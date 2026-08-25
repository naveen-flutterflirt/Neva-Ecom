'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-full text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            Legal Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Welcome to NIVASHOP. Please read these terms carefully before placing orders for our custom 3D printing services, IoT hardware components, and store products.
          </p>
          <div className="pt-2 text-xs font-semibold text-zinc-400">
            Last Updated: August 24, 2026 • Version 2.4
          </div>
        </div>

        {/* Legal Sections Container */}
        <div className="bg-white dark:bg-[#111218] border border-zinc-200/80 dark:border-white/5 rounded-3xl p-6 sm:p-10 shadow-sm space-y-10">

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">1</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Acceptance of Terms</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              By accessing, browsing, creating an account, or placing an order on NIVASHOP ("Website", "We", "Us", or "Our"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must refrain from using our platform and manufacturing services.
            </p>
          </section>

          {/* Section 2 - Custom 3D Printing */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Custom 3D Printing &amp; Manufacturing Services</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                NIVASHOP provides specialized additive manufacturing (3D printing) based on 3D CAD mesh files (.STL, .OBJ, .STEP) and reference specification images uploaded by users.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                <li><strong className="text-zinc-800 dark:text-zinc-200">Dimensional Tolerances:</strong> Standard FDM and SLA prints carry a dimensional tolerance of ±0.2mm or 0.2%, whichever is greater.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">Material Integrity:</strong> Selected materials (PLA, PETG, ABS, Carbon Fiber) will be processed as requested. Surface layer lines are inherent characteristics of additive manufacturing unless post-processing is explicitly requested.</li>
                <li><strong className="text-zinc-800 dark:text-zinc-200">File Validation:</strong> Our automated and engineering review teams verify file geometry before printing. If a mesh file contains non-manifold geometry or unprintable thin walls, we reserve the right to pause production and request an updated file.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 - Pricing & Quotes */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">3</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Pricing, Quotations &amp; Orders</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                All prices listed on standard store products are in Indian Rupees (INR ₹) inclusive of applicable taxes unless specified otherwise.
              </p>
              <p>
                For custom print requests, manual quote estimates are calculated based on volume, material choice, infill percentage, and print duration. Custom quotes remain valid for 14 days from issuance.
              </p>
            </div>
          </section>

          {/* Section 4 - Payment */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">4</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Gateway &amp; Transactions</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              Payments are securely processed via Razorpay supporting UPI, Credit/Debit Cards, and NetBanking. Production on custom 3D orders begins strictly after payment confirmation. We do not store credit card or banking PIN details on our servers.
            </p>
          </section>

          {/* Section 5 - Intellectual Property */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">5</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Intellectual Property &amp; File Ownership</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">User Ownership:</strong> You retain 100% full intellectual property rights to any 3D models, CAD drawings, or designs uploaded to NIVASHOP.
              </p>
              <p>
                We execute strict confidentiality. Your uploaded files will strictly be used for manufacturing, quality inspection, and quote generation, and will <strong className="text-zinc-800 dark:text-zinc-200">NEVER</strong> be resold, shared, or distributed to third parties.
              </p>
            </div>
          </section>

          {/* Section 6 - Cancellations & Returns */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">6</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Cancellations &amp; Returns Policy</h2>
            </div>
            <div className="pl-10 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">Standard Products:</strong> Standard catalog items can be returned within 7 days of receipt if unopened and undamaged.
              </p>
              <p>
                <strong className="text-zinc-800 dark:text-zinc-200">Custom 3D Print Items:</strong> Custom manufactured parts are unique to your specifications. Cancellations are permitted prior to slicing/printing initiation. Once printing has commenced, custom orders cannot be cancelled or refunded unless there is a verifiable manufacturing defect or shipping damage.
              </p>
            </div>
          </section>

          {/* Section 7 - Governing Law */}
          <section className="space-y-3 pt-6 border-t border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center">7</span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Governing Law &amp; Contact</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-10">
              These terms shall be governed by and construed in accordance with the laws of India. For legal inquiries or support regarding these terms, please contact us at <a href="mailto:hello@nivashop.com" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">hello@nivashop.com</a>.
            </p>
          </section>

        </div>

        {/* Footer Support Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-base font-extrabold">Have questions about custom order terms?</h3>
            <p className="text-xs text-violet-100 mt-1">Our engineering support team is here to assist you 24/7.</p>
          </div>
          <a
            href="mailto:hello@nivashop.com"
            className="px-5 py-2.5 bg-white text-violet-700 hover:bg-violet-50 rounded-xl text-xs font-bold transition shrink-0 uppercase tracking-wider"
          >
            Contact Support
          </a>
        </div>

      </div>
    </main>
  );
}
