import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Search, X, ChevronLeft, ChevronRight, Loader2, ChevronDown } from 'lucide-react';
import api from '../../api';

interface User {
  userId: string;
  name: string;
  email: string;
}

interface JobFormData {
  title: string;
  summary: string;
  hrEmail: string;
  reviewers: User[];
  jdFile: FileList;
}

const JobForm = ({ onCreate }: { onCreate: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [hrList, setHrList] = useState<User[]>([]);
  const [isHrOpen, setIsHrOpen] = useState(false);
  
  const [isRevOpen, setIsRevOpen] = useState(false);
  const [revSearch, setRevSearch] = useState("");
  const [availableRev, setAvailableRev] = useState<User[]>([]);
  const [revLoading, setRevLoading] = useState(false);
  const [revPage, setRevPage] = useState(0);
  const [revTotalPages, setRevTotalPages] = useState(1);

  const { register, handleSubmit, reset, watch, control, setValue, formState: { errors } } = useForm<JobFormData>({
    defaultValues: { reviewers: [], hrEmail: "" }
  });

  const selectedFile = watch("jdFile");
  const currentHrEmail = watch("hrEmail");

  useEffect(() => {
    api.get(`/User/HR`).then(res => setHrList(res.data)).catch(console.error);
  }, []);

  const fetchReviewers = useCallback(async (search: string, page: number) => {
    setRevLoading(true);
    try {
      const res = await api.get(`/User/allUser`, { params: { search, page, size: 5 } });
      setAvailableRev(res.data.content || []);
      setRevTotalPages(res.data.totalPages || 1);
    } finally { setRevLoading(false); }
  }, []);

  useEffect(() => {
    if (isRevOpen) fetchReviewers(revSearch, revPage);
  }, [revSearch, revPage, isRevOpen, fetchReviewers]);

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('summary', data.summary || '');
    formData.append('hrEmail', data.hrEmail);
    if (data.jdFile?.[0]) formData.append('jdFile', data.jdFile[0]);
    data.reviewers.forEach(r => formData.append('reviewerEmails', r.email));

    try {
      const res = await api.post('/Job/create', formData);
      if (res.data === "Successful") {
        setMessage('Job created successfully!');
        reset();
        onCreate();
      } else { alert(res.data); }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error creating job');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Job Posting</h2>
      {message && <div className={`mb-4 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
          <input {...register("title", { required: "Title is required" })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">HR Email *</label>
          <div onClick={() => setIsHrOpen(!isHrOpen)} className="w-full border border-gray-300 p-2 rounded-md cursor-pointer flex justify-between items-center bg-white min-h-[42px]">
            <span className={currentHrEmail ? "text-gray-900" : "text-gray-400"}>
              {currentHrEmail || "Select HR Email..."}
            </span>
            <ChevronDown size={18} className="text-gray-400" />
          </div>
          <input type="hidden" {...register("hrEmail", { required: "HR Email is required" })} />
          {isHrOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
              {hrList.map(hr => (
                <div key={hr.userId} onClick={() => { setValue("hrEmail", hr.email); setIsHrOpen(false); }} className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between">
                  <span>{hr.name}</span>
                  <span className="text-xs text-gray-400">{hr.email}</span>
                </div>
              ))}
            </div>
          )}
          {errors.hrEmail && <span className="text-red-500 text-xs">{errors.hrEmail.message}</span>}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reviewers *</label>
          <Controller name="reviewers" control={control} rules={{ required: "Select at least one" }} render={({ field: { value, onChange } }) => (
            <>
              <div onClick={() => setIsRevOpen(!isRevOpen)} className="w-full border border-gray-300 p-2 rounded-md cursor-pointer flex flex-wrap gap-1 items-center min-h-[42px] bg-white">
                {value.length === 0 && <span className="text-gray-400 text-sm">Select reviewers...</span>}
                {value.map(u => (
                  <span key={u.userId} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-sm flex items-center gap-1">
                    {u.name}
                    <X size={14} className="hover:text-blue-900" onClick={(e) => { e.stopPropagation(); onChange(value.filter(x => x.userId !== u.userId)); }} />
                  </span>
                ))}
              </div>
              {isRevOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2">
                  <div className="flex items-center border-b mb-2 px-2 py-1">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input autoFocus className="w-full outline-none text-sm" placeholder="Search..." value={revSearch} onChange={(e) => { setRevSearch(e.target.value); setRevPage(0); }} />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {revLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div> : 
                      availableRev.map(u => (
                        <div key={u.userId} onClick={() => {
                          const exists = value.find(x => x.userId === u.userId);
                          onChange(exists ? value.filter(x => x.userId !== u.userId) : [...value, u]);
                        }} className={`p-2 rounded cursor-pointer text-sm mb-1 flex justify-between ${value.find(x => x.userId === u.userId) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}>
                          <span>{u.name}</span>
                          <span className="text-[10px] opacity-40">{u.email}</span>
                        </div>
                      ))
                    }
                  </div>
                  <div className="flex justify-between items-center border-t mt-2 pt-2 px-1">
                    <span className="text-[10px] text-gray-400 font-bold">Page {revPage + 1} / {revTotalPages}</span>
                    <div className="flex gap-1">
                      <button type="button" disabled={revPage === 0} onClick={() => setRevPage(p => p - 1)} className="disabled:opacity-20"><ChevronLeft size={16}/></button>
                      <button type="button" disabled={revPage >= revTotalPages - 1} onClick={() => setRevPage(p => p + 1)} className="disabled:opacity-20"><ChevronRight size={16}/></button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )} />
          {errors.reviewers && <span className="text-red-500 text-xs">{errors.reviewers.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Summary</label>
          <textarea {...register("summary")} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description File (JD) *</label>
          <input 
            type="file" 
            {...register("jdFile", { required: "Please upload a JD file" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {selectedFile && selectedFile[0] && (
            <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile[0].name}</p>
          )}
          {errors.jdFile && <p className="text-red-500 text-xs mt-1">{errors.jdFile.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
          {loading ? 'Processing...' : 'Create Job'}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
