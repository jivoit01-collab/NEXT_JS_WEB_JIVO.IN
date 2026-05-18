'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validate(): boolean {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.status === 429) {
        router.replace('/?blocked=1');
      } else if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        setLoading(false);
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border bg-card p-8 shadow-xl"
        noValidate
      >
        {/* Header */}
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          Admin Login
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Secure admin access only
        </p>

        {/* Server error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            placeholder="Enter your email"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 ${
              emailError
                ? 'border-destructive focus:ring-destructive/50'
                : 'border-input focus:ring-ring'
            }`}
          />
          {emailError && (
            <p className="mt-1.5 text-xs text-destructive">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-7">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter your password"
              className={`w-full rounded-lg border bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground transition focus:outline-none focus:ring-2 ${
                passwordError
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-input focus:ring-ring'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1.5 text-xs text-destructive">{passwordError}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Login to Dashboard'
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          This is a secure admin area. Only authorized personnel should log in.
        </p>
      </form>
    </main>
  );
}
