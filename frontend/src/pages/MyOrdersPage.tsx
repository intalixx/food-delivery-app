import { useState } from 'react';
import { IndianRupee, ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';

type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type Order = {
    id: string;
    items: OrderItem[];
    date: string;
    status: string;
};

const dummyOrders: Order[] = [
    {
        id: 'ORD-123',
        items: [
            { name: 'Avocado Salad', quantity: 1, price: 120 },
            { name: 'Chicken Burger', quantity: 2, price: 170 }
        ],
        date: '25 Feb, 2026',
        status: 'Order Received'
    },
    {
        id: 'ORD-124',
        items: [
            { name: 'Pepperoni Pizza', quantity: 1, price: 180 },
            { name: 'Margherita Pizza', quantity: 1, price: 160 },
            { name: 'Green Salad', quantity: 2, price: 100 }
        ],
        date: '21 Feb, 2026',
        status: 'Preparing'
    },
    {
        id: 'ORD-125',
        items: [
            { name: 'Classic Burger', quantity: 3, price: 150 }
        ],
        date: '15 Feb, 2026',
        status: 'Out for Delivery'
    },
    {
        id: 'ORD-126',
        items: [
            { name: 'Fruits Salad', quantity: 2, price: 110 },
            { name: 'Tomato Bowl', quantity: 1, price: 140 }
        ],
        date: '10 Feb, 2026',
        status: 'Delivered'
    }
];

const getOrderTotal = (items: OrderItem[]) => items.reduce((sum, item) => sum + item.price * item.quantity, 0);
const getItemsSummary = (items: OrderItem[]) => items.map(item => `${item.quantity} x ${item.name}`).join(', ');

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
                {dummyOrders.map(order => (
                    <div key={order.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 transition-all">

                        {/* Always Visible Row */}
                        <div className="flex items-center cursor-pointer select-none" onClick={() => toggleExpand(order.id)}>
                            <div className="flex flex-col flex-1">
                                {/* Order ID */}
                                <h3 className="font-bold text-[15px] text-gray-800 dark:text-white">{order.id}</h3>

                                {/* Items Summary */}
                                <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 line-clamp-1">
                                    {getItemsSummary(order.items)}
                                </p>

                                {/* Total + Status */}
                                <div className="flex items-center mt-1.5 gap-2 flex-wrap">
                                    <div className="flex items-center text-[14px] font-bold text-gray-700 dark:text-gray-300">
                                        <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                                        {getOrderTotal(order.items)}
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                            </div>

                            {/* Chevron Toggle */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 shrink-0 ml-3 transition-colors">
                                <motion.div animate={{ rotate: expandedItemId === order.id ? 180 : 0 }}>
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedItemId === order.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 pb-2 px-1 border-t border-gray-100 dark:border-gray-800 mt-3 flex flex-col gap-2 text-sm">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center w-full">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium text-[13px]">
                                                    {item.quantity} x {item.name}
                                                </span>
                                                <div className="flex items-center font-semibold text-gray-800 dark:text-white text-[13px]">
                                                    <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                                                    {item.price * item.quantity}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Total Row */}
                                        <div className="flex justify-between items-center w-full pt-2 mt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-800 dark:text-white font-bold text-[13px]">Total</span>
                                            <div className="flex items-center font-bold text-gray-800 dark:text-white text-[13px]">
                                                <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                                                {getOrderTotal(order.items)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Date Footer */}
                                    <div className="flex justify-end items-center px-2 mt-1 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 pb-1 text-[12px] font-medium">
                                        <span className="text-gray-400 font-semibold">{order.date}</span>
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
