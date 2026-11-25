import { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, UserPlus, X } from 'lucide-react';
import type { CustomerAccount } from '../types/store';
import {
  authenticateCustomer,
  normalizeIndianMobile,
  validateRegistrationForm,
  type RegistrationInput,
} from '../utils/storeLogic';

interface AuthModalProps {
  open: boolean;
  initialTab?: 'login' | 'register';
  accounts: CustomerAccount[];
  onClose: () => void;
  onLoginSuccess: (account: CustomerAccount) => void;
  onRegisterSuccess: (account: CustomerAccount) => void;
}

const EMPTY_REGISTER: RegistrationInput = {
  fullName: '',
  mobile: '',
  email: '',
  password: '',
  city: '',
  pincode: '',
};

export function AuthModal({
  open,
  initialTab = 'login',
  accounts,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegistrationInput>(EMPTY_REGISTER);
  const [registerErrors, setRegisterErrors] = useState<
    Partial<Record<keyof RegistrationInput, string>>
  >({});

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setLoginError('');
      setRegisterErrors({});
      setShowPassword(false);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = authenticateCustomer(loginIdentifier, loginPassword, accounts);
    if (result.error || !result.account) {
      setLoginError(result.error || 'Unable to log in. Please check your credentials.');
      return;
    }
    setLoginError('');
    setLoginIdentifier('');
    setLoginPassword('');
    onLoginSuccess(result.account);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegistrationForm(registerForm, accounts);
    if (Object.keys(validation).length > 0) {
      setRegisterErrors(validation);
      return;
    }

    const newAccount: CustomerAccount = {
      id: `cust-${Date.now()}`,
      fullName: registerForm.fullName.trim(),
      mobile: normalizeIndianMobile(registerForm.mobile),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password,
      city: registerForm.city.trim(),
      state: 'Gujarat',
      pincode: registerForm.pincode.replace(/\D/g, ''),
      address: '',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setRegisterErrors({});
    setRegisterForm(EMPTY_REGISTER);
    onRegisterSuccess(newAccount);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#23191E]/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-heading"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-[#23191E]/12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#23191E]/10 bg-[#FDF8F6] flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#B76E79]">
              FATIMA RESIN ART ATELIER
            </p>
            <h2
              id="auth-modal-heading"
              className="mt-0.5 font-serif text-2xl font-semibold text-[#23191E]"
            >
              {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="p-2 rounded-lg text-[#5C4B52] hover:bg-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-5">
          <div
            className="grid grid-cols-2 p-1 rounded-xl bg-[#FDF8F6] border border-[#23191E]/10"
            role="tablist"
            aria-label="Account authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#23191E] text-white shadow-xs'
                  : 'text-[#5C4B52] hover:text-[#23191E]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              onClick={() => {
                setActiveTab('register');
                setRegisterErrors({});
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#23191E] text-white shadow-xs'
                  : 'text-[#5C4B52] hover:text-[#23191E]'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Tab 1: Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} noValidate className="p-6 space-y-4">
            <div>
              <label
                htmlFor="login-identifier"
                className="block text-xs font-semibold text-[#23191E] mb-1.5"
              >
                Email Address or Mobile Number *
              </label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={loginIdentifier}
                onChange={(e) => {
                  setLoginIdentifier(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="e.g. ayesha@email.com or 9313626852"
                className="w-full h-11 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#23191E] mb-1.5"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#5C4B52] hover:text-[#23191E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#9B2C3E]/10 border border-[#9B2C3E]/30 text-xs font-medium text-[#9B2C3E]"
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#B76E79] hover:bg-[#9B5560] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to My Account</span>
            </button>

            <p className="text-xs text-center text-[#5C4B52] pt-1">
              New to Fatima Resin Art?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="font-semibold text-[#B76E79] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </form>
        ) : (
          /* Tab 2: Create Account Form */
          <form onSubmit={handleRegisterSubmit} noValidate className="p-6 space-y-4">
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-xs font-semibold text-[#23191E] mb-1.5"
              >
                Full Name *
              </label>
              <input
                id="reg-fullname"
                type="text"
                autoComplete="name"
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, fullName: e.target.value })
                }
                placeholder="e.g. Ayesha Siddiqui"
                className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
              />
              {registerErrors.fullName && (
                <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-mobile"
                  className="block text-xs font-semibold text-[#23191E] mb-1.5"
                >
                  Mobile Number *
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  autoComplete="tel"
                  value={registerForm.mobile}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, mobile: e.target.value })
                  }
                  placeholder="10-digit Indian mobile"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                />
                {registerErrors.mobile && (
                  <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.mobile}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-[#23191E] mb-1.5"
                >
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  placeholder="name@email.com"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                {registerErrors.email && (
                  <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-[#23191E] mb-1.5"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 pl-3.5 pr-10 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C4B52] hover:text-[#23191E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {registerErrors.password && (
                <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.password}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="reg-city"
                  className="block text-xs font-semibold text-[#23191E] mb-1.5"
                >
                  City *
                </label>
                <input
                  id="reg-city"
                  type="text"
                  value={registerForm.city}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, city: e.target.value })
                  }
                  placeholder="e.g. Bhavnagar"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm"
                />
                {registerErrors.city && (
                  <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.city}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="reg-pincode"
                  className="block text-xs font-semibold text-[#23191E] mb-1.5"
                >
                  Pincode *
                </label>
                <input
                  id="reg-pincode"
                  type="text"
                  maxLength={6}
                  value={registerForm.pincode}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, pincode: e.target.value })
                  }
                  placeholder="364001"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#23191E]/18 bg-[#FDF8F6] focus:bg-white focus:border-[#B76E79] text-sm tabular-nums"
                />
                {registerErrors.pincode && (
                  <p className="mt-1 text-xs text-[#9B2C3E]">{registerErrors.pincode}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#23191E] hover:bg-[#3A2931] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#C59B27]" />
              <span>Create Customer Account</span>
            </button>

            <p className="text-xs text-center text-[#5C4B52] pt-1">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="font-semibold text-[#B76E79] hover:underline cursor-pointer"
              >
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
