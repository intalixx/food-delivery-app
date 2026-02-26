import { useState, useEffect, useCallback } from 'react';
import { Home, Briefcase, MapPin, Loader2, X, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { addressService, type Address } from '@/services/addressService';

interface AddressPickerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (address: Address) => void;
}

export default function AddressPickerModal({ open, onOpenChange, onSelect }: AddressPickerModalProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await addressService.getByUserId(user.id);
            setAddresses(data);

            // If no addresses, close modal and redirect to add one
            if (data.length === 0) {
                onOpenChange(false);
                toast.error('No saved addresses found. Please add an address first.');
                navigate('/profile/address');
                return;
            }
        } catch (error) {
            console.error('Failed to fetch addresses', error);
            toast.error('Failed to load addresses');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, onOpenChange, navigate]);

    useEffect(() => {
        if (open) {
            setSelectedId(null);
            fetchAddresses();
        }
    }, [open, fetchAddresses]);

    const getIcon = (type: string) => {
        if (type === 'Home') return <Home className="w-4 h-4" />;
        if (type === 'Work') return <Briefcase className="w-4 h-4" />;
        return <MapPin className="w-4 h-4" />;
    };

    const handleConfirm = () => {
        const address = addresses.find(a => a.id === selectedId);
        if (address) {
            onSelect(address);
            onOpenChange(false);
        } else {
            toast.error('Please select a delivery address');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md p-0 overflow-hidden"
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Header */}
                <div className="bg-primary/5 dark:bg-primary/10 p-6 pb-5 relative flex flex-col items-center">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <DialogHeader className="w-full text-center sm:text-center mt-1">
                        <DialogTitle className="text-[22px] font-semibold text-gray-900 dark:text-white pb-1">
                            Select Delivery Address
                        </DialogTitle>
                        <DialogDescription className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">
                            Choose where you want your order delivered
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="p-5 max-h-[50vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-7 h-7 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {addresses.map(addr => (
                                    <motion.button
                                        key={addr.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        onClick={() => setSelectedId(addr.id)}
                                        className={`flex items-center w-full p-4 rounded-2xl border transition-all cursor-pointer text-left ${selectedId === addr.id
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/30'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-9 h-9 rounded-full mr-3 shrink-0 transition-colors ${selectedId === addr.id
                                                ? 'bg-primary/15 text-primary'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            {getIcon(addr.save_as)}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-bold text-[14px] text-gray-900 dark:text-white capitalize">
                                                {addr.save_as}
                                            </span>
                                            <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium truncate">
                                                {addr.house_number}, {addr.street_locality}
                                            </span>
                                            <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                                                {addr.city}, {addr.state} - {addr.pincode}
                                            </span>
                                        </div>
                                        {selectedId === addr.id && (
                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
                                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </AnimatePresence>

                            {/* Add new address link */}
                            <button
                                onClick={() => {
                                    onOpenChange(false);
                                    navigate('/profile/address');
                                }}
                                className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-primary font-semibold text-[13px] hover:bg-primary/5 transition-colors cursor-pointer justify-center"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Address
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 pt-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedId}
                        className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-[15px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98]"
                    >
                        Deliver Here
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
