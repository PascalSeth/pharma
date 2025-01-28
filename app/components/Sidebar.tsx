'use client'
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname for dynamic route detection

type Props = {};

function Sidebar({}: Props) {
  const pathname = usePathname(); // Get the current pathname

  const mainMenuItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/history', icon: '⏳', label: 'History' },
    { path: '/inventory', icon: '📦', label: 'Inventory' },
    { path: '/suppliers', icon: '📋', label: 'Suppliers' },
  ];

  const generalMenuItems = [
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/admin', icon: '🙍‍♂️', label: 'Admin' },
    { path: '/community', icon: '👥', label: 'Community' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="h-full justify-between w-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-700">
          <div className="bg-green-500 p-2 rounded-full">
            <span>➕</span> {/* Placeholder for an icon */}
          </div>
          <div className="text-lg max-lg:hidden font-bold">MedKitPOS</div>
        </div>

        {/* Menu */}
        <div className="flex-1 px-4 py-6">
          <div className="text-gray-500 uppercase text-sm max-lg:hidden mb-4">Main menu</div>
          <ul className="space-y-4">
            {mainMenuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.path}
                  className={`flex max-lg:px-2 items-center space-x-4 px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'text-green-500 bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="max-lg:hidden">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="text-gray-500 max-lg:hidden uppercase text-sm mt-8 mb-4">General</div>
          <ul className="space-y-4">
            {generalMenuItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.path}
                  className={`flex max-lg:px-2 items-center space-x-4 px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'text-green-500 bg-gray-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="max-lg:hidden">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-gray-700">
        <button className="flex items-center space-x-4 w-full text-gray-400 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg">
          <span>🚪</span> {/* Placeholder for "Logout" icon */}
          <span className="max-lg:hidden">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
