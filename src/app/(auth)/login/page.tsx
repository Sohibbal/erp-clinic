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
    dokter: '/dokter',
    apoteker: '/apoteker',
    owner: '/owner',
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const matched = DUMMY_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (matched) {
      toast.success(`Welcome back! Logging in as ${matched.role.charAt(0).toUpperCase() + matched.role.slice(1)}...`);
      setTimeout(() => {
        router.push(roleRoutes[matched.role]);
      }, 600);
    } else {
      setIsLoading(false);
      toast.error('Invalid credentials. Please try again.');
      setErrors({ password: 'Invalid email or password' });
    }
  };

  return (
    <div className="flex-1 w-full flex overflow-hidden bg-background text-on-surface">
      {/* Left Panel: Brand Imagery (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-variant overflow-hidden">
        {/* Aesthetic Image Background */}
        <img
          alt="Luxury Clinic Room"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHPcK59PTG0E1mqCUvxTnKbfEyickMNvKx-4TqkT6lOu0_hK7BIOjw5oD74gqHiXy6EicvqWtz87fjFfaLq0KyBeDKXDxhFr_F4WTaKDaqMXp7-7ku0Q_PSyUsHnW5QLFMU6d_lnC-HnQvEKlAaIki_4E6iMydzI4Y5bI_8T-QWO8G3ZGx4Za5Vn049joACXF3NnJ8V4cXESX0hAbW2Ua0UdUSCQYxm5pGe3RtSokuK3oyGILba2IYm8HwX_VcT0oyZsihIt35WNHc"
        />
        {/* Gradient Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
        {/* Brand Promise / Testimonial overlay */}
        <div className="absolute bottom-margin left-margin right-margin text-on-primary">
          <div className="max-w-lg">
            <span
              className="material-symbols-outlined text-4xl mb-stack-sm opacity-80"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              format_quote
            </span>
            <h2 className="font-headline-lg text-headline-lg mb-stack-md leading-tight text-surface-container-lowest">
              Elevating Clinical Excellence
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 text-surface-container-low">
              Experience the seamless intersection of precision medical management and luxury patient care. Aura streamlines your practice so you can focus on beautiful outcomes.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center relative bg-surface-container-lowest px-gutter py-8 sm:px-16 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6 pb-16">
          {/* Header Section */}
          <div className="text-center flex flex-col items-center">
            {/* Logo Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4 shadow-[0_10px_30px_-15px_rgba(183,110,121,0.2)]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
            </div>
            {/* Brand Title */}
            <h1 className="font-display-lg text-display-lg text-primary tracking-tight mb-unit">
              Aura Beauty
            </h1>
            <p className="font-label-md text-label-md text-tertiary uppercase tracking-[0.1em]">
              Clinical Management
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center pt-2">
            <h2 className="font-headline-md text-headline-md text-on-surface">Welcome back</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  className={`w-full pl-12 pr-4 py-3 bg-surface-container-low border rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 ${errors.email ? 'border-error' : 'border-outline-variant/60'}`}
                  id="email"
                  placeholder="clinician@aurabeauty.com"
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
                Password
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
                <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <button type="button" className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors underline-offset-4 hover:underline" onClick={() => toast.info('Password reset is not available in demo mode.')}>
                Forgot Password?
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              className="w-full py-3 mt-4 bg-primary-container text-on-primary-container font-headline-sm text-headline-sm rounded-lg hover:bg-secondary-container hover:shadow-[0_4px_12px_-4px_rgba(244,194,194,0.5)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/40"></div>
            <span className="flex-shrink-0 mx-4 font-body-sm text-body-sm text-outline">or continue with</span>
            <div className="flex-grow border-t border-outline-variant/40"></div>
          </div>

          {/* SSO / Alternative Login */}
          <button
            className="w-full py-2.5 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-lg text-label-lg rounded-lg hover:bg-surface-container-low hover:border-outline transition-all duration-200 flex items-center justify-center gap-3"
            type="button"
            onClick={() => toast.info('Google SSO is not available in demo mode.')}
          >
            <img
              className="w-5 h-5"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTuA9xZPHIwHwXPf1rP-QithOiQmF4d3PxZa2-HbHGKXLlxI0eKfbMFx9LQFVPxJVFg1pg2y-_nO2IpfORltmSe8eveuU7nfbeO28zAYCSZYDKkDTvUgV-B30SkrcRj1Z0zTzrp7cdkz0-HNBLkQpOiWMgdeWH5bn2WKeGrLluGcr6xF5wD37PG1hdvxAR2Gi3rCJacjSFrI9YX6-6B81DZOusFZYhrZ3bPXKs06ngWTAdTHBx20CGW63VSt0vKLABxaBkUytdQBcz"
              alt="Google login"
            />
            Sign in with Google
          </button>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-6 w-full text-center flex justify-center gap-stack-md font-body-sm text-[11px] text-outline">
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Not available in demo.')}>Privacy Policy</button>
          <span className="text-outline-variant/50">•</span>
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Not available in demo.')}>Terms of Service</button>
          <span className="text-outline-variant/50">•</span>
          <button className="hover:text-primary transition-colors" onClick={() => toast.info('Not available in demo.')}>Help Center</button>
        </div>
      </div>
    </div>
  );
}
