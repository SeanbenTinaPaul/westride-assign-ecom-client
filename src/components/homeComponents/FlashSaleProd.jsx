//parent → Home.jsx, HomeUser.jsx
import React, { useState, useEffect } from "react";
import { listFlashSaleProducts } from "@/api/ProductAuth";
import CardProd from "@/components/prodCart/CardProd";
import { calculateCountdown } from "@/utilities/flashSaleHelper";
import { Flame, Zap } from "lucide-react";
import CarouselAuto from "@/utilities/CarouselAuto";
import { SwiperSlide } from "swiper/react";

function FlashSaleProd() {
   const [products, setProducts] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [hasFlashSale, setHasFlashSale] = useState(false);
   const [flashSaleEndDate, setFlashSaleEndDate] = useState(null);
   const [countdown, setCountdown] = useState(null);

   // Fetch flash sale products
   useEffect(() => {
      const fetchFlashSale = async () => {
         try {
            setIsLoading(true);
            const res = await listFlashSaleProducts();
            if (res.data.success) {
               setProducts(res.data.products || []);
               setHasFlashSale(res.data.hasFlashSale);
               setFlashSaleEndDate(res.data.flashSaleEndDate);
            }
         } catch (err) {
            console.error("Error fetching flash sale products:", err);
         } finally {
            setIsLoading(false);
         }
      };
      fetchFlashSale();
   }, []);

   // Countdown timer
   // แปลงเป็น string เพื่อหลีกเลี่ยง infinite loop (Date object จะสร้างใหม่ทุก render)
   const flashSaleEndDateStr = flashSaleEndDate ? new Date(flashSaleEndDate).toISOString() : null;
   
   useEffect(() => {
      if (!flashSaleEndDateStr) {
         setCountdown(null);
         return;
      }
      
      const endDate = new Date(flashSaleEndDateStr);
      setCountdown(calculateCountdown(endDate));
      
      const interval = setInterval(() => {
         const newCountdown = calculateCountdown(endDate);
         setCountdown(newCountdown);
         
         // Re-fetch เมื่อหมดเวลา เพื่ออัพเดทสถานะ
         if (newCountdown.isExpired) {
            clearInterval(interval);
            setHasFlashSale(false);
         }
      }, 1000);

      return () => clearInterval(interval);
   }, [flashSaleEndDateStr]);

   // จัดกลุ่ม products ตาม category
   const groupByCategory = (products) => {
      const groups = {};
      for (const product of products) {
         const categoryName = product.category?.name || "Other";
         const categoryId = product.category?.id || 0;
         if (!groups[categoryId]) {
            groups[categoryId] = {
               name: categoryName,
               products: []
            };
         }
         groups[categoryId].products.push(product);
      }
      return Object.values(groups);
   };

   // ไม่แสดงอะไรถ้าไม่มี flash sale หรือกำลังโหลด
   if (isLoading) return null;
   if (!hasFlashSale || products.length === 0) return null;

   const categoryGroups = groupByCategory(products);

   return (
      <section className='w-full mt-6 ml-4 py-6 px-4 rounded-xl shadow-md bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'>
         {/* Header */}
         <div className='flex flex-col md:flex-row items-center justify-between mb-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-lg'>
            <div className='flex items-center gap-3 text-white'>
               <Flame className='w-8 h-8 animate-pulse' />
               <h2 className='text-2xl md:text-3xl font-bold drop-shadow'>Flash Sale</h2>
            </div>
            {/* Countdown clock*/}
            {countdown && !countdown.isExpired && (
               <div className='flex items-center gap-2 mt-2 md:mt-0'>
                  <span className='text-white text-sm'>Ends in:</span>
                  <div className='flex gap-1'>
                     <div className='bg-white text-red-600 px-2 py-1 rounded font-bold text-lg'>
                        {String(countdown.days).padStart(2, "0")}
                     </div>
                     <span className='text-white text-xl'>:</span>
                     <div className='bg-white text-red-600 px-2 py-1 rounded font-bold text-lg'>
                        {String(countdown.hours).padStart(2, "0")}
                     </div>
                     <span className='text-white text-xl'>:</span>
                     <div className='bg-white text-red-600 px-2 py-1 rounded font-bold text-lg'>
                        {String(countdown.minutes).padStart(2, "0")}
                     </div>
                     <span className='text-white text-xl'>:</span>
                     <div className='bg-white text-red-600 px-2 py-1 rounded font-bold text-lg'>
                        {String(countdown.seconds).padStart(2, "0")}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Products by Category - ใช้ Carousel สำหรับแต่ละ category */}
         {categoryGroups.map((group, index) => (
            <div key={index} className='mb-8'>
               <div className='flex items-center gap-2 mb-4'>
                  <Zap className='w-5 h-5 text-amber-500 animate-pulse' />
                  <h3 className='text-lg font-semibold text-slate-700'>{group.name}</h3>
                  <span className='text-sm text-slate-500'>({group.products.length} items)</span>
               </div>
               <CarouselAuto maxlg_h={"52"} w={"90dvw"}>
                  {group.products.map((product) => (
                     <SwiperSlide key={product.id}>
                        <CardProd prodObj={product} />
                     </SwiperSlide>
                  ))}
               </CarouselAuto>
            </div>
         ))}
      </section>
   );
}

export default FlashSaleProd;
