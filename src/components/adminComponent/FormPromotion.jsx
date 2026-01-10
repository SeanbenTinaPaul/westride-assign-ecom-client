//parent → PromotionAdmin.jsx
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/hooks/use-toast";
import { CalendarIcon, Percent, Timer, ChevronLeft, ChevronRight } from "lucide-react";
import useEcomStore from "@/store/ecom-store";
import { bulkDiscount, listProductAdminPaginated, searchProductAdmin } from "@/api/ProductAuth";

function FormPromotion() {
   const token = useEcomStore((state) => state.token);
   const { toast } = useToast();
   const tableRef = useRef(null);

   // Products state (local, not from store)
   const [products, setProducts] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [total, setTotal] = useState(0);
   const [isSearchMode, setIsSearchMode] = useState(false);
   const limit = 10;

   // ID-based selection (for cross-page preservation)
   const [selectedProductIds, setSelectedProductIds] = useState(new Set());
   const [selectedProductsData, setSelectedProductsData] = useState(new Map()); // Store product data for apply

   // Form state
   const [discountAmount, setDiscountAmount] = useState("");
   const [startDate, setStartDate] = useState(new Date());
   const [endDate, setEndDate] = useState(new Date());
   const [description, setDescription] = useState("");
   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
   const [isPromotion, setIsPromotion] = useState(false);

   // Fetch paginated products
   const fetchProducts = async (page = 1) => {
      setIsLoading(true);
      try {
         const res = await listProductAdminPaginated(token, page, limit);
         if (res.data.success) {
            setProducts(res.data.products);
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
      if (!query || query.trim() === "") {
         fetchProducts(1);
         return;
      }
      setIsLoading(true);
      try {
         const res = await searchProductAdmin(token, query);
         if (res.data.success) {
            setProducts(res.data.products);
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
      } finally {
         setIsLoading(false);
      }
   };

   // Initial fetch
   useEffect(() => {
      if (token) {
         fetchProducts(1);
      }
   }, [token]);

   // Handle page change
   const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
         fetchProducts(page);
      }
   };

   // Generate page numbers
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

   // Handle selection change (ID-based for cross-page preservation)
   const handleSelectionChange = (productId, isSelected) => {
      setSelectedProductIds(prev => {
         const newSet = new Set(prev);
         if (isSelected) {
            newSet.add(productId);
            // Store product data for apply
            const product = products.find(p => p.id === productId);
            if (product) {
               setSelectedProductsData(prevMap => {
                  const newMap = new Map(prevMap);
                  newMap.set(productId, product);
                  return newMap;
               });
            }
         } else {
            newSet.delete(productId);
            setSelectedProductsData(prevMap => {
               const newMap = new Map(prevMap);
               newMap.delete(productId);
               return newMap;
            });
         }
         return newSet;
      });
   };

   // Clear selection and form
   const handleReset = () => {
      setSelectedProductIds(new Set());
      setSelectedProductsData(new Map());
      setDiscountAmount("");
      setDescription("");
      if (tableRef.current) {
         tableRef.current.toggleAllRowsSelected(false);
      }
   };

   // คอลัมน์สำหรับตารางสินค้า
   const columns = [
      {
         id: "select",
         header: ({ table }) => (
            <Checkbox
               checked={table.getIsAllPageRowsSelected()}
               onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
         ),
         cell: ({ row }) => (
            <Checkbox
               checked={row.getIsSelected()}
               onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
         )
      },
      {
         accessorKey: "id",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  ID
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         }
      },
      {
         accessorKey: "title",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Product Title
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         }
      },
      {
         accessorKey: "price",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Price
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         }
      },
      {
         accessorKey: "brandId",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Brand ID
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         }
      },
      {
         accessorKey: "categoryId",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Category ID
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         }
      },
      {
         accessorKey: "promotion",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Current Promotion
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         },
         cell: ({ row }) => {
            return row.original.promotion ? "-" + row.original.promotion + "%" : "-";
         }
      },
      {
         accessorKey: "discounts",
         header: ({ column }) => {
            return (
               <Button
                  variant='ghost'
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               >
                  Current Discounts
                  <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                     <svg
                        className='w-4 h-4'
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
                  </div>
               </Button>
            );
         },
         cell: ({ row }) => {
            const discounts = row.original.discounts || [];
            if (discounts.length === 0) return "-";
            
            const now = new Date();
            const activeDiscount = discounts.find(d => {
               const startDate = new Date(d.startDate);
               const endDate = new Date(d.endDate);
               return d.isActive && now >= startDate && now < endDate;
            });
            
            const discountToShow = activeDiscount || discounts[discounts.length - 1];
            return discountToShow ? `-${discountToShow.amount}%` : "-";
         }
      },
      {
         accessorKey: "startDate",
         header: ({ column }) => (
            <Button
               variant='ghost'
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
               Start Date
               <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                  <svg
                     className='w-4 h-4'
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
               </div>
            </Button>
         ),
         sortingFn: (rowA, rowB) => {
            const dateA = rowA.original.discounts?.[0]?.startDate
               ? new Date(rowA.original.discounts[0].startDate)
               : new Date(0);
            const dateB = rowB.original.discounts?.[0]?.startDate
               ? new Date(rowB.original.discounts[0].startDate)
               : new Date(0);
            return dateA.getTime() - dateB.getTime();
         },
          cell: ({ row }) => {
             const discounts = row.original.discounts || [];
             if (discounts.length === 0) return "-";
             
             const now = new Date();
             const activeDiscount = discounts.find(d => {
                const startDate = new Date(d.startDate);
                const endDate = new Date(d.endDate);
                return d.isActive && now >= startDate && now < endDate;
             });
             
             const discountToShow = activeDiscount || discounts[discounts.length - 1];
             if (!discountToShow) return "-";
             
             const date = new Date(discountToShow.startDate);
             return date.toLocaleString("en-uk", {
                timeZone: "Asia/Bangkok",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
             });
          }
       },
      {
         accessorKey: "endDate",
         header: ({ column }) => (
            <Button
               variant='ghost'
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
               End Date
               <div className='w-full flex justify-center hover:text-fuchsia-700  hover:scale-125 active:rotate-180 transition-transform duration-200'>
                  <svg
                     className='w-4 h-4'
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
               </div>
            </Button>
         ),
         sortingFn: (rowA, rowB) => {
            const dateA = rowA.original.discounts?.[0]?.endDate
               ? new Date(rowA.original.discounts[0].endDate)
               : new Date(0);
            const dateB = rowB.original.discounts?.[0]?.endDate
               ? new Date(rowB.original.discounts[0].endDate)
               : new Date(0);
            return dateA.getTime() - dateB.getTime();
         },

         cell: ({ row }) => {
             const discounts = row.original.discounts || [];
             if (discounts.length === 0) return "-";
             
             const now = new Date();
             const activeDiscount = discounts.find(d => {
                const startDate = new Date(d.startDate);
                const endDate = new Date(d.endDate);
                return d.isActive && now >= startDate && now < endDate;
             });
             
             const discountToShow = activeDiscount || discounts[discounts.length - 1];
             if (!discountToShow) return "-";
             
             const date = new Date(discountToShow.endDate);
             return date.toLocaleString("en-uk", {
                timeZone: "Asia/Bangkok",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
             });
          }
       },
      {
         accessorKey: "isActive",
         header: ({ column }) => (
            <Button
               variant='ghost'
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
               Status
               <div className='w-full flex justify-center hover:text-fuchsia-700 hover:scale-125 active:rotate-180 transition-transform duration-200'>
                  <svg
                     className='w-4 h-4'
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
               </div>
            </Button>
         ),
         sortingFn: (rowA, rowB) => {
            const getStatus = (row) => {
               const discount = row.original.discounts?.[0];
               if (!discount) return "no-discount";

               const now = new Date();
               const startDate = new Date(discount.startDate);

               if (now < startDate) return "pending";
               if (!discount.isActive) return "expired";
               return "active";
            };

            const statusA = getStatus(rowA);
            const statusB = getStatus(rowB);

            const statusOrder = {
               active: 3,
               pending: 2,
               expired: 1,
               "no-discount": 0
            };

            return statusOrder[statusA] - statusOrder[statusB];
         },

         cell: ({ row }) => {
            const discounts = row.original.discounts || [];
            if (discounts.length === 0) return "-";
            const now = new Date();

            const getDiscountStatus = (discount) => {
               const startDate = new Date(discount.startDate);
               if (now < startDate) return "pending";
               if (!discount.isActive) return "expired";
               return "active";
            };
            const status = discounts.map((d) => getDiscountStatus(d))[0];
            return (
               <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                     status === "active"
                        ? "bg-green-100 text-green-700"
                        : status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
               >
                  {status === "active" ? "Active" : status === "pending" ? "Pending" : "Expired"}
               </span>
            );
         }
      }
   ];

   // Apply discount
   const handleApplyDiscount = async () => {
      if (!discountAmount || selectedProductIds.size === 0) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Please select products and enter discount amount"
         });
         return;
      }

      try {
         // Convert selected IDs to product objects
         const selectedProducts = Array.from(selectedProductsData.values());
         
         const discountData = {
            products: selectedProducts,
            amount: parseFloat(discountAmount),
            startDate,
            endDate,
            description,
            isPromotion
         };

         const res = await bulkDiscount(token, discountData);
         if (res.data) {
            toast({
               title: "Success",
               description: res.data.message
            });
            setShowConfirmDialog(false);
            // Reset state
            setSelectedProductIds(new Set());
            setSelectedProductsData(new Map());
            setDiscountAmount("");
            setDescription("");
            // Refresh current page
            if (isSearchMode) {
               setIsSearchMode(false);
            }
            await fetchProducts(currentPage);
            // Clear table selection
            if (tableRef.current) {
               tableRef.current.toggleAllRowsSelected(false);
            }
         }
      } catch (error) {
         console.error(error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to apply discount"
         });
      }
   };

   return (
      <div className='pt-6 space-y-6'>
         <div className='w-full flex  mb-4 p-3 items-center rounded-xl gap-2 bg-gradient-to-r from-card to-slate-100 shadow-md'>
            <h1 className='text-xl font-medium text-slate-700'>Promotion Management</h1>
         </div>
         <Card className='bg-gradient-to-tr from-card to-slate-100'>
            <CardHeader>
               <CardTitle className='flex items-center gap-2'>
                  <Percent className='w-5 h-5' />
                  Bulk Discount
               </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
               <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1 space-y-2'>
                     <label className='text-sm font-medium'>Discount Type</label>
                     <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-2'>
                           <Checkbox
                              checked={!isPromotion}
                              onCheckedChange={() => setIsPromotion(false)}
                           />
                           <span>Flash Sale Discount</span>
                        </div>
                        <div className='flex items-center gap-2'>
                           <Checkbox
                              checked={isPromotion}
                              onCheckedChange={() => setIsPromotion(true)}
                           />
                           <span>General Promotion</span>
                        </div>
                     </div>
                  </div>
                  <div className='flex-1'>
                     <label className='text-sm font-medium '>Discount Amount (%)</label>
                     <Input
                        type='number'
                        min='0'
                        max='100'
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className='mt-1 p-2 rounded-xl transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] border-transparent  focus:ring-1 focus:ring-purple-500 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                     />
                  </div>
               </div>
               {/* Calendar */}
               {!isPromotion && (
                  <div className='space-y-2'>
                     <label className='text-sm font-medium flex items-center gap-2'>
                        <Timer className='w-4 h-4' />
                        Discount Period
                     </label>
                     <div className='flex flex-col md:flex-row gap-4'>
                        <div className='flex-1'>
                           <div className='flex items-center gap-2 text-slate-500'>
                              <span className='font-medium text-sm'>Start Date</span>
                              <CalendarIcon className='w-4 h-4' />
                           </div>
                           <Calendar
                              mode='single'
                              selected={startDate}
                              onSelect={setStartDate}
                              className='flex transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] rounded-lg border focus:ring-1 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                           />
                        </div>
                        <div className='flex-1'>
                           <div className='flex items-center gap-2 text-slate-500'>
                              <span className='font-medium text-sm'>End Date</span>
                              <CalendarIcon className='w-4 h-4' />
                           </div>
                           <Calendar
                              mode='single'
                              selected={endDate}
                              onSelect={setEndDate}
                              className='flex transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] rounded-lg border focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                           />
                        </div>
                     </div>
                     <div className='space-y-2'>
                        <label className='text-sm font-medium'>Description</label>
                        <Input
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           placeholder='e.g. New Year Sale, Summer Collection'
                           className='transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] border-transparent p-2 rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                        />
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Loading indicator */}
         {isLoading && (
            <div className='text-center py-4 text-gray-500'>Loading...</div>
         )}

         {/* Table */}
         <div>
            <DataTable
               className='bg-gradient-to-tr from-card to-slate-100'
               columns={columns}
               data={products}
               tableRef={tableRef}
               showPagination={false}
               externalSearch={true}
               onSearchSubmit={fetchSearchResults}
               selectedIds={selectedProductIds}
               onSelectionChange={handleSelectionChange}
               getRowId={(row) => row.id}
            />
         </div>

         {/* External Pagination (hidden in search mode) */}
         {!isSearchMode && totalPages > 1 && (
            <div className='flex items-center justify-between px-2'>
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
                           variant='default'
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

         {/* Buttons */}
         <div className='flex justify-end gap-4'>
            <Button
               className='rounded-xl'
               variant='outline'
               onClick={handleReset}
            >
               Reset
            </Button>
            <Button
               className='rounded-xl'
               onClick={() => setShowConfirmDialog(true)}
               disabled={!discountAmount || selectedProductIds.size === 0}
            >
               Apply Discount
            </Button>
         </div>

         <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Discount Application</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to apply a {discountAmount}% discount to{" "}
                     {selectedProductIds.size} selected products?
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApplyDiscount}>Apply</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}

export default FormPromotion;
