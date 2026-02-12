import { NavLink,useNavigate } from "react-router-dom";
import axios from "axios";


const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/posts", label: "Posts" },
    { path: "/travel", label: "Travel" },
    { path: "/games", label: "Games" },
    { path: "/jobs", label: "Jobs" },
    { path: "/organization", label: "Organization" },
    { path: "/notifications", label: "Notifications" },
  ];


const Sidebar=()=>{

    const navigate = useNavigate();
      const role = localStorage.getItem("userRole") || 'USER';

    const handleLogout = async () => {
        try {
        await axios.post("http://localhost:8080/Auth/logout", {}, { 
            withCredentials: true 
        });
        } catch(error){
        console.error("Logout API failed", error);
        } finally{
        localStorage.clear();
        navigate("/login", { replace: true });
        }
    };

    return <>
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          HRMS <span className="text-sm font-normal opacity-50">({role})</span>
        </div>
       
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
                `block px-4 py-2 rounded-lg transition ${
                isActive 
                    ? "bg-blue-600 text-white" 
                    : "hover:bg-slate-700 text-slate-300"
                }`
            }
            >
            {item.label}
            </NavLink>

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
    </>
}
export default Sidebar;