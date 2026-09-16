'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../store';
import { addToCart } from '../../../store/cartSlice';
import { Product } from '../../../types/product';
import { apiClient } from '../../../lib/api';
import IotKitDetailsLayout from '../../../components/product/IotKitDetailsLayout';
import Toast from '../../../components/ui/Toast';

export default function IotKitDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchKit = async () => {
      try {
        const res = await apiClient(`/iot-kits/${id}`);
        if (res.success && res.data) {
          const kit = res.data;
          
          // Map to Product interface shape
          const mappedKit: any = {
            ...kit,
            isIoT: true,
            image: kit.images && kit.images.length > 0 ? kit.images[0].imageUrl : '',
          };
          
          setProduct(mappedKit);
          if (mappedKit.images && mappedKit.images.length > 0) {
            setSelectedImage(mappedKit.images[0].imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching IoT kit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKit();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const isAlreadyInCart = cartItems.some((item) => String(item.product.id) === String(product.id));
    if (isAlreadyInCart) {
      showToast(`⚠️ "${product.name}" is already in your cart!`);
      return;
    }

    const sellingPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
    const mrpPrice = product.discountPrice ? Number(product.price) : null;

    dispatch(addToCart({
      product: {
        ...product,
        price: sellingPrice,
        discountPrice: mrpPrice,
      },
      quantity: 1
    }));
    showToast(`✓ Added "${product.name}" to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    
    if (!token) {
      showToast('🔒 Please Sign In to proceed with Buy Now!');
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    const sellingPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
    const mrpPrice = product.discountPrice ? Number(product.price) : null;

    localStorage.setItem('neva-buynow-item', JSON.stringify({
      product: {
        ...product,
        price: sellingPrice,
        discountPrice: mrpPrice,
      },
      quantity: 1
    }));
    router.push('/checkout?buyNow=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-zinc-500">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Kit Not Found</h2>
        <p>We couldn't find the requested IoT Kit.</p>
        <button onClick={() => router.push('/iot-kits')} className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-xl">Back to Kits</button>
      </div>
    );
  }

  const finalSellingPrice = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
  const finalMrpPrice = product.discountPrice ? Number(product.price) : null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] pt-28 pb-20 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <IotKitDetailsLayout
          product={product}
          selectedImage={selectedImage}
          finalSellingPrice={finalSellingPrice}
          finalMrpPrice={finalMrpPrice}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
        />
      </div>
      <Toast message={toastMessage} />
    </main>
  );
}
