import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

export default async function Page() {
  let users = [];
  let columns = [];
  let error = null;

  try {
    const [usersResponse, columnsResponse] = await Promise.all([
      fetch('http://localhost:3001/users'),
      fetch('http://localhost:3001/users_columns'),
    ]);

    if (!usersResponse.ok || !columnsResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    users = await usersResponse.json();
    columns = await columnsResponse.json();
  } catch (err) {
    error = 'Failed to load data. Please try again later.';
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={users} columns={columns} />
    </Box>
  );
}