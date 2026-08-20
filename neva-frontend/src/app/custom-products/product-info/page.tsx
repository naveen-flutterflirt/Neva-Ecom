'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../../components/ui/Button';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileUp,
  Minus,
  Plus,
  Sparkles,
  Upload,
  ChevronUp,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  Globe,
  Clock,
  FileText,
  Save,
  UserPlus,
  LocateFixed,
} from 'lucide-react';
import { addToCart } from '../../../store/cartSlice';
import { useAppDispatch } from '../../../store';
import Toast from '../../../components/ui/Toast';

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
  { name: 'PLA', note: 'Lightweight + clean', price: 0 },
  { name: 'PETG', note: 'Durable + flexible', price: 300 },
  { name: 'ABS', note: 'Heat resistant', price: 450 },
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
    label: 'Product Info',
    description: 'Tell us about your custom print',
  },
  {
    id: 'personal-info',
    label: 'Personal Info',
    description: 'Your contact & delivery details',
  },
  {
    id: 'summary',
    label: 'Summary',
    description: 'Review your custom print request',
  },
  {
    id: 'approval',
    label: 'Approval',
    description: 'Confirm and submit',
  },
];

type UploadedImage = {
  name: string;
  previewUrl: string;
};

export default function ProductInfoPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [selectedMaterial, setSelectedMaterial] = useState(
    materials[0].name
  );
  const [selectedColor, setSelectedColor] = useState(colors[0].name);

  const [selectedQuality, setSelectedQuality] = useState('standard');

  const [quantity, setQuantity] = useState(1);
  const [dimensions, setDimensions] = useState('');
  const [referenceFile, setReferenceFile] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState('product-info');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Reference image states
  const [frontViewFile, setFrontViewFile] =
    useState<UploadedImage | null>(null);

  const [sideViewFile, setSideViewFile] =
    useState<UploadedImage | null>(null);

  const [backTopViewFile, setBackTopViewFile] =
    useState<UploadedImage | null>(null);

  // File input refs
  const frontViewInputRef = useRef<HTMLInputElement>(null);
  const sideViewInputRef = useRef<HTMLInputElement>(null);
  const backTopViewInputRef = useRef<HTMLInputElement>(null);
  const threeDFileInputRef = useRef<HTMLInputElement>(null);

  // Personal Info fields
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

  const materialPrice =
    materials.find((material) => material.name === selectedMaterial)?.price ??
    0;

  const unitPrice = customProduct.price + materialPrice;
  const totalPrice = unitPrice * quantity;

  const showToast = (message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (frontViewFile?.previewUrl) {
        URL.revokeObjectURL(frontViewFile.previewUrl);
      }

      if (sideViewFile?.previewUrl) {
        URL.revokeObjectURL(sideViewFile.previewUrl);
      }

      if (backTopViewFile?.previewUrl) {
        URL.revokeObjectURL(backTopViewFile.previewUrl);
      }
    };
  }, [frontViewFile, sideViewFile, backTopViewFile]);

  // 3D File Upload
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = ['stl', 'obj', 'step'];

    const fileExtension = file.name
      .split('.')
      .pop()
      ?.toLowerCase();

    if (
      !fileExtension ||
      !allowedExtensions.includes(fileExtension)
    ) {
      showToast(
        'Please select a valid STL, OBJ, or STEP file.'
      );
      return;
    }

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast('File size must be less than 100MB.');
      return;
    }

    setReferenceFile(file.name);

    showToast(`3D file selected: ${file.name}`);
  };

  // Reference Image Upload
  const handleReferenceImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    view: 'front' | 'side' | 'back'
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      showToast('Image size must be less than 10MB.');
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    const uploadedImage: UploadedImage = {
      name: file.name,
      previewUrl,
    };

    if (view === 'front') {
      if (frontViewFile?.previewUrl) {
        URL.revokeObjectURL(frontViewFile.previewUrl);
      }

      setFrontViewFile(uploadedImage);
    }

    if (view === 'side') {
      if (sideViewFile?.previewUrl) {
        URL.revokeObjectURL(sideViewFile.previewUrl);
      }

      setSideViewFile(uploadedImage);
    }

    if (view === 'back') {
      if (backTopViewFile?.previewUrl) {
        URL.revokeObjectURL(backTopViewFile.previewUrl);
      }

      setBackTopViewFile(uploadedImage);
    }

    event.target.value = '';

    showToast(`${file.name} uploaded successfully.`);
  };

  // Delete Reference Image
  const handleDeleteReferenceImage = (
    view: 'front' | 'side' | 'back'
  ) => {
    if (view === 'front') {
      if (frontViewFile?.previewUrl) {
        URL.revokeObjectURL(frontViewFile.previewUrl);
      }

      setFrontViewFile(null);

      if (frontViewInputRef.current) {
        frontViewInputRef.current.value = '';
      }

      showToast('Front view image removed.');
    }

    if (view === 'side') {
      if (sideViewFile?.previewUrl) {
        URL.revokeObjectURL(sideViewFile.previewUrl);
      }

      setSideViewFile(null);

      if (sideViewInputRef.current) {
        sideViewInputRef.current.value = '';
      }

      showToast('Side view image removed.');
    }

    if (view === 'back') {
      if (backTopViewFile?.previewUrl) {
        URL.revokeObjectURL(backTopViewFile.previewUrl);
      }

      setBackTopViewFile(null);

      if (backTopViewInputRef.current) {
        backTopViewInputRef.current.value = '';
      }

      showToast('Back/Top view image removed.');
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: customProduct,
        quantity,
      })
    );

    showToast('Custom build added to your cart.');
  };

  const handleStepClick = (stepId: string) => {
    const currentIndex = timelineSteps.findIndex(
      (s) => s.id === stepId
    );

    const previousSteps = timelineSteps.slice(
      0,
      currentIndex
    );

    const allPreviousCompleted = previousSteps.every(
      (s) => completedSteps.includes(s.id)
    );

    if (
      allPreviousCompleted ||
      stepId === activeStep ||
      completedSteps.includes(stepId)
    ) {
      setActiveStep(stepId);
    }
  };

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([
        ...completedSteps,
        stepId,
      ]);
    }

    const currentIndex = timelineSteps.findIndex(
      (s) => s.id === stepId
    );

    if (
      currentIndex <
      timelineSteps.length - 1
    ) {
      setActiveStep(
        timelineSteps[currentIndex + 1].id
      );
    }
  };

  const isStepCompleted = (stepId: string) =>
    completedSteps.includes(stepId);

  const isStepActive = (stepId: string) =>
    activeStep === stepId;

  const isStepLocked = (stepId: string) => {
    const index = timelineSteps.findIndex(
      (s) => s.id === stepId
    );

    const previousSteps = timelineSteps.slice(
      0,
      index
    );

    return (
      !previousSteps.every((s) =>
        completedSteps.includes(s.id)
      ) &&
      !completedSteps.includes(stepId)
    );
  };

  // Get Current Location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast(
        'Geolocation is not supported by your browser.'
      );
      return;
    }

    showToast(
      '📍 Detecting your current location...'
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              'Unable to fetch address'
            );
          }

          const data = await response.json();
          const address = data.address || {};

          const detectedAddress = [
            address.house_number,
            address.road,
            address.neighbourhood,
          ]
            .filter(Boolean)
            .join(', ');

          const detectedCity =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            '';

          const detectedState =
            address.state || '';

          const detectedZip =
            address.postcode || '';

          setAddressLine1(detectedAddress);
          setCity(detectedCity);
          setState(detectedState);
          setZipCode(detectedZip);

          showToast(
            '📍 Current location detected successfully.'
          );
        } catch (error) {
          console.error(
            'Reverse geocoding error:',
            error
          );

          showToast(
            '📍 Location detected, but address could not be fetched. Please enter it manually.'
          );
        }
      },
      (error) => {
        console.error(
          'Geolocation error:',
          error
        );

        switch (error.code) {
          case error.PERMISSION_DENIED:
            showToast(
              'Location permission was denied. Please allow location access.'
            );
            break;

          case error.POSITION_UNAVAILABLE:
            showToast(
              'Unable to determine your current location.'
            );
            break;

          case error.TIMEOUT:
            showToast(
              'Location request timed out. Please try again.'
            );
            break;

          default:
            showToast(
              'Unable to get your current location.'
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Render content for each step
  const renderStepContent = (stepId: string) => {
    switch (stepId) {
      case 'product-info':
        return (
          <div className="space-y-6">

            {/* Reference Images */}
<div>
  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
    Reference Images
  </h3>

  {/* Three upload containers in one row */}
  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

    {/* Front View */}
    <div className="relative min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          frontViewInputRef.current?.click()
        }
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            frontViewInputRef.current?.click();
          }
        }}
        className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 hover:bg-violet-50/50 dark:border-white/15 dark:hover:bg-violet-500/5"
      >
        {frontViewFile ? (
          <div className="relative h-full w-full">
            <img
              src={frontViewFile.previewUrl}
              alt="Front view preview"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                Click to replace
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteReferenceImage('front');
              }}
              className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white shadow-md transition hover:bg-red-500"
              aria-label="Delete front view image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="p-4">
            <Upload className="mx-auto h-7 w-7 text-zinc-400" />

            <p className="mt-2 text-sm font-medium">
              Front View
            </p>

            <p className="text-xs text-zinc-400">
              Drag &amp; drop or click
            </p>
          </div>
        )}
      </div>

      <input
        id="front-view-upload"
        ref={frontViewInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) =>
          handleReferenceImageChange(
            event,
            'front'
          )
        }
        className="hidden"
      />

      {frontViewFile && (
        <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ✓ {frontViewFile.name}
        </p>
      )}
    </div>

    {/* Side View */}
    <div className="relative min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          sideViewInputRef.current?.click()
        }
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            sideViewInputRef.current?.click();
          }
        }}
        className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 hover:bg-violet-50/50 dark:border-white/15 dark:hover:bg-violet-500/5"
      >
        {sideViewFile ? (
          <div className="relative h-full w-full">
            <img
              src={sideViewFile.previewUrl}
              alt="Side view preview"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                Click to replace
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteReferenceImage('side');
              }}
              className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white shadow-md transition hover:bg-red-500"
              aria-label="Delete side view image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="p-4">
            <Upload className="mx-auto h-7 w-7 text-zinc-400" />

            <p className="mt-2 text-sm font-medium">
              Side View
            </p>

            <p className="text-xs text-zinc-400">
              Drag &amp; drop or click
            </p>
          </div>
        )}
      </div>

      <input
        id="side-view-upload"
        ref={sideViewInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) =>
          handleReferenceImageChange(
            event,
            'side'
          )
        }
        className="hidden"
      />

      {sideViewFile && (
        <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ✓ {sideViewFile.name}
        </p>
      )}
    </div>

    {/* Back / Top View */}
    <div className="relative min-w-0">
      <div
        role="button"
        tabIndex={0}
        onClick={() =>
          backTopViewInputRef.current?.click()
        }
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            backTopViewInputRef.current?.click();
          }
        }}
        className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 hover:bg-violet-50/50 dark:border-white/15 dark:hover:bg-violet-500/5"
      >
        {backTopViewFile ? (
          <div className="relative h-full w-full">
            <img
              src={backTopViewFile.previewUrl}
              alt="Back or top view preview"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                Click to replace
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteReferenceImage('back');
              }}
              className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-lg leading-none text-white shadow-md transition hover:bg-red-500"
              aria-label="Delete back/top view image"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="p-4">
            <Upload className="mx-auto h-7 w-7 text-zinc-400" />

            <p className="mt-2 text-sm font-medium">
              Back/Top View
            </p>

            <p className="text-xs text-zinc-400">
              Drag &amp; drop or click
            </p>
          </div>
        )}
      </div>

      <input
        id="back-top-view-upload"
        ref={backTopViewInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) =>
          handleReferenceImageChange(
            event,
            'back'
          )
        }
        className="hidden"
      />

      {backTopViewFile && (
        <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
          ✓ {backTopViewFile.name}
        </p>
      )}
    </div>
  </div>

  <p className="mt-2 text-xs text-zinc-500">
    Images uploaded:{' '}
    {
      [
        frontViewFile,
        sideViewFile,
        backTopViewFile,
      ].filter(Boolean).length
    }{' '}
    of 3
  </p>
