import { useState } from 'react';
import api from '../../Api';

interface ReferModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ReferModal = ({ jobId, isOpen, onClose }:ReferModalProps) => {
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName || !cv) {
      setError('Friend name and CV are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('friendName', friendName);
      formData.append('friendEmail', friendEmail);
      formData.append('cv', cv);
      formData.append('note', note);
      await api.post(`/Job/${jobId}/refer`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Referral submitted successfully!');
      setFriendName('');
      setFriendEmail('');
      setCv(null);
      setNote('');
      onClose();
    } catch (err) {
      setError('Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Refer Friend</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Friend Name:
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>
          <label className="block mb-2">
            Friend Email :
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          <label className="block mb-2">
            CV File:
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCv(e.target.files ? e.target.files[0] : null)}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>
          <label className="block mb-2">
            Note (optional):
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              rows={3}
            />
          </label>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferModal;
