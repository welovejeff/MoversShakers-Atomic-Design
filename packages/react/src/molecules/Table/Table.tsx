import { colors, typography } from '../../tokens';
import type { TableProps, TableColumn } from './Table.types';

/**
 * Table component for displaying tabular data.
 * 
 * @example
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   status: 'active' | 'inactive';
 * }
 * 
 * const columns: TableColumn<User>[] = [
 *   { key: 'name', header: 'Name', sortable: true },
 *   { key: 'email', header: 'Email' },
 *   { 
 *     key: 'status', 
 *     header: 'Status', 
 *     render: (user) => <Badge variant={user.status === 'active' ? 'success' : 'default'}>{user.status}</Badge>
 *   },
 * ];
 * 
 * <Table
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(user) => user.id}
 *   striped
 *   hoverable
 * />
 * ```
 */
export function Table<T>({
    data,
    columns,
    keyExtractor,
    striped = false,
    hoverable = false,
    bordered = true,
    compact = false,
    sortColumn,
    sortDirection,
    onSort,
    emptyState,
    style,
    ...props
}: TableProps<T>) {
    const tableStyles: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: typography.fontFamily.body,
        fontSize: compact ? '0.875rem' : '1rem',
        border: bordered ? '2px solid' : 'none',
        borderColor: colors.brand.black,
        ...style,
    };

    const thStyles: React.CSSProperties = {
        padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
        fontFamily: typography.fontFamily.brand,
        fontWeight: typography.fontWeight.bold,
        fontSize: compact ? '0.75rem' : '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        backgroundColor: colors.brand.black,
        color: colors.brand.white,
        textAlign: 'left',
        borderBottom: `2px solid ${colors.brand.black}`,
    };

    const getThStyles = (column: TableColumn<T>): React.CSSProperties => ({
        ...thStyles,
        width: column.width,
        textAlign: column.align || 'left',
        cursor: column.sortable ? 'pointer' : 'default',
    });

    const getCellStyles = (column: TableColumn<T>, rowIndex: number): React.CSSProperties => ({
        padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
        textAlign: column.align || 'left',
        backgroundColor: striped && rowIndex % 2 === 1 ? colors.brand.greyLight : 'transparent',
        borderBottom: bordered ? `1px solid ${colors.brand.greyLight}` : 'none',
    });

    const renderSortIndicator = (column: TableColumn<T>) => {
        if (!column.sortable) return null;
        if (sortColumn !== column.key) return ' ↕';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    const getValue = (item: T, key: string): unknown => {
        return (item as Record<string, unknown>)[key];
    };

    return (
        <table style={tableStyles} {...props}>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th
                            key={column.key}
                            style={getThStyles(column)}
                            onClick={() => column.sortable && onSort?.(column.key)}
                        >
                            {column.header}
                            {renderSortIndicator(column)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 && emptyState ? (
                    <tr>
                        <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center' }}>
                            {emptyState}
                        </td>
                    </tr>
                ) : (
                    data.map((item, index) => (
                        <tr
                            key={keyExtractor(item, index)}
                            style={{
                                transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                if (hoverable) {
                                    e.currentTarget.style.backgroundColor = colors.brand.yellow;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (hoverable) {
                                    e.currentTarget.style.backgroundColor =
                                        striped && index % 2 === 1 ? colors.brand.greyLight : 'transparent';
                                }
                            }}
                        >
                            {columns.map((column) => (
                                <td key={column.key} style={getCellStyles(column, index)}>
                                    {column.render
                                        ? column.render(item, index)
                                        : String(getValue(item, column.key) ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

Table.displayName = 'Table';

export default Table;