</div>

            {/* Description & Details */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Description &amp; Details
              </h3>

              <p className="mt-1 text-xs text-zinc-500">
                Describe specific details, critical dimensions, or special
                requirements for your print.
              </p>

              <textarea
                rows={4}
                value={dimensions}
                onChange={(event) =>
                  setDimensions(event.target.value)
                }
                placeholder="Tell us about your print requirements..."
                className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03] dark:placeholder:text-zinc-600"
              />
            </div>

            {/* 3D File Upload */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    3D File Upload
                  </h3>

                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    Instant Pricing Available
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  Upload
                </span>
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Upload a .STL, OBJ, or STEP file to get an immediate cost
                estimate and printability analysis.
              </p>

              <div className="mt-3 rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center transition hover:border-violet-400 dark:border-white/15">
                <FileUp className="mx-auto h-10 w-10 text-violet-500" />

                <p className="mt-2 text-sm font-medium">
                  Drag and drop your 3D files
                </p>

                <p className="text-xs text-zinc-400">
                  Supports STL, OBJ, STEP up to 100MB
                </p>

                <Button
                  type="button"
                  onClick={() =>
                    threeDFileInputRef.current?.click()
                  }
                  className="mx-auto mt-3 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                >
                  Browse Files
                </Button>

                <input
                  ref={threeDFileInputRef}
                  type="file"
                  accept=".stl,.obj,.step"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />

                <label
                  htmlFor="file-upload"
                  className="mt-2 block cursor-pointer text-xs text-violet-500 hover:underline"
                >
                  {referenceFile || 'No file selected'}
                </label>
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                Need help optimizing your file?{' '}
                <a
                  href="#"
                  className="text-violet-500 hover:underline"
                >
                  Read our guide
                </a>
              </p>
            </div>

            {/* Print Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Print Configuration
              </h3>

              {/* Material */}
              <div className="mt-3">
                <p className="text-xs font-medium text-zinc-500">
                  Material
                </p>

                <div className="mt-1.5 flex flex-wrap gap-3">
                  {materials.map((material) => (
                    <button
                      key={material.name}
                      type="button"
                      onClick={() =>
                        setSelectedMaterial(
                          material.name
                        )
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selectedMaterial ===
                        material.name
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200'
                          : 'border-zinc-200 hover:border-violet-300 dark:border-white/10'
                      }`}
                    >
                      {material.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mt-3">
                <p className="text-xs font-medium text-zinc-500">
                  Color
                </p>

                <div className="mt-1.5 flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() =>
                        setSelectedColor(
                          color.name
                        )
                      }
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        selectedColor ===
                        color.name
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                          : 'border-zinc-200 hover:border-violet-300 dark:border-white/10'
                      }`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border-2 border-white/80 shadow-sm"
                        style={{
                          backgroundColor:
                            color.value,
                        }}
                      />

                      {color.name}

                      {selectedColor ===
                        color.name && (
                        <Check className="h-4 w-4 text-violet-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div className="mt-3">
                <p className="text-xs font-medium text-zinc-500">
                  Quality (Layer Height)
                </p>

                <div className="mt-1.5 flex flex-wrap gap-3">
                  {[
                    {
                      label: 'Over 0.5mm',
                      value: 'over',
                    },
                    {
                      label: 'Standard 0.5mm',
                      value: 'standard',
                    },
                    {
                      label: 'High 0.5mm',
                      value: 'high',
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSelectedQuality(
                          option.value
                        )
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selectedQuality ===
                        option.value
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200'
                          : 'border-zinc-200 hover:border-violet-300 dark:border-white/10'
                      }`}
                    >
                      {option.label}

                      {selectedQuality ===
                        option.value && (
                        <Check className="ml-2 inline-block h-4 w-4 text-violet-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-3">
                <p className="text-xs font-medium text-zinc-500">
                  Quantity
                </p>

                <div className="mt-1.5 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:border-violet-400 dark:border-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center text-xl font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (value) => value + 1
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 transition hover:border-violet-400 dark:border-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={() =>
                handleStepComplete(
                  'product-info'
                )
              }
              className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Continue to Personal Info →
            </Button>
          </div>
        );

      case 'personal-info':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Your Contact &amp; Delivery Details
              </h2>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Contact Information
              </h3>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Full Name
                  </label>

                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Email Address
                  </label>

                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="john@example.com"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Phone Number
                  </label>

                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <div className="flex">
                      <select className="rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-50 px-3 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-white/[0.03]">
                        <option>+1 (US)</option>
                        <option>+44 (UK)</option>
                        <option>+91 (IN)</option>
                      </select>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value
                          )
                        }
                        placeholder="555-123-4567"
                        className="flex-1 rounded-r-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Shipping Address
              </h3>

              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Address Line 1
                  </label>

                  <div className="relative mt-1">
                    <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="text"
                      value={addressLine1}
                      onChange={(e) =>
                        setAddressLine1(
                          e.target.value
                        )
                      }
                      placeholder="123 Main Street"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Address Line 2
                  </label>

                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) =>
                        setAddressLine2(
                          e.target.value
                        )
                      }
                      placeholder="Apt. Suite, Box (Optional)"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                {/* Current Location */}
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-[#111217] dark:text-zinc-300 dark:hover:border-violet-400/50 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                  >
                    <LocateFixed className="h-4 w-4 text-violet-500" />
                    Use Current Location
                  </button>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    City
                  </label>

                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="text"
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      placeholder="San Francisco"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      State / Province
                    </label>

                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                      <input
                        type="text"
                        value={state}
                        onChange={(e) =>
                          setState(
                            e.target.value
                          )
                        }
                        placeholder="California"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Zip / Postal Code
                    </label>

                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) =>
                          setZipCode(
                            e.target.value
                          )
                        }
                        placeholder="94105"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Order Notes
              </h3>

              <div className="mt-3">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Delivery Instructions
                </label>

                <div className="relative mt-1">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />

                  <textarea
                    rows={3}
                    value={deliveryInstructions}
                    onChange={(e) =>
                      setDeliveryInstructions(
                        e.target.value
                      )
                    }
                    placeholder="Key Deliveries are USPS UPS DHL FedEx"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/[0.03]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveStep(
                    'product-info'
                  )
                }
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold transition hover:border-violet-400 dark:border-white/10"
              >
                Back
              </button>

              <Button
                onClick={() =>
                  handleStepComplete(
                    'personal-info'
                  )
                }
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Request Summary →
              </Button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Review Your Custom Print Request
              </h2>

              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                Step 3 of 4
              </span>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Product Details
              </h3>

              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
                    <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-300" />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      Custom Port
                    </p>

                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Ergo Keyboard Chassis – Rev B
                    </p>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Custom mechanical keyboard case optimized for split
                      ergonomics. Requires high-precision resin printing for
                      the select plate tolerances.
                    </p>

                    <div className="mt-2 flex gap-4 text-xs">
                      <span className="text-zinc-500">
                        Material:{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {selectedMaterial}
                        </span>
                      </span>

                      <span className="text-zinc-500">
                        Resolution:{' '}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          60 Microns
                        </span>
                      </span>
                    </div>

                    <div className="mt-2 text-xs">
                      <span className="text-zinc-500">
                        Quality:{' '}
                      </span>

                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {selectedQuality ===
                        'over'
                          ? 'Over 0.5mm'
                          : selectedQuality ===
                            'standard'
                          ? 'Standard 0.5mm'
                          : 'High 0.5mm'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-white/5">
                  <FileUp className="h-4 w-4 text-violet-500" />

                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {referenceFile ||
                      'No 3D file selected'}
                  </span>

                  <span className="ml-auto text-[10px] text-zinc-400">
                    A02.HIG - Product Geometry Check
                  </span>
                </div>

                {/* Uploaded Reference Images */}
{(
  frontViewFile ||
  sideViewFile ||
  backTopViewFile
) && (
  <div className="mt-3">
    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
      Reference Images
    </p>

    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">

      {/* Front View */}
      {frontViewFile && (
        <div className="relative min-w-0">
          <div className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 dark:border-white/15">
            <div className="relative h-full w-full">
              <img
                src={frontViewFile.previewUrl}
                alt="Front view preview"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  Front View
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {frontViewFile.name}
          </p>
        </div>
      )}

      {/* Side View */}
      {sideViewFile && (
        <div className="relative min-w-0">
          <div className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 dark:border-white/15">
            <div className="relative h-full w-full">
              <img
                src={sideViewFile.previewUrl}
                alt="Side view preview"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  Side View
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {sideViewFile.name}
          </p>
        </div>
      )}

      {/* Back / Top View */}
      {backTopViewFile && (
        <div className="relative min-w-0">
          <div className="group relative mx-auto flex aspect-[4/3] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 text-center transition hover:border-violet-400 dark:border-white/15">
            <div className="relative h-full w-full">
              <img
                src={backTopViewFile.previewUrl}
                alt="Back or top view preview"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <span className="rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  Back/Top View
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {backTopViewFile.name}
          </p>
        </div>
      )}

    </div>
  </div>
)}
              </div>
            </div>

            {/* Contact & Delivery */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Contact &amp; Delivery
              </h3>

              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-zinc-400" />

                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {fullName ||
                        'Alex Chan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400" />

                    <span className="text-zinc-600 dark:text-zinc-400">
                      {email ||
                        'alex.chan@example.com'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-zinc-400" />

                    <span className="text-zinc-600 dark:text-zinc-400">
                      {phone ||
                        '+1 (555) 019-8372'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 border-t border-zinc-200 pt-2 dark:border-white/10">
                    <MapPin className="mt-0.5 h-4 w-4 text-zinc-400" />

                    <div className="text-zinc-600 dark:text-zinc-400">
                      <p>
                        {addressLine1 ||
                          '1024 Hexagon Lane'}
                      </p>

                      <p>
                        {addressLine2 ||
                          'Suite 404, Building G'}
                      </p>

                      <p>
                        {city ||
                          'Neo-Seattle'}
                        ,{' '}
                        {state || 'WA'}{' '}
                        {zipCode || '98109'}
                      </p>

                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                        Standard Delivery (3-5 days post-print)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Status */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Pricing &amp; Status
              </h3>

              <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Premium Material Quota
                    </p>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Due to the custom nature of your file and material
                      choices, our engineers need to review the geometry to
                      provide an accurate estimate.
                    </p>

                    <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Estimated Furnished Quote in 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={confirmDetails}
                  onChange={(e) =>
                    setConfirmDetails(
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />

                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  I confirm these details are correct
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveStep(
                    'personal-info'
                  )
                }
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold transition hover:border-violet-400 dark:border-white/10"
              >
                Edit Details
              </button>

              <Button
                onClick={() =>
                  handleStepComplete(
                    'summary'
                  )
                }
                disabled={!confirmDetails}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send for Approval →
              </Button>
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                Request Submitted
              </h3>

              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                Our engineering team is reviewing your custom print
                specifications. You will receive a quote shortly.
              </p>
            </div>

            {/* Reference ID */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  REFERENCE ID
                </span>

                <span className="text-sm font-bold text-violet-600 dark:text-violet-300">
                  #CR-2031
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Receipt Time Limit
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] text-zinc-500">
                    Date/Time
                  </p>

                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    2026-08-20
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] text-zinc-500">
                    Start Time
                  </p>

                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    14:30
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-[10px] text-zinc-500">
                    End Time
                  </p>

                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    16:30
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push('/')
                }
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold transition hover:border-violet-400 dark:border-white/10"
              >
                Back to Home
              </button>
            </div>

            {/* Save Progress */}
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-400/20 dark:bg-violet-400/10">
              <div className="flex items-start gap-3">
                <Save className="mt-0.5 h-5 w-5 text-violet-600 dark:text-violet-300" />

                <div>
                  <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    Save your progress
                  </p>

                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    Create an account to easily track this request and save
                    your customer designs.
                  </p>

                  <Button className="mt-3 flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-16 pt-20 text-zinc-900 dark:bg-[#0b0c11] dark:text-zinc-100 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <div className="mb-6 flex items-center justify-between gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors hover:text-violet-600 dark:hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Main content */}
        <div className="w-full">
          <div className="space-y-4">

            {/* Timeline Header */}
            <div className="rounded-[20px] border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#111217]">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Build Your Custom Print
                  </h1>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Complete each step to configure your custom order
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-500">
                    Step{' '}
                    {timelineSteps.findIndex(
                      (s) =>
                        s.id === activeStep
                    ) + 1}{' '}
                    of {timelineSteps.length}
                  </span>

                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    {completedSteps.length}/
                    {timelineSteps.length}
                  </span>
                </div>
              </div>

              {/* Horizontal Timeline Steps */}
              <div className="mt-6">
                <div className="flex items-start justify-between">
                  {timelineSteps.map(
                    (step, index) => {
                      const isActive =
                        isStepActive(step.id);

                      const isCompleted =
                        isStepCompleted(
                          step.id
                        );

                      const isLocked =
                        isStepLocked(
                          step.id
                        );

                      return (
                        <button
                          key={step.id}
                          onClick={() =>
                            !isLocked &&
                            handleStepClick(
                              step.id
                            )
                          }
                          disabled={isLocked}
                          className="group relative flex flex-1 flex-col items-center gap-1.5"
                        >
                          <div className="flex w-full flex-col items-center">
                            {index > 0 && (
                              <div
                                className={`absolute left-0 top-4 h-0.5 w-1/2 -translate-y-1/2 ${
                                  isCompleted ||
                                  (isActive &&
                                    completedSteps.includes(
                                      timelineSteps[
                                        index -
                                          1
                                      ]?.id ||
                                        ''
                                    ))
                                    ? 'bg-violet-500'
                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                }`}
                              />
                            )}

                            {index <
                              timelineSteps.length -
                                1 && (
                              <div
                                className={`absolute right-0 top-4 h-0.5 w-1/2 -translate-y-1/2 ${
                                  isCompleted
                                    ? 'bg-violet-500'
                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isActive
                                  ? 'border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                  : isCompleted
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : isLocked
                                  ? 'border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500'
                                  : 'border-zinc-300 bg-white text-zinc-500 hover:border-violet-400 dark:border-zinc-600 dark:bg-[#111217] dark:text-zinc-400'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-bold">
                                  {index + 1}
                                </span>
                              )}
                            </div>

                            <span
                              className={`mt-2 text-xs font-semibold transition-colors ${
                                isActive
                                  ? 'text-violet-600 dark:text-violet-300'
                                  : isCompleted
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : isLocked
                                  ? 'text-zinc-400 dark:text-zinc-500'
                                  : 'text-zinc-600 hover:text-violet-500 dark:text-zinc-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Accordion Steps */}
            <div className="space-y-3">
              {timelineSteps.map(
                (step, index) => {
                  const isActive =
                    isStepActive(step.id);

                  const isCompleted =
                    isStepCompleted(
                      step.id
                    );

                  const isLocked =
                    isStepLocked(
                      step.id
                    );

                  return (
                    <div
                      key={step.id}
                      className={`rounded-[20px] border transition-all ${
                        isActive
                          ? 'border-violet-500 bg-white shadow-lg dark:bg-[#111217]'
                          : isCompleted
                          ? 'border-emerald-200 bg-white dark:border-emerald-400/20 dark:bg-[#111217]'
                          : 'border-zinc-200 bg-white/50 dark:border-white/10 dark:bg-[#111217]/50'
                      }`}
                    >
                      {/* Step Header */}
                      <button
                        onClick={() =>
                          !isLocked &&
                          handleStepClick(
                            step.id
                          )
                        }
                        className={`flex w-full items-center gap-4 p-5 text-left transition ${
                          isLocked
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5'
                        } ${
                          isActive
                            ? 'rounded-t-[20px]'
                            : 'rounded-[20px]'
                        }`}
                        disabled={isLocked}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                          {isCompleted ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check className="h-5 w-5" />
                            </div>
                          ) : isActive ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
                              {index + 1}
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-500 dark:bg-white/10">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                isActive
                                  ? 'text-violet-700 dark:text-violet-300'
                                  : isCompleted
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {step.label}
                            </span>

                            {isCompleted && (
                              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                ✓ Done
                              </span>
                            )}

                            {isLocked && (
                              <span className="text-[10px] font-bold uppercase text-zinc-400">
                                🔒 Locked
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs ${
                              isActive
                                ? 'text-zinc-600 dark:text-zinc-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {isActive ? (
                            <ChevronUp className="h-5 w-5 text-violet-500" />
                          ) : (
                            <ChevronDown
                              className={`h-5 w-5 ${
                                isCompleted
                                  ? 'text-emerald-500'
                                  : 'text-zinc-400'
                              }`}
                            />
                          )}
                        </div>
                      </button>

                      {/* Step Content */}
                      {isActive && (
                        <div className="border-t border-zinc-200 px-5 pb-6 pt-4 dark:border-white/10">
                          {renderStepContent(
                            step.id
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} />
    </main>
  );
}