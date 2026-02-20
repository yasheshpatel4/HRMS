import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import api from '../../api';
import { Loader2 } from 'lucide-react';

interface PostListProps {
  filter?: 'all';
  refreshTrigger?: number;
}

const PostList = ({ filter = 'all', refreshTrigger = 0 }: PostListProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchPosts = async (pageNum: number, isInitial = false) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/Post/all?page=${pageNum}&size=10`);
      
      const { content, last } = response.data;

      setPosts(prev => isInitial ? content : [...prev, ...content]);
      setHasMore(!last);
    } catch (err) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [filter, refreshTrigger]);

  useEffect(() => {
    if (page > 0) {
      fetchPosts(page);
    }
  }, [page]);

  const handleDelete = (postId: number) => {
    setPosts(prev => prev.filter(p => p.postId !== postId));
  };

  const handleExpandToggle = (postId: number) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      {posts.map((post, index) => {
        if (posts.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.postId}>
              <PostCard
                post={post}
                onDelete={handleDelete}
                onEdit={(p) => console.log('Edit:', p)}
                onCommentAdded={() => fetchPosts(0, true)}
                expanded={expandedPostId === post.postId}
                onToggleExpand={handleExpandToggle}
              />
            </div>
          );
        } else {
          return (
            <PostCard
              key={post.postId}
              post={post}
              onDelete={handleDelete}
              onEdit={(p) => console.log('Edit:', p)}
              onCommentAdded={() => fetchPosts(0, true)}
              expanded={expandedPostId === post.postId}
              onToggleExpand={handleExpandToggle}
            />
          );
        }
      })}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          You've caught up with everything!
        </p>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-500 text-lg py-12">
          No posts yet. Be the first to create one!
        </div>
      )}
    </div>
  );
};

export default PostList;
