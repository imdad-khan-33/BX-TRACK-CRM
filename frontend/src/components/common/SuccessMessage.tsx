import React from 'react';

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

export function SuccessMessage({ message, onClose }: SuccessMessageProps) {
  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-green-600">✓</span>
        <p className="text-green-800">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-green-600 hover:text-green-800 font-semibold"
      >
        ✕
      </button>
    </div>
  );
}
