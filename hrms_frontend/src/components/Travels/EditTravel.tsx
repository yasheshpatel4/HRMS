import { X } from "lucide-react";
import { useState } from "react";
import type { Travel } from "./TravelList";
import api from "../../api";
import TravelForm from "./TravelForm";

interface TravelFormData {
  title: string;
  description: string;
  budget:number;
  startDate: string;
  endDate: string;
  assignedUserIds: number[];
}

const Edittravel=({ Travel, onClose, onUpdate }: { Travel: Travel, onClose: () => void, onUpdate: () => void })=>{
    const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState<TravelFormData>({
        title: Travel.title,
        description: Travel.description,
        budget: Travel.budget,
        startDate: Travel.startDate,
        endDate: Travel.endDate,
        assignedUserIds: [],
      });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const bodyData = new URLSearchParams();
            bodyData.append('travelId', Travel.travelId.toString());
            bodyData.append('title', formData.title);
            bodyData.append('startDate', formData.startDate);
            bodyData.append('description', formData.description);
            bodyData.append('endDate', formData.endDate);
            bodyData.append('budget', formData.budget.toString());

            await api.put(`/Travel/${Travel.travelId}`, bodyData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            onUpdate();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to update Travel. Ensure all fields are valid and can't update after startdate.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Edit Travel</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *<input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter travel title"
                        required
                        />
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description<textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter travel description"
                        />
                        </label>
                        
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget<input
                        type="Number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter travel budget"
                        required
                        />
                        </label>
                        
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *<input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        </label>
                        
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date *<input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        </label>
                        
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                        {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                    </form>

            </div>
            <div>
                <form onSubmit={handleSubmit} className="p-10 border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget<input
                        type="text"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter travel budget"
                        required
                        />
                        </label>
                </form>
            </div>
        </div>
    );
};

export default Edittravel;