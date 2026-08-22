'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [emailOrNumber, setEmailOrNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailOrNumber.trim() || !password.trim()) {
      showToast('❌ Email/contact number and password are required.');
      return;
    }

    setLoading(true);
    try {
      const resData = await apiClient('/auth/signin', {
        method: 'POST',
        body: {
          emailOrNumber: emailOrNumber.trim(),
          password: password,
        },
      });

      showToast('✓ Sign-in successful! 🎉');
      localStorage.setItem('neva-token', resData.token);

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Connection error. Please try again.'}`);
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

            {/* LEFT SECTION */}
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
                  Welcome back
                </div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Power your next build.
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

                {/* <div className="relative z-10 space-y-4 text-sm text-zinc-600 dark:text-zinc-300">

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700/80 dark:bg-zinc-900/70">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                    Fast shipping
                  </p>

                  <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-100">
                    Track your orders and unlock custom filament updates.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700/80 dark:bg-zinc-900/70">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
                    Smart support
                  </p>

                  <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-100">
                    Get real-time help for IoT devices and 3D printing projects.
                  </p>
                </div> */}

              </div>
            </div>

            {/* RIGHT / LOGIN SECTION */}
            <div
              className="
                bg-white/85
                p-5
                dark:bg-[#050b17]/90
                sm:p-8
                md:p-10
                max-[320px]:p-3
              "
            >

              {/* HEADER */}
              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                  sm:mb-6
                  max-[320px]:mb-3
                "
              >

                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.28em]
                      text-violet-600
                      dark:text-violet-300
                      sm:text-[10px]
                      sm:tracking-[0.32em]
                    "
                  >
                    NIVASHOP.IN
                  </p>

                  <h2
                    className="
                      mt-1
                      text-2xl
                      font-black
                      tracking-tight
                      text-zinc-900
                      dark:text-white
                      sm:mt-2
                      sm:text-3xl
                      max-[320px]:text-xl
                    "
                  >
                    Login
                  </h2>
                </div>

                <div
                  className="
                    rounded-full
                    border
                    border-violet-200
                    bg-violet-100
                    px-2
                    py-1
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-violet-700
                    dark:border-violet-500/30
                    dark:bg-violet-500/10
                    dark:text-violet-200
                    sm:px-2.5
                    sm:text-[9px]
                    max-[320px]:px-1.5
                    max-[320px]:py-0.5
                    max-[320px]:text-[7px]
                  "
                >
                  Member
                </div>

              </div>

              {/* LOGIN FORM */}
              <form
                className="
                  space-y-3
                  sm:space-y-4
                  max-[320px]:space-y-2
                "
                onSubmit={handleLogin}
              >

                {/* EMAIL OR CONTACT NUMBER */}
                <div>
                  <label htmlFor="loginIdentifier" className="form-label">
                    Email / Contact Number
                  </label>

                  <input
                    id="loginIdentifier"
                    type="text"
                    name="loginIdentifier"
                    autoComplete="username"
                    placeholder="abc@example.com / 9876543210"
                    value={emailOrNumber}
                    onChange={(e) => setEmailOrNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* REMEMBER / FORGOT */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    text-[10px]
                    text-zinc-500
                    dark:text-zinc-400
                    sm:text-xs
                    max-[320px]:text-[9px]
                  "
                >

                  <label className="flex items-center gap-1.5 sm:gap-2">
                    <input
                      type="checkbox"
                      className="
                        h-3.5
                        w-3.5
                        rounded
                        border-zinc-300
                        bg-zinc-100
                        text-violet-600
                        focus:ring-violet-400
                        dark:border-zinc-600
                        dark:bg-zinc-800
                        dark:text-violet-500
                        sm:h-4
                        sm:w-4
                      "
                    />

                    Remember me
                  </label>

                  <Link
                    href="/forgot-password"
                    className="
                      whitespace-nowrap
                      font-medium
                      text-violet-600
                      transition
                      hover:text-violet-500
                      dark:text-violet-300
                      dark:hover:text-violet-200
                    "
                  >
                    Forgot password?
                  </Link>

                </div>

                {/* LOGIN BUTTON */}
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  className="
                    w-full
                    text-xs
                    uppercase
                    tracking-[0.16em]
                    sm:text-sm
                    sm:tracking-[0.2em]
                    max-[320px]:text-[10px]
                  "
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>

              </form>

              {/* DIVIDER */}
              <div
                className="
                  mt-4
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  text-zinc-500
                  dark:text-zinc-500
                  sm:mt-5
                  sm:gap-3
                  sm:text-xs
                  max-[320px]:mt-3
                "
              >
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />

                <span>or</span>

                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* SIGN UP */}
              <div
                className="
                  mt-4
                  text-center
                  text-xs
                  text-zinc-500
                  dark:text-zinc-400
                  sm:mt-5
                  sm:text-sm
                  max-[320px]:mt-3
                  max-[320px]:text-[10px]
                "
              >
                Don&apos;t have an account?{' '}

                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  style={{ cursor: 'pointer' }}
                  className="
                    font-semibold
                    text-violet-600
                    transition
                    hover:text-violet-500
                    dark:text-violet-300
                    dark:hover:text-violet-200
                  "
                >
                  Sign Up
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} />
    </main>
  );
}