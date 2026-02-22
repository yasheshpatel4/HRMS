import { useEffect, useState } from 'react';
import api from '../../api';

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

  useEffect(() => {
    const fetchReferrals = async () => {
      const response = await api.get('/Job/referrals'); 
      setReferrals(response.data);
    };
    fetchReferrals();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/Job/referral/${id}/status`, newStatus, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setReferrals(prev => prev.map(r => r.referralId === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Candidate</th>
            <th className="px-6 py-3 text-left">Job</th>
            {role === 'HR' && <th className="px-6 py-3 text-left">Referred By</th>}
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((ref) => (
            <tr key={ref.referralId} className="border-t">
              <td className="px-6 py-4">{ref.friendName}<br/><span className="text-xs text-gray-500">{ref.friendEmail}</span></td>
              <td className="px-6 py-4">{ref.job.title}</td>
              {role === 'HR' && <td className="px-6 py-4">{ref.referrer?.name}</td>}
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-sm ${ref.status === 'Pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  {ref.status}
                </span>
              </td>
              <td className="px-6 py-4 flex space-x-2">
                <a href={ref.cvFilePath} target="_blank" className="text-blue-500 underline">CV</a>
                {role === 'HR' && (
                  <select 
                    value={ref.status} 
                    onChange={(e) => handleStatusChange(ref.referralId, e.target.value)}
                    className="border rounded text-sm"
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
  );
};

export default ReferralList;
