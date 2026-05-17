import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ApiProvider, configureApi, updateToken } from "devil-frontend";
import App from "./App";
import "./index.css";

configureApi({
  baseURL: import.meta.env.VITE_API_URL,
});

const token = localStorage.getItem("token");
if (token) {
  updateToken(token);
}

import { AuthProvider } from "./context/AuthContext";
import { GraphProvider } from "./context/GraphContext";
import { SidebarProvider } from "./context/SidebarContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApiProvider baseURL={import.meta.env.VITE_API_URL}>
        <AuthProvider>
          <GraphProvider>
            <SidebarProvider>
              <App />
              <Toaster position="top-right" />
            </SidebarProvider>
          </GraphProvider>
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  </React.StrictMode>
);