/**
 * Flash Sale Helper Utilities
 * สำหรับจัดการ Flash Sale status และข้อมูลใน frontend
 */

/**
 * ตรวจสอบสถานะ Flash Sale
 * @param {Array} discounts - array ของ discount objects
 * @returns {"pending" | "active" | "expired" | null} - สถานะของ flash sale
 */
export const getFlashSaleStatus = (discounts) => {
   if (!discounts || discounts.length === 0) return null;

   const now = new Date();
   const discount = discounts[0]; // ใช้ discount ล่าสุด

   if (!discount) return null;

   const startDate = new Date(discount.startDate);
   const endDate = new Date(discount.endDate);

   // Pending: ยังไม่ถึงเวลาเริ่ม
   if (now < startDate) return "pending";
   
   // Active: อยู่ในช่วงเวลา flash sale
   if (discount.isActive && now >= startDate && now < endDate) return "active";
   
   // Expired: หมดเวลาแล้ว หรือถูก deactivate
   return "expired";
};

/**
 * ดึงข้อมูล Flash Sale
 * @param {Array} discounts - array ของ discount objects
 * @returns {Object|null} - { status, startDate, endDate, amount } หรือ null
 */
export const getFlashSaleInfo = (discounts) => {
   if (!discounts || discounts.length === 0) return null;

   const discount = discounts[0];
   if (!discount) return null;

   const status = getFlashSaleStatus(discounts);
   
   return {
      status,
      startDate: new Date(discount.startDate),
      endDate: new Date(discount.endDate),
      amount: discount.amount
   };
};

/**
 * Format วันที่สำหรับ Flash Sale badge
 * @param {Date} date - วันที่ที่ต้องการ format
 * @returns {string} - เช่น "02:00 PM 09 Jan 26"
 */
export const formatFlashSaleDate = (date) => {
   if (!date || !(date instanceof Date)) return "";
   
   return date.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
      year: "2-digit"
   });
};

/**
 * คำนวณ countdown สำหรับ Flash Sale
 * @param {Date} endDate - วันเวลาสิ้นสุด
 * @returns {Object} - { days, hours, minutes, seconds, isExpired }
 */
export const calculateCountdown = (endDate) => {
   const now = new Date();
   const end = new Date(endDate);
   const diff = end - now;

   // หมดเวลาแล้ว
   if (diff <= 0) {
      return {
         days: 0,
         hours: 0,
         minutes: 0,
         seconds: 0,
         isExpired: true
      };
   }

   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
   const seconds = Math.floor((diff % (1000 * 60)) / 1000);

   return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false
   };
};

/**
 * Format countdown เป็น string "dd:hh:mm:ss"
 * @param {Object} countdown - { days, hours, minutes, seconds }
 * @returns {string} - เช่น "02:15:30:45"
 */
export const formatCountdown = (countdown) => {
   if (!countdown || countdown.isExpired) return "00:00:00:00";

   const pad = (num) => String(num).padStart(2, "0");
   return `${pad(countdown.days)}:${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;
};
