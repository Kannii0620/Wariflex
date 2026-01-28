import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import Incomplete from "./pages/Incomplete";
import App from "./App";
import PaymentCompleted from "./pages/PaymentCompleted";
import DetailSettings from "./pages/DetailSettings";
import PaymentError from "./pages/PaymentError";
import History from "./pages/History"; 
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AuthGuard from './AuthGuard'; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path="/" element={<App />} />
          <Route path="/completed" element={<PaymentCompleted />} />
          <Route path="/detail-settings" element={<DetailSettings />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/error" element={<PaymentError />} />
          <Route path="/guide" element={<Incomplete />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);