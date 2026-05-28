'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DUMMY_CREDENTIALS, type Role } from '../../../lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const roleRoutes: Record<Role, string> = {
    kasir: '/kasir',
    apoteker: '/apoteker',
    owner: '/owner',
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Masukkan email yang valid';
    }
    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (password.length < 4) {
      newErrors.password = 'Kata sandi minimal 4 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const matched = DUMMY_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (matched) {
      toast.success(`Selamat datang! Masuk sebagai ${matched.role.charAt(0).toUpperCase() + matched.role.slice(1)}...`);
      setTimeout(() => {
        router.push(roleRoutes[matched.role]);
      }, 600);
    } else {
      setIsLoading(false);
      toast.error('Kredensial tidak valid. Silakan coba lagi.');
      setErrors({ password: 'Email atau kata sandi salah' });
    }
  };

  return (
    <div className="flex-1 w-full flex overflow-hidden bg-background text-on-surface">
      {/* Left Panel: Brand Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-variant overflow-hidden">
        <img
          alt="Ruang Klinik Mewah"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHPcK59PTG0E1mqCUvxTnKbfEyickMNvKx-4TqkT6lOu0_hK7BIOjw5oD74gqHiXy6EicvqWtz87fjFfaLq0KyBeDKXDxhFr_F4WTaKDaqMXp7-7ku0Q_PSyUsHnW5QLFMU6d_lnC-HnQvEKlAaIki_4E6iMydzI4Y5bI_8T-QWO8G3ZGx4Za5Vn049joACXF3NnJ8V4cXESX0hAbW2Ua0UdUSCQYxm5pGe3RtSokuK3oyGILba2IYm8HwX_VcT0oyZsihIt35WNHc"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#22211D]/90 via-[#22211D]/40 to-transparent"></div>
        <div className="absolute bottom-margin left-margin right-margin text-white">
          <div className="max-w-lg">
            <span
              className="material-symbols-outlined text-4xl mb-stack-sm opacity-80"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              format_quote
            </span>
            <h2 className="font-headline-lg text-headline-lg mb-stack-md leading-tight text-white">
              Kulit Sehat, Tampil Percaya Diri
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 text-white/90">
              Rasakan perpaduan sempurna antara manajemen klinik presisi dan perawatan kulit berkualitas tinggi. Sunrise menyederhanakan praktik Anda agar Anda dapat fokus pada hasil yang luar biasa.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center relative bg-surface-container-lowest px-gutter py-8 sm:px-16 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6 pb-16">
          {/* Header Section */}
          <div className="text-center flex flex-col items-center">
            {/* Sunrise Logo */}
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
              <g transform="translate(50, 55)">
                {Array.from({ length: 17 }).map((_, i) => {
                  const angle = -180 + i * (180 / 16);
                  const rad = (angle * Math.PI) / 180;
                  const x1 = Math.cos(rad) * 18;
                  const y1 = Math.sin(rad) * 18;
                  const x2 = Math.cos(rad) * 38;
                  const y2 = Math.sin(rad) * 38;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C2A058" strokeWidth="2" />;
                })}
                <path d="M -15 0 A 15 15 0 0 1 15 0" stroke="#C2A058" strokeWidth="2.5" fill="none" />
              </g>
            </svg>
            <h1 className="font-display-lg text-display-lg text-[#22211D] tracking-tight mb-unit" style={{ fontVariant: 'small-caps', letterSpacing: '0.06em' }}>
              SUNRISE
            </h1>
            <p className="font-label-md text-label-md text-tertiary uppercase tracking-[0.1em]">
              Healthy Skin & Anti Aging
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center pt-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">Selamat Datang</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Silakan masukkan kredensial Anda untuk mengakses dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Alamat Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 bg-surface-container-low border rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 ${errors.email ? 'border-error' : 'border-outline-variant/60'}`}
                  id="email"
                  placeholder="staf@sunrise-clinic.com"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                />
              </div>
              {errors.email && <p className="text-error text-[12px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  className={`w-full pl-12 pr-12 py-3 bg-surface-container-low border rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 ${errors.password ? 'border-error' : 'border-outline-variant/60'}`}
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-error text-[12px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{errors.password}</p>}
            </div>

            {/* Form Options */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-outline-variant group-hover:border-primary bg-surface-container-lowest transition-colors">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="absolute inset-0 bg-primary rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Ingat saya</span>
              </label>
              <button type="button" className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors underline-offset-4 hover:underline" onClick={() => toast.info('Reset kata sandi tidak tersedia di mode demo.')}>
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              className="w-full py-3 mt-4 bg-primary text-white font-headline-sm text-headline-sm rounded-lg hover:bg-primary/90 hover:shadow-[0_4px_12px_-4px_rgba(194,160,88,0.5)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sedang Masuk...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/40"></div>
            <span className="flex-shrink-0 mx-4 font-body-sm text-body-sm text-outline">atau masuk dengan</span>
            <div className="flex-grow border-t border-outline-variant/40"></div>
          </div>

          {/* SSO */}
          <button
            className="w-full py-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-lg text-label-lg rounded-lg hover:bg-surface-container-low hover:border-outline transition-all duration-200 flex items-center justify-center gap-3"
            type="button"
            onClick={() => toast.info('Google SSO tidak tersedia di mode demo.')}
          >
            <img
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTuA9xZPHIwHwXPf1rP-QithOiQmF4d3PxZa2-HbHGKXLlxI0eKfbMFx9LQFVPxJVFg1pg2y-_nO2IpfORltmSe8eveuU7nfbeO28zAYCSZYDKkDTvUgV-B30SkrcRj1Z0zTzrp7cdkz0-HNBLkQpOiWMgdeWH5bn2WKeGrLluGcr6xF5wD37PG1hdvxAR2Gi3rCJacjSFrI9YX6-6B81DZOusFZYhrZ3bPXKs06ngWTAdTHBx20CGW63VSt0vKLABxaBkUytdQBcz"
              alt="Google login"
            />
            Masuk dengan Google
          </button>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-6 w-full text-center flex justify-center gap-stack-md font-body-sm text-[11px] text-outline">
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Tidak tersedia di mode demo.')}>Kebijakan Privasi</button>
          <span className="text-outline-variant/50">•</span>
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Tidak tersedia di mode demo.')}>Syarat & Ketentuan</button>
          <span className="text-outline-variant/50">•</span>
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Tidak tersedia di mode demo.')}>Pusat Bantuan</button>
        </div>
      </div>
    </div>
  );
}
