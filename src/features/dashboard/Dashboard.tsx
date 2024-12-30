'use client';

import { DataGrid, GridCallbackDetails, GridSortModel, GridFilterModel } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const Dashboard = () => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const router = useRouter();

  useEffect(() => {
    const { searchParams } = new URL(window.location.href);
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection');
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');
    const sortParam = sortField && sortDirection ? `&_sort=${sortField}&_order=${sortDirection}` : '';
    const filterParam = filterField && filterValue ? `&${filterField}_like=${filterValue}` : '';

    const fetchData = async () => {
      const [rowsResponse, columnsResponse] = await Promise.all([
        fetch(`http://localhost:3001/users?${sortParam}${filterParam}`),
        fetch('http://localhost:3001/users_columns'),
      ]);

      const rowsData = await rowsResponse.json();
      const columnsData = await columnsResponse.json();

      setRows(rowsData);
      setColumns(columnsData);
    };

    fetchData();
  }, [router]);

  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const { searchParams } = new URL(window.location.href);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });
    router.push(`?${searchParams.toString()}`);
  };

  const handleSortModelChange = (sortModel: GridSortModel, details: GridCallbackDetails<any>) => {
    const { searchParams } = new URL(window.location.href);
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');

    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      updateQueryParams({ sortField: field, sortDirection: sort ?? null, filterField, filterValue });
    } else {
      updateQueryParams({ sortField: null, sortDirection: null, filterField, filterValue });
    }
  };

  const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
    const { searchParams } = new URL(window.location.href);
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection');

    setFilterModel(newFilterModel);
    if (newFilterModel.items.length > 0) {
      const { field, value } = newFilterModel.items[0];
      updateQueryParams({ filterField: field, filterValue: value, sortField, sortDirection });
    } else {
      updateQueryParams({ filterField: null, filterValue: null, sortField, sortDirection });
    }
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      onSortModelChange={handleSortModelChange}
      filterModel={filterModel}
      onFilterModelChange={handleFilterModelChange}
    />
  );
};
