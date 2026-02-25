import { useForm } from 'react-hook-form';
import api from '../../api';

interface ShareModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareFormValues {
  emails: string;
}

const ShareModal = ({ jobId, isOpen, onClose }: ShareModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ShareFormValues>();

  const validateEmails = (emailString: string) => {
    const emailArray = emailString.split(',').map(e => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailArray.every(email => emailRegex.test(email));
  };

  const onSubmit = async (data: ShareFormValues) => {
    if (!validateEmails(data.emails)) {
      setError('emails', {
        type: 'manual',
        message: 'Please enter valid email addresses separated by commas.',
      });
      return;
    }
    try {
      const recipientEmails = data.emails.split(',').map((e) => e.trim());
      await api.post(`/Job/${jobId}/share`, recipientEmails);
      alert('Job shared successfully!');
      reset();
      onClose();
    } catch (err) {
      setError('emails', {
        type: 'manual',
        message: 'Failed to share job. Please try again.',
      });
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Share Job</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block mb-2">
            Recipient Email(s) (comma-separated):
            <input
              type="text"
              {...register('emails', { required: 'Email addresses are required' })}
              className="w-full p-2 border rounded mt-1"
            />
          </label>
          {errors.emails && (
            <p className="text-red-500 text-sm mb-2">{errors.emails.message}</p>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
