/**
 * Discount Helper Utilities
 * สำหรับคำนวณ discount/promotion ใน frontend (fallback และ UI rendering)
 */

/**
 * ตรวจสอบ discount ที่ยังใช้งานได้
 * @param {Array} discounts - array ของ discount objects
 * @returns {number|null} - จำนวน % discount หรือ null
 */
export const getDiscountAmount = (discounts) => {
   if (!discounts || discounts.length === 0) return null;

   const today = new Date();
   const discount = discounts[0];
   const startDate = new Date(discount.startDate);
   const endDate = new Date(discount.endDate);

   if (discount.isActive && today >= startDate && today < endDate) {
      return discount.amount;
   }
   return null;
};

/**
 * คำนวณ buyPriceNum และ preferDiscount (fallback สำหรับ offline หรือกรณี backend ยังไม่ส่งค่ามา)
 * @param {Object} product - product object ที่มี price, promotion, discounts
 * @returns {Object} - { buyPriceNum, preferDiscount }
 */
export const calculateDiscount = (product) => {
   const discountAmount = getDiscountAmount(product?.discounts);
   let buyPriceNum = product?.price || 0;
   let preferDiscount = null;

   if (product?.promotion > discountAmount) {
      preferDiscount = product.promotion;
      buyPriceNum = product.price * (1 - product.promotion / 100);
   } else if (discountAmount) {
      preferDiscount = discountAmount;
      buyPriceNum = product.price * (1 - discountAmount / 100);
   }

   return { buyPriceNum, preferDiscount };
};

/**
 * คืน % ส่วนลดสำหรับแสดง badge
 * @param {number} promotion - promotion percentage
 * @param {Array} discounts - array ของ discount objects
 * @returns {number|null}
 */
export const getPercentDiscount = (promotion, discounts) => {
   const discountAmount = getDiscountAmount(discounts);

   if (promotion && discountAmount) {
      return Math.max(promotion, discountAmount);
   } else if (promotion) {
      return promotion;
   } else if (discountAmount) {
      return discountAmount;
   }
   return null;
};

/**
 * คำนวณ total discount amount จาก cart items
 * @param {Array} carts - array ของ cart items
 * @returns {Object} - { totalDiscount, total, totalNet }
 */
export const calculateCartTotals = (carts) => {
   let totalDiscount = 0;
   let total = 0;
   let totalNet = 0;

   for (const cart of carts) {
      const price = cart.price * cart.countCart;
      const discountAmount = getDiscountAmount(cart?.discounts);
      let discAmount = 0;

      if (cart?.promotion > discountAmount) {
         discAmount = price * (cart.promotion / 100);
      } else if (cart?.promotion < discountAmount) {
         discAmount = price * (discountAmount / 100);
      }

      totalDiscount += discAmount;
      total += price;
      totalNet += price - discAmount;
   }

   return { totalDiscount, total, totalNet };
};
