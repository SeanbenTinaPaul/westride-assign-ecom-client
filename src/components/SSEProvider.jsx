// SSE Provider สำหรับ subscribe real-time updates จาก backend
// ครอบ App component เพื่อให้ SSE connection ทำงานตลอดเวลา
import { useCallback } from "react";
import PropTypes from "prop-types";
import { useSSE } from "@/components/hooks/useSSE";
import useEcomStore from "@/store/ecom-store";

function SSEProvider({ children }) {
   const updateProductFromSSE = useEcomStore((state) => state.updateProductFromSSE);

   // Handler สำหรับรับ SSE events
   const handleSSEMessage = useCallback(
      (data) => {
         // console.log("SSE event received:", data);
         updateProductFromSSE(data);
      },
      [updateProductFromSSE]
   );

   // Subscribe to SSE
   useSSE(handleSSEMessage);

   return children;
}

SSEProvider.propTypes = {
   children: PropTypes.node.isRequired
};

export default SSEProvider;
