'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { apiClient } from '../../lib/api';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsContact, setSameAsContact] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSameAsContact = (checked: boolean) => {
    setSameAsContact(checked);

    if (checked) {
      setWhatsappNumber(contactNumber);
    }
  };

  const handleContactChange = (value: string) => {
    setContactNumber(value);

    if (sameAsContact) {
      setWhatsappNumber(value);
    }
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !contactNumber.trim() || !whatsappNumber.trim() || !password.trim()) {
      showToast('❌ All fields are required.');
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(contactNumber.trim()) || !phoneRegex.test(whatsappNumber.trim())) {
      showToast('❌ Contact & WhatsApp numbers must be valid 10-digit mobile numbers.');
      return;
    }

    if (password.length < 8) {
      showToast('❌ Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/signup', {
        method: 'POST',
        body: {
          name: fullName.trim(),
          email: email.trim(),
          contactNumber: contactNumber.trim(),
          whatsappNumber: whatsappNumber.trim(),
          password: password,
        },
      });

      showToast('✓ Registration successful! Logging in... 🎉');

      // Auto-login after successful registration
      const signinRes = await apiClient('/auth/signin', {
        method: 'POST',
        body: {
          emailOrNumber: email.trim(),
          password: password,
        },
      });

      localStorage.setItem('neva-token', signinRes.token);
      if (signinRes.user) {
        localStorage.setItem('neva-user', JSON.stringify(signinRes.user));
      }
      showToast('✓ Logged in successfully! 🎉');

      window.dispatchEvent(new Event('neva-auth-change'));

      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err: any) {
      showToast(`❌ ${err.message || 'Connection error. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        min-h-screen overflow-x-hidden overflow-y-auto
        bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_25%),linear-gradient(180deg,#f8fafc,#eef2ff_35%,#f8fafc)]
        px-4 pb-8 pt-20
        text-zinc-900
        dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),transparent_25%),linear-gradient(180deg,#020817,#0b1120_35%,#020817)]
        dark:text-white
        sm:pb-10 sm:pt-24
        md:h-screen md:overflow-hidden
      "
    >
      <div
        className="
          flex w-full items-start justify-center
          md:h-[calc(100vh-7rem)] md:items-center
        "
      >
        <div className="w-full max-w-6xl">

          <div
            className="
              grid overflow-hidden rounded-2xl
              border border-zinc-200/80
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
                relative hidden overflow-hidden
                border-r border-zinc-200/80
                bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,255,0.9))]
                p-8
                dark:border-zinc-200/20
                dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(9,13,22,0.92))]
                md:flex md:flex-col md:justify-between
              "
            >

              <div
                className="
                  pointer-events-none absolute inset-0
                  bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),transparent_18%)]
                  dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.24),transparent_18%)]
                "
              />

              <div className="relative z-10">
                <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-600 dark:text-cyan-300/90">
                  Join neva
                </div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Create your account.
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
                sm:p-8
                md:p-10
                dark:bg-[#050b17]/90
              "
            >

              {/* HEADER */}
              <div className="mb-6 flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-600 dark:text-cyan-300">
                    NIVASHOP
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Sign Up
                  </h2>
                </div>

                <div
                  className="
                    rounded-full
                    border border-cyan-200
                    bg-cyan-100
                    px-2.5 py-1
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-cyan-700
                    dark:border-cyan-500/30
                    dark:bg-cyan-500/10
                    dark:text-cyan-200
                  "
                >
                  New
                </div>

              </div>

              {/* FORM */}
              <form
                className="space-y-4"
                onSubmit={handleSignup}
              >

                {/* NAME + EMAIL */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* FULL NAME */}
                  <div>
                    <label htmlFor="fullName" className="form-label">
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>

                </div>

                {/* CONTACT + WHATSAPP */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* CONTACT NUMBER */}
                  <div>
                    <label htmlFor="contactNumber" className="form-label">
                      Contact Number
                    </label>

                    <input
                      id="contactNumber"
                      type="tel"
                      name="contactNumber"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={contactNumber}
                      onChange={(event) =>
                        handleContactChange(event.target.value)
                      }
                      className="form-input"
                    />
                  </div>

                  {/* WHATSAPP */}
                  <div>
                    <label htmlFor="whatsappNumber" className="form-label">
                      WhatsApp Number
                    </label>

                    <input
                      id="whatsappNumber"
                      type="tel"
                      name="whatsappNumber"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      value={whatsappNumber}
                      disabled={sameAsContact}
                      onChange={(event) =>
                        setWhatsappNumber(event.target.value)
                      }
                      className="form-input disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={sameAsContact}
                        onChange={(event) =>
                          handleSameAsContact(event.target.checked)
                        }
                        className="
                          h-4 w-4
                          rounded
                          border-zinc-300
                          bg-zinc-100
                          text-cyan-600
                          focus:ring-cyan-400
                          dark:border-zinc-600
                          dark:bg-zinc-800
                          dark:text-cyan-500
                        "
                      />

                      Same as Contact Number
                    </label>
                  </div>

                </div>

                {/* PASSWORD */}
                <div>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* CREATE ACCOUNT */}
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                  className="
                    mt-1
                    w-full
                    text-sm
                    uppercase
                    tracking-[0.2em]
                  "
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

              </form>

              {/* LOGIN */}
              <div className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  style={{ cursor: 'pointer' }}
                  className="font-semibold text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Login
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