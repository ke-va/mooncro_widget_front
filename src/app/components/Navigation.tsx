// src/app/components/Navigation.tsx
"use client";

export function Navigation() {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🌘</div>
              <span className="text-xl font-bold text-gray-900">MoonCro</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}