import Link from "next/link";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include the first page
      pages.push(1);
      
      // Always include the current page and 1 on each side when possible
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after page 1 if needed
      if (leftBound > 2) {
        pages.push("ellipsis-left");
      }
      
      // Add the pages around current page
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before the last page if needed
      if (rightBound < totalPages - 1) {
        pages.push("ellipsis-right");
      }
      
      // Always include the last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="flex justify-center" aria-label="Pagination">
      <ul className="flex items-center space-x-1">
        {/* Previous page */}
        <li>
          <Link
            href={currentPage === 1 ? "#" : `${baseUrl}/page/${currentPage - 1}`}
            className={`flex items-center px-3 py-2 rounded-md ${
              currentPage === 1
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : undefined}
          >
            <FaChevronLeft className="w-4 h-4" />
            <span className="sr-only">Previous</span>
          </Link>
        </li>
        
        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === "ellipsis-left" || pageNumber === "ellipsis-right") {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="px-3 py-2 text-gray-500 dark:text-gray-400">…</span>
              </li>
            );
          }
          
          return (
            <li key={index}>
              <Link
                href={`${baseUrl}/page/${pageNumber}`}
                className={`px-3 py-2 rounded-md ${
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}
        
        {/* Next page */}
        <li>
          <Link
            href={currentPage === totalPages ? "#" : `${baseUrl}/page/${currentPage + 1}`}
            className={`flex items-center px-3 py-2 rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : undefined}
          >
            <FaChevronRight className="w-4 h-4" />
            <span className="sr-only">Next</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
