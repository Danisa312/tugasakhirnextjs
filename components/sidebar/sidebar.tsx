import React from 'react';
import {Box} from '../styles/box';
import {Sidebar} from './sidebar.styles';
import {Flex} from '../styles/flex';
import {CompaniesDropdown} from './companies-dropdown';
import {HomeIcon} from '../icons/sidebar/home-icon';
import {SettingsIcon} from '../icons/sidebar/settings-icon';
import {SidebarItem} from './sidebar-item';
import {SidebarMenu} from './sidebar-menu';
import {useSidebarContext} from '../layout/layout-context';
import {useRouter} from 'next/router';
import { Users } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { FileText } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import { Tags } from 'lucide-react';
import { PiggyBank } from 'lucide-react';



export const SidebarWrapper = () => {
   const router = useRouter();
   const {collapsed, setCollapsed} = useSidebarContext();

   return (
      <Box
         as="aside"
         css={{
            height: '100vh',
            zIndex: 202,
            position: 'sticky',
            top: '0',
         }} 
      >
         {collapsed ? <Sidebar.Overlay onClick={setCollapsed} /> : null}

         <Sidebar collapsed={collapsed}>
            <Sidebar.Header>
               <CompaniesDropdown />
            </Sidebar.Header>
            <Flex
               direction={'column'}
               justify={'between'}
               css={{height: '100%'}}
            >
               <Sidebar.Body className="body sidebar">
                  <SidebarItem
                     title="Home"
                     icon={<HomeIcon />}
                     isActive={router.pathname === '/'}
                     href="/"
                  />
                  <SidebarMenu title="Main Menu">
                  
                     <SidebarItem
                        isActive={router.pathname === '/users'}
                        title="Users"
                        icon={<Users />}
                        href="users"
                     />

                     <SidebarItem
                        isActive={router.pathname === '/pendapatan'}
                        title="Pendapatan"
                        icon={<PiggyBank />}
                        href="pendapatan"
                     />

                      <SidebarItem
                        isActive={router.pathname === '/KategoriPengeluaran'}
                        title="Kategori Pengeluaran"
                        icon={<Tags />}
                        href="KategoriPengeluaran"
                     />

                      <SidebarItem
                        isActive={router.pathname === '/pengeluaran'}
                        title="Pengeluaran"
                        icon={<CreditCard />}
                        href="pengeluaran"
                     />

                     <SidebarItem
                        isActive={router.pathname === '/saldo'}
                        title="Saldo"
                        icon={<DollarSign />}
                        href="saldo "
                     />
                     
                     <SidebarItem
                        isActive={router.pathname === '/laporan_bulanan'}
                        title="Laporan Bulanan"
                        icon={<FileText />}
                        href="laporan_bulanan "
                     />

                     

                  </SidebarMenu>
               </Sidebar.Body>
            </Flex>
         </Sidebar>
      </Box>
   );
};
