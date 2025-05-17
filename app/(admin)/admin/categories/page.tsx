"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  FaSearch, 
  FaPlus,
  FaTrash,
  FaEdit,
  FaLayerGroup,
  FaEllipsisH,
  FaSave,
  FaTimes
} from "react-icons/fa";
import Link from "next/link";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  createdAt: string;
}

export default function CategoriesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc", // asc or desc
  });
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
  const [error, setError] = useState("");

  // Protected route - check for auth and admin role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/categories");
    } else if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/unauthorized");
      } else {
        // Load categories data
        fetchCategories();
      }
    }
  }, [status, session, router]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      
      // In production, fetch from API
      // const response = await fetch("/api/categories/admin");
      // const data = await response.json();
      // setCategories(data.categories);
      
      // For now, use mock data
      setTimeout(() => {
        setCategories([
          {
            id: "1",
            name: "News",
            slug: "news",
            description: "Latest technology news and updates",
            articleCount: 45,
            createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
          },
          {
            id: "2",
            name: "Reviews",
            slug: "reviews",
            description: "In-depth product reviews and analysis",
            articleCount: 32,
            createdAt: new Date(Date.now() - 300 * 86400000).toISOString(),
          },
          {
            id: "3",
            name: "Tutorials",
            slug: "tutorials",
            description: "Step-by-step guides and how-to articles",
            articleCount: 18,
            createdAt: new Date(Date.now() - 200 * 86400000).toISOString(),
          },
          {
            id: "4",
            name: "Features",
            slug: "features",
            description: "Long-form articles and special features",
            articleCount: 12,
            createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
          },
          {
            id: "5",
            name: "Opinion",
            slug: "opinion",
            description: "Editorial content and opinion pieces",
            articleCount: 8,
            createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
          }
        ]);
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setIsLoading(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Category];
    const bValue = b[sortConfig.key as keyof Category];
    
    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Toggle sort
  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Delete category
  const deleteCategory = (id: string) => {
    // In production, make API call to delete
    // await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    
    setCategories(categories.filter(category => category.id !== id));
    setActionMenuOpen(null);
  };

  // Edit category
  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setIsEditing(true);
    setActionMenuOpen(null);
  };

  // Save edited category
  const saveCategory = () => {
    if (!editingCategory.name || editingCategory.name.trim() === "") {
      setError("Category name is required");
      return;
    }

    if (isEditing) {
      // Update existing category
      setCategories(
        categories.map(category => 
          category.id === editingCategory.id 
            ? { ...category, ...editingCategory } as Category
            : category
        )
      );
    } else {
      // Add new category
      const newCategory: Category = {
        id: Math.random().toString(36).substring(2, 9),
        name: editingCategory.name!,
        slug: editingCategory.name!.toLowerCase().replace(/\s+/g, '-'),
        description: editingCategory.description || "",
        articleCount: 0,
        createdAt: new Date().toISOString(),
      };
      
      setCategories([...categories, newCategory]);
    }
    
    setIsEditing(false);
    setIsAdding(false);
    setEditingCategory({});
    setError("");
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setIsAdding(false);
    setEditingCategory({});
    setError("");
  };

  // Start adding new category
  const startAddingCategory = () => {
    setIsAdding(true);
    setEditingCategory({});
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="h-10 w-1.5 rounded-full bg-purple-600 dark:bg-purple-500 mr-4"></div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5.5">Manage content categories</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setIsAdding(true);
                  setEditingCategory({
                    name: '',
                    slug: '',
                    description: '',
                  });
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all duration-200"
              >
                <FaPlus className="mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {isAdding ? "Add New Category" : "Edit Category"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                  placeholder="E.g., Technology"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                  placeholder="E.g., technology"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-500 focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                  placeholder="Brief description of the category"
                ></textarea>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FaTimes className="inline mr-1" /> Cancel
                </button>
                <button
                  onClick={saveCategory}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm"
                >
                  <FaSave className="inline mr-1" /> {isAdding ? "Add Category" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories Table */}
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Articles
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {category.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {category.articleCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => editCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Slug: {category.slug}
                      </div>
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {category.articleCount} Articles
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editCategory(category)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty state */}
            {!isLoading && filteredCategories.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
                <div className="mx-auto w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <FaLayerGroup className="text-purple-500 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No categories found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm 
                    ? "Try changing your search query" 
                    : "Get started by adding a new category"}
                </p>
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setEditingCategory({
                      name: '',
                      slug: '',
                      description: '',
                    });
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                >
                  <FaPlus className="mr-2" />
                  Add Category
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
