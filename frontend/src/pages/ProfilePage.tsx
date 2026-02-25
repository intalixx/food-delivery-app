import { User, ShoppingBag, MapPin, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans relative pb-24">
            {/* Standard Clean Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between max-w-xl mx-auto w-full">
                    <h1 className="text-3xl md:text-[28px] font-bold tracking-wide text-gray-900 dark:text-white">Profile</h1>
                    <button onClick={() => navigate(-1)} className="flex items-center py-1.5 px-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        <span className="text-[14px] font-semibold tracking-wide">Back</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col w-full max-w-xl mx-auto px-4 md:px-0 pt-6 pb-16 gap-8">

                {/* Profile Header Section */}
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-wide">Sudip Santra</h2>
                    <p className="text-gray-500 font-medium">+91 9876543210</p>
                </div>

                {/* Options Section */}
                <div className="flex flex-col gap-3 mt-4">
                    {/* My Orders */}
                    <Link to="/profile/orders" className="flex items-center bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all group cursor-pointer active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4">
                            <ShoppingBag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[16px] font-bold text-gray-800 dark:text-white">My Orders</h3>
                            <p className="text-[13px] text-gray-500 font-medium">View your past orders</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>

                    {/* Saved Address */}
                    <Link to="/profile/address" className="flex items-center bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all group cursor-pointer active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mr-4">
                            <MapPin className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[16px] font-bold text-gray-800 dark:text-white">Saved Address</h3>
                            <p className="text-[13px] text-gray-500 font-medium">Manage delivery locations</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>

                    {/* Personal Information */}
                    <Link to="/profile/personal-info" className="flex items-center bg-white dark:bg-gray-900 rounded-4xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all group cursor-pointer active:scale-[0.98]">
                        <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mr-4">
                            <Settings className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[16px] font-bold text-gray-800 dark:text-white">Personal Information</h3>
                            <p className="text-[13px] text-gray-500 font-medium">Update name & contact info</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
