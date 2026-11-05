import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Lock,
  Headphones,
  Radio,
  Disc3,
  Music2,
  Zap,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { apiPost } from '../lib/api';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', label: 'United Kingdom (+44)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
  { code: '+49', country: 'DE', label: 'Germany (+49)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+81', country: 'JP', label: 'Japan (+81)' }
];

export const LoginPage = ({
  onLoginSuccess,
  onCancel,
  showToast
}) => {
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successUser, setSuccessUser] = useState(null);

  const inputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first digit box when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const getFullIdentifier = () => {
    if (method === 'phone') {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      return `${countryCode} ${cleanPhone}`.trim();
    }
    return email.trim();
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');

    if (method === 'phone') {
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 8) {
        setError('Please enter a valid phone number (at least 8-10 digits).');
        return;
      }
    } else {
      if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address (e.g. name@example.com).');
        return;
      }
    }

    const identifier = getFullIdentifier();
    setLoading(true);

    try {
      // Call backend API with seamless fallback
      let sentCode = '';
      try {
        const res = await apiPost('/api/auth/send-otp', {
          identifier,
          method,
          name: displayName
        });
        sentCode = res.debugOtp || '';
      } catch {
        // Fallback local code generation if backend unreachable
        sentCode = String(Math.floor(100000 + Math.random() * 900000));
      }

      if (!sentCode) sentCode = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(sentCode);
      setStep('otp');
      setTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      showToast?.(`OTP sent to ${identifier}! (Code: ${sentCode})`, 'info');
    } catch (err) {
      setError(err.message || 'Could not send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (digit && index === 5 && newDigits.every((d) => d !== '')) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      verifyOtp(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleAutoFill = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    verifyOtp(generatedOtp);
  };

  const verifyOtp = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    const identifier = getFullIdentifier();
    try {
      let finalUser = null;
      try {
        const res = await apiPost('/api/auth/verify-otp', {
          identifier,
          code,
          name: displayName
        });
        finalUser = res.user;
      } catch {
        // Fallback local validation
        if (code === generatedOtp || code === '123456') {
          const nameVal = displayName.trim() || (method === 'email' ? email.split('@')[0] : 'Music Lover');
          finalUser = {
            name: nameVal,
            handle: `@${nameVal.toLowerCase().replace(/[^a-z0-9]/g, '') || 'nexamusic'}`,
            phone: method === 'phone' ? identifier : '',
            email: method === 'email' ? identifier : '',
            plan: 'Nexa Premium · Lossless Hi-Fi',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            isLoggedIn: true,
            verifiedAt: new Date().toISOString()
          };
        } else {
          throw new Error('Incorrect OTP code. Please enter the 6-digit code or use 123456.');
        }
      }

      setSuccessUser(finalUser);
      setStep('success');

      setTimeout(() => {
        onLoginSuccess?.(finalUser);
        showToast?.(`🎉 Welcome, ${finalUser.name}! Enjoy unlimited music.`, 'success');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoUser = {
      name: displayName.trim() || 'Alex Vance',
      handle: '@alexvance',
      phone: '+91 9876543210',
      email: 'alex.vance@nexamusic.io',
      plan: 'Nexa VIP Hi-Fi Lossless',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isLoggedIn: true,
      verifiedAt: new Date().toISOString()
    };
    setSuccessUser(demoUser);
    setStep('success');
    setTimeout(() => {
      onLoginSuccess?.(demoUser);
      showToast?.(`🎉 Welcome, ${demoUser.name}!`, 'success');
    }, 1000);
  };

  return (
    <div className="login-page-root">
      {/* Background Animated Aurora Lights */}
      <div className="login-aurora-glow" aria-hidden="true" />

      {/* Main Dual-Column Container */}
      <div className="login-container-card">
        {/* Top Back/Skip Bar */}
        <div className="login-top-bar">
          {onCancel && (
            <button className="login-back-btn" onClick={onCancel}>
              <ArrowLeft size={16} />
              <span>Back to Music</span>
            </button>
          )}
          <div className="login-brand-pill">
            <Sparkles size={14} color="#a855f7" />
            <span>NEXA MUSIC HI-FI</span>
          </div>
        </div>

        <div className="login-grid-layout">
          {/* LEFT COLUMN: VISUAL ARTWORK & FEATURES */}
          <div className="login-visual-showcase">
            <div className="showcase-vinyl-stage">
              <div className="showcase-acoustic-wave wave-1" />
              <div className="showcase-acoustic-wave wave-2" />
              <div className="showcase-vinyl-disc">
                <div className="showcase-vinyl-grooves" />
                <div className="showcase-vinyl-label">
                  <Disc3 size={32} color="#a855f7" />
                </div>
                <div className="showcase-vinyl-sheen" />
              </div>
            </div>

            <div className="showcase-badge-pill">
              <Zap size={14} color="#ec4899" />
              <span>LOSSLESS AUDIO STREAMING</span>
            </div>

            <h2 className="showcase-headline">
              Sound Without <span className="highlight-text">Limits.</span>
            </h2>
            <p className="showcase-tagline">
              Dive into 50M+ tracks with dynamic frequency visualizers, synchronized lyrics, and intelligent same-vibe autoplay.
            </p>

            <div className="showcase-perks-list">
              <div className="perk-item">
                <Headphones size={18} color="#a855f7" />
                <div>
                  <h4>Studio Hi-Fi (320kbps)</h4>
                  <p>Uncompressed, high-fidelity sound precision.</p>
                </div>
              </div>
              <div className="perk-item">
                <Radio size={18} color="#ec4899" />
                <div>
                  <h4>Same-Vibe Autoplay</h4>
                  <p>Never run out of music that matches your energy.</p>
                </div>
              </div>
              <div className="perk-item">
                <Music2 size={18} color="#38bdf8" />
                <div>
                  <h4>Karaoke Synced Lyrics</h4>
                  <p>Sing along note-by-note with live timing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE OTP LOGIN FORM */}
          <div className="login-form-wrapper">
            {step === 'input' && (
              <>
                <div className="login-header-group">
                  <span className="auth-step-pill">STEP 1 OF 2</span>
                  <h1 className="login-form-title">Welcome to Nexa</h1>
                  <p className="login-form-desc">
                    Log in or create your free account with instant OTP. No password required.
                  </p>
                </div>

                {/* Method Switcher Tabs */}
                <div className="login-method-tabs">
                  <button
                    type="button"
                    className={`login-method-tab ${method === 'phone' ? 'active' : ''}`}
                    onClick={() => { setMethod('phone'); setError(''); }}
                  >
                    <Phone size={16} />
                    <span>Mobile OTP</span>
                  </button>
                  <button
                    type="button"
                    className={`login-method-tab ${method === 'email' ? 'active' : ''}`}
                    onClick={() => { setMethod('email'); setError(''); }}
                  >
                    <Mail size={16} />
                    <span>Email OTP</span>
                  </button>
                </div>

                {error && <div className="login-error-alert">{error}</div>}

                <form onSubmit={handleSendOtp} className="login-form-fields">
                  {/* Optional Name */}
                  <div className="login-field-group">
                    <label htmlFor="user-name-input">Your Name or DJ Handle</label>
                    <div className="login-input-shell">
                      <Sparkles size={16} className="login-field-icon" />
                      <input
                        id="user-name-input"
                        type="text"
                        placeholder="e.g. Suvam Dutta"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="login-input-text"
                      />
                    </div>
                  </div>

                  {/* Phone or Email Input */}
                  {method === 'phone' ? (
                    <div className="login-field-group">
                      <label htmlFor="user-phone-input">Phone Number</label>
                      <div className="login-phone-wrapper">
                        <select
                          className="login-country-select"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <div className="login-input-shell phone-input-shell">
                          <Phone size={16} className="login-field-icon" />
                          <input
                            id="user-phone-input"
                            type="tel"
                            placeholder="98765 43210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="login-input-text"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="login-field-group">
                      <label htmlFor="user-email-input">Email Address</label>
                      <div className="login-input-shell">
                        <Mail size={16} className="login-field-icon" />
                        <input
                          id="user-email-input"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="login-input-text"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="login-primary-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={17} className="spin" />
                        <span>Generating OTP Code…</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="login-divider-row">
                  <span className="divider-line" />
                  <span className="divider-label">OR INSTANT ACCESS</span>
                  <span className="divider-line" />
                </div>

                {/* Quick Demo Login */}
                <button
                  type="button"
                  className="login-quick-demo-btn"
                  onClick={handleQuickDemoLogin}
                >
                  <Flame size={16} color="#f43f5e" />
                  <span>One-Click Instant Demo Login (Guest Pro)</span>
                </button>

                {/* Footnote */}
                <div className="login-secure-footnote">
                  <Lock size={13} />
                  <span>End-to-End Encrypted Session · Safe & Zero Spam</span>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="login-header-group">
                  <span className="auth-step-pill">STEP 2 OF 2</span>
                  <h1 className="login-form-title">Enter Verification Code</h1>
                  <p className="login-form-desc">
                    We sent a 6-digit code to <strong className="text-highlight">{getFullIdentifier()}</strong>
                  </p>
                </div>

                {/* Interactive Auto-fill Banner */}
                {generatedOtp && (
                  <div className="login-demo-otp-banner">
                    <div className="otp-banner-text">
                      <Sparkles size={16} color="#38bdf8" />
                      <span>
                        Simulated OTP: <strong>{generatedOtp}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="login-autofill-btn"
                      onClick={handleAutoFill}
                      title="Auto-fill verification code"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                )}

                {error && <div className="login-error-alert">{error}</div>}

                {/* 6 Digit Inputs */}
                <div className="login-digits-row" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`login-digit-box ${digit ? 'filled' : ''}`}
                      aria-label={`Digit ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  className="login-primary-btn"
                  onClick={() => verifyOtp()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      <span>Verifying Session…</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Verify & Access Nexa</span>
                    </>
                  )}
                </button>

                {/* Resend & Back Row */}
                <div className="login-resend-row">
                  <button
                    type="button"
                    className="login-resend-btn"
                    disabled={timer > 0 || loading}
                    onClick={handleSendOtp}
                  >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    <span>
                      {timer > 0 ? `Resend code in ${timer}s` : 'Resend OTP Code'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="login-back-link"
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                  >
                    Change {method === 'phone' ? 'Phone' : 'Email'}
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="login-success-state">
                <div className="success-pulse-wrap">
                  <div className="success-pulse-ring" />
                  <div className="success-icon-core">
                    <CheckCircle2 size={46} color="#ffffff" />
                  </div>
                </div>

                <h2 className="success-title">
                  Access Granted!
                </h2>
                <p className="success-desc">
                  Welcome to Nexa, <strong className="text-highlight">{successUser?.name || 'Listener'}</strong>. Loading your customized soundstage & Hi-Fi audio stream…
                </p>

                <div className="success-loading-bar">
                  <div className="success-loading-fill" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
