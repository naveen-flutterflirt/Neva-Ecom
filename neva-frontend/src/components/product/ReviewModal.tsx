'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Star, Image as ImageIcon, X, Upload } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  existingReview?: any;
  onSuccess?: () => void;
}

export default function ReviewModal({ isOpen, onClose, productName, existingReview, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || '');
      setTitle(existingReview.title || '');
      setSelectedImages(existingReview.images || []);
    } else if (isOpen && !existingReview) {
      setRating(0);
      setComment('');
      setTitle('');
      setSelectedImages([]);
    }
  }, [isOpen, existingReview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => {
            if (prev.length < 3) return [...prev, reader.result as string];
            return prev;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating!");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get user name if logged in
      let userName = 'Guest User';
      let userId = null;
      try {
        const userStr = localStorage.getItem('neva-user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj.name) userName = userObj.name;
          if (userObj.id) userId = userObj.id;
        }
      } catch (err) {}

      if (existingReview) {
        await apiClient(`/reviews/${existingReview.id}`, {
          method: 'PUT',
          body: {
            rating,
            title,
            comment,
            images: selectedImages,
          }
        });
        alert('Review Updated Successfully!');
      } else {
        await apiClient('/reviews', {
          method: 'POST',
          body: {
            productName,
            rating,
            title,
            comment,
            images: selectedImages,
            userName,
            userId,
          }
        });
        alert('Review Submitted Successfully!');
      }
      
      if (onSuccess) onSuccess();
      
      // Reset and close
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div 
        className="bg-white dark:bg-[#12131a] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Rate and Review</h2>
          <button onClick={onClose} className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You are reviewing: <strong className="text-zinc-900 dark:text-white">{productName}</strong>
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Rate this product</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-90"
                >
                  <Star 
                    className={`h-7 w-7 transition-colors ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 dark:fill-zinc-800 text-zinc-300 dark:text-zinc-700'}`} 
                  />
                </button>
              ))}
            </div>
            <span className="ml-2 text-xs font-bold text-zinc-500">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">Review this product</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Description..."
                className="w-full min-h-[100px] p-3 rounded-lg bg-zinc-50 dark:bg-[#0c0d14] border border-zinc-200 dark:border-zinc-800 focus:border-violet-500 dark:focus:border-violet-500 outline-none text-sm text-zinc-900 dark:text-white resize-y transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Review title..."
                className="w-full p-2.5 rounded-lg bg-zinc-50 dark:bg-[#0c0d14] border border-zinc-200 dark:border-zinc-800 focus:border-violet-500 outline-none text-sm text-zinc-900 dark:text-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative h-16 w-16 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
                <Image src={img} alt={`Upload ${idx}`} width={100} height={100} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {selectedImages.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-16 w-16 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 hover:border-violet-500 hover:text-violet-600 transition-colors"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload}
            />
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg bg-[#ff611d] text-white text-sm font-bold tracking-wider hover:bg-[#e05419] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
