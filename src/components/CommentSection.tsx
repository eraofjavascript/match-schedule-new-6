import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
}

export const CommentSection = ({ scheduleId }: { scheduleId: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLikes, setCommentLikes] = useState<Record<string, CommentLike[]>>({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
    fetchCommentLikes();

    const commentsChannel = supabase
      .channel(`comments-${scheduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_comments',
          filter: `schedule_id=eq.${scheduleId}`,
        },
        () => fetchComments()
      )
      .subscribe();

    const likesChannel = supabase
      .channel(`comment-likes-${scheduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_comment_likes',
        },
        () => fetchCommentLikes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [scheduleId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('schedule_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles!schedule_comments_user_id_fkey (
          display_name,
          avatar_url
        )
      `)
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data as any || []);
    }
  };

  const fetchCommentLikes = async () => {
    const { data, error } = await supabase
      .from('schedule_comment_likes')
      .select('*');

    if (error) {
      console.error('Error fetching comment likes:', error);
    } else {
      const grouped = (data || []).reduce((acc, like) => {
        if (!acc[like.comment_id]) acc[like.comment_id] = [];
        acc[like.comment_id].push(like);
        return acc;
      }, {} as Record<string, CommentLike[]>);
      setCommentLikes(grouped);
    }
  };

  const handleAddComment = async () => {
    const content = newComment.trim();
    if (!content || !user) return;

    const { error } = await supabase.from('schedule_comments').insert({
      schedule_id: scheduleId,
      user_id: user.id,
      content,
    });

    if (error) {
      toast.error(error.message || 'Failed to add comment');
    } else {
      setNewComment('');
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('You must be logged in to like comments');
      return;
    }

    const existingLike = commentLikes[commentId]?.find(
      like => like.user_id === user.id
    );

    if (existingLike) {
      const { error } = await supabase
        .from('schedule_comment_likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) toast.error('Failed to remove like');
    } else {
      const { error } = await supabase.from('schedule_comment_likes').insert({
        comment_id: commentId,
        user_id: user.id,
      });

      if (error) toast.error(error.message || 'Failed to like comment');
    }
  };

  const getLikeCount = (commentId: string) => {
    return commentLikes[commentId]?.length || 0;
  };

  const hasUserLiked = (commentId: string) => {
    if (!user) return false;
    return commentLikes[commentId]?.some(like => like.user_id === user.id) || false;
  };

  return (
    <div className="mt-4 space-y-4">
      {user ? (
        <div className="flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddComment();
              }
            }}
          />
          <Button onClick={handleAddComment}>Post</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <span className="text-sm text-muted-foreground">Sign in to comment</span>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.profiles?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{comment.profiles?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm break-words">{comment.content}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 flex-shrink-0"
                onClick={() => handleToggleLike(comment.id)}
              >
                <Heart
                  className={`h-4 w-4 ${hasUserLiked(comment.id) ? 'fill-red-500 text-red-500' : ''}`}
                />
                {getLikeCount(comment.id) > 0 && (
                  <span className="ml-1 text-xs">{getLikeCount(comment.id)}</span>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
