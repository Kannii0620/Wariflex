import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import About from "./pages/PaymentCompleted";
import DetailSettings from "./pages/DetailSettings";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/detail-settings" element={<DetailSettings />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);





