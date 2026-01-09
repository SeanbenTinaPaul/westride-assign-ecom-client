//sortable table of all products with pagination
//parent→ FormProduct.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table } from "flowbite-react";

//icon
import { Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ImgProdInTableList from "./ImgProdInTableList";
import { Button } from "@/components/ui/button";

import { formatNumber } from "@/utilities/formatNumber";
import { useToast } from "@/components/hooks/use-toast";
import useEcomStore from "@/store/ecom-store";
import { listProductAdminPaginated, searchProductAdmin } from "@/api/ProductAuth";

function TableListProducts({ handleDel, refreshTrigger }) {
   const token = useEcomStore((state) => state.token);
   
   // Data state
   const [tableData, setTableData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   
   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const limit = 10;
   
   // Search state
   const [searchTerm, setSearchTerm] = useState("");
   const [isSearchMode, setIsSearchMode] = useState(false);
   
   // Sort state
   const [sortCol, setSortCol] = useState("id");
   const [sortOrder, setSortOrder] = useState("asc");
   
   const { toast } = useToast();

   // Fetch paginated products
   const fetchProducts = async (page = 1) => {
      setIsLoading(true);
      try {
         const res = await listProductAdminPaginated(token, page, limit);
         if (res.data.success) {
            setTableData(res.data.products);
            setCurrentPage(res.data.pagination.page);
            setTotalPages(res.data.pagination.totalPages);
            setTotal(res.data.pagination.total);
            setIsSearchMode(false);
         }
      } catch (err) {
         console.error("Error fetching products:", err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load products"
         });
      } finally {
         setIsLoading(false);
      }
   };

   // Search products from DB
   const fetchSearchResults = async (query) => {
      setIsLoading(true);
      try {
         const res = await searchProductAdmin(token, query);
         if (res.data.success) {
            setTableData(res.data.products);
            setIsSearchMode(true);
            if (res.data.products.length === 0) {
               toast({
                  variant: "destructive",
                  title: "ไม่พบสินค้า",
                  description: `ไม่พบสินค้าที่มีชื่อ "${query}"`
               });
            }
         }
      } catch (err) {
         console.error("Error searching products:", err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to search products"
         });
      } finally {
         setIsLoading(false);
      }
   };

   // Initial fetch and refresh on trigger
   useEffect(() => {
      if (token) {
         fetchProducts(1);
      }
   }, [token, refreshTrigger]);

   // Handle search on Enter key
   const handleSearch = (e) => {
      if (e.key === "Enter") {
         const term = searchTerm.trim();
         if (term === "") {
            fetchProducts(1);
            return;
         }
         fetchSearchResults(term);
      }
   };

   // Clear search and go back to paginated mode
   const clearSearch = () => {
      setSearchTerm("");
      fetchProducts(1);
   };

   // Handle page change
   const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
         fetchProducts(page);
      }
   };

   // Generate page numbers for pagination
   const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
         for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
         if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
         } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
         } else {
            pages.push(1);
            pages.push("...");
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
         }
      }
      return pages;
   };

   // Local sort function
   const sortData = (col) => {
      const sortedData = [...tableData].sort((a, b) => {
         if (a[col] < b[col]) return sortOrder === "asc" ? -1 : 1;
         if (a[col] > b[col]) return sortOrder === "asc" ? 1 : -1;
         return 0;
      });
      setTableData(sortedData);
      setSortCol(col);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
   };

   // Sort icon component
   const SortIcon = ({ column }) => (
      <svg
         className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
            sortCol === column && sortOrder === "asc" ? "rotate-180" : ""
         }`}
         xmlns='http://www.w3.org/2000/svg'
         fill='none'
         viewBox='0 0 24 24'
         stroke='currentColor'
      >
         <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 9l4-4 4 4m0 6l-4 4-4-4'
         />
      </svg>
   );

   return (
      <div className='w-full'>
         {/* Search Input */}
         <div className='mb-4 flex items-center gap-2'>
            <div className='relative flex-1 max-w-md'>
               <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
               <input
                  type='text'
                  placeholder='Search product title... (Press Enter)'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
               />
               {searchTerm && (
                  <button
                     type='button'
                     onClick={clearSearch}
                     className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                     title='ล้างการค้นหา'
                  >
                     ✕
                  </button>
               )}
            </div>
            {isSearchMode && (
               <span className='text-sm text-gray-500'>
                  Found {tableData.length} result(s)
               </span>
            )}
         </div>

         {/* Loading indicator */}
         {isLoading && (
            <div className='text-center py-4 text-gray-500'>Loading...</div>
         )}

         {/* Table */}
         <div className='relative sm:rounded-lg rounded-xl border bg-card text-card-foreground shadow-md max-h-[60vh] overflow-y-auto'>
            <Table>
               <Table.Head className="capitalize text-sm">
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("id")}>
                     <div className='flex items-center'>
                        ID
                        <SortIcon column="id" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell>
                     <div className='text-center'>Image</div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("title")}>
                     <div className='flex items-center'>
                        Product title
                        <SortIcon column="title" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("brandId")}>
                     <div className='flex items-center truncate'>
                        Brand ID
                        <SortIcon column="brandId" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("categoryId")}>
                     <div className='flex items-center truncate'>
                        Category ID
                        <SortIcon column="categoryId" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("price")}>
                     <div className='flex items-center'>
                        Price
                        <SortIcon column="price" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("quantity")}>
                     <div className='flex items-center'>
                        Quantity
                        <SortIcon column="quantity" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("sold")}>
                     <div className='flex items-center'>
                        Sold
                        <SortIcon column="sold" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("createdAt")}>
                     <div className='flex items-center'>
                        Created At
                        <SortIcon column="createdAt" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell className='cursor-pointer' onClick={() => sortData("updatedAt")}>
                     <div className='flex items-center'>
                        Updated At
                        <SortIcon column="updatedAt" />
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell>
                     <div className='flex items-center'>Edit</div>
                  </Table.HeadCell>
               </Table.Head>

               <Table.Body className='divide-y'>
                  {tableData.map((row, rowIndex) => (
                     <Table.Row
                        key={row.id}
                        className='bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-600'
                     >
                        <Table.Cell className='font-medium text-gray-900 dark:text-white'>
                           {row.id}
                        </Table.Cell>
                        <Table.Cell className='text-center'>
                           <ImgProdInTableList
                              images={row.images}
                              rowIndex={rowIndex}
                           />
                        </Table.Cell>
                        <Table.Cell className='whitespace-nowrap'>{row.title}</Table.Cell>
                        <Table.Cell>{row.brandId}</Table.Cell>
                        <Table.Cell>{row.categoryId}</Table.Cell>
                        <Table.Cell>{formatNumber(row.price)}</Table.Cell>
                        <Table.Cell>{row.quantity}</Table.Cell>
                        <Table.Cell>{row.sold}</Table.Cell>
                        <Table.Cell className="whitespace-nowrap">
                           {new Date(row.createdAt).toLocaleString("en-uk", {
                              timeZone: "Asia/Bangkok",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                           })}
                        </Table.Cell>
                        <Table.Cell className='whitespace-nowrap'>
                           {new Date(row.updatedAt).toLocaleString("en-uk", {
                              timeZone: "Asia/Bangkok",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                           })}
                        </Table.Cell>
                        <Table.Cell>
                           <p className='cursor-pointer' title='Edit'>
                              <Link to={"/admin/product/" + row.id}>
                                 <Pencil className='w-3 hover:text-Bg-warning hover:scale-125 transition duration-300' />
                              </Link>
                           </p>
                           <p
                              className='cursor-pointer'
                              title='Delete'
                              onClick={() => handleDel(row.id)}
                           >
                              <Trash2 className='w-4 hover:text-rose-500 hover:scale-125 transition duration-300' />
                           </p>
                        </Table.Cell>
                     </Table.Row>
                  ))}
               </Table.Body>
            </Table>
         </div>

         {/* Pagination (hidden in search mode) */}
         {!isSearchMode && totalPages > 1 && (
            <div className='flex items-center justify-between mt-4 px-2'>
               <div className='flex items-center gap-1'>
                  <button
                     onClick={() => goToPage(currentPage - 1)}
                     disabled={currentPage === 1}
                     className='p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                     <ChevronLeft className='w-4 h-4' />
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                     page === "..." ? (
                        <span key={`ellipsis-${index}`} className='px-2'>...</span>
                     ) : (
                        <Button
                           key={page}
                           variant={currentPage === page ? 'default' : 'default'}
                           onClick={() => goToPage(page)}
                           disabled={currentPage === page}
                           className={`px-4 rounded-lg ${
                              currentPage === page
                                 ? 'text-white cursor-default'
                                 : 'hover:bg-gray-600 border-gray-600'
                           }`}
                        >
                           {page}
                        </Button>
                     )
                  ))}
                  
                  <button
                     onClick={() => goToPage(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className='p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                     <ChevronRight className='w-4 h-4' />
                  </button>
               </div>

               <span className='text-sm text-gray-500'>
                  Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, total)} of {total}
               </span>
            </div>
         )}
      </div>
   );
}

TableListProducts.propTypes = {
   handleDel: PropTypes.func,
   refreshTrigger: PropTypes.number
};

export default TableListProducts;
