//parent → UpdateOrder.jsx
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { getOrdersAdminPaginated, updateOrderStatAdmin } from "@/api/adminAuth";
import useEcomStore from "@/store/ecom-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";
import { formatNumber } from "@/utilities/formatNumber";

function OrderTable(props) {
   const { token } = useEcomStore((state) => state);
   const { toast } = useToast();
   
   // Table data state
   const [tableData, setTableData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [hasMoreOrders, setHasMoreOrders] = useState(true);
   const [isTriggerRender, setIsTriggerRender] = useState(false);
   
   // Sort and search state
   const [searchTerm, setSearchTerm] = useState("");
   const [sortCol, setSortCol] = useState("");
   const [sortOrder, setSortOrder] = useState("asc");
   
   // Selection state
   const [selectedRows, setSelectedRows] = useState([]);
   const [selectedStatus, setSelectedStatus] = useState("Completed");
   
   const itemsPerLoad = 20;

   // Initial load
   useEffect(() => {
      fetchOrders(0, true);
   }, [token, isTriggerRender]);

   // Fetch orders with pagination
   const fetchOrders = async (skip = 0, isInitial = false) => {
      if (isInitial) {
         setIsLoading(true);
      } else {
         setIsLoadingMore(true);
      }
      
      try {
         const res = await getOrdersAdminPaginated(token, skip, itemsPerLoad);
         if (res.data.success) {
            if (isInitial) {
               setTableData(res.data.orders);
            } else {
               setTableData(prev => [...prev, ...res.data.orders]);
            }
            setHasMoreOrders(res.data.hasMore);
         }
      } catch (err) {
         console.log(err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load orders"
         });
      } finally {
         setIsLoading(false);
         setIsLoadingMore(false);
      }
   };

   // Load More handler
   const loadMoreOrders = () => {
      if (!isLoadingMore && hasMoreOrders) {
         fetchOrders(tableData.length, false);
      }
   };

   // Sort function
   const sortData = (col) => {
      const sortedData = [...tableData].sort((a, b) => {
         if (col === "orderStatus") {
            const statusOrder = {
               Completed: 2,
               "Not Process": 1,
               Refunded: 0
            };
            const statusA = a[col] || "Not Process";
            const statusB = b[col] || "Not Process";
            return sortOrder === "asc"
               ? statusOrder[statusA] - statusOrder[statusB]
               : statusOrder[statusB] - statusOrder[statusA];
         } else if (col === "status") {
            const statusOrder = {
               succeeded: 1,
               "not process": 0
            };
            const statusA = a[col] || "not process";
            const statusB = b[col] || "not process";
            return sortOrder === "asc"
               ? statusOrder[statusA] - statusOrder[statusB]
               : statusOrder[statusB] - statusOrder[statusA];
         } else {
            if (a[col] < b[col]) return sortOrder === "asc" ? -1 : 1;
            if (a[col] > b[col]) return sortOrder === "asc" ? 1 : -1;
            return 0;
         }
      });
      setTableData(sortedData);
      setSortCol(col);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
   };

   // Checkbox selection
   const handleSelectRow = (id) => {
      setSelectedRows((prev) =>
         prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
      );
   };
   
   // Checkbox select all
   const handleSelectAll = (e) => {
      if (e.target.checked) {
         const allIds = filteredData.map((item) => item.id);
         setSelectedRows(allIds);
      } else {
         setSelectedRows([]);
      }
   };

   // Bulk status update
   const handleBulkUpdate = async () => {
      if (selectedRows.length > 0) {
         try {
            const res = await updateOrderStatAdmin(token, selectedRows, selectedStatus);
            toast({
               title: "Success",
               description: `${res.data.message}`
            });
         } catch (err) {
            console.log(err);
            toast({
               variant: "destructive",
               title: "Error!",
               description: "Failed to update order status"
            });
         }
         setSelectedRows([]);
         // Re-fetch from beginning to show updated data
         setTableData([]);
         setIsTriggerRender(!isTriggerRender);
      }
   };

   // Filter data based on search term
   const filteredData = tableData?.filter((obj) =>
      Object.values(obj).some((value) =>
         value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
   );

   return (
      <div className='relative overflow-x-auto shadow-md rounded-xl bg-card'>
         <main className='flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-2 bg-card dark:bg-gray-900 p-4'>
            <div className='flex items-center gap-2'>
               <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-0 focus:ring-offset-0 focus:outline-none p-2'
               >
                  <option value='Completed'>Completed</option>
                  <option value='Not Process'>Not Process</option>
                  <option value='Refunded'>Refunded</option>
               </select>
               <Button
                  onClick={handleBulkUpdate}
                  className=' hover:bg-fuchsia-700 focus:ring-4 focus:ring-yellow-300 font-medium rounded-xl text-sm px-4 py-2 dark:bg-slate-500 dark:hover:bg-slate-600 focus:outline-none dark:focus:ring-slate-700'
                  disabled={selectedRows.length === 0}
               >
                  Update order status ({selectedRows.length} selected)
               </Button>
            </div>

            <div className='relative'>
               <input
                  type='text'
                  className='block w-[350px] ps-6 text-sm p-2 rounded-xl Input-3Dshadow'
                  placeholder='Search...'
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </main>

         {/* Loading indicator */}
         {isLoading && (
            <div className='text-center py-4 text-gray-500'>Loading orders...</div>
         )}

         <main className='p-4 bg-card'>
            <div className='border rounded-xl overflow-hidden'>
               <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                  <thead className='text-sm py-auto text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                     <tr>
                        <th scope='col' className='p-4'>
                           <div className='flex items-center'>
                              <input
                                 type='checkbox'
                                 checked={selectedRows.length === filteredData?.length && filteredData?.length > 0}
                                 onChange={(e) => handleSelectAll(e)}
                                 className='w-4 h-4 text-slate-900 shadow bg-gray-100 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none'
                              />
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("id")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Order ID
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "id" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3'>User</th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("orderedById")}>
                           <div className='flex items-center whitespace-nowrap'>
                              User ID
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "orderedById" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3'>Address</th>
                        <th scope='col' className='px-6 py-3'>Products</th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("cartTotal")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Net Total
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "cartTotal" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("createdAt")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Created At
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "createdAt" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("updatedAt")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Updated At
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "updatedAt" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("status")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Payment Status
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "status" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                        <th scope='col' className='px-6 py-3 cursor-pointer' onClick={() => sortData("orderStatus")}>
                           <div className='flex items-center whitespace-nowrap'>
                              Order Status
                              <svg className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${sortCol === "orderStatus" && sortOrder === "asc" ? "rotate-180" : ""}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                 <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l4-4 4 4m0 6l-4 4-4-4' />
                              </svg>
                           </div>
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredData?.map((item) => (
                        <tr
                           key={item.id}
                           className='bg-card border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        >
                           <td className='w-4 p-4'>
                              <div className='flex items-center'>
                                 <input
                                    type='checkbox'
                                    checked={selectedRows.includes(item.id)}
                                    onChange={() => handleSelectRow(item.id)}
                                    className='w-4 h-4 text-slate-900 shadow bg-gray-100 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 focus:outline-none'
                                 />
                              </div>
                           </td>
                           <td className='px-6 py-4'>{item.id}</td>
                           <td className='px-6 py-4'>
                              <div className='text-base font-semibold'>{item.orderedBy?.name}</div>
                              <div className='font-normal text-gray-500'>{item.orderedBy?.email}</div>
                           </td>
                           <td className='px-6 py-4'>{item.orderedById}</td>
                           <td
                              title={item.orderedBy?.address}
                              className='px-6 py-4 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-ellipsis'
                           >
                              {item.orderedBy?.address}
                           </td>
                           <td className='px-6 py-4'>
                              {item.products?.map((prod, i) => (
                                 <div key={i} className='whitespace-nowrap'>
                                    <div>{prod.product?.title}</div>
                                    <div className='pl-5'>
                                       {prod?.count}x ฿{formatNumber(prod?.price)}
                                    </div>
                                 </div>
                              ))}
                           </td>
                           <td className='px-6 py-4'>฿{formatNumber(item.cartTotal)}</td>
                           <td className='px-6 py-4'>
                              {new Date(item.createdAt).toLocaleString("en-uk", {
                                 timeZone: "Asia/Bangkok",
                                 day: "2-digit",
                                 month: "short",
                                 year: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit",
                                 hour12: true
                              })}
                           </td>
                           <td className='px-6 py-4'>
                              {new Date(item.updatedAt).toLocaleString("en-uk", {
                                 timeZone: "Asia/Bangkok",
                                 day: "2-digit",
                                 month: "short",
                                 year: "numeric",
                                 hour: "2-digit",
                                 minute: "2-digit",
                                 hour12: true
                              })}
                           </td>
                           <td className='px-6 py-4'>{item.status || "not process"}</td>
                           <td className='px-6 py-4'>
                              <span
                                 className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    item.orderStatus === "Completed"
                                       ? "bg-green-100 text-green-700"
                                       : item.orderStatus === "Not Process"
                                       ? "bg-yellow-100 text-yellow-700"
                                       : "bg-red-100 text-red-700"
                                 }`}
                              >
                                 {item.orderStatus}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </main>

         {/* Load More Button */}
         <main className='flex flex-col items-center justify-center p-4 my-4 bg-card gap-2'>
            <span className='text-sm text-gray-500'>
               Showing {filteredData?.length || 0} of {tableData.length} loaded orders
            </span>
            {hasMoreOrders && (
               <Button
                  onClick={loadMoreOrders}
                  disabled={isLoadingMore}
                  className='rounded-xl hover:bg-fuchsia-700'
               >
                  {isLoadingMore ? "Loading..." : "Load More Orders"}
               </Button>
            )}
            {!hasMoreOrders && tableData.length > 0 && (
               <span className='text-sm text-gray-400'>All orders loaded</span>
            )}
         </main>
      </div>
   );
}

OrderTable.propTypes = {};

export default OrderTable;
