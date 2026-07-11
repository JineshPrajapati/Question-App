"use client";

import { Menu, MenuIcon } from "lucide-react";

// import { Menu } from "lucide-react";

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-2">
      {/* Toggle Sidebar (only on mobile) */}
      <button onClick={onToggleSidebar} >
        <MenuIcon className="h-6 w-6" />
      </button>

      <h1 className="text-xl font-bold">My App</h1>

      {/* Right-side actions */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">User</span>
        <img
          src="https://via.placeholder.com/32"
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </header>
  );
}
