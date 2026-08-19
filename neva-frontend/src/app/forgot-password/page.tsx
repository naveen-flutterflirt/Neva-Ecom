'use client';

import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <main
      className="
        min-h-screen
        overflow-y-auto
        bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),transparent_25%),linear-gradient(180deg,#f8fafc,#eef2ff_35%,#f8fafc)]
        px-4
        pb-8
        pt-20
        text-zinc-900
        dark:bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.14),transparent_25%),linear-gradient(180deg,#020817,#0b1120_35%,#020817)]
        dark:text-white
        md:h-screen
        md:overflow-hidden
        md:pb-0
        md:pt-0
      "
    >
      <div
        className="
          flex
          min-h-[calc(100vh-5rem)]
          w-full
          items-start
          justify-center
          pt-4
          sm:pt-6
          md:h-screen
          md:min-h-0
          md:items-center
          md:pt-16
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
                <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.38em] text-violet-600 dark:text-violet-300/90">
                  Security
                </div>

                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Reset your access.
                </h1>
              </div>

              <div className="relative z-10 space-y-4 text-sm text-zinc-600 dark:text-zinc-300">

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700/80 dark:bg-zinc-900/70">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                    OTP verify
                  </p>

                  <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-100">
                    Receive a secure code to your email or phone for quick verification.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700/80 dark:bg-zinc-900/70">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
                    Account recovery
                  </p>

                  <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-100">
                    Create a fresh password and get back to your orders and saved favourites.
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="bg-white/85 p-6 sm:p-8 md:p-10 dark:bg-[#050b17]/90">

              {/* HEADER */}
              <div className="mb-8 flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
                    NIVASHOP.IN
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Forgot Password
                  </h2>
                </div>

                <div className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                  Help
                </div>

              </div>

              {/* FORM */}
              <form
                className="space-y-5"
                onSubmit={(event) => event.preventDefault()}
              >

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/30"
                  />
                </div>

                {/* CONTACT NUMBER */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400"
                  >
                    Contact Number
                  </label>

                  <input
                    id="contactNumber"
                    type="tel"
                    name="contactNumber"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-500 dark:focus:border-violet-400 dark:focus:ring-violet-500/30"
                  />
                </div>

                {/* BUTTONS */}
                <div className="flex items-center gap-3 pt-2">

                  {/* SEND OTP */}
                  <Button
                    type="submit"
                    style={{ cursor: 'pointer' }}
                    className="
    flex-1
    rounded-2xl
    px-4
    py-3
    uppercase
    tracking-[0.12em]
  "
>
                    Send OTP
                  </Button>

                  {/* BACK */}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    style={{ cursor: 'pointer' }}
                    className="
                      rounded-2xl
                      border
                      border-zinc-200
                      bg-zinc-100
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-zinc-700
                      
                      
                    "
                  >
                    Back
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