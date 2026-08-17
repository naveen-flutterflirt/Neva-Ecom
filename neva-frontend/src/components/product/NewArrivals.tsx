'use client';

import React, { useState } from 'react';
import { ShoppingCart, Eye, Star, Sparkles, Cpu, Layers, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    image: string;
    badge?: string;
    isIoT: boolean;
    description: string;
    specs: Record<string, string>;
}

const dummyProducts: Product[] = [
    {
        id: '1',
        name: 'Neva Silk PLA Violet Spool',
        category: '3D Printing',
        price: 1299,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80',
        badge: 'Best Seller',
        isIoT: false,
        description: 'Industrial-grade Silk PLA filament offering high gloss finish, low shrinkage, and excellent layer adhesion for high-end decorative prints.',
        specs: {
            "Material": "Silk PLA",
            "Diameter": "1.75mm",
            "Spool Weight": "1.0 kg",
            "Print Temp": "190-220°C",
            "Bed Temp": "50-60°C"
        }
    },
    {
        id: '2',
        name: 'Neva Node IoT Core v2',
        category: 'Smart IoT',
        price: 849,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=600&q=80',
        badge: 'New',
        isIoT: true,
        description: 'A high-performance IoT development board powered by ESP32, featuring integrated Wi-Fi + Bluetooth, 4MB flash, and 26 GPIO pins for smart hardware integration.',
        specs: {
            "Chipset": "ESP-WROOM-32",
            "Memory": "4MB Flash / 520KB SRAM",
            "Connectivity": "Wi-Fi 802.11 b/g/n & BLE 4.2",
            "Input Voltage": "5V USB / 3.3V-12V Vin",
            "Interfaces": "I2C, SPI, UART, PWM"
        }
    },
    {
        id: '3',
        name: 'Neva Matte PLA Emerald Spool',
        category: '3D Printing',
        price: 1199,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80',
        isIoT: false,
        description: 'Stunning matte texture finish filament designed for architectural mockups, figurines, and low-visibility layer lines.',
        specs: {
            "Material": "Matte PLA",
            "Diameter": "1.75mm",
            "Spool Weight": "1.0 kg",
            "Print Temp": "195-215°C",
            "Bed Temp": "0-60°C"
        }
    },
    {
        id: '4',
        name: 'Neva IoT Motor Shield v1.2',
        category: 'Smart IoT',
        price: 499,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80',
        badge: 'Popular',
        isIoT: true,
        description: 'Robust motor driver extension board for microcontrollers, supporting dual DC motors or stepper motors with thermal shutdown and overload protection.',
        specs: {
            "Driver Chip": "L293D / TB6612FNG",
            "Max Current": "1.2A per channel",
            "Input Range": "4.5V - 13.5V",
            "Outputs": "2x Stepper or 4x DC Motors",
            "Protection": "Over-temperature & ESD"
        }
    },
];

export default function NewArrivals() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1); // Reset quantity on open
    };

    return (
        <section className="relative bg-zinc-950 pt-8 pb-24 text-white overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px]" />
            <div className="pointer-events-none absolute -right-[10%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-pink-500/5 blur-[120px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent"
                    >
                        New Arrivals
                    </motion.h2>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {dummyProducts.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            whileHover={{ y: -6 }}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(109,40,217,0.15)]"
                        >
                            {/* Product Badge */}
                            {product.badge && (
                                <div className="absolute left-3 top-3 z-10 rounded-lg bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 backdrop-blur-sm shadow-md">
                                    {product.badge}
                                </div>
                            )}

                            {/* Image Showcase */}
                            <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-center pb-6">
                                    <div className="flex gap-2.5">
                                        <button 
                                            onClick={() => handleOpenModal(product)}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                                            title="Quick Shop"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleOpenModal(product)}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                                            title="Quick View Details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="flex flex-1 flex-col p-5">
                                {/* Category Badge */}
                                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                                    {product.isIoT ? (
                                        <Cpu className="h-3 w-3 text-pink-400" />
                                    ) : (
                                        <Layers className="h-3 w-3 text-violet-400" />
                                    )}
                                    {product.category}
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors duration-200 line-clamp-1 mb-2">
                                    {product.name}
                                </h3>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-4">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-semibold text-zinc-300">{product.rating}</span>
                                    <span className="text-[10px] text-zinc-600">(12 reviews)</span>
                                </div>

                                {/* Price / Action Spacer */}
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-800/60">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Price</span>
                                        <span className="text-lg font-black text-white">₹{product.price}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenModal(product)}
                                        className="rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-xs px-4 py-2.5 transition-all duration-200"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick View Details Modal Popup */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-md"
                        />

                        {/* Modal Card Panel */}
                        <motion.div
                            initial={{ scale: 0.92, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.92, y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 text-white backdrop-blur-xl shadow-2xl max-h-[90vh] md:max-h-[80vh]"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-90 transition-all duration-200"
                                aria-label="Close details"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Left Side: Product Image Display */}
                            <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-auto overflow-hidden bg-zinc-950">
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="h-full w-full object-cover"
                                />
                                {selectedProduct.badge && (
                                    <div className="absolute left-4 top-4 rounded-lg bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-400 backdrop-blur-sm shadow-md">
                                        {selectedProduct.badge}
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Specifications and Description Info */}
                            <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col justify-between">
                                <div>
                                    {/* Category */}
                                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">
                                        {selectedProduct.isIoT ? (
                                            <Cpu className="h-4 w-4 text-pink-400" />
                                        ) : (
                                            <Layers className="h-4 w-4 text-violet-400" />
                                        )}
                                        {selectedProduct.category}
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
                                        {selectedProduct.name}
                                    </h2>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1.5 mb-6">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        <span className="text-sm font-semibold text-zinc-200">{selectedProduct.rating}</span>
                                        <span className="text-xs text-zinc-500">•</span>
                                        <span className="text-xs font-medium text-violet-400 hover:underline cursor-pointer">Write a review</span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                        {selectedProduct.description}
                                    </p>

                                    {/* Technical Specs List */}
                                    <div className="mb-8">
                                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">
                                            <Info className="h-4 w-4 text-violet-400" />
                                            Specifications
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 border border-zinc-800 bg-zinc-950/40 p-4 rounded-2xl">
                                            {Object.entries(selectedProduct.specs).map(([key, val]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{key}</span>
                                                    <span className="text-xs font-medium text-zinc-200">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Quantity, Price and Action Button */}
                                <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between mt-auto">
                                    <div className="flex flex-col w-full sm:w-auto">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Unit Price</span>
                                        <span className="text-2xl font-black text-white">₹{selectedProduct.price}</span>
                                    </div>

                                    {/* Quantity Toggle */}
                                    <div className="flex items-center border border-zinc-800 bg-zinc-950/40 rounded-xl px-2.5 py-1.5 w-full sm:w-auto justify-between">
                                        <button 
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            className="h-8 w-8 text-zinc-400 hover:text-white font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 font-bold text-sm w-8 text-center">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(prev => prev + 1)}
                                            className="h-8 w-8 text-zinc-400 hover:text-white font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Add button */}
                                    <button 
                                        onClick={() => {
                                            alert(`Added ${quantity} x ${selectedProduct.name} to Cart!`);
                                            setSelectedProduct(null);
                                        }}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-bold text-sm px-6 py-3.5 w-full sm:w-auto transition-all duration-200 shadow-lg shadow-violet-600/10"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to Cart • ₹{selectedProduct.price * quantity}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
