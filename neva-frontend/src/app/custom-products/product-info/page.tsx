'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button';
import {
  ArrowLeft,
  Check,
  FileUp,
  Minus,
  Plus,
  Sparkles,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  Globe,
  Clock,
  FileText,
  LocateFixed,
  Trash2,
  Layers,
  Droplet,
  Wrench,
  FileCode,
  Image as ImageIcon,
  Shield,
  Zap
} from 'lucide-react';
import Toast from '../../../components/ui/Toast';
import { apiClient } from '../../../lib/api';

const customProduct = {
  id: 'custom-neva-maker-kit',
  name: 'Custom Maker Build',
  category: 'Custom Products',
  price: 2499,
  rating: 5,
  image: '/hero_product.png',
  isIoT: true,
  description:
    'A made-to-order maker setup tuned to your dimensions, finish, and hardware needs.',
  specs: {
    Material: 'Premium PLA + IoT Core',
    Finish: 'Layer-smooth precision',
    Turnaround: '3-5 working days',
  },
};

const materials = [
  { name: 'PLA', note: 'Lightweight + clean', price: 0, icon: Layers },
  { name: 'Carbon Fiber', note: 'Ultra-strong & rigid', price: 600, icon: Shield },
  { name: 'PETG', note: 'Durable & resilient', price: 200, icon: Droplet },
  { name: 'PLA ProPlus', note: 'Enhanced toughness', price: 150, icon: Zap },
  { name: 'ABS', note: 'Heat resistant', price: 450, icon: Wrench },
];

const colors = [
  { name: 'Lumina Violet', value: '#a855f7' },
  { name: 'Electric Cyan', value: '#22d3ee' },
  { name: 'Signal Pink', value: '#ec4899' },
  { name: 'Core Green', value: '#10b981' },
  { name: 'Nexus Blue', value: '#3b82f6' },
];

const timelineSteps = [
  {
    id: 'product-info',
    label: 'Product Config',
    description: 'Configure your print',
  },
  {
    id: 'personal-info',
    label: 'Delivery Details',
    description: 'Contact & shipping info',
  },
  {
    id: 'summary',
    label: 'Review Summary',
    description: 'Verify configuration',
  },
];

type UploadedImage = {
  name: string;
  previewUrl: string;
  dataUrl?: string;
};

