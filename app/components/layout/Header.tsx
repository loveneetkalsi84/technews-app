"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiSearch, FiMenu, FiX, FiUser, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

const Header = () => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  // Categories for the navigation menu
  const categories = [
    { name: "News", path: "/news" },
    { name: "Reviews", path: "/reviews" },
    { name: "Smartphones", path: "/categories/smartphones" },
    { name: "Laptops", path: "/categories/laptops" },
    { name: "Gaming", path: "/categories/gaming" },
    { name: "AI", path: "/categories/ai" },
  ];

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              TechNews
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {categories.map((category) => (
              <Link
                key={category.path}
                href={category.path}
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 ${
                  pathname === category.path
                    ? "font-medium text-blue-600 dark:text-blue-400"
                    : ""
                }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center relative"
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-10 py-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-3 text-gray-500 dark:text-gray-400"
                aria-label="Search"
              >
                <FiSearch />
              </button>
            </form>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>
            )}

            {/* User Menu */}
            {session ? (
              <Link
                href="/admin"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiUser />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2 text-gray-500 dark:text-gray-400"
                  aria-label="Search"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>
            <nav className="flex flex-col space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  href={category.path}
                  className={`text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 ${
                    pathname === category.path
                      ? "font-medium text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
