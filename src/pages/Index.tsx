import { useState, useEffect } from "react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { ExportImport } from "@/components/ExportImport";
import { Subscription, SubscriptionFormData } from "@/types/subscription";
import { CreditCard, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Generate unique ID for new subscriptions
  const generateId = () => {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add new subscription
  const handleAddSubscription = (data: SubscriptionFormData) => {
    const newSubscription: Subscription = {
      ...data,
      id: generateId(),
      isActive: true,
    };
    setSubscriptions([...subscriptions, newSubscription]);
  };

  // Edit subscription
  const handleEditSubscription = (data: SubscriptionFormData) => {
    if (!editingSubscription) return;
    
    const updatedSubscriptions = subscriptions.map(sub =>
      sub.id === editingSubscription.id
        ? { ...sub, ...data }
        : sub
    );
    setSubscriptions(updatedSubscriptions);
    setEditingSubscription(null);
  };

  // Delete subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  // Import subscriptions
  const handleImportSubscriptions = (importedSubscriptions: Subscription[]) => {
    setSubscriptions(importedSubscriptions);
  };

  // Calculate statistics
  const totalMonthlySpending = subscriptions.reduce((total, sub) => total + sub.price, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive).length;
  const upcomingRenewals = subscriptions.filter(sub => {
    const renewalDate = new Date(sub.renewalDate);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return renewalDate <= nextWeek && renewalDate >= new Date();
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border bg-gradient-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-40 blur-2xl pointer-events-none" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
                Minhas Assinaturas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie e acompanhe todas as suas assinaturas em um só lugar
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <ExportImport
                subscriptions={subscriptions}
                onImport={handleImportSubscriptions}
              />
              <SubscriptionForm
                onSubmit={handleAddSubscription}
                editingSubscription={editingSubscription}
                onCancel={() => setEditingSubscription(null)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-secondary border-border hover-scale animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                R$ {totalMonthlySpending.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary border-border hover-scale animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assinaturas Ativas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {activeSubscriptions}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-secondary border-border hover-scale animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Renovações (7 dias)
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {upcomingRenewals}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Edit Form */}
        {editingSubscription && (
          <div className="mb-8">
            <SubscriptionForm
              onSubmit={handleEditSubscription}
              editingSubscription={editingSubscription}
              onCancel={() => setEditingSubscription(null)}
            />
          </div>
        )}

        {/* Subscriptions Grid */}
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma assinatura cadastrada
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando sua primeira assinatura para acompanhar os vencimentos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions
              .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
              .map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={setEditingSubscription}
                  onDelete={handleDeleteSubscription}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
