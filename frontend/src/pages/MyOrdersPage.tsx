import { useState, useEffect, useCallback, useRef } from 'react';
import { IndianRupee, ChevronLeft, ChevronDown, Loader2, ShoppingBag, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { orderService, type Order } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MyOrdersPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Confirm modal state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
    const [pendingCancelCode, setPendingCancelCode] = useState<string>('');

    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await orderService.getMyOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchOrders();
        } else if (!authLoading && !isAuthenticated) {
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, fetchOrders]);

    /** SSE connection for real-time order status updates */
    useEffect(() => {
        if (!isAuthenticated) return;

        const token = Cookies.get('auth_token');
        if (!token) return;

        // EventSource doesn't support custom headers, so we pass token as query param
        const url = `${API_BASE_URL}/orders/stream?token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('order_status_update', (event) => {
            try {
                const data = JSON.parse(event.data) as {
                    order_id: string;
                    order_code: string;
                    order_status: string;
                };

                // Update the order in state instantly (no page refresh needed)
                setOrders(prev =>
                    prev.map(o =>
                        o.id === data.order_id
                            ? { ...o, order_status: data.order_status }
                            : o
                    )
                );

                // Show toast notification
                toast.info(`${data.order_code} — ${data.order_status}`, {
                    duration: 5000,
                    position: 'top-center',
                });
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        });

        es.onerror = () => {
            // Auto-reconnect is built into EventSource, no manual logic needed
            console.warn('SSE connection error, will auto-reconnect...');
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, [isAuthenticated]);

    const toggleExpand = (id: string) => {
        setExpandedItemId(prev => (prev === id ? null : id));
    };

    /** Open the confirm modal instead of window.confirm */
    const openCancelModal = (orderId: string, orderCode: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPendingCancelId(orderId);
        setPendingCancelCode(orderCode);
        setConfirmOpen(true);
    };

    /** Execute the actual cancellation */
    const handleConfirmCancel = async () => {
        if (!pendingCancelId) return;

        setCancellingId(pendingCancelId);
        try {
            const updated = await orderService.cancel(pendingCancelId);
            setOrders(prev => prev.map(o => o.id === pendingCancelId ? { ...o, order_status: updated.order_status } : o));
            toast.success('Order cancelled successfully');
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to cancel order');
        } finally {
            setCancellingId(null);
            setConfirmOpen(false);
            setPendingCancelId(null);
            setPendingCancelCode('');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getItemsSummary = (order: Order) => {
        return order.items.map(item => `${item.qty} x ${item.product_name}`).join(', ');
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

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    </div>
                ) : !isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-center text-[15px]">Please Login To View Your Orders</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-center text-[15px]">No Orders Yet. Start Ordering!</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="flex flex-col bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 transition-all">

                            {/* Always Visible Row */}
                            <div className="flex items-center cursor-pointer select-none" onClick={() => toggleExpand(order.id)}>
                                <div className="flex flex-col flex-1">
                                    {/* Order Code */}
                                    <h3 className="font-bold text-[15px] text-gray-800 dark:text-white">{order.order_code}</h3>

                                    {/* Items Summary */}
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 line-clamp-1">
                                        {getItemsSummary(order)}
                                    </p>

                                    {/* Total + Status */}
                                    <div className="flex items-center mt-1.5 gap-2 flex-wrap">
                                        <div className="flex items-center text-[14px] font-bold text-gray-700 dark:text-gray-300">
                                            <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
                                            {order.final_amount}
                                        </div>
                                        <OrderStatusBadge status={order.order_status} />
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {order.total_qty} {order.total_qty === 1 ? 'item' : 'items'}
                                        </span>
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
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center w-full">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium text-[13px]">
                                                        {item.qty} x {item.product_name}
                                                    </span>
                                                    <div className="flex items-center font-semibold text-gray-800 dark:text-white text-[13px]">
                                                        <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                                                        {item.subtotal}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Total Row */}
                                            <div className="flex justify-between items-center w-full pt-2 mt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                                                <span className="text-gray-800 dark:text-white font-bold text-[13px]">Total</span>
                                                <div className="flex items-center font-bold text-gray-800 dark:text-white text-[13px]">
                                                    <IndianRupee className="w-3 h-3 stroke-[2.5]" />
                                                    {order.final_amount}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Date Footer + Cancel Button */}
                                        <div className="flex justify-between items-center px-2 mt-1 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800 pb-1">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[12px] text-gray-400 font-medium">
                                                    Ordered: {formatDate(order.created_at)}
                                                </span>
                                            </div>

                                            {/* Cancel button — only for 'Order Received' */}
                                            {order.order_status === 'Order Received' && (
                                                <button
                                                    onClick={(e) => openCancelModal(order.id, order.order_code, e)}
                                                    disabled={cancellingId === order.id}
                                                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-[12px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {cancellingId === order.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    )}
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    ))
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            <ConfirmModal
                open={confirmOpen}
                onOpenChange={(open) => {
                    setConfirmOpen(open);
                    if (!open) {
                        setPendingCancelId(null);
                        setPendingCancelCode('');
                    }
                }}
                title="Cancel Order"
                description={`Are you sure you want to cancel order ${pendingCancelCode}? This action cannot be undone.`}
                confirmLabel="Yes, Cancel Order"
                cancelLabel="Keep Order"
                variant="danger"
                isLoading={cancellingId !== null}
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
}
