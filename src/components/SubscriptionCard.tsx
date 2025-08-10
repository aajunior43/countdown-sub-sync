import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { useState, useEffect } from "react";
import { CircularCountdown } from "@/components/CircularCountdown";

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const [daysUntilRenewal, setDaysUntilRenewal] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const renewalDate = new Date(subscription.renewalDate);
      const timeDiff = renewalDate.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setDaysUntilRenewal(0);
        setTimeLeft("Vencida");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      setDaysUntilRenewal(days);
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription.renewalDate]);

  const getUrgencyColor = () => {
    if (daysUntilRenewal <= 0) return "destructive";
    if (daysUntilRenewal <= 3) return "destructive";
    if (daysUntilRenewal <= 7) return "default";
    return "secondary";
  };

  const totalDays = subscription.billingPeriod === 'mensal' ? 30 : 365;

  return (
    <Card className="relative overflow-hidden border-border bg-gradient-secondary hover:shadow-elegant transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-accent opacity-50" />
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-1">
              {subscription.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {subscription.category}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subscription)}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="flex items-center gap-6">
          <CircularCountdown totalDays={totalDays} remainingDays={daysUntilRenewal} />

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">
                {subscription.currency} {subscription.price.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs">
                {subscription.billingPeriod === 'mensal' ? 'Mensal' : 'Anual'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Próxima cobrança: {new Date(subscription.renewalDate).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tempo restante:</span>
              <Badge variant={getUrgencyColor()}>{timeLeft}</Badge>
            </div>

            {subscription.description && (
              <p className="text-sm text-muted-foreground">{subscription.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}