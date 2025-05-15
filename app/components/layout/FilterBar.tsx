import Link from "next/link";

interface FilterBarProps {
  title: string;
  items: {
    name: string;
    slug: string;
    count: number;
  }[];
}

export default function FilterBar({ title, items }: FilterBarProps) {
  return (
    <div className="mb-8">
      <h4 className="font-medium mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${title.toLowerCase()}/${item.slug}`}
              className="flex items-center justify-between text-sm hover:text-blue-600 dark:hover:text-blue-400 group"
            >
              <span className="group-hover:translate-x-1 transition-transform duration-200">
                {item.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {item.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
