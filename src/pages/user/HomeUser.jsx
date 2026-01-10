import React, { useEffect } from "react";
import BestSeller from "@/components/homeComponents/BestSeller";
import CarouselBanner from "@/components/homeComponents/CarouselBanner";
import FlashSaleProd from "@/components/homeComponents/FlashSaleProd";
import NewProd from "@/components/homeComponents/NewProd";
import UserFavprod from "@/components/homeComponents/UserFavprod";
import useEcomStore from "@/store/ecom-store";

const HomeUser = () => {
   const { fetchUserCart } = useEcomStore((state) => state);

   useEffect(() => {
      fetchUserCart();
   }, []);
   return (
      <div className=' flex flex-col items-center'>
         <CarouselBanner />

         <FlashSaleProd />

         <BestSeller />

         <NewProd />

         <UserFavprod />
      </div>
   );
};

export default HomeUser;
