import React, { useState, useRef } from "react";
import {  Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./Context/AuthContext";
import api from "./api";
import { Camera, Menu, UserIcon } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const { user, role, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user?.userId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/User/${user.userId}/profile-photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) await refreshUser();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold capitalize text-gray-800 truncate">
              {location.pathname.split("/")[1] || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900 leading-none">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                {role}
              </span>
            </div>

            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white ring-1 ring-gray-200 overflow-hidden bg-slate-100 flex items-center justify-center transition-all hover:ring-blue-400 disabled:opacity-70"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                ) : user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-gray-400" size={20} />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;