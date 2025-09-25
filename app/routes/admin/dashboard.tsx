import { useEffect, useState } from "react";
import FormCategory from "@/views/components/admin/form-category";
import FormProduct from "@/views/components/admin/form-product";
import OrdersList from "@/views/components/admin/orders-list";
import RequestsList from "@/views/components/admin/requests-list";
import { Navigate, useNavigate } from "react-router";

export default function Dashboard() {
    
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('products');

    const handleLogout = () => {
        // Remove token to logout
        localStorage.removeItem("adminToken");
        navigate("/admin");
    };

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
        window.location.href = "/admin";
        }
    }, [])

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <button onClick={handleLogout} className="cursor-pointer">Logout</button>
            {/* Header Section */}
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Product Management System</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Streamline your inventory management with our comprehensive product dashboard</p>
            </header>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
                <div className="bg-white rounded-full p-1 shadow-lg flex">
                    <button onClick={() => setActiveTab('products')} className={`tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${
                        activeTab === 'products'
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-300 text-gray-600"
                        }`}>Products</button>
                    <button onClick={() => setActiveTab('categories')} className={`tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${
                        activeTab === 'categories'
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-300 text-gray-600"
                        }`}>Categories</button>
                    <button onClick={() => setActiveTab('orders')} className={`tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${
                        activeTab === 'orders'
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-300 text-gray-600"
                        }`}>View Orders</button>
                    <button onClick={() => setActiveTab('requests')} className={`tab-btn cursor-pointer px-6 py-2 rounded-full font-medium transition-all ${
                        activeTab === 'requests'
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-300 text-gray-600"
                        }`}>View Requests</button>
                </div>
            </div>

            {activeTab === 'products' && <FormProduct />}
            {activeTab === 'categories' && <FormCategory />}
            {activeTab === 'orders' && <OrdersList />}
            {activeTab === 'requests' && <RequestsList />}
        </div>
    )
}