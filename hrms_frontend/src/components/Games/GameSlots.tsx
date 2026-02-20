import { useState, useEffect, useCallback } from 'react';
import { Calendar, UserPlus, X, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../api';

interface User { userId: number; name: string; }
interface Slot { slotId: number; startTime: string; available: boolean; }

export const GameSlots = ({ slots, onBook }: { slots: Slot[], onBook: (id: number, pIds: number[]) => void }) => {
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchUsers = useCallback(async (search: string, page: number) => {
    setIsLoading(true);
    try {

      const response = await api.get(`/User/allUser`, {
        params: {
          search: search,
          page: page,
          size: 5 
        }
      });
      
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch users ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDropdownOpen) fetchUsers(searchTerm, currentPage);
  }, [searchTerm, currentPage, isDropdownOpen, fetchUsers]);

  const handleBookingConfirm = () => {
    if (bookingSlot) onBook(bookingSlot.slotId, selectedUsers.map(u => u.userId));
    setBookingSlot(null);
    setSelectedUsers([]);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const toggleUser = (user: User) => {
    setSelectedUsers(prev => 
      prev.find(u => u.userId === user.userId) ? prev.filter(u => u.userId !== user.userId) : [...prev, user]
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-blue-600" />
        <h2 className="text-lg font-semibold">Today's Live Slots</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <button key={slot.slotId} onClick={() => setBookingSlot(slot)} className={`p-3 rounded-md text-center text-sm font-medium border transition-all ${slot.available ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}>
            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {!slot.available && <span className="block text-[10px] font-bold opacity-70">CONTESTABLE</span>}
          </button>
        ))}
      </div>

      {bookingSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-visible">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus className="text-blue-600" /> Select Participants</h3>
              <button onClick={() => setBookingSlot(null)}><X /></button>
            </div>

            <div className="relative mb-6">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full border-2 border-gray-200 p-3 rounded-xl cursor-pointer flex flex-wrap gap-1 items-center min-h-[52px] bg-gray-50 hover:bg-white transition-colors"
              >
                {selectedUsers.length === 0 && <span className="text-gray-400">Search and select users...</span>}
                {selectedUsers.map(user => (
                  <span key={user.userId} className="border-1 px-2 py-1 rounded-lg text-sm flex items-center gap-1">
                    {user.name} <X size={14} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleUser(user); }} />
                  </span>
                ))}
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center border-b pb-2 mb-2 px-2">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input 
                      autoFocus
                      className="w-full outline-none text-sm p-1" 
                      placeholder="Search by name..." 
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-400" /></div>
                    ) : users.length > 0 ? (
                      users.map(user => (
                        <div 
                          key={user.userId} 
                          onClick={() => toggleUser(user)}
                          className={`p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${selectedUsers.find(u => u.userId ==user.userId) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                        >
                          {user.name} (ID: {user.userId})
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-400 text-sm">No users found</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t pt-2 mt-2 px-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Page {currentPage + 1} / {totalPages || 1}</span>
                    <div className="flex gap-1">
                      <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20"><ChevronLeft size={16} /></button>
                      <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20"><ChevronRight size={16} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button 
              disabled={selectedUsers.length === 0}
              onClick={handleBookingConfirm}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              Check Availability & Book           
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
