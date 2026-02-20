import { useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../../api';

interface PostSearchProps {
  onSearch: (posts: any[]) => void;
  onClearSearch: () => void;
}

const PostSearch = ({ onSearch, onClearSearch }: PostSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    author: '',
    tag: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.author) params.append('author', filters.author);
      if (filters.tag) params.append('tag', filters.tag);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/Post/search?${params.toString()}`);
      onSearch(response.data);
      setHasSearched(true);
    } catch (err) {
      setError('Failed to search posts');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setFilters({ author: '', tag: '', startDate: '', endDate: '' });
    setHasSearched(false);
    onClearSearch();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Posts</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input
              type="text"
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="Search by author..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              name="tag"
              value={filters.tag}
              onChange={handleFilterChange}
              placeholder="Search by tag..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="datetime-local"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          {hasSearched && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              <X size={18} />
              Clear Filters
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Search size={18} />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostSearch;
