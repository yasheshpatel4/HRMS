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
          posts: post.data?.totalElements || 0
        });
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 pb-32">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Roima Intelligence - HRMS</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, i) => (
            <div key={i} onClick={() => navigate(item.path)} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <h3 className="text-2xl font-bold">{loading ? '...' : item.value}</h3>
                </div>
                <div className={`${item.bg} p-3 rounded-xl`}>
                  <item.icon className={item.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="fixed bottom-0 right-0 left-0 lg:left-auto lg:w-[calc(100%-16rem)] py-6 px-6 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={24} />
            <div>
              <p className="font-bold text-slate-800 leading-none">Roima Intelligence</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Enterprise HRMS v2.4</p>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => navigate('/organization')} className="hover:text-blue-600 transition-colors">Org Chart</button>
            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Globe size={14} /> Support
            </button>
            <a className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Mail size={14} /> Contact
            </a>
          </div>

          <div className="text-sm text-slate-400 font-medium">
            © {new Date().getFullYear()} All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
