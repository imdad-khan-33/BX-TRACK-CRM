import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';
import { useUIStore } from '@store/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { error, success, clearMessages } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {error && <ErrorMessage message={error} onClose={clearMessages} />}
            {success && <SuccessMessage message={success} onClose={clearMessages} />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
