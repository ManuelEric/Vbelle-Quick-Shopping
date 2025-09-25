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

type Requests = {
    id: string,
    FullName: string,
    PhoneNumber: string,
    ProductName: string,
    CreatedAt?: Timestamp,
    UpdatedAt?: Timestamp,
}

export default function RequestsList({ activeTab: activeTab } : Props) {

    const [requests, setRequests] = useState<Requests[]>([]);

    const fetchRequests = async () => {
        try {
            const q = query(
                collection(db, "request"),
                orderBy("CreatedAt", "desc")
            )

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Requests, "id">),
            }));
        } catch (err) {
            toast.error("Error fetching requests")
            return []; // Important: must return an array
        }
    }      

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchRequests();
            setRequests(data);
        };
        fetchData();
    }, []);

    return (
        <div id="requests" className={`tab-content ${activeTab === 'requests' ? 'active' : ''}`}>
            <div className="bg-white rounded-xl p-8 card-shadow">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Requests</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request At</th>
                            </tr>
                        </thead>
                        <tbody id="requestsTableBody" className="bg-white divide-y divide-gray-200">
                            {/* Requests will be loaded dynamically */}
                            {requests.map(request => (
                                <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.FullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.PhoneNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.ProductName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.CreatedAt?.toDate().toLocaleDateString("en-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}