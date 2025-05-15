export default function AdPlaceholder({ type = "banner" }: { type: "banner" | "sidebar" | "in-article" | "native" }) {
  // Different ad styles based on placement
  let style = "bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded overflow-hidden relative";
  let height = "h-24";

  if (type === "banner") {
    height = "h-24 md:h-32";
  } else if (type === "sidebar") {
    height = "h-[400px] w-full";
  } else if (type === "in-article") {
    height = "h-32 md:h-48";
  } else if (type === "native") {
    height = "h-40 md:h-48";
    style += " border border-gray-200 dark:border-gray-700";
  }

  return (
    <div className={`${style} ${height} flex items-center justify-center mb-6`}>
      <div className="text-center">
        <p className="font-medium text-gray-400 dark:text-gray-500">Advertisement</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {type === "banner" && "Banner Ad - 728×90"}
          {type === "sidebar" && "Sidebar Ad - 300x600"}
          {type === "in-article" && "In-article Ad - 728×90"}
          {type === "native" && "Native Ad"}
        </p>
      </div>
      
      {/* In production, this would be replaced with actual ad code */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-24 h-24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          />
        </svg>
      </div>
    </div>
  );
}
