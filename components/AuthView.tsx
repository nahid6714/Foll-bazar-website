'use client';

import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'reseller' | 'seller';
  createdAt: string;
}

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  onNavigateToShop: () => void;
  onOpenTrackModal: () => void;
}

export default function AuthView({
  initialMode = 'login',
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigateToShop,
  onOpenTrackModal,
}: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [isReseller, setIsReseller] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Error & Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = loginIdentifier.trim();
    const password = loginPassword.trim();

    if (!identifier) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর বা ইমেইল লিখুন।');
      return;
    }
    if (!password) {
      setErrorMessage('অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Construct user profile
      const isEmail = identifier.includes('@');
      const user: UserProfile = {
        name: isEmail ? identifier.split('@')[0] : 'সম্মানিত গ্রাহক',
        phone: isEmail ? '01711223344' : identifier,
        email: isEmail ? identifier : undefined,
        role: 'customer',
        createdAt: new Date().toLocaleDateString('bn-BD'),
      };

      onLoginSuccess(user);
      setSuccessMessage('সফলভাবে লগইন সম্পন্ন হয়েছে!');
    }, 600);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const name = regName.trim();
    const phone = regPhone.trim();
    const password = regPassword.trim();
    const confirmPassword = regConfirmPassword.trim();

    if (!name) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!phone) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন।');
      return;
    }
    if (phone.length < 10) {
      setErrorMessage('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!password) {
      setErrorMessage('পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)।');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মিলছে না! আবার চেক করুন।');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('অনুগ্রহ করে শর্তাবলী ও গোপনীয়তা নীতি মেনে নেওয়ার বক্সে টিক দিন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      let role: 'customer' | 'reseller' | 'seller' = 'customer';
      if (isReseller) role = 'reseller';
      else if (isSeller) role = 'seller';

      const user: UserProfile = {
        name,
        phone,
        email: regEmail.trim() || undefined,
        role,
        createdAt: new Date().toLocaleDateString('bn-BD'),
      };

      onLoginSuccess(user);
      setSuccessMessage('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
    }, 700);
  };

  // Social Login Handler
  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        name: provider === 'Google' ? 'গুগল ব্যবহারকারী' : 'ফেসবুক ব্যবহারকারী',
        phone: '01899887766',
        email: provider === 'Google' ? 'user@gmail.com' : 'user@facebook.com',
        role: 'customer',
        createdAt: new Date().toLocaleDateString('bn-BD'),
      };
      onLoginSuccess(user);
      setSuccessMessage(`${provider}-এর মাধ্যমে সফলভাবে লগইন হয়েছে!`);
    }, 600);
  };

  // If user is already logged in, show their account details & dashboard options
  if (currentUser) {
    return (
      <div className="auth-container-wrapper py-8 px-4 bg-[#f8fafc] min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-50 text-[#df2d4d] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold border-2 border-red-100">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                {currentUser.role === 'reseller'
                  ? 'রিসেলার অ্যাকাউন্ট'
                  : currentUser.role === 'seller'
                  ? 'সেলার অ্যাকাউন্ট'
                  : 'সাধারণ গ্রাহক'}
              </span>
              <span className="text-xs text-gray-500">ভেরিফাইড</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/60 mb-6 space-y-2.5 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                মোবাইল নম্বর
              </span>
              <span className="font-semibold text-gray-800">{currentUser.phone}</span>
            </div>
            {currentUser.email && (
              <div className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  ইমেইল
                </span>
                <span className="font-semibold text-gray-800">{currentUser.email}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                যুক্ত হওয়ার তারিখ
              </span>
              <span className="font-medium text-gray-700">{currentUser.createdAt}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onNavigateToShop}
              className="w-full py-3 px-4 bg-[#df2d4d] hover:bg-[#c82340] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কেনাকাটা চালিয়ে যান</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <button
              type="button"
              onClick={onOpenTrackModal}
              className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Truck className="w-4 h-4 text-[#df2d4d]" />
              <span>আপনার অর্ডার ট্র্যাক করুন</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 px-4 text-red-600 hover:bg-red-50 border border-transparent font-medium rounded-xl flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container py-8 px-4 bg-[#f8fafc] min-h-[75vh] flex items-center justify-center">
      <div
        className="auth-card w-full max-w-[480px] bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8 relative"
        style={{
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2 animate-fadeIn">
            <span className="font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* ============================================================ */
          /* 1. LOGIN FORM - MATCHING SCREENSHOT 1 */
          /* ============================================================ */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#111827]">লগইন করুন</h1>
              <p className="text-sm text-[#6b7280] mt-1.5">
                আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন
              </p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              {/* Field 1: মোবাইল নম্বর বা ইমেইল */}
              <div className="auth-form-group">
                <label className="auth-label">
                  মোবাইল নম্বর বা ইমেইল
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <User className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="01XXXXXXXXX বা email@example.com"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Field 2: পাসওয়ার্ড */}
              <div className="auth-form-group">
                <label className="auth-label">
                  পাসওয়ার্ড
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type={loginShowPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড লিখুন"
                    className="auth-input auth-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPassword(!loginShowPassword)}
                    className="auth-eye-btn"
                    aria-label={loginShowPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {loginShowPassword ? (
                      <EyeOff className="w-4 h-4 text-[#9ca3af]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#9ca3af]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Row: মনে রাখুন & পাসওয়ার্ড ভুলে গেছেন? */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1 mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#df2d4d] cursor-pointer"
                  />
                  <span>মনে রাখুন</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotSent(false);
                    setForgotPhone(loginIdentifier);
                  }}
                  className="text-[#df2d4d] hover:underline font-medium focus:outline-none cursor-pointer"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="auth-btn-primary"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                <span>লগইন করুন</span>
              </button>
            </form>

            {/* Divider: অথবা */}
            <div className="auth-divider">
              <div className="auth-divider-line"></div>
              <span className="auth-divider-text">অথবা</span>
            </div>

            {/* Social Login Buttons: Google & Facebook */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="auth-social-btn"
              >
                {/* Google Multicolor Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google দিয়ে লগইন</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="auth-social-btn"
              >
                {/* Facebook Blue Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook দিয়ে লগইন</span>
              </button>
            </div>

            {/* Footer Switch to Register */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
              <span>অ্যাকাউন্ট নেই? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('register');
                }}
                className="text-[#df2d4d] font-bold hover:underline ml-1"
              >
                রেজিস্টার করুন
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. REGISTER FORM - MATCHING SCREENSHOTS 2 & 3 */
          /* ============================================================ */
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#111827]">রেজিস্টার করুন</h1>
              <p className="text-sm text-[#6b7280] mt-1.5">
                কয়েকটি তথ্য দিয়ে অ্যাকাউন্ট খুলে নিন
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              {/* Field 1: পুরো নাম */}
              <div className="auth-form-group">
                <label className="auth-label">
                  পুরো নাম
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <User className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Field 2: মোবাইল নম্বর */}
              <div className="auth-form-group">
                <label className="auth-label">
                  মোবাইল নম্বর
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Phone className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Field 3: ইমেইল (ঐচ্ছিক) */}
              <div className="auth-form-group">
                <label className="auth-label">
                  ইমেইল <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Mail className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="auth-input"
                  />
                </div>
              </div>

              {/* Special Box 1: আমি রিসেলার একাউন্ট তৈরি করতে চাই */}
              <div
                onClick={() => {
                  setIsReseller(!isReseller);
                  if (!isReseller) setIsSeller(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 select-none mb-3 ${
                  isReseller
                    ? 'border-[#df2d4d] bg-red-50/40'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isReseller}
                  onChange={(e) => {
                    setIsReseller(e.target.checked);
                    if (e.target.checked) setIsSeller(false);
                  }}
                  className="w-4 h-4 rounded accent-[#df2d4d] cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  আমি রিসেলার একাউন্ট তৈরি করতে চাই
                </span>
              </div>

              {/* Special Box 2: আমি সেলার একাউন্ট তৈরি করতে চাই */}
              <div
                onClick={() => {
                  setIsSeller(!isSeller);
                  if (!isSeller) setIsReseller(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 select-none mb-3 ${
                  isSeller
                    ? 'border-[#df2d4d] bg-red-50/40'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSeller}
                  onChange={(e) => {
                    setIsSeller(e.target.checked);
                    if (e.target.checked) setIsReseller(false);
                  }}
                  className="w-4 h-4 rounded accent-[#df2d4d] cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-800">
                  আমি সেলার একাউন্ট তৈরি করতে চাই
                </span>
              </div>

              {/* Field 4: পাসওয়ার্ড */}
              <div className="auth-form-group">
                <label className="auth-label">
                  পাসওয়ার্ড
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="auth-input auth-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="auth-eye-btn"
                    aria-label={regShowPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {regShowPassword ? (
                      <EyeOff className="w-4 h-4 text-[#9ca3af]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#9ca3af]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Field 5: পাসওয়ার্ড নিশ্চিত করুন */}
              <div className="auth-form-group">
                <label className="auth-label">
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <Lock className="w-4 h-4 text-[#9ca3af]" />
                  </span>
                  <input
                    type={regShowConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="আবার পাসওয়ার্ড"
                    className="auth-input auth-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                    className="auth-eye-btn"
                    aria-label={regShowConfirmPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {regShowConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#9ca3af]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#9ca3af]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1 mb-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#df2d4d] cursor-pointer shrink-0"
                  />
                  <span>
                    আমি{' '}
                    <span className="text-[#df2d4d] font-semibold underline">শর্তাবলী</span> ও{' '}
                    <span className="text-[#df2d4d] font-semibold underline">গোপনীয়তা নীতি</span>{' '}
                    মেনে নিচ্ছি
                  </span>
                </label>
              </div>

              {/* Primary Submit Button: অ্যাকাউন্ট তৈরি করুন */}
              <button
                type="submit"
                disabled={isLoading}
                className="auth-btn-primary"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                <span>অ্যাকাউন্ট তৈরি করুন</span>
              </button>
            </form>

            {/* Footer Switch to Login */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
              <span>ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-[#df2d4d] font-bold hover:underline ml-1"
              >
                লগইন করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 relative">
            <h3 className="text-lg font-bold text-gray-900 mb-2">পাসওয়ার্ড পুনরুদ্ধার</h3>
            <p className="text-xs text-gray-600 mb-4">
              আপনার অ্যাকাউন্টের মোবাইল নম্বর দিন। আমরা পাসওয়ার্ড রিসেটের ওটিপি পাঠিয়ে দেব।
            </p>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">ওটিপি কোড পাঠানো হয়েছে!</p>
                <p className="text-xs text-gray-500 mt-1">
                  আপনার মোবাইল নম্বরে ৬ সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-4 w-full py-2 bg-[#df2d4d] text-white text-xs font-semibold rounded-lg"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotPhone.trim()) return;
                  setForgotSent(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#df2d4d]"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#df2d4d] text-white text-xs font-semibold rounded-lg hover:bg-[#c82340]"
                  >
                    কোড পাঠান
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
