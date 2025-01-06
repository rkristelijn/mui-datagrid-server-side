'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridSortModel } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// export const metadata = {
//   title: 'Server Side Data with Sorting',
//   description: 'Demonstrating how to fetch server-side data with sorting',
// };

export default function Page() {
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);

const fetchData = async (sortField?: string, sortDirection?: string, page?: number, pageSize?: number) => {
  console.log("fetchData", sortField, sortDirection, page, pageSize);
  try {
    const params = new URLSearchParams();
    if (sortField) {
      const directionPrefix = sortDirection === 'desc' ? '-' : '';
      params.append('_sort', `${directionPrefix}${sortField}`);
    }
    if (page !== undefined) {
      params.append('_page', (page + 1).toString());
    }
    if (pageSize !== undefined) {
      params.append('_limit', pageSize.toString());
    }

    const [usersResponse, columnsResponse] = await Promise.all([
      fetch(`http://localhost:3001/users?${params.toString()}`),
      fetch('http://localhost:3001/users_columns'),
    ]);

    if (!usersResponse.ok || !columnsResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const usersData = await usersResponse.json();
    const columnsData = await columnsResponse.json();
    const totalCount = usersResponse.headers.get('X-Total-Count');

    setUsers(usersData);
    setColumns(columnsData);
    setRowCount(totalCount ? parseInt(totalCount, 10) : 0);
  } catch (err) {
    setError('Failed to load data. Please try again later.');
  }
};

  useEffect(() => {
    console.log("useEffect", page, pageSize);
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      fetchData(field, sort ?? undefined, page, pageSize);
    } else {
      fetchData(undefined, undefined, page, pageSize);
    }
  }, [page, pageSize, sortModel]);

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    console.log("handleSortModelChange", newSortModel);
    setSortModel(newSortModel);
    console.log(newSortModel);
    if (newSortModel.length > 0) {
      const { field, sort } = newSortModel[0];
      fetchData(field, sort ?? undefined, page, pageSize);
    } else {
      fetchData(undefined, undefined, page, pageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log("handlePageChange", newPage);
    setPage(newPage);
  };


  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={users}
        columns={columns}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        pagination
        pageSizeOptions={[10, 25, 50]}
        paginationModel={{ page, pageSize }}
        rowCount={rowCount}
        paginationMode="server"
        onPaginationModelChange={(model) => {
          handlePageChange(model.page);
        }}
      />
    </Box>
  );
}