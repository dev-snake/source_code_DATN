import "@/assets/styles/index.css";
import router from "@/routes/route.tsx";
import { NextUIProvider } from "@nextui-org/react";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <NextUIProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />
    </NextUIProvider>
  </CookiesProvider>,
);
