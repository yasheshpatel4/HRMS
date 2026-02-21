import { useState, useEffect, useCallback } from 'react';
import { Calendar, UserPlus, X, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../api';

interface User { userId: number; name: string; }
interface Slot { slotId: number; startTime: string; available: boolean; }

export const GameSlots = ({ slots, onBook, onClose }: { slots: Slot[], onBook: (id: number, pIds: number[]) => void, onClose: () => void }) => {
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
        params: { search, page, size: 5 }
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Today's Live Slots</h2>
              <p className="text-sm text-gray-500">Select a preferred time to begin booking</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] p-1">
            {slots.map((slot) => (
              <button 
                key={slot.slotId} 
                onClick={() => setBookingSlot(slot)} 
                className={`group relative p-4 rounded-2xl text-center transition-all border-2 
                  ${slot.available 
                    ? 'border-green-100 bg-green-50 text-green-700 hover:border-green-400 hover:bg-white' 
                    : 'border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-400 hover:bg-white'}`}
              >
                <span className="text-lg font-bold">
                  {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!slot.available && (
                  <span className="block text-[10px] font-black uppercase tracking-tighter opacity-70 mt-1">
                    Contestable
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {bookingSlot && (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
              <div className="absolute inset-0 cursor-default" onClick={() => setBookingSlot(null)}></div>
              <div 
                className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-gray-100 overflow-visible animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()} 
              >            
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <UserPlus className="text-blue-600" /> Select Participants
                  </h3>
                  <button 
                    onClick={() => setBookingSlot(null)} 
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="relative mb-6">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl cursor-pointer flex flex-wrap gap-1 items-center min-h-[52px] bg-gray-50 hover:bg-white transition-colors"
                  >
                    {selectedUsers.length === 0 && <span className="text-gray-400">Search and select users...</span>}
                    {selectedUsers.map(user => (
                      <span key={user.userId} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg text-sm flex items-center gap-1 font-medium">
                        {user.name} 
                        <X size={14} className="cursor-pointer hover:text-blue-900" onClick={(e) => { e.stopPropagation(); toggleUser(user); }} />
                      </span>
                    ))}
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] p-2 animate-in fade-in zoom-in duration-200">
                      <div className="flex items-center border-b pb-2 mb-2 px-2">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input 
                          autoFocus
                          className="w-full outline-none text-sm p-1 bg-transparent" 
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
                              className={`p-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors flex justify-between items-center ${selectedUsers.find(u => u.userId == user.userId) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                            >
                              <span>{user.name}</span>
                              <span className="text-[10px] opacity-40">ID: {user.userId}</span>
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
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400"
                >
                  Check Availability & Book
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
