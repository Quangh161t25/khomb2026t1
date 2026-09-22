import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Đóng"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Ảnh phóng to"
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
