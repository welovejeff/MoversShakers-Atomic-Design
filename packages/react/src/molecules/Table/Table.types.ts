import type { HTMLAttributes, ReactNode } from 'react';

export interface TableColumn<T> {
    /** Unique column key */
    key: string;
    /** Column header */
    header: string | ReactNode;
    /** Cell render function */
    render?: (item: T, index: number) => ReactNode;
    /** Width of column */
    width?: string;
    /** Sortable column */
    sortable?: boolean;
    /** Alignment */
    align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> extends Omit<HTMLAttributes<HTMLTableElement>, 'children'> {
    /** Table data */
    data: T[];
    /** Column definitions */
    columns: TableColumn<T>[];
    /** Row key extractor */
    keyExtractor: (item: T, index: number) => string;
    /** Striped rows */
    striped?: boolean;
    /** Hoverable rows */
    hoverable?: boolean;
    /** Show borders */
    bordered?: boolean;
    /** Compact size */
    compact?: boolean;
    /** Currently sorting column */
    sortColumn?: string;
    /** Sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Sort callback */
    onSort?: (column: string) => void;
    /** Empty state content */
    emptyState?: ReactNode;
}
