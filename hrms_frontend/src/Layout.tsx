import {  Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";

const Layout = () => {
  
  const location = useLocation();
  const role = localStorage.getItem("userRole") || 'USER';

  return (
    <div className="flex h-screen bg-gray-50">
      
      <Sidebar/>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 text-black">
          <h1 className="text-lg font-semibold capitalize text-gray-700">
            {location.pathname.split("/")[1]}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Welcome, {role}</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
              {role?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default Layout;
