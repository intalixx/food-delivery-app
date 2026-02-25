import { useState } from 'react';
import { IndianRupee, ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const dummyOrders = [
    {
        id: "ORD-123",
        name: 'Avocado salad',
        price: 120,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        date: '25 Feb, 2026',
        status: 'Delivered'
    },
    {
        id: "ORD-124",
        name: 'Classic Burger',
        price: 150,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        date: '21 Feb, 2026',
        status: 'Delivered'
    },
    {
        id: "ORD-125",
        name: 'Pepperoni Pizza',
        price: 180,
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        date: '15 Feb, 2026',
        status: 'Delivered'
    },
    {
        id: "ORD-126",
        name: 'Fruits salad',
        price: 110,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
        date: '10 Feb, 2026',
        status: 'Delivered'
    }
];

export default function MyOrdersPage() {
    const navigate = useNavigate();
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedItemId(prev => (prev === id ? null : id));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative pb-24">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-xl mx-auto w-full">
                    <h1 className="text-3xl md:text-[28px] font-bold text-gray-900 dark:text-white">My Orders</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center py-1.5 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="text-[14px] font-semibold tracking-wide">Back</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-0 pt-6 pb-16 gap-4">
                {dummyOrders.map(item => (
                    <div key={item.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-4xl p-3 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-sm">

                        {/* Always Visible Row */}
                        <div className="flex items-center cursor-pointer select-none" onClick={() => toggleExpand(item.id)}>
                            {/* Image */}
                            <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 border-2 border-transparent">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Product Info */}
                            <div className="flex flex-col ml-4 flex-1">
                                <h3 className="font-bold text-[16px] text-gray-800 dark:text-white line-clamp-1">{item.name}</h3>
                                <div className="text-[14px] font-bold text-gray-500 flex items-center mt-0.5 flex-wrap gap-y-1">
                                    <div className="flex items-center mr-2">
                                        <span className="mr-1">Total:</span>
                                        <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                                        {item.price * item.quantity}
                                    </div>
                                    <span className="text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            {/* Chevron Toggle */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 shrink-0 ml-2 transition-colors">
                                <motion.div animate={{ rotate: expandedItemId === item.id ? 180 : 0 }}>
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Expanded Content using Framer Motion */}
                        <AnimatePresence>
                            {expandedItemId === item.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 pb-2 px-2 border-t border-gray-100 dark:border-gray-800 mt-4 flex flex-col gap-1 text-sm">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-gray-500 font-medium text-[13px]">Price Per Qty</span>
                                            <div className="flex items-center font-semibold text-gray-800 dark:text-white text-[13px]">
                                                <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                                                {item.price}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-gray-500 font-medium text-[13px]">Total Qty</span>
                                            <span className="font-semibold text-gray-800 dark:text-white text-[13px]">
                                                {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Date Footer */}
                                    <div className="flex justify-end items-center px-3 mt-1 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 pb-1 text-[12px] font-medium">
                                        <span className="text-gray-400 font-semibold">{item.date}</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                ))}
            </div>
        </div>
    );
}
