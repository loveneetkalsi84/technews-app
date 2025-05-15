"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  FaTachometerAlt, 
  FaNewspaper, 
  FaUsers, 
  FaComments, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { signOut } from "next-auth/react";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/admin", icon: <FaTachometerAlt /> },
  { name: "Articles", path: "/admin/articles", icon: <FaNewspaper /> },
  { name: "Users", path: "/admin/users", icon: <FaUsers /> },
  { name: "Comments", path: "/admin/comments", icon: <FaComments /> },
  { name: "Analytics", path: "/admin/analytics", icon: <FaChartBar /> },
  { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-blue-600 text-white"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-blue-800 text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-700">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">TechNews</span>
            <span className="bg-blue-600 text-xs px-2 py-1 rounded">Admin</span>
          </Link>
        </div>

        {/* Menu items */}
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-900 text-white"
                      : "text-blue-100 hover:bg-blue-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sign out button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white rounded-md transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
