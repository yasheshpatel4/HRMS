
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
    <div className="border rounded-lg p-4 shadow-md bg-white flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          {canManage && (
            <div className="flex space-x-1">
              <button onClick={() => onEdit(job)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">Edit</button>
              <button onClick={() => onDelete(job.jobId)} className="p-1 text-red-600 hover:bg-red-50 rounded">Delete</button>
            </div>
          )}
        </div>
        <p className="text-gray-700 mb-2 line-clamp-3">{job.summary}</p>
        <p className="text-sm text-gray-500 mb-4">HR: {job.hrEmail}</p>
      </div>
      
      <div className="flex space-x-2 mt-auto">
        <button onClick={() => onShare(job.jobId)} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Share</button>
        <button onClick={() => onRefer(job.jobId)} className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Refer</button>
      </div>
    </div>
  );
};

export default JobCard;
