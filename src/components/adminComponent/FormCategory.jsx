//for building category form ►►► to import to CategoryAdmin.jsx ('/admin/category')
import React, { useState, useEffect } from "react";
//component UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/hooks/use-toast";
//api
import { createCategory, removeCategory, updateCategory } from "../../api/CategoryAuth";
//Global state
import useEcomStore from "../../store/ecom-store";
//icons
import {
   PackagePlus,
   FileText,
   Trash2,
   AlertCircle,
   Pencil,
} from "lucide-react";

function FormCategory() {
   const token = useEcomStore((state) => state.token);

   const [name, setName] = useState("");
   const [isEdit, setIsEdit] = useState(false);
   const [editingCategory, setEditingCategory] = useState(null);

   const categories = useEcomStore((state) => state.categories);
   const getCategory = useEcomStore((state) => state.getCategory);
   const { toast } = useToast();
   const [alert, setAlert] = useState(null);
   const [showDialog, setShowDialog] = useState(false); //for delete confirm
   const [showUpdateDialog, setShowUpdateDialog] = useState(false); //for update confirm
   const [categoryToRemove, setCategoryToRemove] = useState({});

   useEffect(() => {
      getCategory().then((result) => {
         // console.log("category->", result);
      });
   }, [getCategory]);

   //add single category Btn
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!name || name.trim() === "") {
         setAlert(
            <Alert variant='destructive'>
               <AlertCircle className='h-4 w-4' />
               <AlertTitle>Warning!</AlertTitle>
               <AlertDescription>Please enter a category name.</AlertDescription>
            </Alert>
         );
         setTimeout(() => {
            setAlert(null);
         }, 3000);
         return;
      }

      try {
         const res = await createCategory(token, { name });

         toast({
            title: "Add Category Success!",
            description: `Category: ${res.data.name}`
         });

         getCategory();
         setName("");
         setAlert(null);
      } catch (err) {
         console.log(err);
      }
   };

   // ----------- Edit a category ------------
   const handleEdit = (id, categoryName) => {
      setIsEdit(true);
      setEditingCategory({ id, name: categoryName });
      setName(categoryName);
      //auto scroll to top when click edit
      setTimeout(() => {
         window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
   };

   const handleUpdate = () => {
      if (!name || name.trim() === "") {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Please enter a category name."
         });
         return;
      }
      setShowUpdateDialog(true);
   };

   const confirmUpdate = async () => {
      try {
         const res = await updateCategory(token, editingCategory.id, { name: name.trim() });
         
         if (res.data.success) {
            toast({
               title: "Update Success!",
               description: `Category updated to: ${res.data.data.name}`
            });
            getCategory();
            handleCancel();
         }
         setShowUpdateDialog(false);
      } catch (err) {
         console.log(err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update category"
         });
      }
   };

   // ----------- Remove a category ------------
   const handleRemove = (id, categoryName) => {
      setCategoryToRemove({ ...categoryToRemove, id, name: categoryName });
      setShowDialog(true);
   };

   const confirmRemove = async () => {
      try {
         await removeCategory(token, categoryToRemove.id);
         toast({
            title: "You've removed category!",
            description: `ID: ${categoryToRemove.id} Category: ${categoryToRemove.name}`
         });
         getCategory();
         setShowDialog(false);
         setCategoryToRemove(null);
      } catch (err) {
         console.log(err);
      }
   };

   // ----------- Cancel edit mode ------------
   const handleCancel = () => {
      setIsEdit(false);
      setEditingCategory(null);
      setName("");
   };

   return (
      <div>
         <div className='w-full space-y-6 max-w-3xl  '>
            <Card className='w-full max-w-3xl rounded-xl bg-gradient-to-tr from-slate-50 to-card'>
               <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                     <PackagePlus className='w-5 h-5' />
                     {isEdit ? "Edit Category" : "Category register"}
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className='mb-4'>{alert}</div>
                  <form
                     onSubmit={isEdit ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}
                     className='flex gap-4'
                  >
                     <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder='Enter a category name'
                        className='w-full p-2 rounded-xl Input-3Dshadow'
                     />
                     {isEdit ? (
                        <div className='flex gap-2'>
                           <Button
                              type='submit'
                              className='bg-amber-600 hover:bg-amber-500 rounded-xl transition-all duration-300 ease-in-out'
                           >
                              Update
                           </Button>
                           <Button
                              type='button'
                              variant='outline'
                              onClick={handleCancel}
                              className='rounded-xl'
                           >
                              Cancel
                           </Button>
                        </div>
                     ) : (
                        <Button
                           type='submit'
                           className=' hover:bg-slate-500 rounded-xl transition-all duration-300 ease-in-out'
                        >
                           Add Category
                        </Button>
                     )}
                  </form>
               </CardContent>
            </Card>
            <Card className='w-full max-w-3xl rounded-xl bg-gradient-to-tr from-slate-50 to-card'>
               <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                     <FileText className='w-4 h-4' />
                     Categories List
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className='relative overflow-x-auto'>
                     <table className='w-full text-sm text-left'>
                        <thead className='text-xs  bg-gray-50'>
                           <tr>
                              <th className='px-6 py-3'>ID</th>
                              <th className='px-6 py-3'>Category Title</th>
                              <th className='px-6 py-3 text-right'>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {categories.map((item) => (
                              <tr
                                 key={item.id}
                                 className={`border-b hover:bg-gray-50 ${
                                    editingCategory?.id === item.id ? 'bg-amber-50' : 'bg-white'
                                 }`}
                              >
                                 <td className='px-6 py-4'>{item.id}</td>
                                 <td className='px-6 py-4'>{item.name}</td>
                                 <td className='px-6 py-4 text-right'>
                                    <Button
                                       variant='ghost'
                                       size='icon'
                                       onClick={() => handleEdit(item.id, item.name)}
                                       className='hover:text-amber-600 hover:scale-125 transition-all duration-300 ease-in-out mr-2'
                                    >
                                       <Pencil className='w-4 h-4' />
                                    </Button>
                                    <Button
                                       variant='ghost'
                                       size='icon'
                                       onClick={() => handleRemove(item.id, item.name)}
                                       className='hover:text-rose-700 hover:scale-125 transition-all duration-300 ease-in-out'
                                    >
                                       <Trash2 className='w-4 h-4' />
                                    </Button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     {/* Delete Confirm Dialog */}
                     <AlertDialog
                        open={showDialog}
                        onOpenChange={setShowDialog}
                     >
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                 <div>
                                    This action <strong>cannot be undone</strong>. This will{" "}
                                    <strong>permanently</strong> delete your category and remove its{" "}
                                    <strong>related products</strong> from our servers.
                                 </div>
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel onClick={confirmRemove}>
                                 Yes, delete
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => setShowDialog(false)}>
                                 Cancel, keep it
                              </AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                     {/* Update Confirm Dialog */}
                     <AlertDialog
                        open={showUpdateDialog}
                        onOpenChange={setShowUpdateDialog}
                     >
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Update</AlertDialogTitle>
                              <AlertDialogDescription>
                                 <div>
                                    Update category from "<strong>{editingCategory?.name}</strong>" to "<strong>{name}</strong>"?
                                 </div>
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel onClick={confirmUpdate}>
                                 Yes, update
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => setShowUpdateDialog(false)}>
                                 Cancel
                              </AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

export default FormCategory;
