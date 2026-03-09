import { useState, useEffect, useRef, useCallback } from 'react';
import PostCard from './PostCard';
import api from '../../api';
import { Loader2 } from 'lucide-react';
import EditPostModal from './EditPostModal';

interface PostListProps {
  filter?: 'all';
  refreshTrigger?: number;
  searchParams?: any;
}

const PostList = ({ filter = 'all', refreshTrigger = 0, searchParams = null }: PostListProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const handleUpdateLocal = (updatedPost: any) => {
    setPosts(prev => prev.map(p => p.postId === updatedPost.postId ? updatedPost : p));
  };

  const fetchPosts = useCallback(async (pageNum: number, isInitial = false) => {
    if (loadingRef.current && !isInitial) return;
    
    setLoading(true);
    setError('');

    try {
      // 1. IMPROVED SEARCH DETECTION: Ensure searchParams has actual values
      const hasQuery = searchParams && Object.values(searchParams).some(v => v !== null && v !== '');
      const baseUrl = hasQuery ? '/Post/search' : '/Post/all';

      const requestParams: any = {
        page: pageNum,
        size: 10,
        sort: 'createdAt,desc',
      };

      if (hasQuery) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) requestParams[key] = value;
        });
      }

      const response = await api.get(baseUrl, { params: requestParams });
      
      const rawData = response.data;
      const content = Array.isArray(rawData?.content) ? rawData.content : (Array.isArray(rawData) ? rawData : []);
      const last = rawData?.last ?? (content.length < 10);

      setPosts(prev => {
        if (isInitial) return content;
        
        // 2. DUPLICATE PROTECTION: Filter out posts already in the state
        const existingIds = new Set(prev.map(p => p.postId));
        const uniqueNewPosts = content.filter((p: { postId: any; }) => !existingIds.has(p.postId));
        return [...prev, ...uniqueNewPosts];
      });

      setHasMore(!last);
    } catch (err) {
      setError('Failed to load posts');
      console.error("Fetch Error:", err);
      if (isInitial) setPosts([]); 
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Handle Search/Filter/Refresh: Resets everything
  useEffect(() => {
    setPage(0);
    fetchPosts(0, true);
  }, [filter, refreshTrigger, JSON.stringify(searchParams), fetchPosts]);

  // Handle Pagination: Triggers on scroll
  useEffect(() => {
    if (page > 0) {
      fetchPosts(page, false);
    }
  }, [page, fetchPosts]);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingRef.current) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Only increment page if we aren't loading and there is more data
      if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, []);

  const handleDelete = (postId: number) => setPosts(prev => prev.filter(p => p.postId !== postId));
  const handleToggleExpand = (postId: number) => setExpandedPostId(prev => (prev === postId ? null : postId));

  return (
    <div className="space-y-4 pb-10">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {(posts || []).map((post, index) => {
        // Safe length check to avoid TypeError
        const currentLength = posts?.length || 0;
        const isLast = currentLength === index + 1;
        return (
          <div ref={isLast ? lastPostElementRef : null} key={post.postId || index}>
            <PostCard
              post={post}
              onDelete={handleDelete}
              onEdit={(p) => setEditingPost(p)}
              onCommentAdded={() => fetchPosts(0, true)}
              expanded={expandedPostId === post.postId}
              onToggleExpand={handleToggleExpand}
            />
          </div>
        );
      })}

      {editingPost && (
        <EditPostModal 
          post={editingPost} 
          onClose={() => setEditingPost(null)} 
          onUpdate={handleUpdateLocal} 
        />
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      )}

      {!hasMore && (posts?.length || 0) > 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          You've caught up with everything!
        </p>
      )}

      {!loading && (posts?.length || 0) === 0 && !error && (
        <div className="text-center text-gray-500 text-lg py-12">
          {searchParams ? 'No posts found matching your search.' : 'No posts yet. Be the first to create one!'}
        </div>
      )}
    </div>
  );
};

export default PostList;
