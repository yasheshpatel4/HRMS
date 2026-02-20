import { useState } from 'react';
import PostList from './PostList';
import PostForm from './PostForm';
import PostSearch from './PostSearch';

const Post = () => {
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearch = (posts: any[]) => {
    setSearchResults(posts);
  };

  const handleClearSearch = () => {
    setSearchResults(null);
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

            {searchResults === null ? (
              <PostList filter="all" refreshTrigger={refreshTrigger} />
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results ({searchResults.length})</h3>
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((post) => (
                      <div
                        key={post.postId}
                        className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                      >
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
                        <p className="text-gray-600 mb-2 text-sm">{post.description}</p>
                        <p className="text-gray-700 mb-4">{post.post}</p>
                        {post.tags && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.split(',').map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No posts found matching your criteria</p>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Post;
