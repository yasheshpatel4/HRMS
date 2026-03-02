import React, { useState, useRef } from "react";
import {  Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./Context/AuthContext";
import api from "./api";

const Layout = () => {

  const location = useLocation();
  const { user, role, refreshUser } = useAuth();
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user?.userId) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/User/${user.userId}/profile-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        await refreshUser();
        setMessage("Success! Photo updated.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setMessage(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
            <div className="relative group">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  role?.[0] || "U"
                )}
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
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
