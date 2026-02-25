import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, IndianRupee, LogIn, UserPlus, Loader2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { categoryService, type Category } from '@/services/categoryService'
import { productService, getProductImageUrl, type Product } from '@/services/productService'

export default function HomePage() {
    const { addToCart, items } = useCart();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeCategory, setActiveCategory] = useState('All');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const [categoriesData, productsData] = await Promise.all([
                    categoryService.getAll(),
                    productService.getAll(),
                ]);
                setCategories(categoriesData);
                setProducts(productsData);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load data';
                setError(message);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter by category
    let filteredItems = activeCategory === 'All'
        ? products
        : products.filter(item => item.category_name === activeCategory);

    // Filter by search query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
            item.product_name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        );
    }

    // Sort by price
    if (sortBy === 'asc') {
        filteredItems = [...filteredItems].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'desc') {
        filteredItems = [...filteredItems].sort((a, b) => Number(b.price) - Number(a.price));
    }

    // Build category tabs from fetched categories
    const categoryTabs = ['All', ...categories.map(c => c.category_name)];

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-gray-50 dark:bg-gray-950 font-sans">
            <div className="p-4 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-primary tracking-tight">Intalix.</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Find The Best Food Around You !</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 md:px-4 md:py-2 rounded-full border border-primary text-[13px] font-semibold text-primary hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-center gap-1.5 leading-none"><LogIn className="w-4 h-4" /><span className="hidden md:inline">Login</span></button>
                        <button className="p-2 md:px-4 md:py-2 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-1.5 leading-none"><UserPlus className="w-4 h-4" /><span className="hidden md:inline">Sign Up</span></button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-6 flex items-center bg-white dark:bg-gray-900 rounded-full px-5 py-3 border border-gray-200 dark:border-gray-700 transition-colors focus-within:border-primary/50 dark:focus-within:border-primary/50">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search your favourite food"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                    />
                    <div className="relative">
                        <button onClick={() => setShowSortMenu(!showSortMenu)} className="p-1 cursor-pointer outline-none">
                            <SlidersHorizontal className={`w-5 h-5 transition-colors ${showSortMenu ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                        </button>

                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-3 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg shadow-black/5 p-2 z-50">
                                <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-2">Sort by</h4>
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => { setSortBy('asc'); setShowSortMenu(false); }}
                                        className={`text-left px-2 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${sortBy === 'asc' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        Price: Low to High
                                    </button>
                                    <button
                                        onClick={() => { setSortBy('desc'); setShowSortMenu(false); }}
                                        className={`text-left px-2 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${sortBy === 'desc' ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        Price: High to Low
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="py-6 relative z-10">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                        {categoryTabs.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border ${activeCategory === category
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading delicious food...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <p className="text-sm text-red-500 font-medium">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No items found</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or category filter.</p>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && !error && filteredItems.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                        {filteredItems.map((item) => {
                            const imageUrl = getProductImageUrl(item.image_path);
                            return (
                                <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 relative flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer group">

                                    <div className="relative w-full">
                                        <div className="w-full h-40 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={imageUrl}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full p-4 flex flex-col">
                                        <h3 className="font-bold text-[16px] text-gray-900 dark:text-white truncate">{item.product_name}</h3>
                                        <p
                                            className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-2"
                                            title={item.description || ''}
                                        >
                                            {item.description}
                                        </p>

                                        {/* Bottom Row - Price */}
                                        <div className="w-full mt-4 flex justify-between items-center">
                                            <span className="font-bold text-lg text-primary flex items-center">
                                                <IndianRupee className="w-3.75 h-3.75 mr-px stroke-[2.5]" />
                                                {Number(item.price)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const isAlreadyInCart = items.some(cartItem => cartItem.id === item.id);

                                                    if (isAlreadyInCart) {
                                                        toast.info('Product is already in cart', {
                                                            action: { label: 'Go to Cart', onClick: () => navigate('/cart') }
                                                        });
                                                    } else {
                                                        addToCart({
                                                            id: item.id,
                                                            name: item.product_name,
                                                            price: Number(item.price),
                                                            image: imageUrl
                                                        });
                                                        toast.success('Product added to cart', {
                                                            action: { label: 'Go to Cart', onClick: () => navigate('/cart') }
                                                        });
                                                    }
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-gray-900 text-primary border border-primary font-bold text-[11px] rounded-md cursor-pointer"
                                            >
                                                ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
