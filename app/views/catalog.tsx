import { useEffect, useState } from "react";
import CartPanel from "./components/cart-panel";
import CheckoutForm from "./components/checkout-form";
import ProductsGrid from "./components/products-grid";
import FilterButton from "./components/filter-button";
import type { Product } from "../types/product";
import SearchBar from "./components/search-bar";
import CheckOrder from "./components/check-order";
import FloatingRequestButton from './components/floating-request-button';
import { Bounce, ToastContainer } from 'react-toastify';

export function Catalog() {
    
    /* toggle cart panel */
    const [isVisible, setIsVisible] = useState(false);

    /* toggle check order panel */
    const [showCheckOrder, setShowCheckOrder] = useState(false);

    const handleToggle = () => {
        setIsVisible(prev => !prev);
    }

    const handleCheckOrder = () => {
        setShowCheckOrder(prev => !prev);
    }

    const [cartItems, setCartItems] = useState<Product[]>([]);

    const clearCart = () => setCartItems([]);

    const uniqueItems = cartItems.length;

    const [selectedCategory, setSelectedCategory] = useState("all");

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    
    return (
        <div>
            {/* Floating button */}
            <FloatingRequestButton />

            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
                />

            <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 text-center sm:text-left">
                        Katalog
                    </h1>

                    {/* Search Bar */}
                    <div className="w-full sm:w-1/2 order-2 sm:order-1">
                        <SearchBar searchTerm={searchTerm} handleChange={(val: string) => setSearchTerm(val)} />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 order-1 sm:order-1">
                        {/* Riwayat Pesanan */}
                        <button
                            onClick={handleCheckOrder}
                            className="sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-indigo-600 hover:underline cursor-pointer"
                        >
                            Riwayat Pesanan
                        </button>

                        {/* Cart Button */}
                        <button
                            onClick={handleToggle}
                            className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 cursor-pointer"
                        >
                            {/* Cart Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            {/* Cart Count */}
                            <span
                                id="cartCount"
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5"
                            >
                                {uniqueItems}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            </header>

            <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <FilterButton selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

                {/* Products Grid */}
                <ProductsGrid cartItems={cartItems} setCartItems={setCartItems} selectedCategory={selectedCategory} searchTerm={searchTerm} />
            </main>

            {/* Check Order Container */}
            <CheckOrder showCheckOrder={showCheckOrder} onClose={() => setShowCheckOrder(false)} />


            {/* Cart Panel */}
            <CartPanel isVisible={isVisible} onClose={() => setIsVisible(false)} cartItems={cartItems} setCartItems={setCartItems} setIsCheckoutOpen={setIsCheckoutOpen}/>

            {/* Checkout Form */}
            <CheckoutForm isCheckoutOpen={isCheckoutOpen} onClose={() => { setIsCheckoutOpen(false); setIsVisible(false); }} cartItems={cartItems} clearCart={clearCart} />
        </div>
    )
}