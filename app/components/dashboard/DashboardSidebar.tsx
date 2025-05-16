"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FaTachometerAlt, 
  FaNewspaper, 
  FaUsers, 
  FaComments, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useTheme } from "next-themes";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/admin", icon: <FaTachometerAlt className="text-xl" /> },
  { name: "Articles", path: "/admin/articles", icon: <FaNewspaper className="text-xl" />, badge: 3 },
  { name: "Users", path: "/admin/users", icon: <FaUsers className="text-xl" /> },
  { name: "Comments", path: "/admin/comments", icon: <FaComments className="text-xl" />, badge: 5 },
  { name: "Analytics", path: "/admin/analytics", icon: <FaChartBar className="text-xl" /> },
  { name: "Settings", path: "/admin/settings", icon: <FaCog className="text-xl" /> },
];

export default function DashboardSidebar() {  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After component is mounted, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger-button');
      
      if (sidebar && hamburger && 
          !sidebar.contains(event.target as Node) && 
          !hamburger.contains(event.target as Node) &&
          window.innerWidth < 768 &&
          isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div id="hamburger-button" className="fixed top-4 left-4 z-30 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-20 ${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-blue-800 to-blue-900 text-white transform transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-700 flex justify-between items-center">
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-2'}`}>
            {!isCollapsed ? (
              <>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">TechNews</span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs px-2 py-1 rounded">Admin</span>
              </>
            ) : (
              <span className="text-2xl font-bold">TN</span>
            )}
          </Link>
          
          {/* Collapse/expand button - only visible on desktop */}
          <button 
            className="hidden md:block text-blue-300 hover:text-white transition-colors" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {/* Admin profile section */}
        <div className={`p-4 border-b border-blue-700 ${isCollapsed ? 'flex justify-center' : 'flex items-center space-x-3'}`}>
          <div className="relative">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt="Profile" 
                width={40} 
                height={40} 
                className="rounded-full border-2 border-blue-400" 
              />
            ) : (
              <FaUserCircle className="text-3xl text-white/70" />
            )}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-blue-800"></div>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 ml-2">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Admin User"}
              </p>
              <p className="text-xs text-blue-300 truncate">
                {session?.user?.email || "admin@example.com"}
              </p>
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className={`mt-5 ${isCollapsed ? 'px-1' : 'px-3'} flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-700`}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group flex items-center ${isCollapsed ? 'justify-center' : ''} px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md"
                      : "text-blue-100 hover:bg-blue-700/50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`${isCollapsed ? '' : 'mr-3'} relative`}>
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </div>
        </nav>        {/* Theme toggle and Sign out buttons */}
        <div className={`p-4 border-t border-blue-700 ${isCollapsed ? 'flex flex-col items-center' : 'space-y-2'}`}>
          {/* Theme toggle button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full mb-2' : ''} px-4 py-3 text-sm font-medium text-blue-200 hover:bg-blue-700/70 hover:text-white rounded-lg transition-all`}
            aria-label="Toggle theme"
          >
            {mounted && (
              <>
                {theme === "dark" ? (
                  <FaSun className={`${isCollapsed ? '' : 'mr-3'} text-lg`} />
                ) : (
                  <FaMoon className={`${isCollapsed ? '' : 'mr-3'} text-lg`} />
                )}
                {!isCollapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
              </>
            )}
          </button>
          
          {/* Sign out button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''} px-4 py-3 text-sm font-medium text-blue-200 hover:bg-blue-700/70 hover:text-white rounded-lg transition-all`}
          >
            <FaSignOutAlt className={`${isCollapsed ? '' : 'mr-3'} text-lg`} />
            {!isCollapsed && "Sign Out"}
          </button>
        </div></div>      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
