import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, Database } from 'lucide-react';
import { toast } from 'sonner';

const Commands = () => {
  const adminCommands = [
    {
      icon: Users,
      title: 'Manage Users',
      description: 'View and manage user accounts',
      action: () => toast.info('User management coming soon'),
    },
    {
      icon: Database,
      title: 'Database',
      description: 'Access database management tools',
      action: () => toast.info('Database tools coming soon'),
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure application settings',
      action: () => toast.info('Settings panel coming soon'),
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Manage security and permissions',
      action: () => toast.info('Security settings coming soon'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 neon-text">Admin Commands</h2>
        <p className="text-muted-foreground">Manage your sports schedule platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {adminCommands.map((command, index) => {
          const Icon = command.icon;
          return (
            <Card key={index} className="neon-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{command.title}</CardTitle>
                    <CardDescription>{command.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={command.action} className="w-full">
                  Access
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Commands;
