import { Heart, MessageCircle, Trash2, Edit2 } from 'lucide-react'; 
import { useAuth } from '../../Context/AuthContext';
import api from '../../api';
import { useState } from 'react';

interface PostCardProps {
  post: any;
  onDelete: (postId: number) => void;
  onEdit: (post: any) => void;
  onCommentAdded: () => void;
  expanded?: boolean;
  onToggleExpand?: (postId: number) => void;
}

const PostCard = ({ post, onDelete, onEdit, onCommentAdded, expanded = false, onToggleExpand }: PostCardProps) => {
  const { user, role } = useAuth();
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  const isOwner = user?.userId == post.owner?.userId;
  const isHR = role =='HR';
  const isLiked = post.likedBy?.some((u: any) => u.userId === user?.userId);

  const handleLike = async () => {
    setLiking(true);
    try {
      await api.post(`/Post/${post.postId}/like`);
      onCommentAdded(); 
    } catch (err) {
      setError('Failed to like post');
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      await api.post(`/Post/${post.postId}/comment`, commentText);
      setCommentText('');
      onCommentAdded(); 
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/Post/${post.postId}`);
        onDelete(post.postId);
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 border border-gray-200 hover:shadow-lg transition overflow-hidden">
      {error && (
        <div className="m-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <div className="p-6 pb-0 flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {post.owner?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{post.owner?.name || 'Anonymous'}</h3>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          {post.isSystemGenerated && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
              🎉 System Generated 
            </span>
          )}
        </div>

        {(isOwner || isHR) && (
          <div className="flex gap-2">
            {isOwner && (
              <button onClick={() => onEdit(post)} className="p-2 text-gray-500 hover:text-blue-600 transition">
                <Edit2 size={18} />
              </button>
            )}
            <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 transition">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="px-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        {post.description && (
          <p className="text-gray-600 mb-3 text-sm italic">{post.description}</p>
        )}
        <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.filePath && (
        <div className="w-full mb-4 px-0 flex justify-center bg-gray-50 border-y border-gray-100">
          <img 
            src={post.filePath} 
            alt={post.title}
            className="max-h-[500px] w-full object-contain hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
            onClick={() => window.open(post.filePath, '_blank')}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="px-6 pb-6">
        {post.tags && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.split(',').map((tag: string, idx: number) => (
              <span key={idx} className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4 pb-4 border-b">
          <div className="flex gap-4">
            <span><b>{post.likedBy?.length || 0}</b> Likes</span>
            <span><b>{post.comments?.length || 0}</b> Comments</span>
          </div>
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            {post.visibility || 'Public'}
          </span>
        </div>

        <div className="flex justify-start gap-6">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 font-semibold transition ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={() => onToggleExpand?.(post.postId)}
            className="flex items-center gap-2 font-semibold text-gray-600 hover:text-blue-600 transition"
          >
            <MessageCircle size={18} />
            Comment
          </button>
        </div>

        {expanded && (
          <div className="mt-6 pt-6 border-t animate-in fade-in duration-300">
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={commenting || !commentText.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {commenting ? '...' : 'Post'}
                </button>
              </div>
            </form>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any) => (
                  <div key={comment.commentId} className="flex items-start gap-3 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                      {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-800 text-sm">{comment.author?.name || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{formatDate(comment.createdAt)}</p>
                      </div>
                      <p className="text-gray-700 text-sm mt-0.5">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;