import { useState } from "react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { NotificationSettings } from "@/components/NotificationSettings";
import { TelegramBackup } from "@/components/TelegramBackup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportImport } from "@/components/ExportImport";
import { Subscription, SubscriptionFormData } from "@/types/subscription";
import { CreditCard, DollarSign, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useNotifications } from "@/hooks/use-notifications";

const Index = () => {
  const { 
    subscriptions, 
    loading, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription 
  } = useSubscriptions();
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Inicializar sistema de notificações
  useNotifications(subscriptions);

  // Função para restaurar backup
  const handleRestoreBackup = (restoredSubscriptions: Subscription[]) => {
    // TODO: Implementar restore from backup no Supabase
    console.log('Restore backup:', restoredSubscriptions);
  };

  // Função para adicionar assinatura via Telegram
  const handleAddSubscriptionFromTelegram = (subscriptionData: Omit<Subscription, 'id'>) => {
    // Convert to SubscriptionFormData format
    const formData: SubscriptionFormData = {
      name: subscriptionData.name,
      price: subscriptionData.price,
      currency: subscriptionData.currency,
      renewalDate: subscriptionData.renewalDate,
      category: subscriptionData.category,
      description: subscriptionData.description,
      billingPeriod: subscriptionData.billingPeriod
    };
    addSubscription(formData);
  };

  // Add new subscription
  const handleAddSubscription = (data: SubscriptionFormData) => {
    addSubscription(data);
  };

  // Edit subscription
  const handleEditSubscription = (data: SubscriptionFormData) => {
    if (!editingSubscription) return;
    updateSubscription(editingSubscription.id, data);
    setEditingSubscription(null);
  };

  // Delete subscription
  const handleDeleteSubscription = (id: string) => {
    deleteSubscription(id);
  };

  // Import subscriptions
  const handleImportSubscriptions = (importedSubscriptions: Subscription[]) => {
    // TODO: Implementar import no Supabase
    console.log('Import subscriptions:', importedSubscriptions);
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
    <div className="min-h-screen bg-background bg-bg-pattern">
      {/* Modern Header */}
      <header className="relative border-b border-border/50 bg-card-gradient overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-purple-gradient opacity-10 pointer-events-none" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground bg-purple-gradient bg-clip-text text-transparent animate-fade-in">
                Minhas Assinaturas
              </h1>

            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ThemeToggle />
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

      <main className="container mx-auto px-6 py-10">
        {/* Enhanced Statistics Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Visão Geral</h2>
            <p className="text-muted-foreground">Acompanhe suas métricas importantes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Mensal
                </CardTitle>
                <DollarSign className="icon-large" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  R$ {totalMonthlySpending.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gastos recorrentes mensais
                </p>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Assinaturas Ativas
                </CardTitle>
                <CreditCard className="icon-large" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {activeSubscriptions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Serviços ativos atualmente
                </p>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Renovações (7 dias)
                </CardTitle>
                <Calendar className="icon-large" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {upcomingRenewals}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vencimentos próximos
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Divider */}
        <div className="section-divider" />

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

        {/* Main Content with Tabs */}
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="w-20 h-20 bg-purple-gradient rounded-2xl flex items-center justify-center mb-6 shadow-purple-glow animate-pulse-glow">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Nenhuma assinatura cadastrada
            </h3>
            
            <div className="pt-4">
              <SubscriptionForm
                onSubmit={handleAddSubscription}
                editingSubscription={editingSubscription}
                onCancel={() => setEditingSubscription(null)}
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="subscriptions" className="space-y-6">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                 <CreditCard className="h-4 w-4" />
                 Assinaturas
               </TabsTrigger>
               <TabsTrigger value="settings" className="flex items-center gap-2">
                 <Settings className="h-4 w-4" />
                 Configurações
               </TabsTrigger>
             </TabsList>

            <TabsContent value="subscriptions" className="space-y-6">
              {/* Subscriptions Grid */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground">Suas Assinaturas</h2>
                  <span className="text-sm text-muted-foreground">
                    {subscriptions.length} {subscriptions.length === 1 ? 'assinatura' : 'assinaturas'}
                  </span>
                </div>
                
                {subscriptions.length === 0 ? (
                  <div className="empty-state">
                    <div className="w-20 h-20 bg-purple-gradient rounded-2xl flex items-center justify-center mb-6 shadow-purple-glow animate-pulse-glow">
                      <CreditCard className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Nenhuma assinatura encontrada
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                      Adicione sua primeira assinatura para começar a gerenciar seus gastos mensais.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subscriptions.map((subscription) => (
                      <SubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onEdit={setEditingSubscription}
                        onDelete={handleDeleteSubscription}
                      />
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

             <TabsContent value="settings" className="space-y-6">
                <NotificationSettings subscriptions={subscriptions} />
                <TelegramBackup 
                  subscriptions={subscriptions} 
                  onRestoreBackup={handleRestoreBackup}
                  onAddSubscription={handleAddSubscriptionFromTelegram}
                />
              </TabsContent>
           </Tabs>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              DEV ALEKSANDRO ALVES
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
