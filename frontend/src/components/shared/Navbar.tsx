import { Home, ShoppingCart, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
    const location = useLocation();
    const { totalItems: cartItemCount } = useCart();

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-18 bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium relative">
                <Link
                    to="/"
                    className={`inline-flex flex-col items-center justify-center px-5 transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                >
                    <Home className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-semibold tracking-wide">Items</span>
                </Link>

                {/* Center Cart Item with Green Background */}
                <div className="flex justify-center -mt-6">
                    <Link
                        to="/cart"
                        className="relative flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full shadow-lg shadow-primary/40 hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 border-[6px] border-gray-50 dark:border-gray-950"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartItemCount > 0 && (
                            <div className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[11px] text-gray-900 font-bold shadow-sm">
                                {cartItemCount}
                            </div>
                        )}
                    </Link>
                </div>

                <Link
                    to="/profile"
                    className={`inline-flex flex-col items-center justify-center px-5 transition-colors ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
                >
                    <User className="w-6 h-6 mb-1" />
                    <span className="text-[11px] font-semibold tracking-wide">Profile</span>
                </Link>
            </div>
        </div>
    )
}
