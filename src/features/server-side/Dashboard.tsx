'use client';

import { Alert } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const Dashboard = () => {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [sortModel, setSortModel] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection');
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');
    const sortParam = sortField && sortDirection ? `&_sort=${sortField}&_order=${sortDirection}` : '';
    const filterParam = filterField && filterValue ? `&${filterField}_like=${filterValue}` : '';

    // const fetcher = async () => {
    //   // fetch data from server
    //   const response = await fetch('https://my-api.com/data', {
    //     method: 'GET',
    //     body: JSON.stringify({
    //       page: paginationModel.page,
    //       pageSize: paginationModel.pageSize,
    //       sortModel,
    //       filterModel,
    //     }),
    //   });
    //   const data = await response.json();
    //   setRows(data.rows);
    // };
    // fetcher();

    const fetchData = async () => {
      console.log('fetchData');
      try {
        const [rowsResponse, columnsResponse] = await Promise.all([
          fetch(`http://localhost:3001/users?${sortParam}${filterParam}`),
          fetch('http://localhost:3001/users_columns'),
        ]);

        if (!rowsResponse.ok || !columnsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const rowsData = await rowsResponse.json();
        const columnsData = await columnsResponse.json();

        setRows(rowsData);
        setColumns(columnsData);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.log(error);
        setError('Failed to load data. Please try again later.' + error);
      }
    };

    fetchData();
  }, [paginationModel, filterModel, sortModel]);

  return (
    <>
      {error && <Alert color="error">{error}</Alert>}
      <DataGridPro
        columns={columns}
        rows={rows}
        pagination
        rowCount={100}
        sortingMode="server"
        filterMode="server"
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        onFilterModelChange={setFilterModel}
      />
    </>
  );
};
