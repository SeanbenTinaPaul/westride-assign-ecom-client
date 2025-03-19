//ใช้แทน Redux ในการสร้าง Global State ► เรียกใช้งานได้ทั่วทั้ง workspace
import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware"; //ใช้เก็บข้อมูลที่ user กรอกลง inout ไว้ใน localStorage
import { listCategory } from "../api/CategoryAuth.jsx";
import { listProduct, seachFilterProd } from "../api/ProductAuth.jsx";
// import _, { update } from "lodash"; // for making unique el array
import { binarySearchProdId } from "@/utilities/binarySearch.js";
const apiUrl = import.meta.env.VITE_API_URL;
import { clearCartUser, getCartUser } from "@/api/userAuth.jsx";
import { listBrand } from "@/api/BrandAuth.jsx";

const ecomStore = (set, get) => ({
   user: null, //ตั้งค่า null ไว้รอ res.data ก่อน
   token: null,
   categories: [],
   products: [],
   brands: [],
   carts: [],
   isSaveToCart: false,
   savedCartCount: 0, //คอขวด carts.length
   showLogoutConfirm: false, // for Show confirmation if user go logout BUT cart not empty and not saved
   isLoggingOut: false, //to check logout attempt
   //to control logout confirmation dialog
   resetCartsAfterPurchas: (prodIdPaidArr) => {
      //keep carts[i].id that not in prodIdPaidArr
      set({ carts: get().carts.filter((obj) => !prodIdPaidArr.includes(obj.id)) });
   },
   updateStatusSaveToCart: (value) => {
      //ทำคอขวด ไม่ให้ Badge ใน SidebarUser.jsx เอาค่า carts.length ไปใช้ได้ง่ายๆจนกว่าจะกด "Place Order" ที่ CartInfo.jsx
      set({
         isSaveToCart: value,
         savedCartCount: get().carts.length //คอขวดคือ savedCartCount , อยากได้ carts.len มาเอาผ่าน state นี้
      });
   },
   
   synCartwithProducts: (productData) => {
      //productData ==={buyPrice, buyPriceNum, preferDiscount,...}
      // console.log("syncPrice And Disc", productData);
      const carts = get().carts;
      const products = get().products; //key man → fetch products from backend
      // updateCarts === products(fresh from DB) + carts(from localStorage)
      const updateCarts = carts.map((cartItem) => {
         //เอา p เพราะใหม่กว่า แต่เก็บ countCart ของเดิมไว้
         let latestProd = binarySearchProdId(products, cartItem.id);
         return latestProd
            ? {
                 ...latestProd,
                 countCart: cartItem.countCart,
                 buyPrice: cartItem.buyPrice,
                 buyPriceNum: cartItem.buyPriceNum,
                 preferDiscount: cartItem.preferDiscount
              }
            : cartItem;
      });
      //productData → 1 prod obj
      if (productData) {
         //หา obj ใน carts ที่มี id ตรงกับ productData.id(ที่ส่งเข้ามาแต่ละชิ้น)
         let existIndex = updateCarts.findIndex((cartItem) => cartItem.id === productData?.id);
         //ถ้ามี obj ที่มี id ตรงกัน ให้เปลี่ยนค่าใน carts ที่มี id ตรงกันนั้น
         if (existIndex !== -1) {
            updateCarts[existIndex] = {
               ...productData,
               countCart: updateCarts[existIndex].countCart,
               buyPrice: productData.buyPrice,
               buyPriceNum: productData.buyPriceNum,
               preferDiscount: productData.preferDiscount
            };
         }
      }
      //เปลี่ยนค่า carts ใน localStorage
      set({ carts: updateCarts });
      // console.log("syncPrice And Disc", productData);
      // console.log("updateCarts", updateCarts);
      // console.log("synCart with Products", carts);
   },
   fetchUserCart: async () => {
      const carts = get().carts;
      get().getProduct(100, 1);
      try {
         const res = await getCartUser(get().token);
         // console.clear();
         console.log("cart now", carts);
         console.log("fetchUserCart", res.data);
         if (res.data.ProductOnCart?.length > 0 || res.data.success) {
            if (carts.length === 0) {
               const editKeyProdArr = res.data.ProductOnCart.map((prod) => {
                  return {
                     ...prod.product,
                     id: prod.productId,
                     countCart: prod.count,
                     preferDiscount: prod.discount,
                     buyPriceNum: prod.buyPriceNum
                  };
               });
               // console.log("editKeyProdArr", editKeyProdArr);
               set({ carts: editKeyProdArr });
               get().updateStatusSaveToCart(true);
            } else {
               console.log("fetch carts + carts", carts);
               carts.forEach((cartItem) => {
                  const existIndex = res.data.ProductOnCart.findIndex(
                     (prod) => prod.productId === cartItem.id
                  );
                  if (existIndex !== -1) {
                     res.data.ProductOnCart[existIndex] = {
                        ...cartItem,
                        countCart: res.data.ProductOnCart[existIndex].count,
                        buyPrice: cartItem.buyPrice,
                        buyPriceNum: cartItem.buyPriceNum,
                        preferDiscount: cartItem.preferDiscount
                     };
                  }
                  // console.log("res.data.ProductOnCart", res.data.ProductOnCart);
                  set({ carts: res.data.ProductOnCart });
               });
            }
         }
      } catch (error) {
         console.log("fetchUserCart error", error);
      }
   },

   //clik 'Add to cart' in CardProd.jsx to call this fn▼
   //productObj = 1 prod | ==={id(productId), buyPrice, buyPriceNum, promotion, avgRating}
   //productObj จริงๆ up-to-dateอยู่แล้ว แต่แค่รอให้ call addToCart(productData) ที่ CardProd.jsx ก่อน
   addToCart: (productObj) => {
      // console.log("addToCart productObj->", productObj);
      /*list to edit ☺☺☺
      1. update productObj before add to updateCart
      2. uniqueCart should unique according to id 
      */
      const carts = get().carts; //is supposed to be updated
      //   const products = get().products;//is supposed to be updated

      //check if productObj is already in carts → select the one in carts
      // const existProd = carts.find((updatedCart) => updatedCart.id === productObj.id);
      const existProdIndex = carts.findIndex((item) => item.id === productObj.id);
      let newCarts;
      if (existProdIndex !== -1) {
         console.log("existProdIndex");
         newCarts = [...carts];
         newCarts[existProdIndex] = {
            ...productObj,
            countCart: (newCarts[existProdIndex].countCart || 0) + 1 //ถ้าส่ง productObj.idมาซ้ำ ด้วยการกด 'Add to cart' === +1 ให้ countCart
         };
      } else {
         console.log("NOT existProdIndex");
         // If product doesn't exist, add new entry
         newCarts = [...carts, { ...productObj, countCart: 1 }];
      }
      set({ carts: newCarts });
      console.log("new carts", newCarts);
      get().updateStatusSaveToCart(false);
      get().synCartwithProducts(productObj);
   },
   
   adjustQuantity: (prodId, updateQuant) => {
      // console.log("adjustQuantity", prodId, updateQuant);
      set((state) => ({
         carts: state.carts.map((obj) =>
            obj.id === prodId
               ? //กด'+'→ ไปเอาเลข 2 มา assign ค่าให้ countCart ของ carts[obj] นั้นๆ
                 { ...obj, countCart: Math.max(1, updateQuant) }
               : obj
         )
      }));
      //force to save cart to DB again if user adjust quantity after saving them to DB
      get().updateStatusSaveToCart(false);
   },

   removeCart: async (prodId) => {
      //remain every product except the one with id === prodId
      set((state) => ({
         carts: state.carts.filter((obj) => obj.id !== prodId)
      }));
      //force to save cart to DB again if user remove items after saving them to DB
      get().updateStatusSaveToCart(false);
      console.log("removeCart", prodId);
      //if user rm carts to empty BUT carts records is wrtitten to DB ► reset confirmation states and rm cart in DB
      if (get().carts.length === 0) {
         set({ isSaveToCart: false, showLogoutConfirm: false });
         try {
            const res = await clearCartUser(get().token);
            console.log("clearCartUser", res);
         } catch (err) {
            console.log(err);
         }
      }
   },

   actionLogin: async (form) => {
      //1. Send req with form to backend, path : http://localhost:5000/api/login
      const res = await axios.post(`${apiUrl}/api/login`, form);

      //2. เอา res.data ต่างๆ มา setState ให้ ecomStore().user และ ecomStore().token
      set({
         user: { ...res.data.payload, picture: res.data.picture, public_id: res.data.picturePub },
         token: res.data.token
      });
      /*
      res.data.payload === {id: 4, email: 'tinnapat_s@kkumail.com', role: 'user'}
      */
      //res ใช้รับสิ่งที่ส่ง(res) มาจาก backend
      return res;
   },
   handleDirectLogout: () => {
      set({
         user: null,
         token: null,
         carts: [],
         isSaveToCart: false,
         savedCartCount: 0,
         showLogoutConfirm: false,
         isLoggingOut: false
      });
      // Add true as second parameter to replace state entirely
   },
   actionLogout: () => {
      const state = get();
      if (state.carts.length > 0 && !state.isSaveToCart && !state.isLoggingOut) {
         // Show confirmation if cart not empty and not saved
         set({
            showLogoutConfirm: true,
            isLoggingOut: true // Mark that this is a logout attempt
         });
      } else {
         // Regular logout process → reset state
         get().handleDirectLogout();
         // localStorage.removeItem("ecom-store");
         // console.log(localStorage);
      }
   },
   // Show confirmation if user go logout BUT cart not empty and not saved
   setShowLogoutConfirm: (show) =>
      set({
         showLogoutConfirm: show,
         isLoggingOut: show // Reset when dialog is closed
      }),

   getBrand: async () => {
      try {
         const res = await listBrand();
         set({ brands: res.data });
      } catch (err) {
         console.log(err);
         return undefined;
      }
   },
   //dropdown category
   getCategory: async () => {
      try {
         const res = await listCategory();
         set({ categories: res.data }); //เก็บ res.data►[{},{},..] ที่ส่งมาจาก backend  res.send()
         return res;
      } catch (err) {
         console.log(err);
         return undefined;
      }
   },
   //product in table
   getProduct: async (count = 100, leastStock) => {
      try {
         const res = await listProduct(count, leastStock);
         // console.log("getProduct response:", res.data);
         set({ products: res.data }); //เก็บ res.data►[{},{},..] ที่ส่งมาจาก backend

        
         get().synCartwithProducts(); // Auto-sync carts after products update
         return res; // Return the response
      } catch (err) {
         console.log(err);
         return undefined; // Return undefined in case of error
      }
   },

   getSeachFilterProd: async (filter) => {
      try {
         const res = await seachFilterProd(filter);
         // console.log("getSeachFilterProd response:", res.data);
         set({ products: res.data }); //เก็บ res.data►[{},{},..] ที่ส่งมาจาก backend  res.send()
         return res; // Return response for checking results length
      } catch (err) {
         console.log(err);
         return { data: [] }; // Return empty array if error
      }
   }
});

//ตัวแปรมาเพื่อที่จะใช้ ecomStore()
//persist(ecomStore, usePersist) ใช้เก็บข้อมูล state ที่ user กรอกลง inout ไว้ใน localStorage | ดูใน F12 webpage ► Application ► Local Storage ► ecom-store
const usePersist = {
   name: "ecom-store",
   storage: createJSONStorage(() => localStorage) //เก็บข้อมูลที่ ไว้ใน localStorage → refresh ไม่ได้ → เข้า Inspect ► Application ► Delete key "ecom-store" ออกจึงจะ refresh ค่าให้
};
// const useEcomStore = create(ecomStore);
const useEcomStore = create(persist(ecomStore, usePersist)); //useEcomStore เป็น hook

export default useEcomStore; //useEcomStore(() => {return..}) to access global state 'ecomStore'


