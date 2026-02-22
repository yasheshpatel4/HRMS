import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../api';

const EditJobModal = ({ job, onClose, onUpdate }: { job: any, onClose: () => void, onUpdate: (j: any) => void }) => {
  const [formData, setFormData] = useState({
    jobId: job.jobId,
    title: job.title || '',
    summary: job.summary || '',
    jdFilePath: job.jdFilePath || '',
    hrEmail: job.hrEmail || ''
  });
  const [emails, setEmails] = useState<string>(""); // Comma separated string
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailList = emails.split(',').map(e => e.trim()).filter(e => e !== "");
      const queryString = new URLSearchParams();
      emailList.forEach(email => queryString.append('reviewerEmails', email));

      const bodyData = new URLSearchParams();
      bodyData.append('jobId', formData.jobId.toString());
      bodyData.append('title', formData.title);
      bodyData.append('summary', formData.summary);
      bodyData.append('jdFilePath', formData.jdFilePath);
      bodyData.append('hrEmail', formData.hrEmail);

      const response = await api.put(`/Job/${job.jobId}?${queryString.toString()}`, bodyData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update job. Ensure all fields are valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Edit Job Opening</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})} 
              rows={3} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Emails</label>
            <input 
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
              value={emails} 
              onChange={e => setEmails(e.target.value)} 
              placeholder="email1@test.com, email2@test.com"
            />
            <p className="text-xs text-gray-400 mt-1">Separate emails with commas</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditJobModal;