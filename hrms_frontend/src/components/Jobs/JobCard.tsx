import { Edit2, Trash2 } from "lucide-react";

interface Job {
  jobId: number;
  title: string;
  summary: string;
  jdFilePath: string;
  hrEmail: string;
}

interface JobCardProps {
  job: Job;
  onShare: (jobId: number) => void;
  onRefer: (jobId: number) => void;
  onEdit: (job: Job) => void; 
  onDelete: (jobId: number) => void; 
  canManage: boolean; 
}

const JobCard = ({ job, onShare, onRefer, onEdit, onDelete, canManage }: JobCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 p-5">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          {canManage && (
            <div className="flex space-x-1">
              <button onClick={() => onEdit(job)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"><Edit2 size={18} /></button>
              <button onClick={() => onDelete(job.jobId)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
        <p className="text-gray-700 mb-2 line-clamp-3">{job.summary}</p>
        <p className="text-sm text-gray-500 mb-4">HR: {job.hrEmail}</p>
      </div>
      
      <div className="flex space-x-2 mt-auto">
        <button onClick={() => onShare(job.jobId)} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm">Share</button>
        <button onClick={() => onRefer(job.jobId)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">Refer</button>
      </div>
    </div>
  );
};

export default JobCard;
