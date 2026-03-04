import { useEffect, useState, useMemo } from 'react';
import api from '../../api';
import { Edit2, Trash2 } from 'lucide-react';

interface Referral {
  referralId: number;
  friendName: string;
  friendEmail: string;
  status: string;
  cvFilePath: string;
  job: { title: string };
  referrer?: { name: string };
}

const ReferralList = ({ role }: { role: string | null }) => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const fetchReferrals = async () => {
      const response = await api.get('/Job/referrals');
      setReferrals(response.data);
    };
  useEffect(() => {
    fetchReferrals();
  }, []);

  const groupedReferrals = useMemo(() => {
    return referrals.reduce((acc, referral) => {
      const title = referral.job.title;
      if (!acc[title]) acc[title] = [];
      acc[title].push(referral);
      return acc;
    }, {} as Record<string, Referral[]>);
  }, [referrals]);

  const toggleJob = (title: string) => {
    setExpandedJob(expandedJob === title ? null : title);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/Job/referral/${id}/status`, newStatus, { 
        headers: { 'Content-Type': 'text/plain' } 
      });
      setReferrals(prev => prev.map(r => r.referralId === id ? { ...r, status: newStatus } : r));
    } catch (err) { console.error(err); }
  };
  const handleCvUpdate = async (id: number, files: FileList | null) => {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  formData.append('file', files[0]);

  try {
    await api.put(`/Job/referral/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    alert('CV updated successfully!');
    fetchReferrals();
  } catch (err) {
    console.error('Failed to update CV', err);
    alert('Failed to update CV');
  }
};

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/Job/referral/${id}`)
      fetchReferrals();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="mt-6 space-y-4">
      {Object.entries(groupedReferrals).map(([jobTitle, items]) => (
        <div key={jobTitle} className="border rounded-lg bg-white shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleJob(jobTitle)}
            className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className={`transform transition-transform ${expandedJob === jobTitle ? 'rotate-90' : ''}`}>
                ▶
              </span>
              <h3 className="font-bold text-gray-800">{jobTitle}</h3>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {items.length} Candidates
            </span>
          </button>

          {expandedJob === jobTitle && (
            <div className="overflow-x-auto border-t">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Candidate</th>
                    {(role === 'HR' || role === 'ADMIN') && <th className="px-6 py-3 text-left">Referred By</th>}
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((ref) => (
                    <tr key={ref.referralId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm text-gray-900">{ref.friendName}</p>
                        <p className="text-xs text-gray-500">{ref.friendEmail}</p>
                      </td>
                      {(role === 'HR' || role === 'ADMIN') && (
                        <td className="px-6 py-4 text-sm text-gray-600">{ref.referrer?.name}</td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          ref.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-4">
                        <a href={ref.cvFilePath} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                          CV
                        </a>

                        {role === 'EMPLOYEE' && ref.status === 'Pending' && (
                          <div className="flex items-center space-x-1">
                            <input
                              type="file"
                              id={`edit-cv-${ref.referralId}`}
                              className="hidden"
                              accept=".pdf,.doc,.docx,image/*"
                              onChange={(e) => handleCvUpdate(ref.referralId, e.target.files)}
                            />
                            
                            <button 
                              title="Update CV"
                              onClick={() => document.getElementById(`edit-cv-${ref.referralId}`)?.click()} 
                              className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>

                            <button 
                              title="Delete Referral"
                              onClick={() => handleDelete(ref.referralId)} 
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}

                        {(role === 'HR' || role === 'ADMIN') && (
                          <select 
                            value={ref.status} 
                            onChange={(e) => handleStatusChange(ref.referralId, e.target.value)}
                            className="border border-gray-300 rounded text-sm p-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReferralList;