import { useState } from 'react';
import { Search, SlidersHorizontal, IndianRupee } from 'lucide-react'
import { useCart } from '../hooks/useCart'

// Dummy data for our food items with categories
const foodItems = [
    // Salads
    { id: 1, name: 'Avocado salad', category: 'Salads', price: 120, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', description: 'Fresh avocado, cherry tomatoes, and mixed greens with lemon dressing.' },
    { id: 2, name: 'Fruits salad', category: 'Salads', price: 110, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', description: 'Seasonal mixed fruits tossed with a light honey syrup.' },
    { id: 3, name: 'Green salad', category: 'Salads', price: 100, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', description: 'Crisp lettuce, cucumber, and green bell peppers with olive oil.' },
    { id: 4, name: 'Tomato bowl', category: 'Salads', price: 140, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', description: 'Heritage tomatoes, basil, and mozzarella topped with balsamic glaze.' },

    // Burgers
    { id: 5, name: 'Classic Burger', category: 'Burgers', price: 150, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', description: 'Juicy beef patty, lettuce, tomato, and our signature sauce.' },
    { id: 6, name: 'Cheese Burger', category: 'Burgers', price: 160, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', description: 'Double cheddar cheese melted over a grilled beef patty.' },
    { id: 7, name: 'Veggie Burger', category: 'Burgers', price: 140, image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400', description: 'Plant-based patty with fresh avocado and vegan mayo.' },
    { id: 8, name: 'Chicken Burger', category: 'Burgers', price: 170, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', description: 'Crispy fried chicken breast, pickles, and spicy ranch.' },

    // Pizzas
    { id: 9, name: 'Pepperoni Pizza', category: 'Pizzas', price: 180, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', description: 'Classic mozzarella topped with spicy pepperoni slices.' },
    { id: 10, name: 'Margherita Pizza', category: 'Pizzas', price: 160, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', description: 'Simple perfection with tomato sauce, fresh mozzarella, and basil.' },
    { id: 11, name: 'BBQ Chicken Pizza', category: 'Pizzas', price: 200, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', description: 'Grilled chicken, red onions, and sweet BBQ sauce.' },
    { id: 12, name: 'Veggie Pizza', category: 'Pizzas', price: 170, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', description: 'Loaded with bell peppers, mushrooms, olives, and onions.' }
];

const categories = ['Salads', 'Burgers', 'Pizzas'];

export default function HomePage() {
    const { addToCart } = useCart();
    const [activeCategory, setActiveCategory] = useState('Salads');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');

    let filteredItems = foodItems.filter(item => item.category === activeCategory);

    if (sortBy === 'asc') {
        filteredItems = [...filteredItems].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'desc') {
        filteredItems = [...filteredItems].sort((a, b) => b.price - a.price);
    }

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-gray-50 dark:bg-gray-950 font-sans">
            <div className="p-6 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 leading-tight">
                    Find The <span className="font-bold">Best<br />Food</span> Around You
                </h1>

                {/* Search Bar */}
                <div className="mt-6 flex items-center bg-white dark:bg-gray-900 rounded-full px-5 py-3 border border-gray-200 dark:border-gray-700 transition-colors focus-within:border-primary/50 dark:focus-within:border-primary/50">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search your favourite food"
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
                <div className="py-8">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                        {categories.map(category => (
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

                {/* Rest of the content */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 relative flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer group">

                            <div className="relative w-full">
                                <div className="w-full h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                    />
                                </div>
                            </div>

                            <div className="w-full p-4 flex flex-col">
                                <h3 className="font-bold text-[16px] text-gray-900 dark:text-white truncate">{item.name}</h3>
                                <p
                                    className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-2"
                                    title={item.description}
                                >
                                    {item.description}
                                </p>

                                {/* Bottom Row - Price */}
                                <div className="w-full mt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-primary flex items-center">
                                        <IndianRupee className="w-3.75 h-3.75 mr-px stroke-[2.5]" />
                                        {item.price}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart({
                                                id: item.id,
                                                name: item.name,
                                                price: item.price,
                                                image: item.image
                                            })
                                        }}
                                        className="px-3 py-1 bg-white dark:bg-gray-900 text-primary border border-primary font-bold text-[11px] rounded-md cursor-pointer"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
