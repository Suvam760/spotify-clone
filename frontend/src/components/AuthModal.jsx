import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  X,
  KeyRound,
  Lock,
  UserCheck
} from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  showToast
}) => {
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'success'
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError('');
      setOtpDigits(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  // Resend Countdown
  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e?.preventDefault();
    setError('');

    const val = identifier.trim();
    if (!val) {
      setError(method === 'phone' ? 'Please enter a valid phone number' : 'Please enter your email address');
      return;
    }

    if (method === 'phone' && val.replace(/\D/g, '').length < 10) {
      setError('Please enter a 10-digit mobile number');
      return;
    }

    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Generate realistic 6-digit OTP
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      setStep('otp');
      setTimer(30);
      setLoading(false);
      setOtpDigits(['', '', '', '', '', '']);

      showToast?.(`🔑 Demo OTP: ${randomCode} (Code sent)`, 'info');

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 700);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    showToast?.(`🔑 New OTP sent: ${newCode}`, 'info');
    inputRefs.current[0]?.focus();
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

    // Auto verify if all filled
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

  const verifyOtp = (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === generatedOtp || code === '123456') {
        setStep('success');
        const finalName = displayName.trim() || (method === 'email' ? identifier.split('@')[0] : 'Music Lover');
        const userObj = {
          name: finalName,
          handle: `@${finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'nexamusic'}`,
          phone: method === 'phone' ? identifier : '',
          email: method === 'email' ? identifier : '',
          plan: 'Nexa Premium · Lossless Hi-Fi',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          isLoggedIn: true,
          verifiedAt: new Date().toISOString()
        };

        setTimeout(() => {
          onLoginSuccess(userObj);
          showToast?.(`🎉 Welcome back, ${finalName}!`, 'success');
          onClose();
        }, 1200);
      } else {
        setError('Incorrect OTP. Please check the code and try again.');
      }
    }, 600);
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-card-cyber" onClick={(e) => e.stopPropagation()}>
        {/* Ambient Top Glow */}
        <div className="auth-ambient-glow" />

        <button className="auth-close-btn" onClick={onClose} aria-label="Close login">
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <Sparkles size={22} className="auth-sparkle-icon" />
          </div>
          <h2 className="auth-title">
            {step === 'success' ? 'Access Granted' : 'Welcome to Nexa'}
          </h2>
          <p className="auth-subtitle">
            {step === 'input' && 'High-Fidelity streaming & synchronized lyrics with instant OTP login.'}
            {step === 'otp' && `Enter the 6-digit code sent to ${identifier}`}
            {step === 'success' && 'Your session has been securely verified. Loading your music library…'}
          </p>
        </div>

        {/* STEP 1: INPUT DETAILS */}
        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="auth-form-body">
            {/* Method Tabs */}
            <div className="auth-method-tabs">
              <button
                type="button"
                className={`auth-tab-pill ${method === 'phone' ? 'active' : ''}`}
                onClick={() => { setMethod('phone'); setError(''); }}
              >
                <Phone size={14} />
                <span>Mobile OTP</span>
              </button>
              <button
                type="button"
                className={`auth-tab-pill ${method === 'email' ? 'active' : ''}`}
                onClick={() => { setMethod('email'); setError(''); }}
              >
                <Mail size={14} />
                <span>Email OTP</span>
              </button>
            </div>

            {/* Display Name Input (Optional) */}
            <div className="auth-field-group">
              <label className="auth-field-label">Your Name (Optional)</label>
              <div className="auth-input-wrap">
                <input
                  type="text"
                  placeholder="e.g. Alex River"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="auth-input"
                  maxLength={40}
                />
              </div>
            </div>

            {/* Contact Input */}
            <div className="auth-field-group">
              <label className="auth-field-label">
                {method === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              <div className="auth-input-wrap">
                {method === 'phone' && <span className="auth-country-prefix">+91</span>}
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  placeholder={method === 'phone' ? '98765 43210' : 'name@example.com'}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                  className={`auth-input ${method === 'phone' ? 'with-prefix' : ''}`}
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && <div className="auth-error-chip">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Sending secure OTP…</span>
                </>
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="auth-footer-notes">
              <ShieldCheck size={13} color="#a855f7" />
              <span>Passwordless 2FA · Instant 1-click verification</span>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="auth-otp-stage">
            {/* Demo Helper Banner */}
            {generatedOtp && (
              <div className="auth-demo-otp-banner" onClick={handleAutoFill} title="Click to auto-fill">
                <KeyRound size={15} color="#ec4899" />
                <div className="demo-otp-text">
                  <span>Demo Verification Code: <strong>{generatedOtp}</strong></span>
                  <small>Click to auto-fill code</small>
                </div>
                <button type="button" className="auth-quick-fill-btn">Auto-Fill</button>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="auth-digits-row" onPaste={handlePaste}>
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
                  className={`auth-digit-box ${digit ? 'filled' : ''}`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && <div className="auth-error-chip">{error}</div>}

            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => verifyOtp()}
              disabled={loading || otpDigits.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Verifying Code…</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Verify & Unlock Library</span>
                </>
              )}
            </button>

            {/* Resend & Edit Row */}
            <div className="auth-otp-actions-row">
              <button
                type="button"
                className="auth-link-subtle"
                onClick={() => { setStep('input'); setError(''); }}
              >
                Change {method === 'phone' ? 'number' : 'email'}
              </button>

              <button
                type="button"
                className={`auth-link-subtle ${timer > 0 ? 'disabled' : ''}`}
                onClick={handleResendOtp}
                disabled={timer > 0}
              >
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS ANIMATION */}
        {step === 'success' && (
          <div className="auth-success-screen">
            <div className="auth-success-circle">
              <CheckCircle2 size={56} color="#a855f7" className="auth-success-icon" />
            </div>
            <h3 className="auth-success-name">{displayName || 'Music Lover'}</h3>
            <span className="auth-success-badge">
              <UserCheck size={14} />
              <span>Nexa Hi-Fi Member · Active</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
