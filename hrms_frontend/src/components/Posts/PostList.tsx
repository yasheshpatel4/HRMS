import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import api from '../../api';

interface PostListProps {
  filter?: 'all';
  refreshTrigger?: number;
}

const PostList = ({ filter = 'all', refreshTrigger = 0 }: PostListProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/Post/all');
      let filteredPosts = response.data;


      filteredPosts.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(filteredPosts);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter, refreshTrigger]);

  const handleDelete = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.postId !== postId));
  };

  const handleEdit = (post: any) => {
    console.log('Edit post:', post);
  };

  const handleExpandToggle = (postId: number) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 text-lg py-12">
        No posts yet. Be the first to create one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.postId}
          post={post}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onCommentAdded={fetchPosts}
          expanded={expandedPostId === post.postId}
          onToggleExpand={handleExpandToggle}
        />
      ))}
    </div>
  );
};

export default PostList;
