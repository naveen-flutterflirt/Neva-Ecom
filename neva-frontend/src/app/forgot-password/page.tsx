'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Form State
  const [step, setStep] = useState<1 | 2>(1); // 1: Email Request, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast('❌ Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast('❌ Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: { email: cleanEmail },
      });

      showToast('✓ 6-Digit OTP verification code sent! Check your email 📧');
      setOtp('');
      setStep(2);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Failed to request OTP. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Change Password
  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!otp.trim() || otp.trim().length < 6) {
      showToast('❌ Please enter the 6-digit OTP code.');
      return;
    }

    if (!newPassword.trim()) {
      showToast('❌ Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      showToast('❌ New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('❌ New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword: newPassword,
        },
      });

      showToast('✓ Password reset successfully! Redirecting to login... 🎉');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Failed to reset password. Check your OTP code.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        h-screen
        overflow-hidden
        bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),transparent_25%),linear-gradient(180deg,#f8fafc,#eef2ff_35%,#f8fafc)]
        px-3
        pt-16
        text-zinc-900
        dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),transparent_25%),linear-gradient(180deg,#020817,#0b1120_35%,#020817)]
        dark:text-white
        sm:px-4
        sm:pt-20
      "
    >
      <Toast message={toastMessage} />

      {/* CENTER CONTAINER */}
      <div
        className="
          flex
          h-[calc(100vh-4rem)]
          w-full
          items-center
          justify-center
          sm:h-[calc(100vh-5rem)]
        "
      >
        <div className="w-full max-w-6xl">
          <div
            className="
              grid
              overflow-hidden
              rounded-2xl
              border
              border-zinc-200/80
              bg-white/80
              shadow-[0_0_60px_rgba(168,85,247,0.08)]
              backdrop-blur-md
              dark:border-zinc-200/60
              dark:bg-white/5
              dark:shadow-[0_0_60px_rgba(168,85,247,0.12)]
              sm:rounded-[30px]
              md:grid-cols-2
            "
          >
            {/* LEFT SECTION (Video Showcase matching Login) */}
            <div
              className="
                relative
                hidden
                overflow-hidden
                border-r
                border-zinc-200/80
                bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.9))]
                p-8
                md:flex
                md:flex-col
                md:justify-between
                dark:border-zinc-200/20
                dark:bg-[linear-gradient(135deg,rgba(17,24,39,0.96),rgba(9,13,22,0.92))]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),transparent_18%)]
                  dark:bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.24),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.24),transparent_18%)]
                "
              />

              <div className="relative z-10">
                <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.38em] text-violet-600 dark:text-cyan-300/90">
                  Account Recovery
                </div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  {step === 1 ? 'Reset your password.' : 'Set new password.'}
                </h1>

                <div className="mt-4 w-full overflow-hidden rounded-2xl">
                  <video
                    src="/yeti_idle.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-[380px] w-full scale-130 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SECTION (Dynamic Form Steps) */}
            <div
              className="
                bg-white/85
                p-6
                dark:bg-[#050b17]/90
                sm:p-8
                md:p-10
                flex
                flex-col
                justify-center
              "
            >
              {/* HEADER */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300 sm:text-[10px] sm:tracking-[0.32em]">
                    NIVASHOP.IN
                  </p>

                  <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:mt-2 sm:text-3xl">
                    {step === 1 ? 'Forgot Password' : 'Enter OTP & Reset'}
                  </h2>
                </div>

                <div className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                  Step {step} of 2
                </div>
              </div>

              {step === 1 ? (
                /* STEP 1: REQUEST OTP FORM */
                <form className="space-y-5" onSubmit={handleRequestOtp}>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Enter your registered email address. We will verify your account and generate a <strong>6-digit OTP code</strong> for password reset.
                  </p>

                  {/* REGISTERED EMAIL INPUT */}
                  <div>
                    <label htmlFor="email" className="form-label">
                      Registered Email Address
                    </label>

                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                      className="w-full text-xs uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.2em] py-3.5"
                    >
                      {loading ? 'Verifying Email...' : 'Send 6-Digit OTP Code'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="w-full py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: ENTER OTP & NEW PASSWORD FORM */
                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    OTP sent to <strong className="text-purple-600 dark:text-purple-400 font-mono">{email}</strong>. Enter the 6-digit code and your new password below.
                  </p>

                  {/* OTP CODE INPUT */}
                  <div>
                    <label htmlFor="otp" className="form-label flex justify-between items-center">
                      <span>6-Digit OTP Code</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
                      >
                        Change Email
                      </button>
                    </label>

                    <div className="relative">
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="form-input text-center font-mono tracking-[0.4em] font-extrabold text-base pr-4"
                      />
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    </div>
                  </div>

                  {/* NEW PASSWORD INPUT */}
                  <div>
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>

                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        title={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM NEW PASSWORD INPUT */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input pl-10 pr-10"
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                      className="w-full text-xs uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.2em] py-3.5"
                    >
                      {loading ? 'Changing Password...' : 'Change Password & Reset'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Email Step
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}