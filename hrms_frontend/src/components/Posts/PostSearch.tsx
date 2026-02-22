import { useState } from 'react';
import { Search, X, Calendar, User, Hash } from 'lucide-react';

interface PostSearchProps {
  onSearch: (filters: any) => void;
  onClearSearch: () => void;
}

const PostSearch = ({ onSearch, onClearSearch }: PostSearchProps) => {
  const [filters, setFilters] = useState({
    author: '',
    tag: '',
    startDate: '',
    endDate: '',
  });
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({ author: '', tag: '', startDate: '', endDate: '' });
    setHasSearched(false);
    onClearSearch();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-6">
      <form onSubmit={handleSearch} className="flex flex-wrap lg:flex-nowrap items-center gap-3">
        
        {/* Author Input */}
        <div className="relative flex-1 min-w-[140px]">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            name="author"
            value={filters.author}
            onChange={handleFilterChange}
            placeholder="Author"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Tag Input */}
        <div className="relative flex-1 min-w-[140px]">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            name="tag"
            value={filters.tag}
            onChange={handleFilterChange}
            placeholder="Tag"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Date Inputs - Grouped */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
          <Calendar className="text-gray-400" size={16} />
          <input
            type="datetime-local"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="bg-transparent text-xs outline-none text-gray-600 cursor-pointer"
            title="Start Date"
          />
          <span className="text-gray-300">|</span>
          <input
            type="datetime-local"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="bg-transparent text-xs outline-none text-gray-600 cursor-pointer"
            title="End Date"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {hasSearched && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Reset Filters"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 shadow-sm"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostSearch;
