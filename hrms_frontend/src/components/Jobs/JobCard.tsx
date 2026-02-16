
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
}

const JobCard = ({ job, onShare, onRefer }:JobCardProps) => {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white">
      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
      <p className="text-gray-700 mb-2">{job.summary}</p>
      <p className="text-sm text-gray-500 mb-4">HR Email: {job.hrEmail}</p>
      <div className="flex space-x-2">
        <button
          onClick={() => onShare(job.jobId)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Share Job
        </button>
        <button
          onClick={() => onRefer(job.jobId)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refer Friend
        </button>
      </div>
    </div>
  );
};

export default JobCard;
