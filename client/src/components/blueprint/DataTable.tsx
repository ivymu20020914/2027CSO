import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  primary?: boolean;
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
}

const alignClass = (align?: 'left' | 'right' | 'center'): string => {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
};

function DataTable<T>({ columns, data, rowKey, onRowClick, empty }: DataTableProps<T>) {
  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bp-hairline-b">
            {columns.map((col: TableColumn<T>) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-2 py-2 text-[9px] font-black uppercase tracking-tight text-[#94A3B8] ${alignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: T, index: number) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`bp-hairline-b transition-colors hover:bg-slate-50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col: TableColumn<T>) => {
                const content: ReactNode = col.render
                  ? col.render(row, index)
                  : ((row as Record<string, unknown>)[col.key] as ReactNode);
                const tone = col.primary
                  ? 'text-xs font-bold text-[#0033A0]'
                  : col.mono
                    ? 'tnum text-xs text-[#94A3B8]'
                    : 'text-[11px] font-medium text-slate-600';
                return (
                  <td
                    key={col.key}
                    className={`px-2 py-2.5 align-top ${alignClass(col.align)} ${tone} ${col.className ?? ''}`}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };
