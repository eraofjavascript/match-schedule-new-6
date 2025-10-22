import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Feed = () => {
  const upcomingGames = [
    {
      id: 1,
      sport: 'Basketball',
      home: 'Lakers',
      away: 'Warriors',
      date: '2025-10-23',
      time: '19:30',
      venue: 'Crypto.com Arena',
    },
    {
      id: 2,
      sport: 'Football',
      home: 'Patriots',
      away: 'Eagles',
      date: '2025-10-24',
      time: '20:00',
      venue: 'Gillette Stadium',
    },
    {
      id: 3,
      sport: 'Baseball',
      home: 'Yankees',
      away: 'Red Sox',
      date: '2025-10-25',
      time: '18:00',
      venue: 'Yankee Stadium',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Upcoming Games</h2>
        <p className="text-muted-foreground">Stay updated with the latest sports schedule</p>
      </div>

      <div className="grid gap-4">
        {upcomingGames.map((game) => (
          <Card key={game.id} className="neon-border hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/20 text-primary border-primary">{game.sport}</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {game.date}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xl font-bold">{game.home}</p>
                  <p className="text-sm text-muted-foreground">Home</p>
                </div>
                <div className="text-2xl font-bold text-primary">VS</div>
                <div className="text-center">
                  <p className="text-xl font-bold">{game.away}</p>
                  <p className="text-sm text-muted-foreground">Away</p>
                </div>
              </div>
              
              <div className="flex items-center justify-around pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  {game.time}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {game.venue}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Feed;
