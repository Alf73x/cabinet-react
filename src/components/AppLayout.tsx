import { Outlet } from "react-router-dom";

import Footer from "./Footer";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-layout">
      <div className="app-layout-content">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}