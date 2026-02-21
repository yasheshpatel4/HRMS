import { useState } from 'react';
import PostList from './PostList';
import PostForm from './PostForm';
import PostSearch from './PostSearch';

const Post = () => {
  const [searchParams, setSearchParams] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearch = (filters: any) => {
    setSearchParams(filters);
  };

  const handleClearSearch = () => {
    setSearchParams(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Social Achievements & Celebrations</h1>
      </div>

      <div className="mt-6">
        <div className="space-y-6">
          <PostForm onPostCreated={handlePostCreated} />

          <PostSearch onSearch={handleSearch} onClearSearch={handleClearSearch} />

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {searchParams ? 'Search Results' : 'Recent Updates'}
            </h3>

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
