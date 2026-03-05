import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Gamepad2, FileText, Bell, Globe, Mail, ShieldCheck } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ employees: 0, jobs: 0, games: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, job, game, post] = await Promise.all([
          api.get('/User/all'),
          api.get('/Job/all'),
          api.get('/Game/all'),
          api.get('/Post/all?page=0&size=1')
        ]);
        setData({
          employees: emp.data?.length || 0,
          jobs: job.data?.length || 0,
          games: game.data?.length || 0,
          posts: post.data?.page.totalElements || 0
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { name: 'Active Employees', value: data.employees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', path: '/organization' },
    { name: 'Job Openings', value: data.jobs, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100', path: '/jobs' },
    { name: 'Available Games', value: data.games, icon: Gamepad2, color: 'text-green-600', bg: 'bg-green-100', path: '/games' },
    { name: 'Total Posts', value: data.posts, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100', path: '/posts' },
  ];

  return (
    <div className="flex flex-col min-h-full relative">
      <div className="flex-1 pb-32 sm:pb-40">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Roima Intelligence</h1>
            <p className="text-slate-500 text-sm">Welcome back to your HRMS dashboard.</p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-full transition-all relative shadow-sm bg-white sm:bg-transparent">
              <Bell className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, i) => (
            <div 
              key={i} 
              onClick={() => navigate(item.path)} 
              className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-200 active:scale-95 group"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{item.name}</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    {loading ? <div className="h-7 w-12 bg-gray-100 animate-pulse rounded" /> : item.value}
                  </h3>
                </div>
                <div className={`${item.bg} p-3 rounded-xl transition-colors group-hover:scale-110 duration-200`}>
                  <item.icon className={`${item.color}`} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
            
            <div className="flex items-center gap-3 order-2 md:order-1">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShieldCheck className="text-blue-600" size={20} />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-slate-800 text-sm leading-none">Roima Intelligence</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 hidden sm:block">Enterprise HRMS v2.4</p>
              </div>
            </div>

            <nav className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-600 order-1 md:order-2">
              <button onClick={() => navigate('/organization')} className="hover:text-blue-600 transition-colors">Org Chart</button>
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Globe size={14} className="text-slate-400" /> Support
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Mail size={14} className="text-slate-400" /> Contact
              </button>
            </nav>

            <div className="text-[11px] sm:text-sm text-slate-400 font-medium order-3">
              © {new Date().getFullYear()} <span className="hidden sm:inline">Roima Intelligence.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
