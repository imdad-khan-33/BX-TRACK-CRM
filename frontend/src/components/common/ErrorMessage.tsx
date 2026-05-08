import React from 'react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-red-600">⚠️</span>
        <p className="text-red-800">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800 font-semibold"
      >
        ✕
      </button>
    </div>
  );
}
