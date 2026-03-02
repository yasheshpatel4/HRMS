import { useState, useEffect } from 'react';
import JobForm from './JobFrom';
import JobCard from './JobCard';
import ShareModal from './ShareModal';
import ReferModal from './ReferModal';
import { useAuth } from '../../Context/AuthContext';
import api from '../../api';
import EditJobModal from './EditJobModal';
import ReferralList from './ReferralList';

interface Job {
  jobId: number;
  title: string;
  summary: string;
  jdFilePath: string;
  hrEmail: string;
}

const Job = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'jobs' | 'referrals'>('jobs');
  const [showForm, setShowForm] = useState(false);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const [referModal, setReferModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const { role } = useAuth();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (jobId: number) => {
    if (globalThis.confirm("Are you sure you want to delete this job opening?")) {
      try {
        await api.delete(`/Job/${jobId}`);
        fetchJobs();
      } catch (err) {
        console.error(err);
        setError("error in deleting job");
      }
    }
  };

  const handleUpdateLocal = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.jobId === updatedJob.jobId ? updatedJob : j));
  };
  
  const fetchJobs = async (search: string = '') => {
      try {
        const response = search 
          ? await api.get(`/Job/search?q=${encodeURIComponent(search)}`)
          : await api.get('/Job/all');
        setJobs(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchJobs(searchTerm);
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setLoading(true);
    fetchJobs('');
  };
  
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleShare = (jobId: number) => {
    setShareModal({ isOpen: true, jobId });
  };

  const handleRefer = (jobId: number) => {
    setReferModal({ isOpen: true, jobId });
  };

  const closeShareModal = () => {
    setShareModal({ isOpen: false, jobId: null });
  };

  const closeReferModal = () => {
    setReferModal({ isOpen: false, jobId: null });
  };

  if (loading) return <div className="text-center py-8">Loading jobs...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const isManagement = role === 'HR' || role === 'ADMIN';

return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Job Management</h1>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search jobs by title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {(searchTerm) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200">
        <div className="flex space-x-4">
          <button 
            onClick={() => { setView('jobs'); setShowForm(false); }} 
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'jobs' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Job Openings
          </button>
          <button 
            onClick={() => { setView('referrals'); setShowForm(false); }} 
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'referrals' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Referrals
          </button>

        </div>

        {isManagement && (
          <button
            onClick={() => { setView('jobs'); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mb-2"
          >
            {showForm ? 'Close Form' : 'Create Job Opening'}
          </button>
        )}
      </div>

      {view === 'jobs' ? (
        <>
          {showForm && isManagement && (
            <div className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <JobForm onCreate={()=>fetchJobs()}/>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {jobs.map((job) => (
              <JobCard 
                key={job.jobId} 
                job={job} 
                onShare={handleShare} 
                onRefer={handleRefer}
                onEdit={(j) => setEditingJob(j)}
                onDelete={handleDelete}
                canManage={isManagement}
              />
            ))}
          </div>
        </>
      ) : (
        <ReferralList role={role} />
      )}

      {editingJob && (
        <EditJobModal 
          job={editingJob} 
          onClose={() => setEditingJob(null)} 
          onUpdate={handleUpdateLocal} 
        />
      )}
      
      <ShareModal jobId={shareModal.jobId!} isOpen={shareModal.isOpen} onClose={closeShareModal} />
      <ReferModal jobId={referModal.jobId!} isOpen={referModal.isOpen} onClose={closeReferModal} />
    </div>
  );
};

export default Job;
