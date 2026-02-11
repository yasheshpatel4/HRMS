import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("userRole") || 'USER';

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/Auth/logout", {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/posts", label: "Posts" },
    { path: "/travel", label: "Travel" },
    { path: "/games", label: "Games" },
    { path: "/jobs", label: "Jobs" },
    { path: "/organization", label: "Organization" },
    { path: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          HRMS <span className="text-sm font-normal opacity-50">({role})</span>
        </div>
       
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition ${
                location.pathname.startsWith(item.path) 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-slate-700 text-slate-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 text-black">
          <h1 className="text-lg font-semibold capitalize text-gray-700">
            {location.pathname.split("/")[1] || "Home"}
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
