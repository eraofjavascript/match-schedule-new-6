import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { ScheduleCard } from '@/components/ScheduleCard';

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

interface Reaction {
  id: string;
  schedule_id: string;
  user_id: string;
  emoji: string;
}

const Feed = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});

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

    const fetchCommentCounts = async () => {
      const { data, error } = await supabase
        .from('schedule_comments')
        .select('schedule_id');

      if (error) {
        console.error('Error fetching comment counts:', error);
      } else {
        const counts = (data || []).reduce((acc, comment) => {
          acc[comment.schedule_id] = (acc[comment.schedule_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setCommentCounts(counts);
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
    fetchCommentCounts();
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
          fetchCommentCounts();
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

  const handleReaction = async (scheduleId: string, emoji: string) => {
    if (!user) {
      toast.error('You must be logged in to react');
      return;
    }

    // Remove any existing reaction by this user
    const existingReaction = reactions[scheduleId]?.find(
      r => r.user_id === user.id
    );

    if (existingReaction) {
      await supabase
        .from('schedule_reactions')
        .delete()
        .eq('id', existingReaction.id);
    }

    // If clicking same emoji, just remove it (toggle off)
    if (existingReaction?.emoji === emoji) {
      return;
    }

    // Add new reaction
    const { error } = await supabase.from('schedule_reactions').insert({
      schedule_id: scheduleId,
      user_id: user.id,
      emoji,
    });

    if (error) {
      toast.error(error.message || 'Failed to add reaction');
    }
  };

  const getUserReaction = (scheduleId: string): string | undefined => {
    if (!user) return undefined;
    return reactions[scheduleId]?.find(r => r.user_id === user.id)?.emoji;
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
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              reactions={reactions[schedule.id] || []}
              commentCount={commentCounts[schedule.id] || 0}
              onReaction={handleReaction}
              userReaction={getUserReaction(schedule.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
