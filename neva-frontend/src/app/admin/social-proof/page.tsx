'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  Check,
  X,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  RefreshCw,
  UploadCloud,
  FileVideo,
  Film
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { apiClient } from '../../../lib/api';

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

interface SocialPostItem {
  id: number;
  url: string;
  image?: string;
  title?: string;
  isActive: boolean;
  createdAt?: string;
}

export default function AdminSocialProofPage() {
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Mode: 'upload' (Direct AWS S3 Video File) or 'url' (Link)
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSocialPosts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/social-posts');
      if (res && res.success && Array.isArray(res.data)) {
        setPosts(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch social posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialPosts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        showToast('⚠️ Please select a valid video file (.mp4, .webm, .mov)');
        return;
      }
      setSelectedFile(file);
      setPreviewVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === 'upload' && !selectedFile) {
      showToast('⚠️ Please select a video file to upload to AWS S3');
      return;
    }

    if (uploadMode === 'url' && !inputUrl.trim()) {
      showToast('⚠️ Please enter a valid Video or Instagram URL');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      if (uploadMode === 'upload' && selectedFile) {
        formData.append('video', selectedFile);
      } else {
        formData.append('url', inputUrl.trim());
      }

      if (inputTitle.trim()) {
        formData.append('title', inputTitle.trim());
      }

      const res = await apiClient('/social-posts', {
        method: 'POST',
        body: formData,
      });

      if (res && res.success) {
        showToast('🚀 Video uploaded to AWS S3 & published to homepage!');
        setSelectedFile(null);
        setPreviewVideoUrl(null);
        setInputUrl('');
        setInputTitle('');
        fetchSocialPosts();
      }
    } catch (err: any) {
      console.error('Failed to upload video:', err);
      showToast(err.message || 'Failed to upload video to AWS S3');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video from AWS S3 & homepage?')) return;
    try {
      await apiClient(`/social-posts/${id}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('✓ Video deleted from AWS S3 successfully');
    } catch (err: any) {
      console.error('Delete post error:', err);
      showToast('Failed to delete video');
    }
  };

  const handleToggleActive = async (post: SocialPostItem) => {
    try {
      const updatedStatus = !post.isActive;
      await apiClient(`/social-posts/${post.id}`, {
        method: 'PUT',
        body: { isActive: updatedStatus },
      });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isActive: updatedStatus } : p));
      showToast(`Status updated to ${updatedStatus ? 'Active' : 'Disabled'}`);
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Film className="h-7 w-7 text-pink-600" />
            AWS S3 Video Upload Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload custom MP4 videos directly to AWS S3 bucket to feature pure 100% video cards on the homepage.
          </p>
        </div>

        <button
          onClick={fetchSocialPosts}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition shadow-xs w-fit cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh List
        </button>
      </div>

      {/* Form & Live Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Upload Video File to AWS S3 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-7 shadow-sm space-y-5">

          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-pink-600" />
              Upload Video File
            </h2>


          </div>

          <form onSubmit={handleAddPost} className="space-y-4">

            {uploadMode === 'upload' ? (
              /* AWS S3 Drag & Drop Video File Card */
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 block">Select Video File (.mp4, .webm)</label>

                <div className="relative border-2 border-dashed border-pink-200 hover:border-pink-500 bg-pink-50/40 rounded-2xl p-6 text-center transition group cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="h-12 w-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <FileVideo className="h-6 w-6" />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-extrabold text-zinc-900 truncate max-w-xs mx-auto">{selectedFile.name}</p>
                        <p className="text-[10px] font-mono text-emerald-600 font-bold mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to Upload to AWS S3
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-zinc-800">Click to choose or Drag &amp; Drop Video</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Supports MP4, WEBM up to 100MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* URL Input Option */
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">
                  Video / Reel Direct URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://your-bucket.s3.amazonaws.com/video.mp4"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-xs font-mono text-zinc-900 bg-zinc-50 focus:bg-white focus:border-pink-500 outline-none transition"
                />
              </div>
            )}

            {/* Optional Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 block">Title / Tagline (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Precision 3D Printing Showcase"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-zinc-50 focus:bg-white focus:border-pink-500 outline-none transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5  inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition duration-200"
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading Video to AWS S3 Bucket...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Upload Video &amp; Publish to Homepage
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Card: Video Preview Frame (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 text-white rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> Live Video Preview
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Homepage Aspect 4:5</span>
          </div>

          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
            {previewVideoUrl ? (
              <video src={previewVideoUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
            ) : inputUrl ? (
              <video src={inputUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2 text-zinc-500">
                <FileVideo className="h-10 w-10 mx-auto text-zinc-700" />
                <p className="text-xs font-medium">Select a video file to preview live autoplay here before uploading to AWS S3.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Published Videos Grid Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-zinc-900"> Published Videos on Homepage</h2>
            <p className="text-xs text-zinc-500">Total {posts.length} videos </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
            Loading videos...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs space-y-2">
            <Film className="h-8 w-8 mx-auto text-zinc-300" />
            <p>No custom videos uploaded yet. Upload your first video above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col justify-between space-y-3 p-3 transition hover:shadow-xl"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-black">
                  <video src={post.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-white truncate block">{post.title || 'AWS S3 Video'}</span>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-mono text-pink-400 hover:underline truncate block"
                  >
                    {post.url}
                  </a>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleToggleActive(post)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${post.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {post.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition border border-red-500/20 cursor-pointer"
                    title="Delete Video from AWS S3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
