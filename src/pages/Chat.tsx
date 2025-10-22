import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  user_id: string;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Fetch user profile
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

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: 'Error loading messages',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleSend = async () => {
    if (message.trim() && user && profile) {
      const { error } = await supabase.from('messages').insert({
        content: message,
        user_id: user.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      });

      if (error) {
        toast({
          title: 'Error sending message',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setMessage('');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Chat</h2>
        <p className="text-muted-foreground">Connect with the community</p>
      </div>

      <Card className="neon-border h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Sports Chat Room</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8 border border-primary/20">
                    <AvatarImage src={msg.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {msg.display_name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-primary">{msg.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="ml-10">{msg.content}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
