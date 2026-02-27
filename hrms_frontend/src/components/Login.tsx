import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LockKeyhole, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">HRMS Login</h2>
            <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100"
              >
                <AlertCircle size={16} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-blue-600 hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-6 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
          Secure HR Management
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
