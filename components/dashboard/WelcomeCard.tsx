import { Card, CardContent } from '@/components/ui/Card';

interface WelcomeCardProps {
  userName: string | null;
  userEmail: string;
}

export function WelcomeCard({ userName, userEmail }: WelcomeCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userName || userEmail.split('@')[0];

  return (
    <Card hover={false} className="bg-gradient-primary border-0">
      <CardContent className="py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="text-white/80">
          Here&apos;s what&apos;s new today in AI development.
        </p>
      </CardContent>
    </Card>
  );
}
