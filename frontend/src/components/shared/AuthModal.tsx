import { useState, useEffect } from 'react';
import { Phone, ArrowLeft, User, MapPin, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/context/AuthContext';

type ModalStep = 'phone' | 'otp' | 'signup';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'login' | 'signup';
}

export default function AuthModal({ open, onOpenChange, mode }: AuthModalProps) {
    const { login } = useAuth();
    const [internalMode, setInternalMode] = useState<'login' | 'signup'>(mode);
    const [step, setStep] = useState<ModalStep>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Signup fields
    const [name, setName] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [streetLocality, setStreetLocality] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    const isPhoneValid = phone.length === 10;
    const isOtpValid = otp.length === 6;

    useEffect(() => {
        if (open) {
            setInternalMode(mode);
        }
    }, [mode, open]);

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
        setPhone(digitsOnly);
    };

    const handleSendOtp = async () => {
        if (!isPhoneValid) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile_number: phone, mode: internalMode })
            });
            const data = await res.json();

            if (res.ok) {
                setStep('otp');
                toast.success(`OTP is: ${data.otp}`, {
                    duration: 10000,
                    position: 'top-center',
                    action: {
                        label: 'Copy',
                        onClick: () => {
                            navigator.clipboard.writeText(data.otp);
                            toast.info('OTP copied to clipboard!');
                        }
                    }
                });
            } else {
                if (data.needs_signup) {
                    toast.error('Account not found.', {
                        description: 'Would you like to sign up instead?',
                        action: {
                            label: 'Sign up',
                            onClick: () => {
                                setInternalMode('signup');
                                handleSendOtp();
                            }
                        },
                        duration: 8000,
                    });
                } else {
                    toast.error(data.errors?.[0] || 'Failed to send OTP');
                }
            }
        } catch {
            toast.error('Network error. Failed to send OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!isOtpValid) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile_number: phone, otp })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.isNewUser) {
                    setStep('signup');
                    toast.info('Please complete your profile');
                } else {
                    toast.success('Logged in successfully!');
                    login(data.user, data.token);
                    handleClose();
                }
            } else {
                toast.error(data.errors?.[0] || 'Invalid OTP');
            }
        } catch {
            toast.error('Network error. Failed to verify OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignupComplete = async () => {
        if (!name.trim() || !houseNumber.trim() || !streetLocality.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
            toast.error('Please fill all fields');
            return;
        }
        if (!/^[0-9]{6}$/.test(pincode.trim())) {
            toast.error('Pincode must be exactly 6 digits');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile_number: phone,
                    user_name: name,
                    house_number: houseNumber,
                    street_locality: streetLocality,
                    city,
                    state,
                    pincode
                })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Account created successfully!');
                login(data.user, data.token);
                handleClose();
            } else {
                toast.error(data.errors?.[0] || 'Failed to sign up');
            }
        } catch {
            toast.error('Network error. Failed to sign up.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset after animation
        setTimeout(() => {
            setStep('phone');
            setPhone('');
            setOtp('');
            setName('');
            setHouseNumber('');
            setStreetLocality('');
            setCity('');
            setState('');
            setPincode('');
            setIsSubmitting(false);
        }, 200);
    };

    const handleBack = () => {
        if (step === 'otp') {
            setOtp('');
            setStep('phone');
        } else if (step === 'signup') {
            setStep('otp');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden"
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="bg-primary/5 dark:bg-primary/10 p-6 pb-5 relative flex flex-col items-center">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    {step !== 'phone' && (
                        <button
                            onClick={handleBack}
                            className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    )}
                    <DialogHeader className="w-full text-center sm:text-center mt-1">
                        <DialogTitle className="text-[22px] font-semibold text-gray-900 dark:text-white pb-1">
                            {step === 'phone' && (internalMode === 'login' ? 'Welcome back' : 'Create Account')}
                            {step === 'otp' && 'Verify OTP'}
                            {step === 'signup' && 'Complete your profile'}
                        </DialogTitle>
                        <DialogDescription className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">
                            {step === 'phone' && 'Enter your mobile number to continue'}
                            {step === 'otp' && `We sent a 6-digit code to +91 ${phone}`}
                            {step === 'signup' && 'Tell us your name and delivery address'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="p-6 pt-2">
                    {/* Step 1: Phone */}
                    {step === 'phone' && (
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Mobile Number
                                </label>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus-within:border-primary/50 dark:focus-within:border-primary/50 transition-colors">
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 select-none">+91</span>
                                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        placeholder="Enter 10 digit number"
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSendOtp}
                                disabled={!isPhoneValid || isSubmitting}
                                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    internalMode === 'login' ? 'Login' : 'Send OTP'
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                {internalMode === 'login' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button onClick={() => setInternalMode('signup')} className="text-primary font-semibold cursor-pointer outline-none hover:underline">
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button onClick={() => setInternalMode('login')} className="text-primary font-semibold cursor-pointer outline-none hover:underline">
                                            Login
                                        </button>
                                    </>
                                )}
                            </div>

                            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                                By continuing, you agree to our Terms of Service & Privacy Policy
                            </p>
                        </div>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center mt-2 gap-6">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(val) => setOtp(val.replace(/\D/g, ''))}
                                    inputMode="numeric"
                                    autoFocus
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup className="gap-2 sm:gap-3">
                                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                                            <InputOTPSlot
                                                key={idx}
                                                index={idx}
                                                className="w-11 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl font-semibold rounded-xl! border! border-gray-300 dark:border-gray-600 shadow-sm outline-none ring-primary/50! ring-offset-0!"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>

                                <button
                                    onClick={() => {
                                        setOtp('');
                                        handleSendOtp();
                                    }}
                                    className="text-sm text-primary font-semibold hover:underline cursor-pointer transition-all"
                                >
                                    Didn't receive? Resend OTP
                                </button>
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={!isOtpValid || isSubmitting}
                                className="w-full py-3.5 mt-2 rounded-xl bg-primary text-white font-semibold text-[15px] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] shadow-sm"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Verify & Continue'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Signup - Name & Address */}
                    {step === 'signup' && (
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Address</span>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={houseNumber}
                                        onChange={(e) => setHouseNumber(e.target.value)}
                                        placeholder="House / Flat No. *"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <input
                                        type="text"
                                        value={streetLocality}
                                        onChange={(e) => setStreetLocality(e.target.value)}
                                        placeholder="Street / Locality *"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="City *"
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="State *"
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="Pincode *"
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSignupComplete}
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] mt-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
