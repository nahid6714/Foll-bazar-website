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
  role: 'customer';
  createdAt: string;
}

export interface RegisteredAccount {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'customer';
  createdAt: string;
}

const REGISTERED_ACCOUNTS_KEY = 'falbazar_registered_accounts';

// Normalize phone to digits for reliable comparison across formats
function normalizePhone(phoneStr: string): string {
  if (!phoneStr) return '';
  const cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.length > 11 && cleaned.startsWith('88')) {
    return cleaned.slice(2);
  }
  return cleaned;
}

function getStoredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RegisteredAccount[];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore
  }
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
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Error & Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Submit - STRICT REGISTRATION CHECK
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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

      const accounts = getStoredAccounts();
      const inputCleanPhone = normalizePhone(identifier);
      const isEmail = identifier.includes('@');
      const inputEmail = identifier.toLowerCase();

      // Find registered account
      const matchedAccount = accounts.find((acc) => {
        if (isEmail && acc.email && acc.email.toLowerCase() === inputEmail) {
          return true;
        }
        if (inputCleanPhone.length >= 10 && normalizePhone(acc.phone) === inputCleanPhone) {
          return true;
        }
        return false;
      });

      // 1. If NO registered account found: PREVENT LOGIN STRICTLY
      if (!matchedAccount) {
        setErrorMessage(
          'এই মোবাইল নম্বর বা ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি! রেজিস্ট্রেশন করা ছাড়া লগইন করা সম্ভব নয়। অনুগ্রহ করে প্রথমে নতুন অ্যাকাউন্ট রেজিস্ট্রেশন করুন।'
        );
        return;
      }

      // 2. Validate Password
      if (matchedAccount.password !== password) {
        setErrorMessage('পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন অথবা "পাসওয়ার্ড ভুলে গেছেন?" চাপুন।');
        return;
      }

      // 3. Login Success
      const user: UserProfile = {
        name: matchedAccount.name,
        phone: matchedAccount.phone,
        email: matchedAccount.email,
        role: 'customer',
        createdAt: matchedAccount.createdAt,
      };

      onLoginSuccess(user);
      setSuccessMessage(`সফলভাবে লগইন সম্পন্ন হয়েছে! স্বাগতম, ${user.name}`);
    }, 450);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const name = regName.trim();
    const phone = regPhone.trim();
    const password = regPassword.trim();
    const confirmPassword = regConfirmPassword.trim();

    if (!name) {
      setErrorMessage('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (name.length < 2) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক নাম লিখুন।');
      return;
    }
    if (!phone) {
      setErrorMessage('অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন।');
      return;
    }
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 10) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
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

      const accounts = getStoredAccounts();
      const duplicate = accounts.find((acc) => {
        if (normalizePhone(acc.phone) === cleanPhone) return true;
        if (regEmail.trim() && acc.email && acc.email.toLowerCase() === regEmail.trim().toLowerCase()) return true;
        return false;
      });

      if (duplicate) {
        setErrorMessage(
          'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে! অনুগ্রহ করে লগইন করুন।'
        );
        return;
      }

      const newAccount: RegisteredAccount = {
        name,
        phone,
        email: regEmail.trim() || undefined,
        password,
        role: 'customer',
        createdAt: new Date().toLocaleDateString('bn-BD'),
      };

      accounts.push(newAccount);
      saveStoredAccounts(accounts);

      const user: UserProfile = {
        name: newAccount.name,
        phone: newAccount.phone,
        email: newAccount.email,
        role: 'customer',
        createdAt: newAccount.createdAt,
      };

      onLoginSuccess(user);
      setSuccessMessage('আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং আপনি স্বয়ংক্রিয়ভাবে লগইন হয়েছেন!');
    }, 550);
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
                কাস্টমার অ্যাকাউন্ট
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
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 animate-fadeIn">
            <span className="font-bold text-base leading-none">⚠️</span>
            <div className="flex-1">
              <p className="leading-snug">{errorMessage}</p>
              {mode === 'login' && errorMessage.includes('রেজিস্ট্রেশন') && (
                <button
                  type="button"
                  onClick={() => {
                    if (loginIdentifier.trim()) {
                      if (loginIdentifier.includes('@')) {
                        setRegEmail(loginIdentifier.trim());
                      } else {
                        setRegPhone(loginIdentifier.trim());
                      }
                    }
                    setErrorMessage(null);
                    setMode('register');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#df2d4d] bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition shadow-xs cursor-pointer"
                >
                  <span>এখনই অ্যাকাউন্ট রেজিস্ট্রেশন করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-[11px] sm:text-xs font-medium rounded-full border border-amber-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>লগইন করতে পূর্বে রেজিস্ট্রেশন থাকা বাধ্যতামূলক</span>
              </div>
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
                className="auth-btn-primary" style={{ backgroundColor: '#df2d4d', color: '#ffffff', borderColor: '#df2d4d' }}
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : null}
                <span>লগইন করুন</span>
              </button>
            </form>

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
                className="auth-btn-primary" style={{ backgroundColor: '#df2d4d', color: '#ffffff', borderColor: '#df2d4d' }}
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

            {forgotError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-1.5 animate-fadeIn">
                <span>⚠️</span>
                <span>{forgotError}</span>
              </div>
            )}

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
                  setForgotError(null);
                  const clean = normalizePhone(forgotPhone);
                  if (!clean) return;
                  const accounts = getStoredAccounts();
                  const found = accounts.find((acc) => normalizePhone(acc.phone) === clean);
                  if (!found) {
                    setForgotError('এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি! পাসওয়ার্ড পুনরুদ্ধার করতে আগে রেজিস্ট্রেশন করুন।');
                    return;
                  }
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
