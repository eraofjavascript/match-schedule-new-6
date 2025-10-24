import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Commands = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSchedule, setShowSchedule] = useState(false);
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!username || !password || !displayName) {
      toast.error('All fields are required');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast.error('Username must be 3-20 characters (letters, numbers, underscore only)');
      return;
    }

    setLoading(true);
    const email = `${username}@sportschedule.com`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: displayName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('User created successfully!');
      setUsername('');
      setPassword('');
      setDisplayName('');
      setShowSignup(false);
    }
    setLoading(false);
  };

  const handleCreateSchedule = async () => {
    if (!title || !gameName || !time || !date || !place) {
      toast.error('Title, game name, time, date, and place are required');
      return;
    }

    setScheduleLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error('You must be logged in to create a schedule');
      setScheduleLoading(false);
      return;
    }

    const { error } = await supabase.from('schedules').insert({
      title,
      game_name: gameName,
      time,
      date,
      place,
      description,
      user_id: user.id,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Schedule created successfully!');
      setTitle('');
      setGameName('');
      setTime('');
      setDate('');
      setPlace('');
      setDescription('');
      setShowSchedule(false);
    }
    setScheduleLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Admin Commands</h2>
        <p className="text-muted-foreground">Manage your sports schedule platform</p>
      </div>

      <div className="grid gap-4">
        <Card className="neon-border hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Create User</CardTitle>
                <CardDescription>Add a new user to the platform</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowSignup(!showSignup)} className="w-full">
              {showSignup ? 'Cancel' : 'Access'}
            </Button>

            {showSignup && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="neon-border hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Create Schedule</CardTitle>
                <CardDescription>Post a new game schedule</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowSchedule(!showSchedule)} className="w-full">
              {showSchedule ? 'Cancel' : 'Access'}
            </Button>

            {showSchedule && (
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gameName">Game Name</Label>
                  <Input
                    id="gameName"
                    placeholder="Enter game name"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    placeholder="Enter venue/location"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreateSchedule} 
                  className="w-full"
                  disabled={scheduleLoading}
                >
                  {scheduleLoading ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Commands;
