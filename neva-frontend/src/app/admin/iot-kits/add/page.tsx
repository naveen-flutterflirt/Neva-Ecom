'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../../lib/api';
import Toast from '../../../../components/ui/Toast';

export default function AddIotKitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [status, setStatus] = useState('active');

  // Main Images
  const [images, setImages] = useState<File[]>([]);

  // What's Included
  const [whatsIncluded, setWhatsIncluded] = useState<{ name: string; quantity: string; imageFile: File | null }[]>([
    { name: '', quantity: '', imageFile: null }
  ]);

  // Projects
  const [projects, setProjects] = useState<string[]>(['']);

  // FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([
    { question: '', answer: '' }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (images.length + files.length > 5) {
        showToast('Maximum 5 images allowed for the kit.');
        return;
      }
      setImages([...images, ...files]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock) {
      showToast('Please fill all required basic information fields.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      if (discountPrice) formData.append('discountPrice', discountPrice);
      formData.append('stock', stock);
      formData.append('status', status);

      // Append main images
      images.forEach((img) => {
        formData.append('images', img);
      });

      // Prepare What's Included
      const parsedWhatsIncluded = whatsIncluded.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: '' // Will be filled by backend
      }));
      formData.append('whatsIncluded', JSON.stringify(parsedWhatsIncluded));

      whatsIncluded.forEach((item, idx) => {
        if (item.imageFile) {
          formData.append(`components_${idx}_image`, item.imageFile);
        }
      });

      // Prepare Projects & FAQs
      formData.append('projects', JSON.stringify(projects.filter(p => p.trim() !== '')));
      formData.append('faqs', JSON.stringify(faqs.filter(f => f.question.trim() !== '')));

      const token = typeof window !== 'undefined' ? (localStorage.getItem('neva-admin-token') || localStorage.getItem('neva-token')) : '';
      const response = await apiClient('/iot-kits', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        showToast('IoT Kit added successfully!');
        setTimeout(() => {
          // Reset form or redirect
          router.push('/admin/iot-kits/add'); // Or list page if it existed
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error adding IoT Kit';
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Add New IoT Kit</h1>
          <p className="text-sm text-zinc-500 mt-1">Create a comprehensive kit with components and projects</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Kit Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="e.g. Smart Home Starter Kit" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="Detailed description of the kit..."></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Price (₹) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Discount Price (₹)</label>
              <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} min="0" step="0.01" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Stock Quantity *</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} required min="0" className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Images */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Kit Images (Max 5)</h2>
            <span className="text-xs text-zinc-500">{images.length}/5 uploaded</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-xl border border-zinc-200 overflow-hidden group">
                <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/80 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer bg-zinc-50">
                <Plus className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-semibold">Upload</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">What's Included (Components)</h2>
            <button type="button" onClick={() => setWhatsIncluded([...whatsIncluded, { name: '', quantity: '', imageFile: null }])} className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Component
            </button>
          </div>

          <div className="space-y-3">
            {whatsIncluded.map((comp, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl">
                
                <label className="relative w-16 h-16 shrink-0 rounded-lg border border-zinc-200 bg-white flex flex-col items-center justify-center text-zinc-400 overflow-hidden cursor-pointer hover:border-violet-400 transition">
                  {comp.imageFile ? (
                    <img src={URL.createObjectURL(comp.imageFile)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 mb-0.5" />
                      <span className="text-[9px] font-medium">Image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const newArr = [...whatsIncluded];
                      newArr[idx].imageFile = e.target.files[0];
                      setWhatsIncluded(newArr);
                    }
                  }} />
                </label>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Component Name</label>
                    <input type="text" value={comp.name} onChange={e => {
                      const newArr = [...whatsIncluded];
                      newArr[idx].name = e.target.value;
                      setWhatsIncluded(newArr);
                    }} className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-violet-500" placeholder="e.g. Arduino UNO" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Quantity</label>
                    <input type="text" value={comp.quantity} onChange={e => {
                      const newArr = [...whatsIncluded];
                      newArr[idx].quantity = e.target.value;
                      setWhatsIncluded(newArr);
                    }} className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-violet-500" placeholder="e.g. 1 pc" />
                  </div>
                </div>

                <button type="button" onClick={() => setWhatsIncluded(whatsIncluded.filter((_, i) => i !== idx))} className="p-2 text-zinc-400 hover:text-red-500 transition mt-4">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Projects</h2>
            <button type="button" onClick={() => setProjects([...projects, ''])} className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Project
            </button>
          </div>
          
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input type="text" value={proj} onChange={e => {
                  const newArr = [...projects];
                  newArr[idx] = e.target.value;
                  setProjects(newArr);
                }} className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="Enter project name or description" />
                <button type="button" onClick={() => setProjects(projects.filter((_, i) => i !== idx))} className="p-2 text-zinc-400 hover:text-red-500 transition">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">FAQs</h2>
            <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add FAQ
            </button>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 border border-zinc-100 bg-zinc-50/50 rounded-xl relative group">
                <div className="flex-1 space-y-3">
                  <input type="text" value={faq.question} onChange={e => {
                    const newArr = [...faqs];
                    newArr[idx].question = e.target.value;
                    setFaqs(newArr);
                  }} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-violet-500" placeholder="Question" />
                  
                  <textarea value={faq.answer} onChange={e => {
                    const newArr = [...faqs];
                    newArr[idx].answer = e.target.value;
                    setFaqs(newArr);
                  }} rows={2} className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-violet-500" placeholder="Answer"></textarea>
                </div>
                
                <button type="button" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="p-2 text-zinc-400 hover:text-red-500 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md shadow-violet-600/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100">
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save IoT Kit
          </button>
        </div>

      </form>
      <Toast message={toastMessage} />
    </div>
  );
}
