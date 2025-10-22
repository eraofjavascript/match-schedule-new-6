import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, Trophy, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Profile</h2>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <Card className="neon-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Account Information</CardTitle>
          {isAdmin && (
            <Badge className="bg-primary/20 text-primary border-primary">
              <Trophy className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {profile ? getInitials(profile.display_name) : <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{profile?.display_name}</h3>
              <p className="text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-lg font-medium">{profile?.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="text-lg font-medium">{profile?.display_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-lg font-medium">
                {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button onClick={signOut} variant="destructive" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
