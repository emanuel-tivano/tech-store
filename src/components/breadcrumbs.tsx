import Link from 'next/link';

interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto pb-1">
      <ol className="flex min-w-max flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 sm:min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex min-w-0 items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-slate-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={
                    isLast ? 'max-w-[16rem] truncate font-medium text-slate-700 sm:max-w-full' : undefined
                  }
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
