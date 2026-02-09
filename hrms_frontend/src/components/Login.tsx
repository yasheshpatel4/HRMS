import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent, roleType: 'HR' | 'USER') => {
    e.preventDefault();
    
    localStorage.setItem("userRole", roleType);
    localStorage.setItem("isAuthenticated", "true");

    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">HRMS Login</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button 
              onClick={(e) => handleLogin(e, 'USER')}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login as User
            </button>
            <button 
              onClick={(e) => handleLogin(e, 'HR')}
              className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
            >
              Login as HR
            </button>
          </div>
        </form>
        
        <p className="mt-4 text-xs text-center text-gray-500">
          Demo buttons above will set the role and redirect you.
        </p>
      </div>
    </div>
  );
};

export default Login;
