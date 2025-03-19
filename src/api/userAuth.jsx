import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
//res.json()
export const createCartUser = async (token, cart) => {
   // console.log("form to create prod", cart);
   return await axios.post(`${apiUrl}/api/user/cart`, cart, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
//res.json()
export const getCartUser = async (token) => {
   // console.log("getCartUser");
   return await axios.get(`${apiUrl}/api/user/cart`, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};

export const clearCartUser = async (token) => {
   return await axios.delete(`${apiUrl}/api/user/cart`, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};

//res.json()
export const saveAddressUser = async (token, addressObj) => {
   return await axios.post(`${apiUrl}/api/user/address`, addressObj, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
//res.json()
export const saveOrderUser = async (token, payload) => {
   return await axios.post(`${apiUrl}/api/user/order`, payload, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
export const getOrderUser = async (token) => {
   return await axios.get(`${apiUrl}/api/user/order`, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
export const updateProfileUser = async (token, info) => {
   return await axios.patch(`${apiUrl}/api/user/update-profile`, info, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
};
export const addRatingUser = async (token, payload) => {
   return await axios.post(`${apiUrl}/api/user/rating`, payload, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
}
export const toggleFavoriteUser = async (token, productId)=> {
   return await axios.post(`${apiUrl}/api/user/favorite`, {productId}, {
      headers: {
         Authorization: `Bearer ${token}`
      }
   });
}