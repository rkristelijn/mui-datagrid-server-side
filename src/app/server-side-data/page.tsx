import { DataGrid } from '@mui/x-data-grid';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

interface Column {
  field: string;
  headerName: string;
  width: number;
}

interface Props {
  users: User[];
  columns: Column[];
  error: string | null;
}

const DashboardPage = ({ users, columns, error }: Props) => {
  const [rows, setRows] = useState(users);
  const [cols, setCols] = useState(columns);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={cols} checkboxSelection />
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [usersResponse, columnsResponse] = await Promise.all([
      fetch('http://localhost:3001/users'),
      fetch('http://localhost:3001/users_columns'),
    ]);

    if (!usersResponse.ok || !columnsResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const users = await usersResponse.json();
    const columns = await columnsResponse.json();

    return {
      props: {
        users,
        columns,
        error: null,
      },
    };
  } catch (error) {
    return {
      props: {
        users: [],
        columns: [],
        error: 'Failed to load data. Please try again later.',
      },
    };
  }
};

export default DashboardPage;
