import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, MessageCircle, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  title: string;
  game_name: string;
  time: string;
  date: string;
  place: string;
  description: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  schedule_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Reaction {
  id: string;
  schedule_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

const Feed = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const emojis = ['👍', '❤️', '🎉', '⚽', '🏀', '🔥'];

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching schedules:', error);
      } else {
        setSchedules(data || []);
      }
    };

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('schedule_comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        const grouped = (data || []).reduce((acc, comment) => {
          if (!acc[comment.schedule_id]) acc[comment.schedule_id] = [];
          acc[comment.schedule_id].push(comment);
          return acc;
        }, {} as Record<string, Comment[]>);
        setComments(grouped);
      }
    };

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('schedule_reactions')
        .select('*');

      if (error) {
        console.error('Error fetching reactions:', error);
      } else {
        const grouped = (data || []).reduce((acc, reaction) => {
          if (!acc[reaction.schedule_id]) acc[reaction.schedule_id] = [];
          acc[reaction.schedule_id].push(reaction);
          return acc;
        }, {} as Record<string, Reaction[]>);
        setReactions(grouped);
      }
    };

    fetchSchedules();
    fetchComments();
    fetchReactions();

    const scheduleChannel = supabase
      .channel('schedules-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
        },
        () => {
          fetchSchedules();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_comments',
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('reactions-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_reactions',
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, []);

  const handleAddComment = async (scheduleId: string) => {
    const content = newComment[scheduleId]?.trim();
    if (!content) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    const { error } = await supabase.from('schedule_comments').insert({
      schedule_id: scheduleId,
      user_id: user.id,
      content,
    });

    if (error) {
      toast.error('Failed to add comment');
    } else {
      setNewComment({ ...newComment, [scheduleId]: '' });
    }
  };

  const handleReaction = async (scheduleId: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }

    const existingReaction = reactions[scheduleId]?.find(
      r => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      const { error } = await supabase
        .from('schedule_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) toast.error('Failed to remove reaction');
    } else {
      const { error } = await supabase.from('schedule_reactions').insert({
        schedule_id: scheduleId,
        user_id: user.id,
        emoji,
      });

      if (error) toast.error('Failed to add reaction');
    }
  };

  const getReactionCount = (scheduleId: string, emoji: string) => {
    return reactions[scheduleId]?.filter(r => r.emoji === emoji).length || 0;
  };

  const hasUserReacted = async (scheduleId: string, emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    return reactions[scheduleId]?.some(r => r.user_id === user.id && r.emoji === emoji) || false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Upcoming Games</h2>
        <p className="text-muted-foreground">Stay updated with the latest sports schedule</p>
      </div>

      <div className="grid gap-4">
        {schedules.length === 0 ? (
          <Card className="neon-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              No schedules yet. Create one from the Commands page!
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="neon-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{schedule.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {schedule.date}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{schedule.game_name}</p>
                </div>
                
                {schedule.description && (
                  <p className="text-muted-foreground text-sm">{schedule.description}</p>
                )}
                
                <div className="flex items-center justify-around pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    {schedule.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {schedule.place}
                  </div>
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                  {emojis.map((emoji) => {
                    const count = getReactionCount(schedule.id, emoji);
                    return (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleReaction(schedule.id, emoji)}
                      >
                        <span className="text-lg">{emoji}</span>
                        {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                      </Button>
                    );
                  })}
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setShowComments({ 
                      ...showComments, 
                      [schedule.id]: !showComments[schedule.id] 
                    })}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {comments[schedule.id]?.length || 0} Comments
                    </span>
                  </Button>

                  {showComments[schedule.id] && (
                    <div className="mt-4 space-y-4">
                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={newComment[schedule.id] || ''}
                          onChange={(e) => setNewComment({ 
                            ...newComment, 
                            [schedule.id]: e.target.value 
                          })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(schedule.id);
                            }
                          }}
                        />
                        <Button onClick={() => handleAddComment(schedule.id)}>
                          Post
                        </Button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-2">
                        {comments[schedule.id]?.map((comment) => (
                          <div 
                            key={comment.id} 
                            className="bg-muted/50 rounded-lg p-3"
                          >
                            <p className="text-sm">{comment.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
