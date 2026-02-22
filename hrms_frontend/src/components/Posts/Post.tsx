import { useState } from 'react';
import PostList from './PostList';
import PostForm from './PostForm';
import PostSearch from './PostSearch';

const Post = () => {
  const [searchParams, setSearchParams] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false); 

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsFormOpen(false);
  };

  const handleSearch = (filters: any) => {
    setSearchParams(filters);
  };

  const handleClearSearch = () => {
    setSearchParams(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Social Achievements & Celebrations
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-sm active:scale-95"
        >
          + Create Post
        </button>
      </div>

      <div className="mt-6">
        <div className="space-y-6">
          {isFormOpen && (
            <PostForm 
              onPostCreated={handlePostCreated} 
              onCancel={() => setIsFormOpen(false)} 
            />
          )}

          <PostSearch onSearch={handleSearch} onClearSearch={handleClearSearch} />

          <div>
            <h5 className=" font-semibold text-gray-800 mb-2">
              {searchParams ? 'Search Results' : 'Recent Post'}
            </h5>

            <PostList 
              refreshTrigger={refreshTrigger} 
              searchParams={searchParams} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
