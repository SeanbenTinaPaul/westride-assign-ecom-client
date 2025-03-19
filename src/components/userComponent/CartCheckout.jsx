//parent → Cart.jsx
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { createCartUser } from "@/api/userAuth";
import useEcomStore from "@/store/ecom-store";
import { formatNumber } from "@/utilities/formatNumber";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/hooks/use-toast";

import { ListChecks, Trash2, Slack } from "lucide-react";

function CartCheckout({ isCollapsedContext }) {
   const {
      carts,
      fetchUserCart,
      adjustQuantity,
      removeCart,
      token,
      getProduct,
      updateStatusSaveToCart
   } = useEcomStore((state) => state);
   const [totalDiscount, setTotalDiscount] = useState(0);
   const [totalNet, setTotalNet] = useState(0);
   const [total, setTotal] = useState(0);
   const navigate = useNavigate();
   const { toast } = useToast();
   const [scrolledToBottom, setScrolledToBottom] = useState(false); //true→fully show | false→hide some part
   // const sidebarWidth = isCollapsedContext ? "6rem" : "16rem"; //for moving last <main>

   // console.log(user);
   // console.log("carts in ListCheckout", { carts });

   // Sync with products when carts or products change
   useEffect(() => {
      getProduct(1000, 1);
      fetchUserCart();
   }, []);

   //fetch products every '+' and '-' clicked
   const handleClickAddDelamount = () => {
      getProduct(1000, 1);
      // console.log("carts after click add", carts);
   };
   //check if scrolled to bottom
   useEffect(() => {
      const handleScroll = () => {
         //check if the user has reached the bottom of the page by calculating the distance from the top of the page to the bottom.
         //.innerHeight return the height of browser window area
         //.scrollY returns the number of pixels that the webpage has been scrolled vertically (distance from the top of the webpage to the current scroll position)
         //.scrollHeight returns the total height of HTML document, including any content that is not visible due to scrolling.
         const bottom =
            Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
         //if have reached the bottom, set a state scrolledToBottom to true.
         setScrolledToBottom(bottom);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      //return in useEffect() : Removing event listeners, Closing WebSockets or other network connections,Canceling timers or intervals,Releasing resources, such as file handles or database connections
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);
   //send req to backend
   const handleCreateCart = async () => {
      try {
         const res = await createCartUser(token, { carts });
         if (res.status === 202) {
            toast({
               title: "We're sorry!",
               description: `${res.data.message}`
            });
            return;
         }
         // console.log("res.data.cart", res.data.cart);
         // console.log("res.data.productOnCart", res.data.productOnCart);
         updateStatusSaveToCart(true);
         if (res.data.success) {
            navigate("/user/payment");
         } else {
            console.log("error", res.data.message);
            toast({
               variant: "destructive",
               title: "error",
               description: "Adding to cart Not success"
            });
         }
      } catch (err) {
         console.log(err);
      }
   };
   // Safe discount amount getter
   const getDiscountAmount = (cart) => {
      //check if isAtive === true (not expired)
      //isAtive === true → can use discount
      let today = new Date();
      let startDate = new Date(cart?.discounts?.[0]?.startDate);
      let endDate = new Date(cart?.discounts?.[0]?.endDate);
      if (cart?.discounts?.[0]?.isActive && today < endDate && today >= startDate) {
         // console.log("carts?.discounts?.[0]?.amount", cart?.discounts?.[0]?.amount);
         return cart?.discounts?.[0]?.amount;
      }
      return null;
   };
   //move howMuchDiscount out of useEffect() and carts.forEach((cart) =>{..}) to prevent infinite render
   const howMuchDiscount = useCallback((cart) => {
      const discountAmount = getDiscountAmount(cart);
      const price = cart.price * cart.countCart;

      if (cart?.promotion > discountAmount) {
         return price * (cart.promotion / 100);
      } else if (cart?.promotion < discountAmount) {
         return price * (discountAmount / 100);
      }
      return 0;
   }, []); // Empty dependency array since getDiscountAmount is stable

   // Calculate discounts whenever carts update
   useEffect(() => {
      let totalDisc = 0;
      let total = 0;
      let totalNet = 0;

      carts.forEach((cart) => {
         let discAmount = howMuchDiscount(cart);
         totalDisc += discAmount;
         total += cart.price * cart.countCart;
         totalNet += cart.price * cart.countCart - discAmount;
      });

      setTotalDiscount(totalDisc);
      setTotal(total);
      setTotalNet(totalNet);
   }, [carts, howMuchDiscount]);

   //cal promotion va discount price | หาเฉพาะจำนวนที่ไม่ต้องจ่าย

   //cal percent discount for badge
   const renderPercentDiscount = (cart) => {
      const discountAmount = getDiscountAmount(cart);
      if (cart?.promotion && discountAmount) {
         //  console.log("pro vs dis", cart?.promotion ,discountAmount );
         return Math.max(cart?.promotion, discountAmount);
      } else if (cart?.promotion) {
         // console.log("carts.promotion", cart?.promotion);
         return cart?.promotion;
      } else if (discountAmount) {
         // console.log("discountAmount", discountAmount);
         return discountAmount;
      }
      return null;
   };

   const handleRmCart = (prodId) => {
      removeCart(prodId);
   };

   return (
      // max-[1286px]:pb-[calc(100vh-25rem)] max-[1504px]:pb-[calc(100vh-20rem)] max-[1920px]:pb-[calc(100vh-25rem)]
      <div className='flex flex-col min-h-screen relative ml-14 pb-[calc(100vh-40rem)] max-md:pb-[calc(100vh-20rem)] max-lg:pb-[calc(100vh-25rem)] max-xl:pb-[calc(100vh-25rem)] max-2xl:pb-[calc(100vh-25rem)] max-[1920px]:pb-[calc(100vh-25rem)]'>
         {/* header */}
         <div className='flex p-4 mt-6 mb-4 bg-gradient-to-r from-slate-700 to-slate-500 gap-2 items-center rounded-xl shadow-md'>
            <ListChecks
               size={24}
               className='text-card'
            />
            <p className='text-lg font-semibold text-card'>Product List: {carts.length}</p>
         </div>

         {/* list */}
         <main className='p-10 h-full rounded-xl shadow-md bg-gradient-to-r from-slate-100 to-card'>
            {/* left */}
            <div>
               {/* {console.log("carts in checkout->", carts)} */}
               {carts.map((cart) => (
                  <div
                     key={cart.id}
                     className='bg-card p-3 mb-2 rounded-xl shadow-md '
                  >
                     {/* row 1 : img + title+ desc+badge+trash*/}
                     <article className='flex justify-between mb-2 items-start '>
                        {/*  left :img + title+ desc+badge*/}
                        <div className='flex gap-2 items-start w-full '>
                           <section className=' relative w-28 h-28 flex-shrink-0  text-center items-center aspect-square  object-cover border-2 border-white bg-gray-300 rounded-md overflow-hidden'>
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
                           <section className='flex flex-col justify-between w-3/4 h-28 mx-4'>
                              {(cart?.promotion || getDiscountAmount(cart)) && (
                                 <div>
                                    <Badge className='bg-red-500 px-1'>
                                       -{renderPercentDiscount(cart)}%
                                    </Badge>
                                 </div>
                              )}
                              <div className='border-b ml-1'>
                                 <p className='font-medium text-sm whitespace-normal break-words'>
                                    {cart.title}
                                 </p>
                                 <p className='text-xs whitespace-normal break-words'>
                                    {/* {cart.description} */}
                                 </p>
                              </div>
                              <div className='flex justify-start items-start gap-2 mb-4'>
                                 <Badge className='py-0 px-0 w-10 h-6 bg-card flex items-center drop-shadow'>
                                    {cart.brand?.img_url ? (
                                       <img
                                          src={cart.brand?.img_url}
                                          alt=''
                                          className='w-full h-full rounded-md mx-auto object-center object-contain'
                                          title={
                                             cart.brand?.title === "AMD"
                                                ? "ใครไม่ D ?"
                                                : cart.brand?.title
                                          }
                                       />
                                    ) : (
                                       <Slack className='w-5 h-5 mx-auto fill-current text-slate-500 font-thin' />
                                    )}
                                    {/* <p className='text-sm text-gray-500 max-lg:text-xs'>Brand title</p> */}
                                 </Badge>
                                 <p className='text-base font-light text-gray-500 '>
                                    {cart.brand?.title == "No brand"
                                       ? "Exclusive Selection"
                                       : cart.brand?.title}
                                 </p>
                              </div>
                              {cart?.preferDiscount ? (
                                 <div className='mt-2'>
                                    <p className='font-normal text-sm text-gray-500 line-through'>
                                       ฿{formatNumber(cart.price)}
                                    </p>
                                    <p className='font-normal text-base '>
                                       ฿{formatNumber(cart.buyPriceNum)}
                                    </p>
                                 </div>
                              ) : (
                                 <p className='font-normal text-base mb-2'>
                                    ฿{formatNumber(cart.price)}
                                 </p>
                              )}
                           </section>
                        </div>
                        {/* right : trash*/}
                        <div
                           onClick={() => handleRmCart(cart.id)}
                           className='cursor-pointer'
                        >
                           <Trash2 className='w-4 drop-shadow-md hover:text-rose-500 hover:scale-125 transition duration-300' />
                        </div>
                     </article>
                     {/* row 2: quantity + price */}
                     <div className='flex justify-between items-center '>
                        {/* LEFT:quantity */}
                        <div className='flex items-center space-x-4'>
                           <section className='border px-2 py-1 p-2 rounded-xl Input-3Dshadow'>
                              <button
                                 onClick={() => {
                                    adjustQuantity(cart.id, cart.countCart - 1);
                                    handleClickAddDelamount();
                                 }}
                                 className='px-3 w-8 h-8 rounded-xl Btn-3Dshadow'
                              >
                                 -
                              </button>
                              <span className='px-4 font-light text-xs'>{cart.countCart}</span>
                              <button
                                 disabled={cart.countCart >= cart.quantity}
                                 onClick={() => {
                                    adjustQuantity(cart.id, cart.countCart + 1);
                                    handleClickAddDelamount();
                                 }}
                                 className='px-3 w-8 h-8 rounded-xl Btn-3Dshadow'
                              >
                                 +
                              </button>
                           </section>
                           <p className='font-light text-xs text-gray-500'>
                              In stock: {cart.quantity - cart.countCart}
                           </p>
                        </div>
                        {/* RIGHT: price */}
                        {/* {console.log("cart buyPriceNum", cart)} */}
                        <section className='font-medium text-base text-fuchsia-900'>
                           ฿{formatNumber(cart.buyPriceNum * cart.countCart)}
                        </section>
                     </div>
                  </div>
               ))}
            </div>
         </main>
         {/* rigt :total net price*/}
         {/* w-full overflow-hidden transition-all duration-300 shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.1)] border-transparent p-2 rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-transparent hover:shadow-[inset_0_2px_6px_0_rgba(0,0,0,0.15)] */}
         <main
            className={`
               fixed bottom-0 ${isCollapsedContext ? "left-24" : "left-64"} right-4 
               bg-white/80 backdrop-blur-md transition-all duration-500 ease-in-out 
               shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
               p-4 rounded-t-xl transform
               ${scrolledToBottom ? "translate-y-0" : "translate-y-10 hover:translate-y-0"}
            `}
         >
            {carts.length > 0 && (
               <article className='w-full p-2 rounded-xl Input-3Dshadow'>
                  {/* className="bg-card p-2 mb-2 rounded-md shadow-md" */}
                  <section className='flex justify-between p-2 mb-2 '>
                     <p>Total</p>
                     <p>฿{formatNumber(total)}</p>
                  </section>
                  <section className='flex justify-between  p-2 mb-2  '>
                     <p>Discounts</p>
                     <p>-฿{formatNumber(totalDiscount)}</p>
                  </section>
                  <section className='flex justify-between  p-2 mb-2  '>
                     <p>Net Price</p>
                     <p>฿{formatNumber(totalNet)}</p>
                  </section>
               </article>
            )}
            {/* className='px-3 w-8 h-8 bg-gradient-to-b from-card to-gray-100 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),0_4px_6px_rgba(0,0,0,0.15)] hover:from-gray-300 hover:to-gray-400 hover:shadow-[inset_0_-1px_2px_rgba(0,0,0,0.15),0_6px_8px_rgba(0,0,0,0.2)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5 transition-all duration-500' */}
            <Link>
               <Button
                  variant='primary'
                  className='w-full mt-4 text-white py-2 shadow-md rounded-xl Btn-gradientFuchsia'
                  disabled={carts.length === 0}
                  onClick={handleCreateCart}
               >
                  Checkout
               </Button>
            </Link>
            <Link to={"/user/shop"}>
               <Button
                  variant='secondary'
                  type='button'
                  className='w-full mt-4  py-2 shadow-md rounded-xl bg-slate-50'
               >
                  Continue Shopping
               </Button>
            </Link>
         </main>
      </div>
   );
}

CartCheckout.propTypes = {
   isCollapsedContext: PropTypes.bool
};

export default CartCheckout;
