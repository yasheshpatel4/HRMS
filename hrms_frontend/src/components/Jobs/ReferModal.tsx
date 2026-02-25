import { useForm } from 'react-hook-form';
import api from '../../api';

interface ReferModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface ReferFormInputs {
  friendName: string;
  friendEmail: string;
  cv: FileList;
  note: string;
}

const ReferModal = ({ jobId, isOpen, onClose }: ReferModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReferFormInputs>();

  const onSubmit = async (data: ReferFormInputs) => {
    try {
      const formData = new FormData();
      formData.append('friendName', data.friendName);
      formData.append('friendEmail', data.friendEmail);
      formData.append('cv', data.cv[0]);
      formData.append('note', data.note);

      await api.post(`/Job/${jobId}/refer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Referral submitted successfully!');
      reset();
      onClose();
    } catch (err) {
      setError('root', { message: 'Failed to submit referral. Please try again.' });
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Refer Friend</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block mb-2">
            Friend Name:
            <input
              {...register('friendName', { required: 'Friend name is required' })}
              type="text"
              className="w-full p-2 border rounded mt-1"
            />
            {errors.friendName && <p className="text-red-500 text-xs">{errors.friendName.message}</p>}
          </label>

          <label className="block mb-2">
            Friend Email :
            <input
              {...register('friendEmail')}
              type="email"
              className="w-full p-2 border rounded mt-1"
            />
          </label>

          <label className="block mb-2">
            CV File:
            <input
              {...register('cv', { required: 'CV is required' })}
              type="file"
              accept="image/*,.pdf"
              className="w-full p-2 border rounded mt-1"
            />
            {errors.cv && <p className="text-red-500 text-xs">{errors.cv.message}</p>}
          </label>

          <label className="block mb-2">
            Note (optional):
            <textarea
              {...register('note')}
              className="w-full p-2 border rounded mt-1"
              rows={3}
            />
          </label>

          {errors.root && <p className="text-red-500 text-sm mb-2">{errors.root.message}</p>}

          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={() => { reset(); onClose(); }} 
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferModal;
