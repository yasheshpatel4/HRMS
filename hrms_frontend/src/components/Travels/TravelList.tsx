import { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import DocumentUpload from './DocumentUpload';
import TravelForm from './TravelForm';
import api from '../../api';
import { Edit2, Trash2 } from 'lucide-react';

interface Travel {
  travelId: number;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
  assignedUsers: number[];
  createdBy: number;
}
interface TravelListProps {
  onNavigateToExpense?: (travelId: number) => void;
}
const TravelList = ({ onNavigateToExpense }:TravelListProps) => {
  const { user, role } = useAuth();
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    fetchTravels();
  }, [user, role]);

  const handleDelete = async (travelId: number) => {
    if (!window.confirm("Are you sure you want to delete this travel?")) return;
    
    try {
      const response=await api(`/Travel/${travelId}`, { method: 'DELETE' });
      setIsDeleted(true);
      alert(response.data);
    } catch (error) {
      console.error("Failed to delete travel:", error);
      alert("Error deleting travel. Please try again.");
    }
  };

  const fetchTravels = async () => {
    try {
      let response;
      if (role == 'HR') {
        response = await api.get(`/Travel/HR/${user?.userId}`);
      }
      else if( role == 'ADMIN' || role == 'MANAGER'){
         response = await api.get(`/Travel/all`);       
      } else {
        response = await api.get(`/Travel/user/${user?.userId}`);
      }
      setTravels(response.data);
    } catch (error) {
      console.error('Error fetching travels:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDocuments = async (travel: Travel) => {
    try {
      let response;
        response = await api.get(`/Travel/Document/${travel.travelId}`);
      setDocuments(response.data);
      setSelectedTravel(travel);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const downloadDocument = async (docId: number) => {
    try {
      const response = await api.get(`/Travel/Document/${docId}/url`);
      window.open(`${response.data}`, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading travels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Travel Assignments</h2>
        {role === 'HR' && (
          <button onClick={() => setShowTravelForm(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Create New Travel
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {travels.map((travel) => (
          <div key={travel.travelId} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{travel.title}</h3>
              {(role === 'HR' || role === 'ADMIN') && (
            <div className="flex space-x-1">
              <button onClick={() => console.log("edit")} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-full transition-colors"><Edit2 size={18} /></button>
              <button onClick={() => console.log(handleDelete(travel.travelId))} className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"><Trash2 size={18} /></button>
            </div>
            )} 
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Start:</span> {new Date(travel.startDate).toLocaleDateString()}</p>
              <p><span className="font-medium">End:</span> {new Date(travel.endDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Description:</span> {travel.description}</p>
              <p><span className="font-medium">Employees:</span> {travel.assignedUsers?.length || 0}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => viewDocuments(travel)}
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
              >
                View Documents
              </button>
              {role === 'EMPLOYEE' && (
                <button 
                  onClick={() => onNavigateToExpense?.(travel.travelId)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Submit Expense
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {travels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No travel assignments found
        </div>
      )}

      {selectedTravel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Documents for {selectedTravel.title}
              </h3>
              <button
                onClick={() => setSelectedTravel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {new Date(selectedTravel.startDate).toLocaleDateString()} - {new Date(selectedTravel.endDate).toLocaleDateString()}
              </p>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.docId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {doc.fileName?.toLowerCase().includes('.pdf') ? '📄' : '📷'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">
                         • Uploaded by {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadDocument(doc.docId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents found for this travel
              </div>
            )}

            {selectedTravel && (
              <div className="mt-6 pt-6 border-t">
                <DocumentUpload
                  travelId={selectedTravel.travelId}
                  onUploadSuccess={() => viewDocuments(selectedTravel)}
                /><p>Document upload</p>
              </div>
            )}
          </div>
        </div>
      )}
      <TravelForm
        isOpen={showTravelForm}
        onClose={() => setShowTravelForm(false)}
        onSuccess={() => {
          setShowTravelForm(false);
          fetchTravels();
        }}
      />
    </div>
  );
};

export default TravelList;
