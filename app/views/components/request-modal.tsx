// components/RequestModal.tsx
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { collection, addDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "firebaseConfig";
import type { Request } from "@/types/request";
import { toast } from 'react-toastify';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestModal({ isOpen, onClose }: RequestModalProps) {
  const [requestForm, setRequestForm] = useState<Omit<Request, "id">>({
    FullName: '',
    PhoneNumber: '',
    ProductName: '',
    CreatedAt: serverTimestamp(),
    UpdatedAt: serverTimestamp(),
  });

  const clearRequestForm = () => {
    setRequestForm({
        FullName: "",
        PhoneNumber: "",
        ProductName: "",
        CreatedAt: serverTimestamp(),
        UpdatedAt: serverTimestamp(),
    });
}

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //handle request submission
    try {
        await addDoc(collection(db, "request"), requestForm);
        clearRequestForm();
        toast.success("Request berhasil dikirim!");
        onClose();
    } catch (error) {
        toast.error("Gagal mengirim request. Coba kembali.");
        console.error("Error submitting order:", error);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Carikan Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              id="FullName"
              name="FullName"
              value={requestForm.FullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
            <input
              name="PhoneNumber"
              type="PhoneNumber"
              value={requestForm.PhoneNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Item</label>
            <input
              name="ProductName"
              value={requestForm.ProductName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
