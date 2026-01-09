import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import SidebarUser from "@/components/userComponent/SidebarUser";
import HeaderUser from "@/components/userComponent/HeaderUser";
import useEcomStore from "@/store/ecom-store";

const LayoutUser = () => {
   const { syncCartProductsFromDB } = useEcomStore((state) => state);
   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
   const contentMargin = isSidebarCollapsed ? "ml-16" : "ml-56";

   // Sync cart products with latest DB data when user layout mounts
   useEffect(() => {
      syncCartProductsFromDB();
   }, [syncCartProductsFromDB]);
   return (
      <div className='min-h-screen flex'>
         <SidebarUser isCollapsed={isSidebarCollapsed} />
         <div className={`flex-1 flex flex-col ${contentMargin} transition-all duration-300`}>
            <HeaderUser />
            <div className='fixed top-1 left-3 z-[60]'>
               <Button
                  className='bg-transparent border-none hover:bg-transparent '
                  variant='outline'
                  size='icon'
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
               >
                  {/* Trigger Button */}
                  {isSidebarCollapsed ? (
                     <PanelLeftOpen className='h-4 w-4 text-white transition-all duration-300' />
                  ) : (
                     <PanelLeftClose className='h-4 w-4 text-white transition-all duration-300' />
                  )}

                  {/* <ArrowLeftToLine className ={`${isSidebarCollapsed ? 'rotate-180' : '' } h-4 w-4 text-white`} /> */}
               </Button>
            </div>
            {/* content space */}
            <main className='flex-1 h-full p-6  bg-[#E5E5E5] pt-14'>
               {/* Outlet → Navlink in MainSidebar.jsx */}
               {/* / Pass through context instead of props */}
               <Outlet context={isSidebarCollapsed}/>
            </main>
         </div>
      </div>
   );
};

export default LayoutUser;
