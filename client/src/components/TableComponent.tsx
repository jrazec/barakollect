import React from 'react';

export interface TableColumn {
  key: string;
  label: React.ReactNode;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

export interface TableComponentProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
  rowClassName?: (row: any) => string;
}

const TableComponent: React.FC<TableComponentProps> = ({
  columns,
  data,
  className = "",
  rowClassName
}) => {
  return (
    <div className={`bg-[var(--parchment)] rounded-lg shadow overflow-hidden ${className}`}>
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
