import type { Product } from "@/types/product";
import { collection, getDocs, query, where, type Timestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "firebaseConfig";
import { formatRupiah } from "@/utils/formatRupiah";

interface CheckOrderProps {
    showCheckOrder: boolean;
    onClose: () => void;
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

export default function CheckOrder({ showCheckOrder, onClose }: CheckOrderProps) {
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Orders[]>([]);
    const [error, setError] = useState("");

    if (!showCheckOrder) return null; // Don't render if not open

    const handleSearch = async () => {
        if (!phone.trim()) {
            setError("Masukkan nomor HP terlebih dahulu");
            return;
        }
    
        setLoading(true);
        setError("");
        setOrders([]);
    
        try {
            const q = query(
                collection(db, "orders"),
                where("PhoneNumber", "==", phone.trim())
            );
            const querySnapshot = await getDocs(q);
        
            if (querySnapshot.empty) {
                setError("Tidak ada pesanan dengan nomor HP ini");
                setOrders([]);
            } else {
                const results: Orders[] = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Orders, "id">),
                }));
                setOrders(results);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Terjadi kesalahan. Coba lagi.");
        }
    
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                ✕
                </button>

                <h2 className="text-xl font-semibold text-indigo-600 mb-4">Cek Pesanan</h2>

                {/* Input */}
                <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                Nomor HP:
                </label>
                <input
                    id="phone"
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4"
                />

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className={`w-full py-2 rounded-lg transition ${
                        loading
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                >
                {loading ? "Mencari..." : "Cari Pesanan"}
                </button>

                {/* Error */}
                {error && (
                <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
                )}

                {/* Results */}
                {orders.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Hasil Pencarian</h3>
                    <div className="space-y-3">
                    {orders.map((order) => (
                        <div
                        key={order.id}
                        className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                        >
                        <p>
                            <span className="font-medium">Nama:</span> {order.FullName}
                        </p>
                        <p>
                            <span className="font-medium">Nomor HP:</span> {order.PhoneNumber}
                        </p>
                        <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                    order.Status === "Selesai"
                                    ? "bg-green-100 text-green-700"
                                    : order.Status === "Diproses"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                            >
                            {order.Status}
                            </span>
                        </p>
                        <p>
                            <span className="font-medium">Total:</span>{" "}
                            {formatRupiah(order.Total)}
                        </p>

                        {/* Items */}
                        <div className="mt-2">
                            <p className="font-medium">Produk:</p>
                            <ul className="list-disc ml-5 text-sm">
                            {order.Items.map((item, idx) => (
                                <li key={idx}>
                                {item.Name} ({item.Quantity} pcs)
                                </li>
                            ))}
                            </ul>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}