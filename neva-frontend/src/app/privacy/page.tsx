'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, FileCheck, Eye, HardDrive, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-zinc-800 dark:text-zinc-150 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Back Link */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-violet-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 rounded-full text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            Data Protection &amp; Confidentiality
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            At NIVASHOP, we are committed to protecting your personal data, shipping details, and proprietary 3D design files with absolute confidentiality and enterprise security.
          </p>
          <div className="pt-2 text-xs font-semibold text-zinc-400">
            Last Updated: August 24, 2026 • Version 2.4
          </div>
        </div>

        {/* Privacy Sections Container */}
        <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-3xl p-6 sm:p-10 shadow-sm space-y-10">

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">1</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Information We Collect</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                When you use NIVASHOP, register an account, or order custom 3D products, we collect essential information required to fulfill your requests:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                <li><strong className="text-zinc-800 dark:text-zinc-200">Account Credentials:</strong> Full Name, Email Address, Contact Number, and WhatsApp Number.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Shipping Details:</strong> Delivery street address, landmark, city, state, and pincode.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Design Specifications:</strong> 3D mesh CAD model files (.STL, .OBJ, .STEP), reference images, dimensions, material selections, and custom instructions.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 - Confidentiality of 3D CAD Files */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">100% CAD &amp; 3D Design Confidentiality Guarantee</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-cyan-800 dark:text-cyan-200 text-xs font-semibold">
                🔒 Guarantee: Your uploaded 3D CAD files belong exclusively to you. NIVASHOP does NOT claim any ownership rights over your uploaded models.
              </div>
              <p>
                We use your 3D files strictly for slice preparation, manufacturing analysis, quote calculation, and printing. Your files will <strong className="text-zinc-800 dark:text-zinc-200">NEVER</strong> be published, shared, sold, or distributed to any third parties or public repositories.
              </p>
            </div>
          </section>

          {/* Section 3 - Payment Encryption */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">3</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Processing Security</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              All financial transactions are handled securely through Razorpay using PCI-DSS Level 1 compliant encryption. NIVASHOP does not collect or store your credit/debit card numbers, UPI PINs, or banking passwords.
            </p>
          </section>

          {/* Section 4 - Storage & Cookies */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">4</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cookies &amp; Local Session Storage</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              We utilize essential browser local storage and cookies strictly to maintain your logged-in authentication session and preserve items in your shopping cart. We do not use intrusive cross-site tracking cookies.
            </p>
          </section>

          {/* Section 5 - Your Data Control Rights */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">5</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Rights &amp; Data Control</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                You have the right to inspect, update, or request the deletion of your account and personal data at any time.
              </p>
              <p>
                If you wish to delete your account or purge your order files from our manufacturing servers, simply send a request to <a href="mailto:hello@nivashop.com" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">hello@nivashop.com</a>.
              </p>
            </div>
          </section>

          {/* Section 6 - Contact */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center">6</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Privacy Officer Contact</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              If you have any questions or privacy concerns regarding this policy, please reach out to our privacy officer at <a href="mailto:hello@nivashop.com" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline">hello@nivashop.com</a>.
            </p>
          </section>

        </div>

        {/* Footer Support Banner */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-base font-extrabold">Need custom non-disclosure agreement (NDA)?</h3>
            <p className="text-xs text-cyan-100 mt-1">We sign standard NDAs for proprietary enterprise 3D CAD files.</p>
          </div>
          <a
            href="mailto:hello@nivashop.com?subject=NDA Request"
            className="px-5 py-2.5 bg-white text-cyan-700 hover:bg-cyan-50 rounded-xl text-xs font-bold transition shrink-0 uppercase tracking-wider"
          >
            Request NDA
          </a>
        </div>

      </div>
    </main>
  );
}
