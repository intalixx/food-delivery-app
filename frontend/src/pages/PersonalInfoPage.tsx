import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, User, Phone, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { profileService, getProfileImageUrl } from '@/services/profileService';

export default function PersonalInfoPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gender: '' as 'male' | 'female' | ''
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await profileService.getMe();
                setFormData({
                    name: user.user_name || '',
                    phone: user.mobile_number || '',
                    email: user.email || '',
                    gender: user.gender || ''
                });
                if (user.image_path) {
                    setImagePreview(getProfileImageUrl(user.image_path));
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                toast.error('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setIsSaving(true);
        try {
            await profileService.updateMe(
                {
                    user_name: formData.name.trim(),
                    email: formData.email.trim(),
                    gender: formData.gender as 'male' | 'female' | undefined,
                },
                selectedFile
            );
            toast.success('Profile updated successfully');
            setSelectedFile(null);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative pb-24">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-xl mx-auto w-full">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Information</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center py-1.5 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="text-[14px] font-semibold tracking-wide">Back</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-0 pt-6 pb-16 gap-6"
            >
                {/* Photo Upload Area */}
                <div className="flex flex-col items-center justify-center pt-2">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02]">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        {/* Camera Icon Overlay */}
                        <div className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm transition-transform group-hover:scale-110">
                            <Camera className="w-4 h-4" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div className="mt-3 text-center">
                        <h2 className="text-[18px] font-bold text-gray-800 dark:text-white">{formData.name || 'New User'}</h2>
                        <p className="text-[13px] text-gray-500 font-medium">Tap photo to edit</p>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white dark:bg-gray-900 rounded-4xl p-5 border border-gray-200 dark:border-gray-700 mt-2">
                    <div className="flex flex-col gap-5">

                        {/* Name Field */}
                        <div>
                            <label className="text-[13px] font-bold text-gray-500 ml-1 mb-1.5 block">Full Name *</label>
                            <div className="relative flex items-center">
                                <User className="absolute left-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        {/* Phone Field (Read Only) */}
                        <div>
                            <label className="text-[13px] font-bold text-gray-500 ml-1 mb-1.5 block">Phone Number</label>
                            <div className="relative flex items-center">
                                <Phone className="absolute left-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    readOnly
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-[15px] font-medium text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 ml-1 mt-1">Phone number cannot be changed</p>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="text-[13px] font-bold text-gray-500 ml-1 mb-1.5 block">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        {/* Gender Selection */}
                        <div>
                            <label className="text-[13px] font-bold text-gray-500 ml-1 mb-1.5 block">Gender</label>
                            <div className="flex gap-3">
                                {(['male', 'female'] as const).map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => setFormData(prev => ({ ...prev, gender }))}
                                        className={`flex-1 py-3 rounded-2xl text-[14px] font-bold border transition-colors cursor-pointer capitalize ${formData.gender === gender
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-2.5 rounded-xl font-semibold text-[14px] tracking-wide cursor-pointer hover:bg-primary/90 transition-colors active:scale-[0.98] flex items-center justify-center shadow-[0_4px_14px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Save Details'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
