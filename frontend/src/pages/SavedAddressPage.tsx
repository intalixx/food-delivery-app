import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Plus, Home, Briefcase, MapPin, Trash2, MoreHorizontal, Edit2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { addressService, type Address, type CreateAddressData, type UpdateAddressData } from '@/services/addressService';

type SaveAsPreset = 'Home' | 'Work' | 'Other';

type FormData = {
    save_as: string;
    pincode: string;
    city: string;
    state: string;
    house_number: string;
    street_locality: string;
    mobile: string;
};

const emptyForm: FormData = { save_as: 'Home', pincode: '', city: '', state: '', house_number: '', street_locality: '', mobile: '' };

export default function SavedAddressPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState<FormData>({ ...emptyForm });
    const [selectedType, setSelectedType] = useState<SaveAsPreset>('Home');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const fetchAddresses = useCallback(async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const data = await addressService.getByUserId(user.id);
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
            toast.error('Failed to load addresses');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Fetch addresses on mount
    useEffect(() => {
        if (user?.id) fetchAddresses();
    }, [user?.id, fetchAddresses]);

    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAddAddress = async () => {
        if (!newAddress.house_number || !newAddress.street_locality || !newAddress.pincode || !newAddress.city || !newAddress.state || !newAddress.mobile) {
            toast.error("Please fill in all the details");
            return;
        }
        if (!user?.id) {
            toast.error("Please login first");
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                const updateData: UpdateAddressData = {
                    save_as: newAddress.save_as,
                    pincode: newAddress.pincode,
                    city: newAddress.city,
                    state: newAddress.state,
                    house_number: newAddress.house_number,
                    street_locality: newAddress.street_locality,
                    mobile: newAddress.mobile,
                };
                const updated = await addressService.update(editingId, updateData);
                setAddresses(addresses.map(a => a.id === editingId ? updated : a));
                toast.success("Address updated successfully");
            } else {
                const createData: CreateAddressData = {
                    user_id: user.id,
                    save_as: newAddress.save_as,
                    pincode: newAddress.pincode,
                    city: newAddress.city,
                    state: newAddress.state,
                    house_number: newAddress.house_number,
                    street_locality: newAddress.street_locality,
                    mobile: newAddress.mobile,
                };
                const created = await addressService.create(createData);
                setAddresses([created, ...addresses]);
                toast.success("Address saved successfully");
            }
            resetForm();
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const addr = addresses.find(a => a.id === id);
        if (addr) {
            const preset = (['Home', 'Work'] as SaveAsPreset[]).includes(addr.save_as as SaveAsPreset) ? addr.save_as as SaveAsPreset : 'Other';
            setSelectedType(preset);
            setNewAddress({
                save_as: addr.save_as,
                pincode: addr.pincode,
                city: addr.city,
                state: addr.state,
                house_number: addr.house_number,
                street_locality: addr.street_locality,
                mobile: addr.mobile,
            });
            setEditingId(id);
            setIsAdding(true);
            setOpenDropdownId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenDropdownId(null);
        try {
            await addressService.delete(id);
            setAddresses(addresses.filter(a => a.id !== id));
            toast.info("Address deleted permanently");
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete address');
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setSelectedType('Home');
        setNewAddress({ ...emptyForm });
    };

    const getIcon = (type: string) => {
        if (type === 'Home') return <Home className="w-5 h-5" />;
        if (type === 'Work') return <Briefcase className="w-5 h-5" />;
        return <MapPin className="w-5 h-5" />;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative pb-24">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-xl mx-auto w-full">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Addresses</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center py-1.5 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="text-[14px] font-semibold tracking-wide">Back</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-0 pt-6 pb-16 gap-4">

                {/* Add New Address Button / Form */}
                <AnimatePresence mode="popLayout">
                    {!isAdding ? (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            onClick={() => setIsAdding(true)}
                            className="flex items-center w-full bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mr-4 group-hover:bg-primary/20 transition-colors">
                                <Plus className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-[16px] text-primary">Add New Address</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            layout
                            className="bg-white dark:bg-gray-900 p-5 rounded-4xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white mb-4">Enter Address Details</h2>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        maxLength={6}
                                        inputMode="numeric"
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        className="w-1/3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-1/3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                        className="w-1/3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="House No., Building Name"
                                    value={newAddress.house_number}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, house_number: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                />
                                <textarea
                                    placeholder="Street Locality / Area"
                                    rows={2}
                                    value={newAddress.street_locality}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, street_locality: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50 resize-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Customer Mobile Number"
                                    value={newAddress.mobile}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, mobile: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                />

                                <div className="mt-2 text-[13px] font-bold text-gray-500">Save as</div>
                                <div className="flex gap-2">
                                    {(['Home', 'Work', 'Other'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setSelectedType(type);
                                                setNewAddress(prev => ({ ...prev, save_as: type === 'Other' ? '' : type }));
                                            }}
                                            className={`cursor-pointer flex-1 py-1.5 rounded-full text-[13px] font-bold border transition-colors ${selectedType === type ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <AnimatePresence>
                                    {selectedType === 'Other' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-3 pb-1">
                                                <input
                                                    type="text"
                                                    placeholder="Location Name (e.g. My Flat, Amit's House)"
                                                    value={newAddress.save_as}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, save_as: e.target.value }))}
                                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[14px] text-gray-900 dark:text-white outline-none focus:border-primary/50"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div layout className="flex gap-3 mt-2">
                                    <button onClick={resetForm} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-semibold text-[14px] cursor-pointer">Cancel</button>
                                    <button
                                        onClick={handleAddAddress}
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-primary text-white rounded-2xl font-semibold text-[14px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? 'Update Address' : 'Save Address'}
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div layout className="text-[15px] font-bold text-gray-800 dark:text-gray-200 mt-2 mb-1 px-1">Saved Addresses</motion.div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    </div>
                ) : addresses.length === 0 ? (
                    <motion.div layout className="text-center text-gray-500 py-10 font-medium">No saved addresses yet.</motion.div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {addresses.map(addr => (
                                <motion.div
                                    key={addr.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center bg-white dark:bg-gray-900 rounded-4xl p-5 border border-gray-200 dark:border-gray-700 transition-all"
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-4 shrink-0 transition-colors">
                                        {getIcon(addr.save_as)}
                                    </div>
                                    <div className="flex flex-col flex-1 pr-2 justify-center">
                                        <h3 className="font-bold text-[16px] text-gray-900 dark:text-white capitalize mb-0.5 leading-tight">{addr.save_as}</h3>
                                        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{addr.house_number}, {addr.street_locality}</p>
                                        <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-tight mb-0.5">{addr.city}, {addr.state} - {addr.pincode}</p>
                                        {addr.mobile && (
                                            <p className="text-[13px] text-gray-600 dark:text-gray-400 font-medium mt-0.5 leading-tight">
                                                {addr.mobile}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action items */}
                                    <div className="relative ml-2 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === addr.id ? null : addr.id); }}
                                            className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                                            title="More options"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        <AnimatePresence>
                                            {openDropdownId === addr.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg z-10 overflow-hidden"
                                                >
                                                    <button onClick={(e) => handleEdit(addr.id, e)} className="w-full flex items-center px-4 py-3 text-[14px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                                        <Edit2 className="w-4 h-4 mr-3 text-gray-400" />
                                                        Edit
                                                    </button>
                                                    <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
                                                    <button onClick={(e) => handleDelete(addr.id, e)} className="w-full flex items-center px-4 py-3 text-[14px] font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                        Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
