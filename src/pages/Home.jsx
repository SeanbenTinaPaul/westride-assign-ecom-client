import React from "react";
import BestSeller from "@/components/homeComponents/BestSeller";
import CarouselBanner from "@/components/homeComponents/CarouselBanner";
import FlashSaleProd from "@/components/homeComponents/FlashSaleProd";
import NewProd from "@/components/homeComponents/NewProd";

const Home = () => {
   return (
      <div className=' flex flex-col items-center'>
         <CarouselBanner />

         <FlashSaleProd />

         <BestSeller />

         <NewProd />
      </div>
   );
};

export default Home;
