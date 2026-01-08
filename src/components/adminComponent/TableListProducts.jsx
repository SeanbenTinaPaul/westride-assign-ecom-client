//sortable table of all products
//parent→ FormProduct.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table } from "flowbite-react";

//icon
import { Pencil, Trash2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import ImgProdInTableList from "./ImgProdInTableList";

import { formatNumber } from "@/utilities/formatNumber";
import { useToast } from "@/components/hooks/use-toast";

//props.products=[{},{},..] → data from DB with cloudinary URL
function TableListProducts({ products, handleDel }) {
   //initialize the sort col and order - sync with props
   const [tableData, setTableData] = useState(products);

   //for flowbite table
   const [sortCol, setSortCol] = useState("id");
   const [sortOrder, setSortOrder] = useState("asc");

   //for search
   const [searchTerm, setSearchTerm] = useState("");
   const { toast } = useToast();

   // console.log("prod in table", products); //products===[{images:[{url:..}],...}, {}]
   // console.log('data',data)

   // Sync tableData with props.products when products change (from parent's getProduct call)
   useEffect(() => {
      setTableData(products);
      setSearchTerm(""); // Reset search when products change
   }, [products]);

   // Handle search on Enter key
   const handleSearch = (e) => {
      if (e.key === "Enter") {
         const term = searchTerm.trim().toLowerCase();
         if (term === "") {
            // If search is empty, show all products
            setTableData(products);
            return;
         }
         const filtered = products.filter((product) =>
            product.title.toLowerCase().includes(term)
         );
         if (filtered.length === 0) {
            toast({
               variant: "destructive",
               title: "ไม่พบสินค้า",
               description: `ไม่พบสินค้าที่มีชื่อ "${searchTerm}"`,
            });
         } else {
            setTableData(filtered);
         }
      }
   };

   //function to sort table data
   const sortData = (col) => {
      const sortedData = [...tableData].sort((a, b) => {
         if (a[col] < b[col]) return sortOrder === "asc" ? -1 : 1;
         if (a[col] > b[col]) return sortOrder === "asc" ? 1 : -1;
         return 0;
      });
      setTableData(sortedData);
      setSortCol(col);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); //toggle between asc and desc
   };

   return (
      <div className='w-full'>
         {/* Search Input */}
         <div className='mb-4 flex items-center gap-2'>
            <div className='relative flex-1 max-w-md'>
               <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
               <input
                  type='text'
                  placeholder='Search for product title... (Press Enter to search)'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
               />
               {searchTerm && (
                  <button
                     type='button'
                     onClick={() => {
                        setSearchTerm("");
                        setTableData(products);
                     }}
                     className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                     title='ล้างการค้นหา'
                  >
                     ✕
                  </button>
               )}
            </div>
         </div>

         <div className='relative sm:rounded-lg rounded-xl border bg-card text-card-foreground shadow-md max-h-[70vh] overflow-y-auto'>
            <Table>
               <Table.Head className="capitalize text-sm">
                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("id")}
                  >
                     <div className='flex items-center'>
                        ID
                        <svg
                           className={`w-4 h-4 ml-2 hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "id" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell>
                     <div className='text-center'>Image</div>
                  </Table.HeadCell>
                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("title")}
                  >
                     <div className='flex items-center'>
                        Product title
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "title" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("brandId")}
                  >
                     <div className='flex items-center truncate'>
                        Brand ID
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "brandId" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("categoryId")}
                  >
                     <div className='flex items-center truncate'>
                        Category ID
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "categoryId" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>

                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("price")}
                  >
                     <div className='flex items-center'>
                        Price
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "price" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>

                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("quantity")}
                  >
                     <div className='flex items-center'>
                        Quantity
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "quantity" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>

                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("sold")}
                  >
                     <div className='flex items-center'>
                        Sold
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "sold" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>

                  
                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("createdAt")}
                  >
                     <div className='flex items-center'>
                        Created At
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "createdAt" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>

                  <Table.HeadCell
                     className='cursor-pointer'
                     onClick={() => sortData("updatedAt")}
                  >
                     <div className='flex items-center'>
                        Updated At
                        <svg
                           className={`w-4 h-4 ml-2  hover:text-fuchsia-700 hover:scale-125 transition-transform duration-300 ${
                              sortCol === "updatedAt" && sortOrder === "asc" ? "rotate-180" : ""
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
                     </div>
                  </Table.HeadCell>
                  <Table.HeadCell>
                     <div className='flex items-center'>Edit</div>
                  </Table.HeadCell>
               </Table.Head>

               <Table.Body className='divide-y'>
                  {/* TableData === products */}
                  {tableData.map((row, rowIndex) => (
                     <Table.Row
                        key={rowIndex}
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
                           <p
                              className='cursor-pointer'
                              title='Edit'
                           >
                              <Link to={"/admin/product/" + row.id}>
                                 <Pencil className='w-3 hover:text-Bg-warning hover:scale-125 transition duration-300' />
                              </Link>
                           </p>
                           <p
                              className='cursor-pointer'
                              title='Delete'
                              onClick={() => handleDel(row.id)}
                              // onClick={() => {
                              //    if (window.confirm("Are you sure you want to delete this product?")) {
                              //       handleDel(row.id);
                              //    }
                              // }}
                           >
                              <Trash2 className='w-4 hover:text-rose-500 hover:scale-125 transition duration-300' />
                           </p>
                        </Table.Cell>
                     </Table.Row>
                  ))}
               </Table.Body>
            </Table>
         </div>
      </div>
   );
}

TableListProducts.propTypes = {
   products: PropTypes.array,
   handleDel: PropTypes.func
};

export default TableListProducts;
