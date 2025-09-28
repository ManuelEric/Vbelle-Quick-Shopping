// components/FloatingRequestButton.tsx
import { useState } from 'react';
import RequestModal from "@/views/components/request-modal";

export default function FloatingRequestButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed cursor-pointer bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition"
        aria-label="Request Product" title="Request item yang kamu mau"
      >
        {/* Paper Plane Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 19l9 2-9-18-9 18 9-2z"
          />
        </svg>
      </button>

      {/* Modal */}
      <RequestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

    </>
  );
}
