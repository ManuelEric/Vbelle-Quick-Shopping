import { useState } from "react";
import { formatRupiah } from "@/utils/formatRupiah";
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Product {
    id: string;
    Name: string;
    ActualPrice: number;
    OfferPrice: number;
    SellPrice: number;
    CategoryID: string;
    Description: string;
    Image: string;
    Quantity: number;
}

interface PanelProps {
    isVisible: boolean;
    onClose: () => void;
    cartItems: Product[];
    setCartItems: React.Dispatch<React.SetStateAction<Product[]>>;
    setIsCheckoutOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CartPanel({ isVisible, onClose, cartItems, setCartItems, setIsCheckoutOpen }: PanelProps ) {

    /* increase & decrease quantity */
    const increaseQty = (id: string) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? {...item, Quantity: item.Quantity + 1} : item
            )
        );
    }

    const decreaseQty = (id: string) => {
        setCartItems(prev =>
            prev
            .map(item =>
                item.id === id ? {...item, Quantity: item.Quantity - 1} : item
            )
            .filter(item => item.Quantity > 0) // Remove item if quantity is 0
        );
    }

    /* calculate total */
    const calculateTotal = (items: Product[]) => {
        return items.reduce((total: number, item: Product) => {
            return total + item.SellPrice * item.Quantity;
        }, 0)
    }

    /* remove item from cart */
    const removeFromCart = (id: string) => {
        setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
    }

    return (
        <div id="cartPanel" className={`cart-panel fixed inset-y-0 right-0 w-full sm:max-w-md bg-white shadow-lg z-50 p-4 overflow-y-auto ${isVisible ? "open" : ""} `}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Keranjang Anda</h2>
                <button id="closeCart" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div id="cartItems" className="space-y-4 mb-6">
                {/* Cart items will be inserted here */}
                {cartItems.length === 0 ? (
                    <p id="emptyCart" className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                    <div>
                    {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 h-20 w-20 rounded bg-gray-100 overflow-hidden">
                                    <img src={item.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png"} alt="Product thumbnail" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                <h3 className="font-medium">{item.Name}</h3>
                                <p className="text-sm text-gray-500">{formatRupiah(item.SellPrice)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="quantity-btn px-2 py-1 bg-gray-100 rounded cursor-pointer" onClick={() => decreaseQty(item.id)}>-</button>
                                    <span>{ item.Quantity }</span>
                                <button className="quantity-btn px-2 py-1 bg-gray-100 rounded cursor-pointer" onClick={() => increaseQty(item.id)}>+</button>
                                <button className="remove-btn px-2 py-1 text-red-500 rounded ml-2 cursor-pointer" onClick={() => removeFromCart(item.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            <div className="border-t pt-4">
                {/* <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span id="cartSubtotal">$0.00</span>
                </div>
                <div className="flex justify-between mb-4">
                    <span>Shipping:</span>
                    <span id="cartShipping">$5.99</span>
                </div> */}
                <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span id="cartTotal">{formatRupiah(calculateTotal(cartItems))}</span>
                </div>
            </div>

            <button id="checkoutButton" 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cartItems.length === 0}
                className="w-full mt-6 cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-300">
                Proceed to Checkout
            </button>
        </div>
    )
}