import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PaymentCompleted from "./pages/PaymentCompleted";
import DetailSettings from "./pages/DetailSettings";
// import Incomplete from "./pages/Incomplete"; 
import PaymentError from "./pages/PaymentError";
import History from "./pages/History"; 
import Notifications from './pages/Notifications';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/completed" element={<PaymentCompleted />} />
        <Route path="/detail-settings" element={<DetailSettings />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/error" element={<PaymentError />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);





