//rafce
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import SSEProvider from "@/components/SSEProvider";

const App = () => {
   return (
      <>
         <Toaster/>
         <SSEProvider>
            <AppRoutes />
         </SSEProvider>
      </>
   );
};

export default App;
