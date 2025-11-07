import React, { memo, useCallback } from 'react';

export interface TableColumn {
  key: string;
  label: React.ReactNode;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPageChange: (page: number) => void;
}

export interface TableComponentProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
  rowClassName?: (row: any) => string;
  pagination?: PaginationProps;
  showPaginationTop?: boolean;
}

// Memoized pagination component to prevent unnecessary re-renders
const PaginationControls = memo(({ pagination }: { pagination: PaginationProps }) => {
  const { currentPage, totalPages, totalItems, hasNext, hasPrevious, onPageChange } = pagination;

  const handlePreviousClick = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 border-b border-gray-200">
      <div className="text-sm text-gray-700 font-accent">
        Showing page {currentPage} of {totalPages} ({totalItems} total items)
      </div>
      <div className="flex gap-2">
        <button
          onClick={handlePreviousClick}
          disabled={!hasPrevious && currentPage === 1}
          className="button-accent px-3 py-1 text-sm border border-gray-300 rounded-lg font-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNextClick}
          disabled={!hasNext && currentPage === totalPages}
          className="button-accent px-3 py-1 text-sm border border-gray-300 rounded-lg font-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
});

PaginationControls.displayName = 'PaginationControls';

const TableComponent: React.FC<TableComponentProps> = ({
  columns,
  data,
  className = "",
  rowClassName,
  pagination,
  showPaginationTop = false
}) => {
  return (
    <div className={`bg-[var(--parchment)] rounded-lg shadow overflow-hidden ${className}`}>
      {/* Top Pagination */}
      {showPaginationTop && pagination && (
        <PaginationControls pagination={pagination} />
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--arabica-brown)] text-[var(--parchment)]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-main font-semibold ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                  rowClassName ? rowClassName(row) : ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm text-[var(--espresso-black)] font-accent"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500 font-accent">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TableComponent;
