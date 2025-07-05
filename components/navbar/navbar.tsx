import {Input, Link, Navbar, Text} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import {SearchIcon} from '../icons/searchicon';
import {Box} from '../styles/box';
import {BurguerButton} from './burguer-button';
import { UserDropdown } from './user-dropdown';

interface Props {
   children: React.ReactNode;
}

export const NavbarWrapper = ({children}: Props) => {
   const [namaUser, setNamaUser] = useState('User');
   const collapseItems = [
      'Profile',
      'Dashboard',
      'Activity',
      'Analytics',
      'System',
      'Deployments',
      'My Settings',
      'Team Settings',
      'Help & Feedback',
      'Log Out',
   ];

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const userStr = localStorage.getItem('user');
         if (userStr) {
            try {
               const userObj = JSON.parse(userStr);
               setNamaUser(userObj?.name || userObj?.username || userObj?.email || 'User');
            } catch {
               setNamaUser('User');
            }
         }
      }
   }, []);

   return (
      <Box
         css={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'hidden',
         }}
      >
         <Navbar
            isBordered
            css={{
               'borderBottom': '1px solid $border',
               'justifyContent': 'space-between',
               'width': '100%',
               '@md': {
                  justifyContent: 'space-between',
               },

               '& .nextui-navbar-container': {
                  'border': 'none',
                  'maxWidth': '100%',
                  'gap': '$6',
                  '@md': {
                     justifyContent: 'space-between',
                  },
               },
            }}
         >
            <Navbar.Content showIn="md">
               <BurguerButton />
            </Navbar.Content>
            <div style={{ width: '100%', padding: '10px 0 0 32px', background: 'transparent' }}>
               <span style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#666',
                  margin: 0,
                  padding: 0,
                  display: 'block',
                  lineHeight: 1.2,
                  letterSpacing: 0.1,
                  textAlign: 'left',
               }}>
                  Selamat Datang, {namaUser}
               </span>
            </div>
            <Navbar.Content
               hideIn={'md'}
               css={{
                  width: '100%',
               }}
            >
               <Input
                  clearable
                  contentLeft={
                     <SearchIcon
                        fill="var(--nextui-colors-accents6)"
                        size={16}
                     />
                  }
                  contentLeftStyling={false}
                  css={{
                     'w': '100%',
                     'transition': 'all 0.2s ease',
                     '@xsMax': {
                        w: '100%',
                        // mw: '300px',
                     },
                     '& .nextui-input-content--left': {
                        h: '100%',
                        ml: '$4',
                        dflex: 'center',
                     },
                  }}
                  placeholder="Search..."
               />
            </Navbar.Content>
            <Navbar.Content
               css={{
                  justifyContent: 'flex-end',
                  flex: 1,
               }}
               hideIn={"xs"}
            >
               <UserDropdown />
            </Navbar.Content>

            <Navbar.Collapse>
               {collapseItems.map((item, index) => (
                  <Navbar.CollapseItem
                     key={item}
                     activeColor="secondary"
                     css={{
                        color:
                           index === collapseItems.length - 1 ? '$error' : '',
                     }}
                     isActive={index === 2}
                  >
                     <Link
                        color="inherit"
                        css={{
                           minWidth: '100%',
                        }}
                        href="#"
                     >
                        {item}
                     </Link>
                  </Navbar.CollapseItem>
               ))}
            </Navbar.Collapse>
         </Navbar>
         {children}
      </Box>
   );
};
