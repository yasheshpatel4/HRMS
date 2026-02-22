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
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const [referModal, setReferModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const { role } = useAuth();
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const handleDelete = async (jobId: number) => {
    if (window.confirm("Are you sure you want to delete this job opening?")) {
      try {
        await api.delete(`/Job/${jobId}`);
        setJobs(prev => prev.filter(j => j.jobId !== jobId));
      } catch (err) {
        alert("Failed to delete job.");
      }
    }
  };

  const handleUpdateLocal = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.jobId === updatedJob.jobId ? updatedJob : j));
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/Job/all');
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Job Management</h1>

      <div className="flex space-x-4 mb-8 border-b">
        <button 
          onClick={() => setView('jobs')} 
          className={`pb-2 px-4 transition-colors ${view === 'jobs' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-500'}`}
        >
          Job Openings
        </button>
        <button 
          onClick={() => setView('referrals')} 
          className={`pb-2 px-4 transition-colors ${view === 'referrals' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500 hover:text-blue-500'}`}
        >
          {role === 'HR' ? 'All Referrals' : 'My Referrals'}
        </button>
      </div>

      {view === 'jobs' ? (
        <>
          {role === 'HR' && <JobForm />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {jobs.map((job) => (
              <JobCard 
                key={job.jobId} 
                job={job} 
                onShare={handleShare} 
                onRefer={handleRefer}
                onEdit={(j) => setEditingJob(j)}
                onDelete={handleDelete}
                canManage={role === 'HR'}
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
      
      <ShareModal
        jobId={shareModal.jobId!}
        isOpen={shareModal.isOpen}
        onClose={closeShareModal}
      />
      <ReferModal
        jobId={referModal.jobId!}
        isOpen={referModal.isOpen}
        onClose={closeReferModal}
      />
    </div>
  );
};

export default Job;
