'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      showToast('❌ Please provide your email address.');
      return;
    }

    if (!cleanOtp || cleanOtp.length < 6) {
      showToast('❌ Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient('/auth/verify-email', {
        method: 'POST',
        body: {
          email: cleanEmail,
          otp: cleanOtp,
        },
      });

      showToast('✓ Email verified successfully! Logging you in... 🎉');

      if (res.token) {
        localStorage.setItem('neva-token', res.token);
      }
      if (res.user) {
        localStorage.setItem('neva-user', JSON.stringify(res.user));
      }

      window.dispatchEvent(new Event('neva-auth-change'));

      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Verification failed. Please check your code.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast('❌ Please provide your email address first.');
      return;
    }

    setResending(true);
    try {
      await apiClient('/auth/resend-verification-otp', {
        method: 'POST',
        body: { email: cleanEmail },
      });

      showToast('✓ A new verification code has been dispatched to your email! 📧');
      setCountdown(60);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Failed to resend verification code.'}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <main
      className="
        h-screen
        overflow-hidden
        bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_25%),linear-gradient(180deg,#f8fafc,#eef2ff_35%,#f8fafc)]
        px-3
        pt-16
        text-zinc-900
        dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),transparent_25%),linear-gradient(180deg,#020817,#0b1120_35%,#020817)]
        dark:text-white
        sm:px-4
        sm:pt-20
      "
    >
      <Toast message={toastMessage} />

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
              shadow-[0_0_60px_rgba(34,211,238,0.08)]
              backdrop-blur-md
              dark:border-zinc-200/60
              dark:bg-white/5
              dark:shadow-[0_0_60px_rgba(34,211,238,0.12)]
              sm:rounded-[30px]
              md:grid-cols-2
            "
          >
            {/* LEFT SECTION */}
            <div
              className="
                relative
                hidden
                overflow-hidden
                border-r
                border-zinc-200/80
                bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.9))]
                p-8
                md:flex
                md:flex-col
                md:justify-between
                dark:border-zinc-200/20
                dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(9,13,22,0.92))]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),transparent_18%)]
                  dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.24),transparent_18%)]
                "
              />

              <div className="relative z-10">
                <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-600 dark:text-cyan-300/90">
                  Account Verification
                </div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Verify your email.
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

            {/* RIGHT SECTION */}
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
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-600 dark:text-cyan-300">
                    NIVASHOP
                  </p>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Email Verification
                  </h2>
                </div>

                <div className="rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                  Security
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleVerify}>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We have sent a <strong>6-digit verification code</strong> to your email. Enter it below to activate your account.
                </p>

                {/* EMAIL ADDRESS */}
                <div>
                  <label htmlFor="verifyEmail" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="verifyEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="form-input pl-10"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  </div>
                </div>

                {/* OTP CODE */}
                <div>
                  <label htmlFor="verifyOtp" className="form-label flex justify-between items-center">
                    <span>6-Digit Verification Code</span>
                    <button
                      type="button"
                      disabled={countdown > 0 || resending}
                      onClick={handleResendOtp}
                      className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 disabled:opacity-50 cursor-pointer"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : resending ? 'Resending...' : 'Resend Code'}
                    </button>
                  </label>

                  <div className="relative">
                    <input
                      id="verifyOtp"
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="form-input text-center font-mono tracking-[0.4em] font-extrabold text-lg pr-4"
                    />
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  </div>
                </div>

                {/* VERIFY BUTTON */}
                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                    className="w-full text-xs uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.2em] py-3.5"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="w-full py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
