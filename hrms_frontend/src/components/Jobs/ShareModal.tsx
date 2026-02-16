import { useState } from 'react';
import api from '../../Api';

interface ShareModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal = ({ jobId, isOpen, onClose }:ShareModalProps) => {
  const [emails, setEmails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmails = (emailString: string) => {
    const emailArray = emailString.split(',').map(e => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every(email => emailRegex.test(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmails(emails)) {
      setError('Please enter valid email addresses separated by commas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const recipientEmails = emails.split(',').map(e => e.trim());
      await api.post(`/Job/${jobId}/share`, recipientEmails);
      alert('Job shared successfully!');
      setEmails('');
      onClose();
    } catch (err) {
      setError('Failed to share job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Share Job</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Recipient Email(s) (comma-separated):
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
