const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, bucketName } = require('../config/s3Config');
const productRepository = require('../repositories/productRepository');
const crypto = require('crypto');

const region = process.env.AWS_REGION || 'us-east-1';

// Helper to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Helper to upload a single file to AWS S3
const uploadToS3 = async (file) => {
  const uniqueKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${file.originalname.replace(/\s+/g, '-')}`;
  
  const uploadParams = {
    Bucket: bucketName,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return `https://${bucketName}.s3.${region}.amazonaws.com/${uniqueKey}`;
};

// Helper to delete a file from AWS S3
const deleteFromS3 = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split('/');
    const key = urlParts[urlParts.length - 1];
    
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Failed to delete S3 object:', error.message);
  }
};

class ProductController {
  async getProducts(req, res) {
    try {
      const products = await productRepository.findAll();
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: error.message,
      });
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: error.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, categoryId, sku, description, price, discountPrice, stock, status, primaryImageIndex } = req.body;
      const images = req.files && req.files['images'] ? req.files['images'] : [];
      const videos = req.files && req.files['videos'] ? req.files['videos'] : [];

      if (!name || !categoryId || !sku || !price) {
        return res.status(400).json({
          success: false,
          message: 'Name, Category, SKU, and Price are required fields',
        });
      }

      // Check unique SKU
      const existingSku = await productRepository.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: `Product SKU '${sku}' already exists`,
        });
      }

      const slug = generateSlug(name);

      // Verify unique slug
      const existingSlug = await productRepository.findBySlug(slug);
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: `Product slug '${slug}' already exists from the name`,
        });
      }

      // Create Product record
      const product = await productRepository.create({
        name,
        categoryId,
        sku,
        description,
        price,
        discountPrice: discountPrice || null,
        stock: stock || 0,
        status: status || 'draft',
        slug,
      });

      // Upload files to S3
      const mediaToSave = [];
      const primaryIdx = parseInt(primaryImageIndex, 10) || 0;

      // Handle Image uploads
      for (let i = 0; i < images.length; i++) {
        const fileUrl = await uploadToS3(images[i]);
        mediaToSave.push({
          productId: product.id,
          imageUrl: fileUrl,
          isPrimary: i === primaryIdx,
          sortOrder: i,
          mediaType: 'image',
        });
      }

      // Handle Video uploads
      for (let i = 0; i < videos.length; i++) {
        const fileUrl = await uploadToS3(videos[i]);
        mediaToSave.push({
          productId: product.id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: images.length + i,
          mediaType: 'video',
        });
      }

      if (mediaToSave.length > 0) {
        await productRepository.createImages(mediaToSave);
      }

      const freshProduct = await productRepository.findById(product.id);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: freshProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, categoryId, sku, description, price, discountPrice, stock, status, primaryImageIndex, deletedImageIds } = req.body;
      const images = req.files && req.files['images'] ? req.files['images'] : [];
      const videos = req.files && req.files['videos'] ? req.files['videos'] : [];

      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const updateData = {};
      if (name) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
      }
      if (categoryId) updateData.categoryId = categoryId;
      if (sku) {
        if (sku !== product.sku) {
          const existingSku = await productRepository.findBySku(sku);
          if (existingSku) {
            return res.status(400).json({
              success: false,
              message: `SKU '${sku}' already in use by another product`,
            });
          }
        }
        updateData.sku = sku;
      }
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (discountPrice !== undefined) updateData.discountPrice = discountPrice || null;
      if (stock !== undefined) updateData.stock = stock;
      if (status) updateData.status = status;

      await productRepository.update(id, updateData);

      // Handle Media Deletions
      if (deletedImageIds) {
        const idList = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
        for (const imgId of idList) {
          const imgObj = product.images.find(img => img.id === imgId);
          if (imgObj) {
            await deleteFromS3(imgObj.imageUrl);
            await productRepository.deleteImage(imgId);
          }
        }
      }

      // Handle new uploads
      const newMedia = [];
      const startSortOrder = product.images.length;

      // Handle new images
      for (let i = 0; i < images.length; i++) {
        const fileUrl = await uploadToS3(images[i]);
        newMedia.push({
          productId: id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: startSortOrder + i,
          mediaType: 'image',
        });
      }

      // Handle new videos
      for (let i = 0; i < videos.length; i++) {
        const fileUrl = await uploadToS3(videos[i]);
        newMedia.push({
          productId: id,
          imageUrl: fileUrl,
          isPrimary: false,
          sortOrder: startSortOrder + images.length + i,
          mediaType: 'video',
        });
      }

      if (newMedia.length > 0) {
        await productRepository.createImages(newMedia);
      }

      // Re-fetch product images to adjust primary image
      const refreshedProduct = await productRepository.findById(id);
      
      if (primaryImageIndex !== undefined) {
        const primaryIdx = parseInt(primaryImageIndex, 10);
        const allImages = refreshedProduct.images.filter(img => img.mediaType === 'image');
        if (allImages[primaryIdx]) {
          await productRepository.setPrimaryImage(allImages[primaryIdx].id);
        }
      }

      const finalProduct = await productRepository.findById(id);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: finalProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      // Delete images and videos from S3
      for (const img of product.images) {
        await deleteFromS3(img.imageUrl);
      }

      // Delete from DB
      await productRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Product and all associated media deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
