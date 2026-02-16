import { useState, useEffect } from 'react';
import JobForm from './JobFrom';
import JobCard from './JobCard';
import ShareModal from './ShareModal';
import ReferModal from './ReferModal';
import { useAuth } from '../../Context/AuthContext';
import api from '../../Api';

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
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const [referModal, setReferModal] = useState<{ isOpen: boolean; jobId: number | null }>({ isOpen: false, jobId: null });
  const { role } = useAuth();

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
      <h1 className="text-3xl font-bold mb-6">Job Openings</h1>
      {role == 'HR' && <JobForm />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {jobs.map((job) => (
          <JobCard key={job.jobId} job={job} onShare={handleShare} onRefer={handleRefer} />
        ))}
      </div>
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
