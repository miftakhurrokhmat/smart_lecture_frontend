import { ReactNode } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { ChevronDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  width?: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;

  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Extra filter slot (pakai FilterDropdown di sini)
  filters?: ReactNode;

  // Page size selector
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;

  // Pagination
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;

  // Sorting
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string) => void;

  isLoading?: boolean;
  emptyMessage?: string;
  itemLabel?: string; // ex: "mahasiswa"
}

export default function DataTable<T>({
  data,
  columns,
  rowKey,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  page,
  totalItems,
  onPageChange,
  sortKey,
  sortDirection,
  onSortChange,
  isLoading = false,
  emptyMessage = "Tidak ada data",
  itemLabel = "data",
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1, 2, 3, "...", totalPages);
    return pages;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          {onPageSizeChange && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Tampilkan</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="appearance-none border border-gray-200 rounded-lg pl-2.5 pr-6 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <span>data</span>
            </div>
          )}

          {filters}
        </div>

        {onSearchChange && (
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  }`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSortChange?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-gray-700 transition"
                    >
                      {col.header}
                      <ArrowUpDown
                        size={11}
                        className={
                          sortKey === col.key
                            ? "text-purple-600"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-gray-50/60 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-sm text-gray-700 ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Menampilkan {startItem}-{endItem} dari {totalItems} {itemLabel}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50 flex items-center justify-center transition"
          >
            <ChevronLeft size={14} />
          </button>

          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span
                key={`dots-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-xs text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                  p === page
                    ? "bg-purple-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:bg-gray-50 flex items-center justify-center transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
