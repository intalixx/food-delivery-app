import { useState } from 'react';
import { Phone, ArrowLeft, User, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type ModalStep = 'phone' | 'otp' | 'signup';

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'login' | 'signup';
}

export default function AuthModal({ open, onOpenChange, mode }: AuthModalProps) {
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

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
        setPhone(digitsOnly);
    };

    const handleSendOtp = async () => {
        if (!isPhoneValid) return;
        setIsSubmitting(true);
        // Simulate OTP send
        await new Promise(r => setTimeout(r, 800));
        setIsSubmitting(false);
        setStep('otp');
        toast.success('OTP sent to +91 ' + phone);
    };

    const handleVerifyOtp = async () => {
        if (!isOtpValid) return;
        setIsSubmitting(true);
        // Simulate verification
        await new Promise(r => setTimeout(r, 800));
        setIsSubmitting(false);

        if (mode === 'signup') {
            setStep('signup');
        } else {
            toast.success('Logged in successfully!');
            handleClose();
        }
    };

    const handleSignupComplete = async () => {
        if (!name.trim() || !houseNumber.trim() || !streetLocality.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
            toast.error('Please fill all fields');
            return;
        }
        if (!/^[0-9]{4,10}$/.test(pincode.trim())) {
            toast.error('Invalid pincode');
            return;
        }
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        setIsSubmitting(false);
        toast.success('Account created successfully!');
        handleClose();
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
            <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton={false}>
                {/* Header */}
                <div className="bg-primary/5 dark:bg-primary/10 p-6 pb-4">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            {step !== 'phone' && (
                                <button
                                    onClick={handleBack}
                                    className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            )}
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                    {step === 'phone' && (mode === 'login' ? 'Welcome back' : 'Create account')}
                                    {step === 'otp' && 'Verify OTP'}
                                    {step === 'signup' && 'Complete your profile'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {step === 'phone' && 'Enter your mobile number to continue'}
                                    {step === 'otp' && `We sent a 6-digit code to +91 ${phone}`}
                                    {step === 'signup' && 'Tell us your name and delivery address'}
                                </DialogDescription>
                            </div>
                        </div>
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
                                    'Send OTP'
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                                By continuing, you agree to our Terms of Service & Privacy Policy
                            </p>
                        </div>
                    )}

                    {/* Step 2: OTP */}
                    {step === 'otp' && (
                        <div className="space-y-5">
                            <div className="flex flex-col items-center gap-4">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(val) => setOtp(val.replace(/\D/g, ''))}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoFocus
                                    containerClassName="justify-center gap-3"
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                        <InputOTPSlot index={1} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                        <InputOTPSlot index={2} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                    </InputOTPGroup>
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={3} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                        <InputOTPSlot index={4} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                        <InputOTPSlot index={5} className="w-12! h-13! text-xl font-semibold rounded-xl! border! border-gray-200 dark:border-gray-700 shadow-sm" />
                                    </InputOTPGroup>
                                </InputOTP>

                                <button
                                    onClick={() => {
                                        setOtp('');
                                        toast.success('OTP resent to +91 ' + phone);
                                    }}
                                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                                >
                                    Didn't receive? Resend OTP
                                </button>
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={!isOtpValid || isSubmitting}
                                className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
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
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
