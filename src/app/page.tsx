import React from 'react';
import { List, ListItem, Link } from '@mui/material';

const links = [
  { text: 'Home', href: '/' },
  { text: 'About', href: '/about' },
  { text: 'Client Side', href: '/client-side' },
  { text: 'Server Side', href: '/server-side' },
  { text: 'Server Side Data', href: '/server-side-data' },
];

const Page = () => {
  return (
    <List>
      {links.map((link, index) => (
        <ListItem key={index}>
          <Link href={link.href} underline="hover">
            {link.text}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

export default Page;