export default function ProductInfoPage() {
  const router = useRouter();

  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].name);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [selectedQuality, setSelectedQuality] = useState('6 Inch');
  const [quantity, setQuantity] = useState(1);
  const [dimensions, setDimensions] = useState('');
  const [referenceFile, setReferenceFile] = useState('');
  const [referenceFileSize, setReferenceFileSize] = useState('');
  const [threeDFileUrl, setThreeDFileUrl] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState('product-info');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Reference images (Front, Side, Back)
  const [frontViewFile, setFrontViewFile] = useState<UploadedImage | null>(null);
  const [sideViewFile, setSideViewFile] = useState<UploadedImage | null>(null);
  const [backTopViewFile, setBackTopViewFile] = useState<UploadedImage | null>(null);

  const frontViewInputRef = useRef<HTMLInputElement>(null);
  const sideViewInputRef = useRef<HTMLInputElement>(null);
  const backTopViewInputRef = useRef<HTMLInputElement>(null);
  const threeDFileInputRef = useRef<HTMLInputElement>(null);

  // Delivery details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [confirmDetails, setConfirmDetails] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('#CR-2031');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const materialPrice = materials.find((m) => m.name === selectedMaterial)?.price ?? 0;
  const unitPrice = customProduct.price + materialPrice;
  const totalPrice = unitPrice * quantity;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('neva-token');
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to configure Custom Products!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    if (token) {
      apiClient('/auth/me')
        .then((res) => {
          if (res && res.data) {
            if (res.data.name) setFullName(res.data.name);
            if (res.data.email) setEmail(res.data.email);
            if (res.data.contactNumber || res.data.whatsappNumber) {
              setPhone(res.data.contactNumber || res.data.whatsappNumber);
            }
          }
        })
        .catch(() => {});
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (frontViewFile?.previewUrl) URL.revokeObjectURL(frontViewFile.previewUrl);
      if (sideViewFile?.previewUrl) URL.revokeObjectURL(sideViewFile.previewUrl);
      if (backTopViewFile?.previewUrl) URL.revokeObjectURL(backTopViewFile.previewUrl);
    };
  }, [frontViewFile, sideViewFile, backTopViewFile]);

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 MB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle 3D print file select
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['stl', 'obj', 'step'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !allowedExtensions.includes(ext)) {
      showToast('Please select a valid STL, OBJ, or STEP file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast('File size must be less than 100MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setThreeDFileUrl(e.target?.result as string || '');
    };
    reader.readAsDataURL(file);

    setReferenceFile(file.name);
    setReferenceFileSize(formatFileSize(file.size));
    showToast(`✓ 3D model selected: ${file.name}`);
  };

  const handleDelete3DFile = () => {
    setReferenceFile('');
    setReferenceFileSize('');
    if (threeDFileInputRef.current) threeDFileInputRef.current.value = '';
    showToast('3D model file removed.');
  };

  // Helper to convert and compress image file to data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Image Upload handler
  const handleReferenceImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
    view: 'front' | 'side' | 'back'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showToast('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must be less than 10MB.');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      const dataUrl = await processImageFile(file);
      const uploaded = { name: file.name, previewUrl, dataUrl };

      if (view === 'front') {
        if (frontViewFile?.previewUrl) URL.revokeObjectURL(frontViewFile.previewUrl);
        setFrontViewFile(uploaded);
      } else if (view === 'side') {
        if (sideViewFile?.previewUrl) URL.revokeObjectURL(sideViewFile.previewUrl);
        setSideViewFile(uploaded);
      } else {
        if (backTopViewFile?.previewUrl) URL.revokeObjectURL(backTopViewFile.previewUrl);
        setBackTopViewFile(uploaded);
      }

      showToast(`✓ Image uploaded successfully.`);
    } catch (err) {
      console.error('Failed to process image file:', err);
    }
  };

  const handleDeleteImage = (view: 'front' | 'side' | 'back') => {
    if (view === 'front' && frontViewFile) {
      URL.revokeObjectURL(frontViewFile.previewUrl);
      setFrontViewFile(null);
    } else if (view === 'side' && sideViewFile) {
      URL.revokeObjectURL(sideViewFile.previewUrl);
      setSideViewFile(null);
    } else if (view === 'back' && backTopViewFile) {
      URL.revokeObjectURL(backTopViewFile.previewUrl);
      setBackTopViewFile(null);
    }
    showToast('Image removed.');
  };

  // Geolocation autofill
  const handleGetCurrentLocation = () => {
    showToast('📍 Getting current location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            setAddressLine1(addr.road || addr.suburb || '');
            setCity(addr.city || addr.town || addr.village || '');
            setState(addr.state || '');
            setZipCode(addr.postcode || '');
            showToast('✓ Address details auto-filled!');
          }
        } catch {
          showToast('Failed to retrieve location details.');
        }
      },
      () => showToast('Unable to detect location. Please type manually.')
    );
  };

  // Step wizard controls
  const handleNextStep = (currentStep: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to configure Custom Products!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    if (currentStep === 'product-info') {
      if (!referenceFile) {
        showToast('Please upload a 3D print model file first.');
        return;
      }
      setCompletedSteps(prev => [...new Set([...prev, 'product-info'])]);
      setActiveStep('personal-info');
    } else if (currentStep === 'personal-info') {
      if (!fullName || !email || !phone || !addressLine1 || !city || !state || !zipCode) {
        showToast('Please fill out all shipping fields.');
        return;
      }
      setCompletedSteps(prev => [...new Set([...prev, 'personal-info'])]);
      setActiveStep('summary');
    }
  };

  // Submit custom print
  const handleSubmitRequest = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('neva-token') : null;
    if (!token) {
      showToast('🔒 Please Sign In or Create an Account to submit Custom Print Requests!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        customerName: fullName || 'Customer',
        customerEmail: email,
        customerPhone: phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        deliveryInstructions,
        fileName: referenceFile || 'custom_model.stl',
        fileSize: referenceFileSize || '10.0 MB',
        fileUrl: threeDFileUrl || null,
        material: selectedMaterial,
        color: selectedColor,
        quality: selectedQuality,
        height: selectedQuality,
        quantity,
        notes: dimensions,
        frontImage: frontViewFile?.dataUrl || null,
        sideImage: sideViewFile?.dataUrl || null,
        backImage: backTopViewFile?.dataUrl || null,
      };

      const res = await apiClient('/custom-print', {
        method: 'POST',
        body: payload,
      });

      if (res && res.data) {
        setSubmittedRequestId(res.data.requestId || res.data.id || '#CR-2031');
      }

      showToast('✓ Custom 3D print request submitted successfully! 🎉');
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit custom print request:', err);
      showToast(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-zinc-800 dark:text-zinc-150 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full text-center space-y-8 animate-fade-in">

          {/* Glowing rocket logo hourglass icon */}
          <div className="flex justify-center">
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-orange-600/10 to-amber-500/10 dark:from-orange-600/20 dark:to-amber-500/20 flex items-center justify-center border border-orange-500/20 dark:border-orange-500/30 shadow-[0_0_35px_rgba(249,115,22,0.08)] dark:shadow-[0_0_35px_rgba(249,115,22,0.15)]">
              <div className="h-12 w-12 rounded-full bg-white dark:bg-[#1b1c24] flex items-center justify-center border border-orange-500/20 dark:border-orange-500/40">
                <Clock className="h-6 w-6 text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Request Submitted</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Our engineering team is reviewing your custom print specifications. You will receive a quote shortly.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-white dark:bg-[#15161e] border border-zinc-200/80 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
              <span>REFERENCE ID</span>
              <span className="text-zinc-900 dark:text-white font-mono text-sm bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded flex items-center gap-1.5 border border-zinc-200 dark:border-white/10 select-all">
                {submittedRequestId}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submittedRequestId);
                    showToast('Reference ID copied to clipboard! 📋');
                  }}
                  className="hover:text-violet-600 dark:hover:text-white transition"
                  title="Copy Reference ID"
                >
                  <span className="text-[10px] cursor-pointer">📋</span>
                </button>
              </span>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/25 rounded-full text-xs font-bold text-amber-600 dark:text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping animate-duration-1000" />
                Under Admin Review
              </span>
            </div>
          </div>

          {/* Processing Timeline track */}
          <div className="bg-white dark:bg-[#15161e] border border-zinc-200/80 dark:border-white/5 rounded-2xl p-6 text-left space-y-4 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Processing Timeline</span>

            <div className="relative pt-2">
              {/* Connecting background track */}
              <div className="absolute top-4 left-6 right-6 h-[2px] bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2" />
              {/* Filled status bar */}
              <div className="absolute top-4 left-6 w-[20%] h-[2px] bg-orange-500 -translate-y-1/2" />

              <div className="relative z-10 flex items-center justify-between">
                {[
                  { label: 'SUBMITTED', status: 'completed' },
                  { label: 'REVIEW', status: 'active' },
                  { label: 'QUOTED', status: 'pending' },
                  { label: 'APPROVED', status: 'pending' },
                  { label: 'PRODUCTION', status: 'pending' },
                  { label: 'SHIPPING', status: 'pending' }
                ].map((step, idx) => (
                  <div key={step.label} className="flex flex-col items-center select-none">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${step.status === 'completed' ? 'bg-white dark:bg-[#1b1c24] border-orange-500 text-orange-500' :
                      step.status === 'active' ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' :
                        'bg-zinc-100 dark:bg-[#1b1c24] border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600'
                      }`}>
                      {step.status === 'completed' ? '✓' : idx + 1}
                    </span>
                    <span className={`text-[8px] mt-1.5 font-bold tracking-wider ${step.status === 'active' ? 'text-orange-600 dark:text-orange-400 font-extrabold' :
                      step.status === 'completed' ? 'text-zinc-650 dark:text-zinc-350' : 'text-zinc-400 dark:text-zinc-600'
                      }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-white"
            >
              Back to Home
            </button>
          </div>

        </div>
        <Toast message={toastMessage} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] pb-16 pt-20 text-zinc-800 dark:text-zinc-150">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-violet-650 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Master Configurator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Step Form Configurator */}
          <div className="lg:col-span-7 space-y-6">

            {/* Timeline Progress Header */}
            <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
                <div>
                  <h1 className="text-lg font-bold text-zinc-950 dark:text-white">Custom Print Configurator</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">Configure your custom layout and dispatch options.</p>
                </div>
                <div className="text-xs font-bold text-zinc-400">
                  Step {timelineSteps.findIndex(s => s.id === activeStep) + 1} of {timelineSteps.length}
                </div>
              </div>

              {/* Step tracker list with center-aligned horizontal connecting progress line */}
              <div className="relative mt-6 pb-2 px-1">
                {/* Background Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-[2px] bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2" />

                {/* Active Progress Fill Line */}
                <div
                  className="absolute top-4 left-6 h-[2px] bg-violet-600 -translate-y-1/2 transition-all duration-300"
                  style={{
                    width: activeStep === 'product-info' ? '0%' : activeStep === 'personal-info' ? '50%' : '100%'
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = completedSteps.includes(step.id);
                    return (
                      <button
                        key={step.id}
                        disabled={idx > 0 && !completedSteps.includes(timelineSteps[idx - 1].id)}
                        onClick={() => setActiveStep(step.id)}
                        className="flex flex-col items-center select-none"
                      >
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${isActive ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-650/20' :
                          isCompleted ? 'bg-emerald-500 text-white border-emerald-500' :
                            'bg-zinc-100 text-zinc-550 border-zinc-250 dark:bg-zinc-850 dark:border-white/10 dark:text-zinc-400'
                          }`}>
                          {isCompleted ? <Check className="h-4.5 w-4.5" /> : idx + 1}
                        </span>
                        <span className={`text-[10px] mt-2 font-bold transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400 font-extrabold' :
                          isCompleted ? 'text-emerald-600 dark:text-emerald-400' :
                            'text-zinc-450 dark:text-zinc-500'
                          }`}>
                          {step.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Steps Wrapper */}
            <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm min-h-[420px]">

              {activeStep === 'product-info' && (
                <div className="space-y-6">
                  {/* Reference Image Dropzones - Balanced 3-column setup with object-contain for full images */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-1">1. Reference Model Images</h2>
                    <p className="text-xs text-zinc-500 mb-4">Upload snapshots of your design from three angles for accurate analysis.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Front View Image Upload */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-450 uppercase mb-1.5 block text-center">Front Angle</span>
                        <div
                          onClick={() => !frontViewFile && frontViewInputRef.current?.click()}
                          className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all overflow-hidden bg-zinc-50/50 dark:bg-white/[0.02] ${frontViewFile
                            ? 'border-zinc-200 dark:border-white/10 shadow-sm group'
                            : 'border-zinc-200 dark:border-white/10 hover:border-violet-400 cursor-pointer'
                            }`}
                        >
                          {frontViewFile ? (
                            <div className="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-900/50">
                              <img
                                src={frontViewFile.previewUrl}
                                alt="Front view preview"
                                className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    frontViewInputRef.current?.click();
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold text-white bg-white/20 hover:bg-white/35 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage('front');
                                  }}
                                  className="p-1 text-white bg-red-500 hover:bg-red-655 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <Upload className="mx-auto h-6 w-6 text-zinc-400" />
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mt-1">Upload File</span>
                              <span className="text-[9px] text-zinc-400">JPG, PNG, WEBP</span>
                            </div>
                          )}
                          <input
                            ref={frontViewInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleReferenceImageChange(e, 'front')}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Side View Image Upload */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-455 uppercase mb-1.5 block text-center">Side Angle</span>
                        <div
                          onClick={() => !sideViewFile && sideViewInputRef.current?.click()}
                          className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all overflow-hidden bg-zinc-50/50 dark:bg-white/[0.02] ${sideViewFile
                            ? 'border-zinc-200 dark:border-white/10 shadow-sm group'
                            : 'border-zinc-200 dark:border-white/10 hover:border-violet-400 cursor-pointer'
                            }`}
                        >
                          {sideViewFile ? (
                            <div className="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-900/50">
                              <img
                                src={sideViewFile.previewUrl}
                                alt="Side view preview"
                                className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sideViewInputRef.current?.click();
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold text-white bg-white/20 hover:bg-white/35 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage('side');
                                  }}
                                  className="p-1 text-white bg-red-500 hover:bg-red-655 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <Upload className="mx-auto h-6 w-6 text-zinc-400" />
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mt-1">Upload File</span>
                              <span className="text-[9px] text-zinc-400">JPG, PNG, WEBP</span>
                            </div>
                          )}
                          <input
                            ref={sideViewInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleReferenceImageChange(e, 'side')}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Back/Top View Image Upload */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-455 uppercase mb-1.5 block text-center">Back / Top Angle</span>
                        <div
                          onClick={() => !backTopViewFile && backTopViewInputRef.current?.click()}
                          className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all overflow-hidden bg-zinc-50/50 dark:bg-white/[0.02] ${backTopViewFile
                            ? 'border-zinc-200 dark:border-white/10 shadow-sm group'
                            : 'border-zinc-200 dark:border-white/10 hover:border-violet-400 cursor-pointer'
                            }`}
                        >
                          {backTopViewFile ? (
                            <div className="absolute inset-0 w-full h-full bg-zinc-50 dark:bg-zinc-900/50">
                              <img
                                src={backTopViewFile.previewUrl}
                                alt="Back view preview"
                                className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    backTopViewInputRef.current?.click();
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold text-white bg-white/20 hover:bg-white/35 rounded-lg border border-white/30 backdrop-blur-sm transition-all"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage('back');
                                  }}
                                  className="p-1 text-white bg-red-500 hover:bg-red-655 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3">
                              <Upload className="mx-auto h-6 w-6 text-zinc-400" />
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mt-1">Upload File</span>
                              <span className="text-[9px] text-zinc-400">JPG, PNG, WEBP</span>
                            </div>
                          )}
                          <input
                            ref={backTopViewInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleReferenceImageChange(e, 'back')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3D Model Upload Dropzone - Enhanced with Replace and Delete features */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-1">2. 3D Model Mesh File</h2>
                    <p className="text-xs text-zinc-500">Upload print volume files (.STL, .OBJ, or .STEP) to generate manufacturing estimates.</p>

                    {referenceFile ? (
                      <div className="mt-3 relative border border-zinc-200 dark:border-white/5 rounded-xl p-4 bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between group overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-violet-50 dark:bg-violet-950/20 text-violet-650 dark:text-violet-400 flex items-center justify-center shrink-0">
                            <FileCode className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate max-w-[240px]">{referenceFile}</span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Loaded Mesh Model</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => threeDFileInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg transition"
                          >
                            Replace File
                          </button>
                          <button
                            onClick={handleDelete3DFile}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-transparent transition"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          ref={threeDFileInputRef}
                          type="file"
                          accept=".stl,.obj,.step"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => threeDFileInputRef.current?.click()}
                        className="mt-3 border-2 border-dashed border-zinc-200 dark:border-white/10 hover:border-violet-500 rounded-xl p-6 text-center cursor-pointer hover:bg-[#fcfcff] dark:hover:bg-white/5 transition flex flex-col items-center justify-center gap-1.5"
                      >
                        <FileUp className="h-7 w-7 text-violet-500" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-white">Click to select mesh model</span>
                        <span className="text-[10px] text-zinc-400">STL, OBJ, STEP (Max 100MB)</span>

                        <input
                          ref={threeDFileInputRef}
                          type="file"
                          accept=".stl,.obj,.step"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes Remarks */}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-1">3. Custom Instructions</h2>
                    <p className="text-xs text-zinc-500 mb-1.5">Provide scaling dimensions, special infill structures, or structural remarks.</p>
                    <textarea
                      rows={3}
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. Scale height to 120%, please print hollow infill 15%..."
                      className="w-full rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-900 outline-none focus:bg-white focus:border-violet-500 resize-none dark:border-white/5 dark:bg-[#15161d] dark:text-zinc-200 dark:hover:text-white dark:focus:text-white dark:hover:border-zinc-700 dark:focus:border-violet-400 dark:focus:bg-[#1c1d26] transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {activeStep === 'personal-info' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Shipping Address & Contact</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Please provide delivery address details.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-lg text-[10px] font-bold bg-zinc-50 hover:bg-zinc-100 transition dark:border-white/10 dark:bg-[#15161d]"
                    >
                      <LocateFixed className="h-3 w-3 text-violet-500" />
                      Detect Location
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House No, Road Name, Area"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        placeholder="Apartment, LandMark"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bangalore"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Karnataka"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 block mb-1">Pin Code</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="560103"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-2 text-xs outline-none focus:bg-white focus:border-violet-500 dark:border-white/5 dark:bg-[#15161d]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 'summary' && (
                <div className="space-y-6 text-zinc-800 dark:text-zinc-200">

                  {/* Header Title */}
                  <div className="border-b border-zinc-100 dark:border-white/5 pb-3">
                    <h2 className="text-base font-extrabold text-zinc-950 dark:text-white">Review Your Custom Print Request</h2>
                    <p className="text-xs text-zinc-500">Please review configuration and shipping details before final submission.</p>
                  </div>

                  {/* 1. Product Details Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-violet-500" />
                      Product Details
                    </h3>

                    <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-4 bg-zinc-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row gap-4">
                      {/* Left: Row of Snap Previews */}
                      <div className="flex sm:flex-col gap-2 shrink-0 justify-start">
                        <div className="flex gap-2">
                          <div className="h-14 w-14 rounded-lg overflow-hidden border border-zinc-205 dark:border-white/5 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm" title="Front Angle">
                            {frontViewFile?.previewUrl ? (
                              <img
                                src={frontViewFile.previewUrl}
                                alt="Front"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div className="h-14 w-14 rounded-lg overflow-hidden border border-zinc-205 dark:border-white/5 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm" title="Side Angle">
                            {sideViewFile?.previewUrl ? (
                              <img
                                src={sideViewFile.previewUrl}
                                alt="Side"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div className="h-14 w-14 rounded-lg overflow-hidden border border-zinc-205 dark:border-white/5 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm" title="Back/Top Angle">
                            {backTopViewFile?.previewUrl ? (
                              <img
                                src={backTopViewFile.previewUrl}
                                alt="Back/Top"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Right details */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 px-2 py-0.5 rounded">Custom Part</span>
                          <h4 className="text-sm font-extrabold text-zinc-950 dark:text-white mt-1 truncate max-w-[360px]">
                            {referenceFile || 'Unnamed Custom Part Design'}
                          </h4>
                          <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 italic">
                            {dimensions || 'No specific infill or scale instructions provided.'}
                          </p>
                        </div>

                        {/* Attribute badges */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <div className="bg-zinc-100 dark:bg-white/[0.04] border border-zinc-205 dark:border-white/5 rounded-lg px-2.5 py-1">
                            <span className="text-[9px] text-zinc-400 block font-bold uppercase">Material</span>
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedMaterial}</span>
                          </div>
                          <div className="bg-zinc-100 dark:bg-white/[0.04] border border-zinc-205 dark:border-white/5 rounded-lg px-2.5 py-1">
                            <span className="text-[9px] text-zinc-400 block font-bold uppercase">Resolution</span>
                            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 capitalize">{selectedQuality}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* STL file name indicator card */}
                    <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-3 bg-zinc-50/50 dark:bg-white/[0.01] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-5 w-5 text-zinc-450" />
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block font-mono">{referenceFile || 'model_mesh.stl'}</span>
                          <span className="text-[10px] text-zinc-450 block">{referenceFileSize || '10.0 MB'} • Passed Geometry Check</span>
                        </div>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact & Delivery Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-455 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-violet-500" />
                      Contact &amp; Delivery
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Requestor Info */}
                      <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-white/[0.01] space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Requestor Info</span>
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block">{fullName || 'Alex Chen'}</span>
                          <span className="text-xs text-zinc-500 block">{email || 'alex.chen@makerdev.local'}</span>
                          <span className="text-xs text-zinc-500 block">{phone || '+1 (555) 019-8372'}</span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-white/[0.01] space-y-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Shipping Address</span>
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white block">{addressLine1 || '1024 Hexagon Lane'}</span>
                          {addressLine2 && <span className="text-xs text-zinc-500 block">{addressLine2}</span>}
                          <span className="text-xs text-zinc-500 block">{city || 'Neo-Seattle'}, {state} {zipCode}</span>
                          <span className="text-[10px] text-violet-650 font-bold block mt-1">
                            {deliveryInstructions || 'Standard Delivery (3-5 days post-print)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Pricing & Status Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-455 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-violet-500" />
                      Pricing &amp; Status
                    </h3>

                    <div className="border border-zinc-200 dark:border-white/5 rounded-xl p-4 bg-zinc-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5 max-w-[360px]">
                        <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                          Pending Manual Quote
                        </span>
                        <p className="text-[11px] text-zinc-500 leading-normal">
                          Due to the custom nature of your file and material choice, our engineers need to review the geometry to provide an accurate estimate.
                        </p>
                      </div>

                      <div className="bg-[#111218] border border-white/5 p-3 rounded-lg text-center shrink-0 w-full sm:w-auto">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Estimated Turnaround</span>
                        <span className="text-xs font-black text-violet-400 block mt-0.5">Quote in 24h</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm check details checkbox */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmDetails}
                        onChange={(e) => setConfirmDetails(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                        I confirm these details are correct
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep('personal-info')}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-700 hover:underline px-2.5 py-1.5 transition"
                      >
                        ← Edit Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Sticky Live Print Configuration & Pricing Sidebar (Matches design exactly) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">

            {/* Main Interactive Print Configuration Panel */}
            <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-[24px] p-6 shadow-sm dark:shadow-xl space-y-6 text-zinc-900 dark:text-white">
              {activeStep !== 'summary' ? (
                <>
                  <h2 className="text-base font-extrabold tracking-tight">Print Configuration</h2>

                  {/* Material Selector Row */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Material</span>

                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {materials.map((m) => {
                        const Icon = m.icon;
                        const isSelected = selectedMaterial === m.name;
                        return (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => setSelectedMaterial(m.name)}
                            className={`rounded-xl py-3 px-1 transition flex flex-col items-center justify-center gap-1.5 border ${isSelected
                              ? 'bg-violet-600 border-violet-600 text-white font-bold'
                              : 'bg-zinc-50 dark:bg-zinc-850/30 border-zinc-100 dark:border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                              }`}
                          >
                            <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            <span className="text-[10px]">{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aesthetic Color circles selection */}
                  <div className="space-y-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Color</span>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {colors.map((c) => {
                        const isSelected = selectedColor === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${isSelected
                              ? 'ring-2 ring-violet-550 dark:ring-violet-500 border-white ring-offset-2 ring-offset-white dark:ring-offset-[#111218]'
                              : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/30'
                              }`}
                            style={{ backgroundColor: c.value }}
                          >
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                            )}
                          </button>
                        );
                      })}
                      {/* Plus mock color button */}
                      <button
                        type="button"
                        onClick={() => showToast('Color palette expanded!')}
                        className="h-8 w-8 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-white/5 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Height Selection */}
                  <div className="space-y-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Height</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-zinc-100 dark:bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-200 dark:border-white/5">
                      {[
                        { value: '4 Inch', label: '4 Inch', detail: '4" Height' },
                        { value: '6 Inch', label: '6 Inch', detail: '6" Height' },
                        { value: '8 Inch', label: '8 Inch', detail: '8" Height' },
                        { value: '14 Inch', label: '14 Inch', detail: '14" Height' }
                      ].map((h) => {
                        const isSelected = selectedQuality === h.value;
                        return (
                          <button
                            key={h.value}
                            type="button"
                            onClick={() => setSelectedQuality(h.value)}
                            className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center transition-all ${isSelected
                              ? 'bg-violet-600 text-white font-bold shadow-sm'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-800'
                              }`}
                          >
                            <span className="text-xs font-bold">{h.label}</span>
                            <span className={`text-[9px] ${isSelected ? 'text-violet-100' : 'text-zinc-400'}`}>{h.detail}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="space-y-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">Quantity</span>
                    <div className="bg-zinc-105 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 p-1 rounded-xl flex items-center justify-between max-w-[140px]">
                      <button
                        type="button"
                        onClick={() => setQuantity(v => Math.max(1, v - 1))}
                        className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-transparent flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition"
                      >
                        <Minus className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
                      </button>
                      <span className="text-xs font-extrabold w-8 text-center text-zinc-900 dark:text-white">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(v => v + 1)}
                        className="h-7 w-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-transparent flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition"
                      >
                        <Plus className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold tracking-tight">Summary Details</h2>
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Material:</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{selectedMaterial}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Color:</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{selectedColor}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-zinc-400">Quality:</span>
                      <span className="text-zinc-900 dark:text-white font-bold capitalize">{selectedQuality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 dark:text-zinc-400">Quantity:</span>
                      <span className="text-zinc-900 dark:text-white font-bold">× {quantity}</span>
                    </div>
                  </div>
                </div>
              )}


              {/* Action trigger button inside the panel */}
              <div className="pt-2">
                {activeStep === 'product-info' ? (
                  <button
                    onClick={() => handleNextStep('product-info')}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-cyan-500 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    Continue to Personal Info
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </button>
                ) : activeStep === 'personal-info' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleNextStep('personal-info')}
                      className="w-full py-3 bg-gradient-to-r from-blue-700 to-cyan-500 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      Request Summary
                      <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep('product-info')}
                      className="w-full py-2 bg-transparent border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-350 rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Back to Config
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled={!confirmDetails || isSubmitting}
                      onClick={handleSubmitRequest}
                      className={`w-full py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 uppercase tracking-wider ${confirmDetails && !isSubmitting
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-550 cursor-not-allowed'
                        }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Print Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep('personal-info')}
                      className="w-full py-2 bg-transparent border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-350 rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Back to Delivery Info
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Global custom premium toast */}
      <Toast message={toastMessage} />
    </main>
  );
}