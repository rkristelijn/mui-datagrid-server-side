'use client';

import { useEffect, useState } from 'react';
import { DataGrid, GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

export default function Page() {
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [users, setUsers] = useState([]);

  const fetchData = async (sortModel?: GridSortModel, page?: number, pageSize?: number, filterModel?: GridFilterModel) => {
    console.log('fetchData', sortModel, page, pageSize);
    try {
      const params = new URLSearchParams();
      if (sortModel && sortModel.length > 0) {
        const sortFields = sortModel.map((sort) => sort.field).join(',');
        const sortDirections = sortModel.map((sort) => sort.sort).join(',');
        params.append('_sort', sortFields);
        params.append('_order', sortDirections);
      }
      if (page !== undefined) {
        params.append('_page', (page + 1).toString());
      }
      if (pageSize !== undefined) {
        params.append('_limit', pageSize.toString());
      }
      if (filterModel && filterModel.items.length > 0) {
        // for now assume it is only 'contains' filter
        console.log("filterModel", filterModel);
        filterModel.items.forEach((filter) => {
          params.append(filter.field, filter.value);
        });
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
    fetchData(sortModel, page, pageSize, filterModel);
  }, [page, pageSize, sortModel]);

  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
    fetchData(newSortModel, page, pageSize, filterModel);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
    console.log("handleFilterModelChange", newFilterModel);
    setFilterModel(newFilterModel);
    fetchData(sortModel, page, pageSize, newFilterModel);
   };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        columns={columns}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={(model) => {
          console.log('onPaginationModelChange', model);
          handlePageChange(model.page);
          handlePageSizeChange(model.pageSize);
        }}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[10, 25, 50]}
        pagination
        paginationMode="server"
        sortingMode='server'
        filterMode='server'
        paginationModel={{ page, pageSize }}
        rowCount={rowCount}
        rows={users}
        sortModel={sortModel}
      />
    </Box>
  );
}