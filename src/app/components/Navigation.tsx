// src/app/components/Navigation.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, FileText } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🌘</div>
              <span className="text-xl font-bold text-gray-900">MoonCro</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Questionnaire</span>
            </Link>
            
            <Link
              href="/analyzer"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/analyzer' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>AI Analyzer</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}