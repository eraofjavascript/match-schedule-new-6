import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, MessageCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommentSection } from './CommentSection';

interface Schedule {
  id: string;
  title: string;
  game_name: string;
  time: string;
  date: string;
  place: string;
  description: string | null;
}

interface Reaction {
  id: string;
  schedule_id: string;
  user_id: string;
  emoji: string;
}

interface ScheduleCardProps {
  schedule: Schedule;
  reactions: Reaction[];
  commentCount: number;
  onReaction: (scheduleId: string, emoji: string) => void;
  userReaction?: string;
}

const EMOJIS = ['👍', '❤️', '🎉', '⚽', '🏀', '🔥'];

export const ScheduleCard = ({ 
  schedule, 
  reactions, 
  commentCount,
  onReaction,
  userReaction
}: ScheduleCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const getReactionCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length || 0;
  };

  const handleEmojiSelect = (emoji: string) => {
    onReaction(schedule.id, emoji);
    setEmojiPickerOpen(false);
  };

  return (
    <Card className="neon-border hover:shadow-lg transition-all">
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
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {userReaction ? (
                  <>
                    <span className="text-lg">{userReaction}</span>
                    <span className="ml-1 text-xs">Change</span>
                  </>
                ) : (
                  'React'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1">
                {EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {EMOJIS.map((emoji) => {
            const count = getReactionCount(emoji);
            if (count === 0) return null;
            return (
              <div key={emoji} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm">
                <span className="text-lg">{emoji}</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Comments Section */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount} Comments</span>
          </Button>

          {showComments && <CommentSection scheduleId={schedule.id} />}
        </div>
      </CardContent>
    </Card>
  );
};
