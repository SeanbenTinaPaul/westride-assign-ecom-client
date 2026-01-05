// Hook สำหรับ subscribe SSE events จาก backend
// ใช้สำหรับ Guest + User เพื่อรับ real-time updates (stock, price, promotion)
import { useEffect, useRef } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export const useSSE = (onMessage) => {
   const eventSourceRef = useRef(null);

   useEffect(() => {
      // สร้าง SSE connection
      eventSourceRef.current = new EventSource(`${apiUrl}/api/sse`);

      eventSourceRef.current.onmessage = (event) => {
         try {
            const data = JSON.parse(event.data);
            onMessage(data);
         } catch (err) {
            console.error("SSE parse error:", err);
         }
      };

      eventSourceRef.current.onerror = (err) => {
         console.error("SSE connection error:", err);
         // Reconnect after 5 seconds
         setTimeout(() => {
            if (eventSourceRef.current) {
               eventSourceRef.current.close();
               eventSourceRef.current = new EventSource(`${apiUrl}/api/sse`);
            }
         }, 5000);
      };

      // Cleanup on unmount
      return () => {
         if (eventSourceRef.current) {
            eventSourceRef.current.close();
         }
      };
   }, [onMessage]);

   return eventSourceRef.current;
};
