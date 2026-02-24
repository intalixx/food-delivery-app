import { useCart } from '../hooks/useCart';
import { IndianRupee, Minus, Plus, ChevronLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { items, updateQuantity, totalPrice, clearCart, removeFromCart } = useCart();
    const navigate = useNavigate();

    const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const finalTotal = totalPrice;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-6 pb-24 font-sans">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your cart is empty</h2>
                <p className="text-gray-500 mt-2 mb-8 text-center max-w-xs font-medium content-center">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="px-6 py-2.5 bg-primary text-white font-bold text-[15px] rounded-xl shadow-[0_4px_14px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] transition-all cursor-pointer">Start Ordering</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative pb-24">
            {/* Standard Clean Header */}
            <div className="pt-6 pb-2 px-4 md:px-6">
                <div className="flex items-center justify-between max-w-xl mx-auto w-full">
                    <h1 className="text-3xl md:text-[28px] font-bold tracking-wide text-gray-900 dark:text-white">Cart</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="flex items-center py-1.5 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            <span className="text-[14px] font-semibold tracking-wide">Back</span>
                        </button>
                        <button onClick={clearCart} className="flex items-center py-1.5 px-3 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-red-500 border border-red-200 dark:border-red-900/50">
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="text-[14px] font-semibold tracking-wide">Clear</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-0 pt-4 pb-16 gap-5">

                {/* Items List */}
                <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {items.map(item => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="relative rounded-4xl bg-red-100 dark:bg-red-900/30 w-full"
                            >
                                <div className="absolute inset-0 flex items-center justify-between px-5 text-red-500 rounded-4xl border border-red-200 dark:border-red-900/50">
                                    <Trash2 className="w-5 h-5" />
                                    <span className="text-[12px] font-bold tracking-wider uppercase opacity-60">Swipe to delete</span>
                                    <Trash2 className="w-5 h-5" />
                                </div>

                                <motion.div
                                    className="flex items-center w-full bg-white dark:bg-gray-900 rounded-4xl p-3 border border-gray-200 dark:border-gray-700 relative z-10"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.8}
                                    whileTap={{ cursor: 'grabbing' }}
                                    onDragEnd={(e, { offset }) => {
                                        if (Math.abs(offset.x) > 100) {
                                            removeFromCart(item.id);
                                        }
                                    }}
                                >
                                    {/* Image */}
                                    <div className="w-15 h-15 shrink-0 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex flex-col ml-3 flex-1">
                                        <h3 className="font-bold text-[15px] text-gray-800 dark:text-white line-clamp-1">{item.name}</h3>
                                        <div className="text-[13px] font-bold text-gray-500 flex items-center mt-0.5">
                                            <IndianRupee className="w-3 h-3 stroke-3" />
                                            {item.price}
                                        </div>
                                    </div>

                                    {/* Controls & Total */}
                                    <div className="flex items-center ml-2 shrink-0 pr-1">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-5.5 h-5.5 rounded-full bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                >
                                                    <Minus className="w-2.5 h-2.5 stroke-[3.5]" />
                                                </button>

                                                <span className="text-[14px] font-bold text-gray-800 dark:text-white min-w-7 text-center">
                                                    {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-5.5 h-5.5 rounded-full bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                >
                                                    <Plus className="w-2.5 h-2.5 stroke-[3.5]" />
                                                </button>
                                            </div>
                                            <div className="text-[12px] font-bold text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                                                <IndianRupee className="w-2.5 h-2.5 stroke-3" />
                                                {item.price * item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>



                {/* Summary & Checkout */}
                <div className="bg-white dark:bg-gray-900 w-full rounded-[24px] p-6 border border-gray-200 dark:border-gray-700 mt-4">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center text-[14px] font-semibold text-gray-500 dark:text-gray-400">
                            <span>Subtotal</span>
                            <div className="flex items-center text-gray-800 dark:text-white">
                                <IndianRupee className="w-3 h-3 stroke-3" /> {totalPrice}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[14px] font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700 mt-3">
                            <span>Total Items</span>
                            <div className="flex items-center text-gray-800 dark:text-white">
                                {totalItemCount}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[18px] font-bold text-gray-900 dark:text-white mt-4 mb-6">
                            <span>Final Amount</span>
                            <div className="flex items-center">
                                <IndianRupee className="w-4 h-4 mr-0.5 stroke-3" /> {items.length > 0 ? finalTotal : 0}
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-primary text-white font-bold text-[14px] tracking-wide rounded-xl shadow-[0_4px_14px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.3)] active:scale-[0.98] transition-shadow cursor-pointer">
                            CHECKOUT
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
