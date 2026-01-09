import React from "react";
import PropTypes from "prop-types";
import {
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   useReactTable,
   getSortedRowModel
} from "@tanstack/react-table";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from "@/components/ui/select";
// import { Search } from "lucide-react";

//-----------------------------------------------------------
export function DataTable({
   columns,
   data,
   onRowSelection,
   showToolbar = true,
   tableRef,
   // New props for external control
   showPagination = true,
   externalSearch = false,
   onSearchSubmit,
   // ID-based selection for cross-page preservation
   selectedIds,
   onSelectionChange,
   getRowId = (row) => row.id
}) {
   const [rowSelection, setRowSelection] = React.useState({});
   const [globalFilter, setGlobalFilter] = React.useState("");
   const [sorting, setSorting] = React.useState([]);
   const [searchTerm, setSearchTerm] = React.useState("");

   // Sync rowSelection with selectedIds when data changes (for cross-page selection)
   React.useEffect(() => {
      if (selectedIds && getRowId) {
         const newRowSelection = {};
         data.forEach((row, index) => {
            const rowId = getRowId(row);
            if (selectedIds.has(rowId)) {
               newRowSelection[index] = true;
            }
         });
         setRowSelection(newRowSelection);
      }
   }, [data, selectedIds, getRowId]);

   //when called useReactTable() → auto passed to table and row props to header and cell functions in the columns array.
   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: {
         rowSelection,
         globalFilter: externalSearch ? "" : globalFilter, // disable internal filter if external
         sorting
      },
      enableRowSelection: true,
      onRowSelectionChange: (updater) => {
         const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
         setRowSelection(newSelection);

         // If using ID-based selection, notify parent of changes
         if (onSelectionChange && getRowId) {
            // Find what changed
            const oldKeys = new Set(Object.keys(rowSelection).filter((k) => rowSelection[k]));
            const newKeys = new Set(Object.keys(newSelection).filter((k) => newSelection[k]));

            // Find added selections
            newKeys.forEach((key) => {
               if (!oldKeys.has(key)) {
                  const rowIndex = parseInt(key);
                  if (data[rowIndex]) {
                     onSelectionChange(getRowId(data[rowIndex]), true);
                  }
               }
            });

            // Find removed selections
            oldKeys.forEach((key) => {
               if (!newKeys.has(key)) {
                  const rowIndex = parseInt(key);
                  if (data[rowIndex]) {
                     onSelectionChange(getRowId(data[rowIndex]), false);
                  }
               }
            });
         }
      },
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel()
   });

   // Update parent component when selection changes (legacy support)
   React.useEffect(() => {
      if (onRowSelection && !onSelectionChange) {
         const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
         onRowSelection(selectedRows);
      }
   }, [rowSelection, table, onRowSelection, onSelectionChange]);

   // Assign table instance to ref
   React.useEffect(() => {
      if (tableRef) {
         tableRef.current = table;
      }
   }, [table, tableRef]);

   // Handle search submit for external search
   const handleSearchKeyDown = (e) => {
      if (e.key === "Enter" && externalSearch && onSearchSubmit) {
         onSearchSubmit(searchTerm);
      }
   };

   return (
      <div className='space-y-4 p-6  bg-gradient-to-tr from-card to-slate-100 shadow-md rounded-xl border-slate-200 border'>
         {showToolbar && (
            <div className='flex items-center justify-between'>
               <div className='flex w-full max-w-sm items-center space-x-2'>
                  {externalSearch ? (
                     <div className='relative'>
                        {/* <Search className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' /> */}
                        <Input
                           placeholder='Search... (Enter)'
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           onKeyDown={handleSearchKeyDown}
                           className='h-8 pl-10 w-[150px] lg:w-[250px] transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] border-transparent p-2 rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                        />
                        {searchTerm && (
                           <button
                              type='button'
                              onClick={() => {
                                 setSearchTerm("");
                                 if (onSearchSubmit) onSearchSubmit("");
                              }}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                           >
                              ✕
                           </button>
                        )}
                     </div>
                  ) : (
                     <Input
                        placeholder='Search...'
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(String(e.target.value))}
                        className='h-8 w-[150px] lg:w-[250px] transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] border-transparent p-2 rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)]'
                     />
                  )}
               </div>
               <div className='flex items-center space-x-2'>
                  <p className='text-sm text-muted-foreground'>
                     {selectedIds
                        ? `${selectedIds.size} selected`
                        : `${table.getSelectedRowModel().rows.length} of ${
                             table.getFilteredRowModel().rows.length
                          } row(s) selected.`}
                  </p>
               </div>
            </div>
         )}

         <div className='rounded-lg border'>
            <Table>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                           return (
                              <TableHead key={header.id}>
                                 {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                         header.column.columnDef.header,
                                         header.getContext()
                                      )}
                              </TableHead>
                           );
                        })}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {table.getRowModel().rows?.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow
                           key={row.id}
                           data-state={row.getIsSelected() && "selected"}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={columns.length}
                           className='h-24 text-center'
                        >
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination controls - only show if showPagination is true */}
         {showPagination && (
            <div className='flex items-center justify-end space-x-2 py-4'>
               <div className='flex items-center space-x-2'>
                  <p className='text-sm font-medium'>Rows per page</p>
                  <Select
                     value={`${table.getState().pagination.pageSize}`}
                     onValueChange={(value) => {
                        table.setPageSize(Number(value));
                     }}
                  >
                     <SelectTrigger className='h-8 w-[70px]'>
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                     </SelectTrigger>
                     <SelectContent side='top'>
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                           <SelectItem
                              key={pageSize}
                              value={`${pageSize}`}
                           >
                              {pageSize}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
               </div>
               <Button
                  variant='outline'
                  size='sm'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
               >
                  Previous
               </Button>
               <Button
                  variant='outline'
                  size='sm'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
               >
                  Next
               </Button>
            </div>
         )}
      </div>
   );
}
DataTable.propTypes = {
   columns: PropTypes.array,
   data: PropTypes.array,
   onRowSelection: PropTypes.func,
   showToolbar: PropTypes.bool,
   tableRef: PropTypes.object,
   showPagination: PropTypes.bool,
   externalSearch: PropTypes.bool,
   onSearchSubmit: PropTypes.func,
   selectedIds: PropTypes.instanceOf(Set),
   onSelectionChange: PropTypes.func,
   getRowId: PropTypes.func
};
