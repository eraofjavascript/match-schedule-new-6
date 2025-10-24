import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const Feed = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

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

    fetchSchedules();

    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
