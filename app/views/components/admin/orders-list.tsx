import type { Product } from "@/types/product";
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "firebaseConfig";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/utils/formatRupiah";
import { Timestamp } from "firebase/firestore";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
    activeTab?: string
}

type Orders = {
    id: string;
    FullName: string;
    PhoneNumber: string;
    Total: number;
    Items: Product[]; 
    Status: string;
    Payment: string;
    CreatedAt: Timestamp;
}

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentOptions = ["waiting", "down payment", "paid"];
const purchaseOptions = ["purchased", "not purchased"];

export default function OrdersList({ activeTab: activeTab } : Props) {

    const [open, setOpen] = useState(false)
    const [orders, setOrders] = useState<Orders[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);

    const fetchOrders = async () => {
        try {
            const q = query(
                collection(db, "orders"),
                orderBy("CreatedAt", "desc")
            )

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Orders, "id">),
            }));
        } catch (err) {
            toast.error("Error fetching orders")
            return []; // Important: must return an array
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Update Firestore
            const orderRef = doc(db, "orders", id);
            await updateDoc(orderRef, { Status: newStatus });
        
            // Update local state
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === id ? { ...order, Status: newStatus } : order
              )
            );
            toast.success("Status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handlePaymentChange = async (id: string, newPayment: string) => {
        try {
            // Update Firestore
            const orderRef = doc(db, "orders", id);
            await updateDoc(orderRef, { Payment: newPayment });

            // Update local state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                  order.id === id ? { ...order, Payment: newPayment } : order
                )
            );
            toast.success("Payment updated");
        } catch (err) {
            toast.error("Failed to update payment");
        }
    }

    const handlePurchaseChange = async (
        id: string, 
        itemId: string, 
        newPurchase: string
    ) => {
        try {
            // Update Firestore
            const orderRef = doc(db, "orders", id);
            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                alert("Order not found");
                return;
            }

            const orderData = orderSnap.data();
            const items = orderData.Items || [];

            // Update the item with the matching id
            const updatedItems = items.map((item: any) =>
                item.id === itemId ? { ...item, Purchase: newPurchase } : item
            );

            // Push the update to Firestore
            await updateDoc(orderRef, { Items: updatedItems });

            // ✅ Update local `orders` state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                order.id === id ? { ...order, Items: updatedItems } : order
                )
            );

            // ✅ Also update `selectedOrder` if it's the same one being updated
            if (selectedOrder?.id === id) {
                setSelectedOrder({
                ...selectedOrder,
                Items: updatedItems
                });
            }

            toast.success("Item purchase status updated!");
        } catch (err) {
            toast.error("Failed to update item purchase status");
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-indigo-100 text-indigo-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
      

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchOrders();
            setOrders(data);
        };
        fetchData();
    }, []);

    return (
        <div id="orders" className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
            <div className="bg-white rounded-xl p-8 card-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody" className="bg-white divide-y divide-gray-200">
                            {/* Orders will be loaded dynamically */}
                            {orders.map(order => (
                                <tr key={order.id} className={`hover:bg-gray-50 cursor-pointer ${getStatusColor(order.Status)}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" onClick={() => setSelectedOrder(order)}>{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" onClick={() => {setOpen(true); setSelectedOrder(order)}}>{order.FullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.PhoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.CreatedAt?.toDate().toLocaleDateString("en-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(order.Total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.Status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="mt-1 border rounded px-2 py-1"
                                        >
                                            {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                            value={order.Payment}
                                            onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                                            className="mt-1 border rounded px-2 py-1"
                                        >
                                            {paymentOptions.map((payment) => (
                                            <option key={payment} value={payment}>
                                                {payment.charAt(0).toUpperCase() + payment.slice(1)}
                                            </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={open} onClose={setOpen} className="relative z-10">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
                />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                        <DialogPanel
                            transition
                            className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
                        >
                            <TransitionChild>
                            <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                                <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="relative rounded-md text-gray-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon aria-hidden="true" className="size-6" />
                                </button>
                            </div>
                            </TransitionChild>
                            <div className="relative flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl">
                            <div className="px-4 sm:px-6">
                                <DialogTitle className="text-base font-semibold text-gray-900">Order Detail</DialogTitle>
                            </div>
                            <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                <table className="table-auto w-full">
                                    <tr>
                                        <td className="px-4 py-2"><strong>Name</strong></td>
                                        <td>:</td>
                                        <td className="px-4 py-2">{selectedOrder?.FullName}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2"><strong>Phone</strong></td>
                                        <td>:</td>
                                        <td className="px-4 py-2">{selectedOrder?.PhoneNumber}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2"><strong>Status</strong></td>
                                        <td>:</td>
                                        <td className="px-4 py-2">{selectedOrder?.Status}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2"><strong>Total</strong></td>
                                        <td>:</td>
                                        <td className="px-4 py-2">{selectedOrder ? formatRupiah(selectedOrder.Total) : ''}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2"><strong>Created At</strong></td>
                                        <td>:</td>
                                        <td className="px-4 py-2">{selectedOrder?.CreatedAt?.toDate().toLocaleString("en-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                        </td>
                                    </tr>
                                </table>
                                
                                <h3 className="font-semibold mt-4 mb-2">Items:</h3>
                                <ul className="space-y-1 overflow-y-auto">
                                    {selectedOrder?.Items.map((item) => (
                                    <li key={item.id} className="border p-2 rounded">
                                        <div className="flex items-center">
                                            <div className="h-25 w-25 overflow-hidden rounded-lg ms-2">
                                                <img src={item.Image ?? "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/36cbede6-cca8-4f15-8343-4a6656da4493.png"} alt="Product thumbnail" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="ms-10">
                                                <p>{item.Name} × {item.Quantity}</p>
                                                <p>{formatRupiah(item.SellPrice)}</p>
                                                <select 
                                                    value={item.Purchase || "not purchased"}
                                                    className="mt-2 px-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    onChange={(e) => handlePurchaseChange(selectedOrder.id, item.id, e.target.value)}
                                                >
                                                    {purchaseOptions.map((purchase) => (
                                                    <option key={purchase} value={purchase}>
                                                        {purchase.charAt(0).toUpperCase() + purchase.slice(1)}
                                                    </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                            </div>
                        </DialogPanel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}