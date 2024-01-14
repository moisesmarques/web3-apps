import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export interface ITableProps {
  columns: IColumnType[];
  data?: { [string: string]: any }[];
}

/**
 * @interface IColumnType
 * @property {key} - label of the column
 */
export interface IColumnType {
  /**@property name of the column */
  name: string;
  key: string;
}

const DEFAULT_TABLE_STATE = { columns: [], data: [] };

export default BasicTable;

export function BasicTable({ columns, data }: ITableProps = DEFAULT_TABLE_STATE) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(data || []).map((row, index) => (
            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {columns.map((column) => (
                <TableCell
                  component="th"
                  scope="row"
                  key={`${column.key}${index}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
