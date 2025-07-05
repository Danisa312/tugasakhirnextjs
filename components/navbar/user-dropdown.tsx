import {Avatar, Dropdown, Navbar, Text} from '@nextui-org/react';
import React, { useEffect, useState, Key } from 'react';
import {DarkModeSwitch} from './darkmodeswitch';
import { useRouter } from 'next/router';

export const UserDropdown = () => {
   const router = useRouter();
   const [user, setUser] = useState<{ email?: string; username?: string; name?: string } | null>(null);

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const userStr = localStorage.getItem('user');
         if (userStr) {
            try {
               setUser(JSON.parse(userStr));
            } catch {
               setUser(null);
            }
         }
      }
   }, []);

   const handleAction = (actionKey: Key) => {
      if (actionKey === 'logout') {
         if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
         }
         router.push('/login');
      }
      if (actionKey === 'settings') {
         router.push('/settings');
      }
   };
   return (
      <Dropdown placement="bottom-right">
         <Navbar.Item>
            <Dropdown.Trigger>
               <Avatar
                  bordered
                  as="button"
                  color="secondary"
                  size="md"
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
               />
            </Dropdown.Trigger>
         </Navbar.Item>
         <Dropdown.Menu
            aria-label="User menu actions"
            onAction={handleAction}
         >
            <Dropdown.Item key="profile" css={{height: '$18'}}>
               <Text b color="inherit" css={{d: 'flex'}}>
                  Signed in as
               </Text>
               <Text b color="inherit" css={{d: 'flex'}}>
                  {user?.email || user?.username || user?.name || 'User'}
               </Text>
            </Dropdown.Item>
            <Dropdown.Item key="settings" withDivider>
               My Settings
            </Dropdown.Item>
            <Dropdown.Item key="logout" withDivider color="error">
               Log Out
            </Dropdown.Item>
            <Dropdown.Item key="switch" withDivider>
               <DarkModeSwitch />
            </Dropdown.Item>
         </Dropdown.Menu>
      </Dropdown>
   );
};
