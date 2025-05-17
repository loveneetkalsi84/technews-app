"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaSearch, 
  FaUser,
  FaUserPlus, 
  FaArrowLeft,
  FaSort,
  FaEdit,
  FaUserShield,
  FaUserSlash,
  FaEllipsisH
} from "react-icons/fa";
import AdminWrapper from "@/app/components/dashboard/AdminWrapper";
import Image from "next/image";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "user";
  image?: string | null;
  registeredAt: string;
  lastActive?: string | null;
}

export default function UsersManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "registeredAt",
    direction: "desc", // asc or desc
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/users");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load users data
        fetchUsers();
      }
    }
  }, [status, session, router]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (actionMenuOpen && !((event.target as Element).closest('.action-menu'))) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [actionMenuOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      // In production, fetch from API
      // const response = await fetch("/api/admin/users");
      // const data = await response.json();
      // setUsers(data.users);
      
      // For now, use mock data
      setTimeout(() => {
        setUsers([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            registeredAt: new Date(Date.now() - 90 * 86400000).toISOString(), // 90 days ago
            lastActive: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "editor",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(), // 60 days ago
            lastActive: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "user",
            image: "https://randomuser.me/api/portraits/men/86.jpg",
            registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(), // 30 days ago
            lastActive: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
          },
          {
            id: "4",
            name: "Sarah Williams",
            email: "sarah@example.com",
            role: "user",
            image: "https://randomuser.me/api/portraits/women/67.jpg",
            registeredAt: new Date(Date.now() - 15 * 86400000).toISOString(), // 15 days ago
            lastActive: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
          },
          {
            id: "5",
            name: "Alex Brown",
            email: "alex@example.com",
            role: "editor",
            image: null,
            registeredAt: new Date(Date.now() - 45 * 86400000).toISOString(), // 45 days ago
            lastActive: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
          },
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  // Sort users
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Toggle action menu
  const toggleActionMenu = (userId: string) => {
    setActionMenuOpen(actionMenuOpen === userId ? null : userId);
  };

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Time since for "Last Active" display
  const timeSince = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';

    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000; // Years
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000; // Months
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400; // Days
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600; // Hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60; // Minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return "Just now";
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
                        
    return matchesSearch && matchesRole;
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const key = sortConfig.key as keyof User;
    
    if (a[key] === b[key]) return 0;
    
    if (sortConfig.direction === 'asc') {
      // Handle null values for optional fields
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      // @ts-ignore
      return a[key] < b[key] ? -1 : 1;
    } else {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      // @ts-ignore
      return a[key] > b[key] ? -1 : 1;
    }
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <AdminWrapper>
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-green-600 dark:bg-green-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Manage user accounts and permissions</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
              <Link
                href="/admin/users/new"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaUserPlus className="mr-2" />
                Add New User
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Filters and search */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full sm:w-40">
                <select
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center">
                        Role
                        <FaSort className="ml-1 w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('registeredAt')}
                    >
                      <div className="flex items-center">
                        Registered
                        <FaSort className="ml-1 w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('lastActive')}
                    >
                      <div className="flex items-center">
                        Last Active
                        <FaSort className="ml-1 w-3 h-3" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.image ? (
                                <Image 
                                  src={user.image} 
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <FaUser className="text-gray-500 dark:text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : user.role === 'editor'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {user.role === 'admin' && (
                              <FaUserShield className="mr-1 text-xs" />
                            )}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.registeredAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {timeSince(user.lastActive)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="relative inline-block">
                            <button
                              onClick={() => toggleActionMenu(user.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none action-menu"
                              aria-label="User actions"
                            >
                              <FaEllipsisH />
                            </button>
                            {actionMenuOpen === user.id && (
                              <div className="action-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                <div className="py-1">
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                      console.log(`Edit user: ${user.id}`);
                                      setActionMenuOpen(null);
                                    }}
                                  >
                                    <FaEdit className="mr-2" />
                                    Edit Profile
                                  </button>
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                      console.log(`Change role: ${user.id}`);
                                      setActionMenuOpen(null);
                                    }}
                                  >
                                    <FaUserShield className="mr-2" />
                                    Change Role
                                  </button>
                                  <button
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() => {
                                      console.log(`Deactivate user: ${user.id}`);
                                      setActionMenuOpen(null);
                                    }}
                                  >
                                    <FaUserSlash className="mr-2" />
                                    Deactivate User
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <FaUser className="h-8 w-8 mb-3 text-gray-400" />
                          <p className="mb-1 text-base">No users found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>            </div>
          </div>
        </div>
    </AdminWrapper>
  );
}
