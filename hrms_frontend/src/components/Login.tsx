import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LockKeyhole, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { encryptPassword, useAuth } from "../Context/AuthContext";
import axios from "axios";

type AuthView = "login" | "forgot" | "reset";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await axios.post(`http://localhost:8080/Auth/forgot?email=${email}`);
      setSuccess("OTP sent to your email!");
      setView("reset");
    } catch (err: any) {
      setError("Failed to send OTP. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const encrypt=encryptPassword(newPassword);
    try {
      await axios.post("http://localhost:8080/Auth/reset", {
        email,
        otp,
        password: encrypt,
      });
      setSuccess("Password reset successfully! Please login.");
      setView("login");
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      setError("Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          {view !== "login" && (
            <button 
              onClick={() => setView("login")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {view === "login" ? "HRMS Login" : view === "forgot" ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {view === "login" ? "Sign in to manage your HR tasks." : 
               view === "forgot" ? "Enter your email to receive a 6-digit OTP." : 
               "Enter the OTP sent to your email and your new password."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                <AlertCircle size={16} /> <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-100">
                <CheckCircle2 size={16} /> <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="name@company.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button type="button" onClick={() => setView("forgot")} className="text-xs text-blue-600 hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Sign In"}
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="name@company.com" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
              </button>
            </form>
          )}

          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                <input type="text" required value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-center tracking-widest text-lg font-bold" placeholder="000000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Reset Password"}
              </button>
            </form>
          )}

          {view === "login" && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-blue-600 font-semibold hover:underline">Sign Up</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
