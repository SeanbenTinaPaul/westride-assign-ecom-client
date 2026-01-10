//parent → ShopUser.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatNumber } from "@/utilities/formatNumber";
import { getPercentDiscount, calculateDiscount } from "@/utilities/discountHelper";
import { getFlashSaleInfo, formatFlashSaleDate, calculateCountdown, formatCountdown } from "@/utilities/flashSaleHelper";
//component ui
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
//icons
import { Heart, ShoppingCart, Star, StarHalf, Slack, Flame, Zap } from "lucide-react";
import useEcomStore from "@/store/ecom-store";

import { motion } from "motion/react";
import { toggleFavoriteUser } from "@/api/userAuth";
import { useToast } from "@/components/hooks/use-toast";

//-------------------------------------------------------------------

function CardProd({ prodObj }) {
   const { addToCart, user, token, synCartwithProducts } = useEcomStore(
      (state) => state
   ); //getProduct from DB → set to carts in LocalStorage
   const [isFavorite, setIsFavorite] = useState(false);
   //to save price after discount + promotion → for further Checkout
   const [productData, setProductData] = useState(prodObj);
   const { toast } = useToast();

   //click heart or not
   const handleFavorite = async () => {
      if (!user || !token) return;
      setIsFavorite(!isFavorite);
      const res = await toggleFavoriteUser(token, prodObj.id);
      // SSE: Favorite toggle ไม่ต้อง refresh products - local state จัดการ UI update
      if (!res.data.success) {
         setIsFavorite((prevState) => !prevState); //set back to previous state if error
         toast({
            title: "Warning!",
            description: res.data.message
         });
      }
   };
   const setFav = useCallback(() => {
      if (!user || !token) return;
      const favorites = prodObj.favorites;
      // console.log("favorites", favorites);
      for (const favObj of favorites) {
         favObj?.userId == user.id && prodObj.id == favObj?.productId
            ? setIsFavorite(true)
            : setIsFavorite(false);
      }
   }, [isFavorite]);
   //render star
   const renderStar = (rate) => {
      const stars = [];
      const totalStars = 5;

      for (let i = 1; i <= totalStars; i++) {
         if (i <= rate || i - rate <= 0.21) {
            //full yellow star || if x.8 or x.9 → full yellow
            //fill bg only in svg area ► fill-current text-*-*
            stars.push(
               <Star
                  key={`full-star-${i}`}
                  className='w-4 h-4 fill-current text-yellow-500 max-lg:w-3 max-lg:h-3'
               />
            );
         } else if (i - 0.5 <= rate) {
            //half yellow star
            stars.push(
               <div
                  key={`half-star-container-${i}`}
                  className='relative'
               >
                  <Star className='w-4 h-4 fill-current text-gray-300 max-lg:w-3 max-lg:h-3' />
                  <StarHalf
                     key={`half-star-${i}`} // Already has unique key
                     className='absolute top-0 left-0 w-4 h-4 fill-current text-yellow-500 max-lg:w-3 max-lg:h-3'
                  />
               </div>
            );
         } else {
            //full grey star
            stars.push(
               <Star
                  key={`empty-star-${i}`}
                  className='w-4 h-4 fill-current text-gray-300 max-lg:w-3 max-lg:h-3'
               />
            );
         }
      }
      return stars;
   };

   // ใช้ buyPriceNum และ preferDiscount จาก backend (prodObj) หรือ fallback จาก utility function
   useEffect(() => {
      // ถ้า backend ส่งค่ามาแล้ว ใช้ค่าจาก prodObj โดยตรง
      //this code will decide NaN or number in CartInfo.jsx + CartCheckout.jsx
      if (prodObj?.buyPriceNum !== undefined) {
         setProductData((prev) => ({
            ...prev,
            ...prodObj,
            buyPrice: formatNumber(prodObj.buyPriceNum),
            buyPriceNum: prodObj.buyPriceNum,
            preferDiscount: prodObj.preferDiscount
         }));
      } else {
         // fallback: คำนวณเองจาก utility function
         const { buyPriceNum, preferDiscount } = calculateDiscount(prodObj);
         setProductData((prev) => ({
            ...prev,
            ...prodObj,
            buyPrice: formatNumber(buyPriceNum),
            buyPriceNum: buyPriceNum,
            preferDiscount: preferDiscount
         }));
      }
   }, [prodObj]);

   useEffect(() => {
      // useEffect() is designed to handle side effects, such as updating the global state, making API calls, or setting timers.
      // console.log("productData", productData)
      synCartwithProducts(productData);
      if (user && token) setFav();
   }, [prodObj, productData]);

   //cal promotion vs discount price (ใช้ค่าจาก productData ที่มี buyPriceNum แล้ว)
   const renderDiscountPrice = () => {
      return formatNumber(productData.buyPriceNum);
   };

   //cal percent discount for badge (ใช้ utility function)
   const renderPercentDiscount = () => {
      return getPercentDiscount(prodObj?.promotion, prodObj?.discounts);
   };

   // Flash Sale: ตรวจสอบสถานะและคำนวณ countdown (ใช้ useMemo เพื่อหลีกเลี่ยง infinite loop)
   const flashSaleInfo = useMemo(() => getFlashSaleInfo(prodObj?.discounts), [prodObj?.discounts]);
   const flashSaleStatus = flashSaleInfo?.status;
   const flashSaleEndDateStr = flashSaleInfo?.endDate?.toISOString?.() || null;
   
   // State สำหรับ countdown timer
   const [countdown, setCountdown] = useState(null);
   
   // Effect สำหรับ client-side countdown (ทุก 1 วินาที)
   useEffect(() => {
      if (flashSaleStatus !== "active" || !flashSaleEndDateStr) {
         setCountdown(null);
         return;
      }

      const endDate = new Date(flashSaleEndDateStr);
      
      // Initial countdown
      setCountdown(calculateCountdown(endDate));

      // Update ทุก 1 วินาที
      const interval = setInterval(() => {
         const newCountdown = calculateCountdown(endDate);
         setCountdown(newCountdown);
         
         // หยุด interval เมื่อหมดเวลา
         if (newCountdown.isExpired) {
            clearInterval(interval);
         }
      }, 1000);

      return () => clearInterval(interval);
   }, [flashSaleStatus, flashSaleEndDateStr]);

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{
            duration: 0.4,
            scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 }
         }}
      >
         <div>
            {/* {console.log("prodObj", prodObj)} */}
            {/* {console.log("productData", productData)} */}
            <Card className='lg:flex lg:flex-col w-36 h-52 lg:w-72 lg:h-[395px] bg-gradient-to-br from-card to-slate-100 relative lg:static overflow-hidden border-none'>
               {/* Product Image+fav+badge */}
               <div className='relative lg:h-52 h-28'>
                  <Link
                     to={
                        user && token
                           ? `/user/view-product/${prodObj.id}`
                           : `/view-product/${prodObj.id}`
                     }
                  >
                     <img
                        src={prodObj?.images?.[0]?.url || ""}
                        // Without optional chaining → prodObj.images[0].url ► NO '.' in front of [0]
                        alt='No image'
                        className='w-full h-full object-cover bg-gradient-to-tr from-slate-100 to-slate-200'
                     />
                  </Link>
                  {/* Flash Sale / Discount Badges */}
                  {flashSaleStatus === "pending" ? (
                     // Pending State: แสดง amber badges + วันที่เริ่ม + ??%
                     <>
                        <Badge className='absolute top-2 right-2 lg:top-3 lg:right-3 bg-amber-500 px-1 text-[10px] lg:text-xs flex items-center gap-1'>
                           <Zap className='w-3 h-3' />
                           {formatFlashSaleDate(flashSaleInfo?.startDate)}
                        </Badge>
                        <Badge className='absolute top-7 right-2 lg:top-9 lg:right-3 bg-amber-400 px-1 text-[10px] lg:text-xs'>
                           -??%
                        </Badge>
                        {/* ถ้ามี promotion อยู่แล้ว → แสดง promotion badge ด้านล่าง */}
                        {prodObj?.promotion && (
                           <Badge className='absolute top-12 right-2 lg:top-[60px] lg:right-3 bg-red-500 px-1 text-[10px] lg:text-xs'>
                              -{prodObj.promotion}%
                           </Badge>
                        )}
                     </>
                  ) : flashSaleStatus === "active" && countdown && !countdown.isExpired ? (
                     // Active State: แสดง countdown + ส่วนลดสูงสุด
                     <Badge className='absolute top-2 right-2 lg:top-3 lg:right-3 bg-red-500 px-1 text-[10px] lg:text-xs flex items-center gap-1'>
                        <Flame className='w-3 h-3' />
                        {formatCountdown(countdown)} -{renderPercentDiscount()}%
                     </Badge>
                  ) : (
                     // Expired/Normal State: แสดง promotion badge ตามเดิม (ถ้ามี)
                     renderPercentDiscount() && (
                        <Badge className='absolute top-2 right-2 lg:top-4 lg:right-4 bg-red-500 px-1'>
                           -{renderPercentDiscount()}%
                        </Badge>
                     )
                  )}
                  {/* fav btn */}
                  {user && (
                     <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleFavorite}
                        className={`absolute top-2 left-2 hover:bg-white/80`}
                     >
                        <Heart
                           className={`w-5 h-5  ${
                              isFavorite ? "text-red-500 fill-current" : "text-gray-500"
                           }`}
                        />
                     </Button>
                  )}
               </div>
               {/*title + description+ brand  */}
               <div className='flex flex-col flex-1 min-h-0 '>
                  {/* <div className="border-2 border-red-300  flex flex-col justify-between h-full"> */}
                  {/*className='space-y-1 px-4 py-2 max-lg:py-1 max-lg:px-2'  */}
                  <CardHeader className='lg:h-24 lg:px-4 lg:py-2 py-1 px-2 '>
                     {/* className='flex justify-between items-start' */}
                     <div className='flex justify-between items-start '>
                        <h3 className='lg:font-medium lg:text-sm text-xs truncate'>
                           {prodObj.title}
                        </h3>
                        <Badge className='py-0 px-0 -mb-1 w-8 h-5 lg:w-10 lg:h-6 bg-card flex items-center drop-shadow'>
                           {prodObj.brand?.img_url ? (
                              <img
                                 src={prodObj.brand?.img_url}
                                 alt=''
                                 className='w-full h-full rounded-md mx-auto object-center object-contain'
                                 title={
                                    prodObj.brand?.title === "AMD"
                                       ? "ใครไม่ D ?"
                                       : prodObj.brand?.title
                                 }
                              />
                           ) : (
                              <div
                                 className='mx-auto'
                                 title='Exclusive Selection'
                              >
                                 <Slack className='w-4 h-4 lg:w-5 lg:h-5 mx-auto fill-current text-slate-500 font-thin' />
                              </div>
                           )}
                           {/* <p className='text-sm text-gray-500 max-lg:text-xs'>Brand title</p> */}
                        </Badge>
                     </div>
                     <p className='text-sm text-gray-500 max-lg:hidden truncate'>
                        sold {prodObj.sold}
                     </p>
                  </CardHeader>

                  {/* price + discount + rating */}
                  <CardContent className=' mt-auto pb-2 lg:px-4 my-0 pt-0 px-2 ml-1 absolute lg:static top-[138px]'>
                     <div className='flex lg:space-x-2 h-[44px] flex-col space-x-1 space-y-1 items-start justify-end '>
                        {/* ราคาหลังหัก promotion (ใช้ค่าจาก productData) */}
                        <span className='lg:text-xl font-bold text-blue-600 text-sm'>
                           ฿
                           {renderPercentDiscount()
                              ? renderDiscountPrice()
                              : formatNumber(prodObj?.price)}
                        </span>
                        {/* ราคาจริง มีขีด line-through */}
                        <span className='lg:text-sm text-gray-500 line-through text-xs '>
                           {renderPercentDiscount() ? `฿${formatNumber(prodObj?.price)}` : ""}
                        </span>
                     </div>
                     <div className='mt-1 mb-0 flex items-center lg:space-x-1 space-x-0 top-[138px] left-2'>
                        {renderStar(prodObj.avgRating)}
                        <span
                           className={`lg:text-sm text-gray-500 ml-1 text-xs ${
                              prodObj.avgRating ? "" : "text-transparent"
                           }`}
                        >
                           {prodObj.avgRating?.toFixed(1) || 0}
                        </span>
                     </div>
                  </CardContent>
                  {/* </div> */}

                  {/* Add to cart BTN */}
                  <CardFooter className='px-4 mt-auto'>
                     {!user ? (
                        <Link
                           to='/login'
                           className='w-full'
                        >
                           <Button className='w-8 h-8 lg:w-full lg:rounded-xl absolute lg:static top-[168px] lg:top-0 right-2 lg:right-0 hover:bg-slate-500 '>
                              <ShoppingCart className='w-4 h-4 lg:mr-2 mr-0 ' />
                              <span className='inline max-lg:hidden'>Add to cart</span>
                           </Button>
                        </Link>
                     ) : (
                        <Button
                           onClick={() => addToCart(productData)}
                           className='w-full lg:rounded-xl max-lg:w-8 max-lg:h-8 max-lg:absolute max-lg:top-[168px] max-lg:right-2 hover:bg-slate-500'
                        >
                           <ShoppingCart className='w-4 h-4 lg:mr-2 mr-0' />
                           <span className='inline max-lg:hidden'>Add to cart</span>
                        </Button>
                     )}
                  </CardFooter>
               </div>
            </Card>
         </div>
      </motion.div>
   );
}

CardProd.propTypes = {
   rating: PropTypes.number,
   promotion: PropTypes.number,
   prodObj: PropTypes.object.isRequired
};

export default CardProd;
