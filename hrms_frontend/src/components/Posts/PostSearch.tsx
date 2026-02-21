import { useState } from 'react';
import { Search, X } from 'lucide-react';

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
    const emptyFilters = { author: '', tag: '', startDate: '', endDate: '' };
    setFilters(emptyFilters);
    setHasSearched(false);
    onClearSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Search className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Search Posts</h3>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Author</label>
            <input
              type="text"
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="author"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tag</label>
            <input
              type="text"
              name="tag"
              value={filters.tag}
              onChange={handleFilterChange}
              placeholder="tag"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From</label>
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To</label>
            <input
              type="datetime-local"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          {hasSearched && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
              Reset
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Search size={18} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostSearch;
