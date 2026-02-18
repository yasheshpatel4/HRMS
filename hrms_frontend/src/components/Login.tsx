import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      // navigate("/dashboard");
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">HRMS Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black" 
              placeholder="name@gmail.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
