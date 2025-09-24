import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    isCheckoutOpen: boolean;
    onClose: () => void;
    cartItems: Product[];
    clearCart: () => void;
}

export default function CheckoutForm({ isCheckoutOpen, onClose, cartItems, clearCart }: PanelProps) {

    const [formData, setFormData] = useState({
        FullName: "",
        PhoneNumber: "",
        Status: "",
        Payment: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const clearFormData = () => {
        setFormData({
            FullName: "",
            PhoneNumber: "",
            Status: "",
            Payment: "",
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //handle order submission
        const FullName = formData.FullName;
        const PhoneNumber = formData.PhoneNumber;
        const Status = "pending"
        const Payment = "waiting"

        try {
            await addDoc(collection(db, "orders"), {
                FullName,
                PhoneNumber,
                Status,
                Payment,
                Items: cartItems,
                CreatedAt: Timestamp.now(),
                Total: cartItems.reduce((sum: number, item) => sum + item.SellPrice * item.Quantity, 0),
            });
            clearCart();
            clearFormData();
            toast.success("Order submitted!");
            onClose();
        } catch (error) {
            toast.error("Failed to submit order. Please try again.");
            console.error("Error submitting order:", error);
        }
    }

    return (
        <div id="checkoutForm"
            className={`${isCheckoutOpen ? "open" : ""} checkout-form fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center`}>
            <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-md mx-2 max-h-screen overflow-y-auto p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Checkout</h2>
                    <button id="closeCheckout" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form id="shippingForm" className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="FullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text"
                            id="FullName"
                            name="FullName"
                            value={formData.FullName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-700">Nomor Telepon (diutamakan whatsapp)</label>
                        <input type="text"
                            id="PhoneNumber"
                            name="PhoneNumber"
                            value={formData.PhoneNumber}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    {/* <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" id="address" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="city" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
                            <input type="text" id="postalCode" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div> */}

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" id="cancelCheckout" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 cursor-pointer py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Submit Order</button>
                    </div>
                </form>
            </div>
        </div>
    )
}