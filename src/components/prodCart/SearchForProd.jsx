//parent → Shop.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

//Global state
import useEcomStore from "@/store/ecom-store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Boxes, DollarSign, BadgeCheck, Award, Bitcoin } from "lucide-react";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { formatNumber } from "@/utilities/formatNumber";
//---------------------------------------------------------------------------
let seachBody = {
   query: "",
   category: [],
   brand: [],
   price: []
};

function SearchForProd({ setIsFoundSearch, setWhatTextSearch }) {
   const {
      token,
      products,
      getProduct,
      getSeachFilterProd,
      getCategory,
      categories,
      brands,
      getBrand
   } = useEcomStore((state) => state);
   const [textSearch, setTextSearch] = useState(""); //for text search
   const [selectedCate, setSelectedCate] = useState([]); // Track selected category IDs
   const [selectedBrand, setSelectedBrand] = useState([]); // Track selected brand IDs
   const [priceRange, setPriceRange] = useState([0, 50000]); // for price range slider
   const [resetKey, setResetKey] = useState(0); //to reset key of <Slider/> in order to force Slider re-render, then reset the range bar
   const [searchTerms, setSearchTerms] = useState(seachBody);
   //console.log(textSearch);
   useEffect(() => {
      getCategory();
      getProduct(100, 1);
      getBrand();
   }, []);
   //1. search by text
   //req.body → { "query": "core" }
   const handleSearchText = (e) => {
      e.preventDefault();
      const txt = e.target.value;
      setTextSearch(txt); // use to assign to value={} of <input/>
      // setWhatTextSearch(txt.trim());
      // console.log(txt.trim());

      if (txt.trim()) {
         setSearchTerms((prev) => ({ ...prev, query: txt.trim() }));
      } else {
         setSearchTerms((prev) => ({ ...prev, query: "" }));
         setWhatTextSearch("");
      }
   };

   //2. search by category
   //req.body → { "category": [1, 2] }
   const handleCheckCate = (e) => {
      const cateId = parseInt(e.target.value); //value='' of <input/>
      const isChecked = e.target.checked; //true or false
      let updateCate = []; //reset every click at checkbox
      // console.log(cateId);

      if (isChecked) {
         updateCate = [...selectedCate, cateId];
         //not use {...prev, "category": selectedCate} bc selectedCate will be updated nxet render
         setSearchTerms((prev) => ({ ...prev, category: updateCate }));
      } else {
         //ถ้า unchecked → เอาเลข id นั้นมา filter ออกจาก [] ที่ใช้เก็บเลข id ตั้งแต่ render รอบก่อน
         updateCate = selectedCate.filter((id) => id !== cateId);
         setSearchTerms((prev) => ({ ...prev, category: updateCate }));
      }
      //to decide if display a symbol cheked or unchecked
      setSelectedCate(updateCate);
   };

   const handleCheckBrand = (e) => {
      const brandId = parseInt(e.target.value); //value='' of <input/>
      const isChecked = e.target.checked; //true or false
      let updateBrand = []; //reset every click at checkbox
      // console.log(cateId);

      if (isChecked) {
         updateBrand = [...selectedBrand, brandId];
         //not use {...prev, "category": selectedCate} bc selectedCate will be updated nxet render
         setSearchTerms((prev) => ({ ...prev, brand: updateBrand }));
      } else {
         //ถ้า unchecked → เอาเลข id นั้นมา filter ออกจาก [] ที่ใช้เก็บเลข id ตั้งแต่ render รอบก่อน
         updateBrand = selectedBrand.filter((id) => id !== brandId);
         setSearchTerms((prev) => ({ ...prev, brand: updateBrand }));
      }
      //to decide if display a symbol cheked or unchecked
      setSelectedBrand(updateBrand);
   };

   //3. search by price
   //req.body → { "price": [100, 600] }

   const handlePriceChange = (values) => {
      // console.log(values);
      setPriceRange(values);
      setSearchTerms((prev) => ({ ...prev, price: values }));
   };

   //4. req to backend
   const handleSumitSearch = async (e) => {
      e.preventDefault();
      console.log(searchTerms);
      try {
         //if no search input → just display all products
         //empty str is false, empty arr is true
         if (
            !searchTerms.query &&
            searchTerms.category.length === 0 &&
            searchTerms.brand.length === 0
         ) {
            getProduct(100, 1);
            setIsFoundSearch(true);
         }

         const result = await getSeachFilterProd(searchTerms);
         console.log("Search result", result);
         //check if prod were found
         if (result?.data?.length === 0) {
            //not found→ display all prod instead
            setIsFoundSearch(false);
            getProduct(100, 1);
            setWhatTextSearch(searchTerms.query);
         } else {
            //found
            setIsFoundSearch(true);
         }
      } catch (err) {
         console.error("Search error:", err);
         setIsFoundSearch(false);
      }
   };

   //reset search to default
   const handleReset = async () => {
      // Reset all form states
      setTextSearch("");
      setSelectedCate([]);
      setSelectedBrand([]);
      setSearchTerms({
         query: "",
         category: [],
         brand: [],
         price: []
      });
      setWhatTextSearch("");
      setPriceRange([0, 50000]);
      setResetKey((prev) => prev + 1); // Increment key to force re-render → ..just found not re-render issue

      // Reset search results by fetching all products
      try {
         await getProduct(100, 1);
         setIsFoundSearch(true);
      } catch (err) {
         console.error("Reset error:", err);
      }
   };

   return (
      <div className='h-full w-full p-4 rounded-xl bg-gradient-to-tr from-card to-slate-100 overflow-auto scrollbar-none'>
         <form
            onSubmit={(e) => handleSumitSearch(e)}
            className='flex flex-col gap-2 '
         >
            <input
               type='text'
               value={textSearch}
               onChange={(e) => handleSearchText(e)}
               placeholder='e.g. ขาหมู, core i7'
               className='w-full mb-4 bg-gradient-to-tr from-card to-slate-100 p-2 rounded-xl Input-3Dshadow'
            />
            <div className='mb-4'>
               {/* {console.log('categories search',categories)} */}
               <div className='flex gap-2 items-center mb-2'>
                  <BadgeCheck
                     size={20}
                     className='text-slate-700'
                  />
                  <h1 className='text-lg font-semibold text-slate-700'>Brand</h1>
               </div>
               <div>
                  {brands.map((obj) => (
                     <div
                        key={obj.id}
                        className='flex gap-2 items-center'
                     >
                        {/* <input
                           type='checkbox'
                           value={obj.id}
                           checked={selectedCate.includes(obj.id)}
                           onChange={(e) => handleCheckCate(e)}
                        /> */}
                        <Checkbox
                           className='w-4 h-4 bg-white border border-gray-300 rounded-sm'
                           id={`brand-${obj.id}`}
                           checked={selectedBrand.includes(obj.id)}
                           onCheckedChange={(checked) => {
                              handleCheckBrand({
                                 target: {
                                    value: obj.id,
                                    checked: checked
                                 }
                              });
                           }}
                        />
                        <label>{obj.title == 'No brand' ? 'Exclusive Selection' : obj.title}</label>
                     </div>
                  ))}
               </div>
            </div>
            <div className='mb-4'>
               {/* {console.log('categories search',categories)} */}
               <div className='flex gap-2 items-center mb-2'>
                  <Boxes
                     size={20}
                     className='text-slate-700'
                  />
                  <h1 className='text-lg font-semibold text-slate-700'>Category</h1>
               </div>
               <div>
                  {categories.map(
                     (obj) =>
                        obj.name !== "Banner(not for sale)" &&
                        obj.id !== 38 && (
                           <div
                              key={obj.id}
                              className='flex gap-2 items-center'
                           >
                              {/* <input
                           type='checkbox'
                           value={obj.id}
                           checked={selectedCate.includes(obj.id)}
                           onChange={(e) => handleCheckCate(e)}
                        /> */}
                              <Checkbox
                                 className='w-4 h-4 bg-white border border-gray-300 rounded-sm'
                                 id={`category-${obj.id}`}
                                 checked={selectedCate.includes(obj.id)}
                                 onCheckedChange={(checked) => {
                                    handleCheckCate({
                                       target: {
                                          value: obj.id,
                                          checked: checked
                                       }
                                    });
                                 }}
                              />
                              <label>{obj.name}</label>
                           </div>
                        )
                  )}
               </div>
            </div>
            <div>
               {/* Price range */}
               <div className='flex gap-2 items-center mb-2'>
                  <Bitcoin
                     size={20}
                     className='text-slate-700'
                  />
                  <h1 className='text-lg font-semibold text-slate-700'>Price</h1>
               </div>
               <div>
                  <div className='flex justify-between '>
                     <span className='text-xs'>{formatNumber(priceRange[0])}</span>
                     <span className='text-xs'>{formatNumber(priceRange[1])}</span>
                  </div>
                  <Slider
                     key={resetKey}
                     range //e.target.value is []
                     min={0}
                     max={100000}
                     step={100}
                     defaultValue={priceRange}
                     onChange={handlePriceChange}
                     className='w-full mt-2 bg-f'
                     // Add trackStyle and handleStyle props
                     trackStyle={{ backgroundColor: "#701a75" }} // Purple color for the track
                     railStyle={{ backgroundColor: "transparent" }} // Gray color for the rail
                     handleStyle={[
                        // Style for the handles
                        {
                           backgroundColor: "#701a75",
                           borderColor: "#9ca3af"
                        },
                        {
                           backgroundColor: "#701a75",
                           borderColor: "#9ca3af"
                        }
                     ]}
                  />
               </div>
            </div>
            <Button
               type='submit'
               className='hover:bg-slate-500 w-full rounded-xl shadow-md transition-all duration-300'
            >
               Search
            </Button>
            <Button
               variant='secondary'
               type='button'
               onClick={handleReset}
               className='w-full mb-4 shadow-md rounded-xl bg-slate-50'
            >
               Reset
            </Button>
         </form>
      </div>
   );
}

SearchForProd.propTypes = {
   setIsFoundSearch: PropTypes.func,
   setWhatTextSearch: PropTypes.func
   // isFoundTextSearch: PropTypes.bool
};

export default SearchForProd;
