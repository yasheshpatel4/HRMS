import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LockKeyhole, Mail, User, Briefcase, Users, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    doj: "",
    department: "",
    designation: "",
    role: "EMPLOYEE",
    managerEmail: "",
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signup(formData);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-3 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[500px]"
      >
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 overflow-hidden"
              >
                <AlertCircle size={16} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" icon={<User size={18}/>} placeholder="abc" onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" icon={<Mail size={18}/>} placeholder="abc@gmail.com" onChange={handleChange} required />
            </div>

            <InputField label="Password" name="password" type="password" icon={<LockKeyhole size={18}/>} placeholder="••••••••" onChange={handleChange} required />

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth" name="dob" type="date" icon={<Calendar size={18}/>} onChange={handleChange} required />
              <InputField label="Date of Joining" name="doj" type="date" icon={<Calendar size={18}/>} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Department" name="department" icon={<Briefcase size={18}/>} placeholder="IT" onChange={handleChange} required />
              <InputField label="Designation" name="designation" icon={<Briefcase size={18}/>} placeholder="Developer" onChange={handleChange} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 text-sm bg-white"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">HR</option>
              </select>
            </div>

            <InputField label="Manager Email" name="managerEmail" type="email" icon={<Users size={18}/>} placeholder="manager@company.com" onChange={handleChange} required />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-blue-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({ label, icon, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input {...props} className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 text-sm" />
    </div>
  </div>
);

export default Signup;
