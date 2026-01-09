//perent → Shop.jsx
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useEcomStore from "@/store/ecom-store";
import { formatNumber } from "@/utilities/formatNumber";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import { createCartUser } from "@/api/userAuth";
import { getPercentDiscount } from "@/utilities/discountHelper";

function CartInfo() {
   const { token, carts, adjustQuantity, removeCart, updateStatusSaveToCart } =
      useEcomStore((state) => state);
   //carts === [{ categoryId:, buyPriceNum:,countCart:,discounts:,promotion:, },{},..]  
   const { toast } = useToast();
   // SSE handles real-time updates - no need for getProduct on each click

   // คำนวณ percent discount สำหรับ badge (ใช้ utility function)
   const renderPercentDiscount = useCallback((cart) => {
      return getPercentDiscount(cart?.promotion, cart?.discounts);
   }, []);

   // คำนวณ total price จาก carts (ใช้ buyPriceNum ที่คำนวณจาก backend หรือ fallback)
   const toTalPrice = useCallback(() => {
      let total = 0;
      for (const cart of carts) {
         total += cart.buyPriceNum * cart.countCart;
      }
      return total;
   }, [carts]);

   // Calculate total price
   //    useEffect(() => {
   //       console.log("carts in CartInfo", carts);
   //       setTotalPrice(carts.reduce((acc, curr) => acc + curr.price * curr.countCart, 0));
   //    }, [carts]);

   const handleRmCart = (prodId) => {
      removeCart(prodId);
   };
   //send req to backend
   const handleCreateCart = async () => {
      try {
         //need req.body.carts: [{id, countCart, count, price, buyPriceNum, discount, productId},{..}]
         const res = await createCartUser(token, { carts: carts });
         // console.log("res.data.cart", res.data.cart);
         // console.log("res.data.productOnCart", res.data.productOnCart);
         if (res.status === 202) {
            toast({
               title: "We're sorry!",
               description: `${res.data.message}`
            });
            return;
         }
         if (res.data.success) {
            toast({
               title: "Your cart is now saved.",
               description: "Feel free to browse more or come back later to complete your purchase."
            });
         }
      } catch (err) {
         console.log(err);
         toast({
            variant: "destructive",
            title: "error",
            description: "Adding to cart Not success"
         });
      }
   };

   return (
      <div className='h-[90dvh] w-full bg-gradient-to-r from-card to-slate-100 p-4 rounded-xl shadow-md overflow-y-auto scrollbar-none'>
         {/* Border */}
         <main className=' bg-gradient-to-r from-card to-slate-100 p-2 rounded-lg Input-3Dshadow'>
            {/* card */}
            {carts.map((cart) => (
               <div
                  key={cart.id}
                  className='bg-card p-2 mb-2 rounded-md shadow-md '
               >
                  {/* row 1 : img + title+ desc+badge+trash*/}
                  <article className='flex justify-between mb-2 '>
                     {/*  left :img + title+ desc+badge*/}
                     <div className='flex gap-2 items-center  w-full'>
                        <section className=' relative flex-shrink-0  text-center items-center aspect-square w-16 h-16 object-cover border-2 border-white bg-gray-300 rounded-md overflow-hidden'>
                           {cart.images?.[0] ? (
                              <img
                                 src={cart.images?.[0]?.url}
                                 alt='no img'
                                 className='w-full h-full object-cover'
                              />
                           ) : (
                              "No image"
                           )}
                        </section>
                        {/* badge+title+desc */}
                        <section className='block w-3/4'>
                           {renderPercentDiscount(cart) && (
                              <Badge className='bg-red-500 px-1'>
                                 -{renderPercentDiscount(cart)}%
                              </Badge>
                           )}
                           <p className='font-medium text-sm whitespace-normal break-words'>
                              {cart.title}
                           </p>
                           {/* <p className='text-xs whitespace-normal break-words'>
                              {cart.description}
                           </p> */}
                        </section>
                     </div>
                     {/* right : trash*/}
                     <section
                        onClick={() => handleRmCart(cart.id)}
                        className='cursor-pointer'
                     >
                        <Trash2 className='w-4 drop-shadow-md hover:text-rose-500 hover:scale-125 transition duration-300' />
                     </section>
                  </article>
                  {/* row 2: quantity + price */}
                  <article className='flex justify-between items-center'>
                     {/* LEFT:quantity */}
                     <section className=' px-2 py-1 rounded-xl Input-3Dshadow'>
                        <button
                           onClick={() => {
                              adjustQuantity(cart.id, cart.countCart - 1);
                           }}
                           className='px-1 w-6 rounded-md Btn-3Dshadow'
                        >
                           -
                        </button>
                        <span className='px-4 font-light text-xs'>{cart.countCart}</span>
                        <button
                           disabled={cart.countCart >= cart.quantity}
                           onClick={() => {
                              adjustQuantity(cart.id, cart.countCart + 1);
                           }}
                           className='px-1 w-6 rounded-md Btn-3Dshadow'
                        >
                           +
                        </button>
                     </section>
                     {/* RIGHT: price */}
                     <section>
                        {cart.countCart >= cart.quantity && (
                           <p className='text-xs text-red-500'>level reached</p>
                        )}
                        <div className='font-normal text-sm text-fuchsia-900'>
                           ฿{formatNumber(cart.buyPriceNum * cart.countCart)}
                        </div>
                     </section>
                  </article>
               </div>
            ))}
            {/* Total */}
            <article className='flex justify-between px-2'>
               <span className='font-bold'>Total</span>
               <span className='font-bold '>฿{formatNumber(toTalPrice())}</span>
            </article>
            {/* btn */}
            {/* <Link to='/user/cart'> */}
            <Button
               disabled={carts.length === 0}
               onClick={() => {
                  updateStatusSaveToCart(true);
                  handleCreateCart();
               }}
               className='w-full mt-4 py-2 shadow-md rounded-xl Btn-gradientFuchsia'
            >
               Place Order
            </Button>
         </main>
      </div>
   );
}

export default CartInfo;
