import { useState } from "react";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionForm } from "@/components/SubscriptionForm";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ExportImport } from "@/components/ExportImport";
import UserMenu from "@/components/UserMenu";
import { Subscription, SubscriptionFormData } from "@/types/subscription";
import { CreditCard, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Starfield Background */}
      <div className="fixed inset-0 z-0">
        {/* Stars */}
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`
            }}
          />
        ))}
        
        {/* Meteors */}
        {Array.from({ length: 1 }).map((_, i) => {
          const directions = [
            { movementAngle: 225, tailAngle: 45 },
            { movementAngle: 315, tailAngle: 135 },
            { movementAngle: 135, tailAngle: 315 },
            { movementAngle: 45, tailAngle: 225 }
          ];
          const direction = directions[Math.floor(Math.random() * directions.length)];
          const tailAngle = direction.tailAngle + (Math.random() - 0.5) * 10;
          
          return (
            <div
              key={`meteor-${i}`}
              className="absolute"
              style={{
                width: '80px',
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.2) 70%, rgba(255,255,255,0.4) 90%, rgba(255,255,255,0.6) 100%)',
                borderRadius: '0.5px',
                boxShadow: '0 0 4px 0.5px rgba(255,255,255,0.2), 0 0 8px 1px rgba(255,255,255,0.05)',
                animation: `meteor-main ${Math.random() * 20 + 40}s linear infinite`,
                animationDelay: `${Math.random() * 30}s`,
                transform: `rotate(${tailAngle}deg)`,
                filter: 'blur(0.2px)'
              }}
            />
          );
        })}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.2; transform: scale(1); }
        }
        
        @keyframes meteor-main {
          0% {
            transform: translateX(-20vw) translateY(-20vh);
            opacity: 0;
          }
          3% {
            opacity: 0.6;
          }
          97% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(120vw) translateY(120vh);
            opacity: 0;
          }
        }
      `}</style>
      
      {/* Modern Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none" />
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-white animate-fade-in">
                Minhas Assinaturas
              </h1>
              <p className="text-gray-300 text-lg">Gerencie suas assinaturas no espaço</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <UserMenu />
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

      <main className="relative z-10 container mx-auto px-6 py-10">
        {/* Enhanced Statistics Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white">Visão Geral</h2>
            <p className="text-gray-300">Acompanhe suas métricas importantes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Total Mensal
                </CardTitle>
                <DollarSign className="h-6 w-6 text-green-400" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-white">
                  R$ {totalMonthlySpending.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400">
                  Gastos recorrentes mensais
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Assinaturas Ativas
                </CardTitle>
                <CreditCard className="h-6 w-6 text-blue-400" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-white">
                  {activeSubscriptions}
                </div>
                <p className="text-xs text-gray-400">
                  Serviços ativos atualmente
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Renovações (7 dias)
                </CardTitle>
                <Calendar className="h-6 w-6 text-orange-400" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-white">
                  {upcomingRenewals}
                </div>
                <p className="text-xs text-gray-400">
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
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Nenhuma assinatura cadastrada
            </h3>
            <p className="text-gray-300 mb-6">Comece adicionando sua primeira assinatura</p>
            
            <div className="pt-4">
              <SubscriptionForm
                onSubmit={handleAddSubscription}
                editingSubscription={editingSubscription}
                onCancel={() => setEditingSubscription(null)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Subscriptions Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Suas Assinaturas</h2>
                <span className="text-sm text-gray-300">
                  {subscriptions.length} {subscriptions.length === 1 ? 'assinatura' : 'assinaturas'}
                </span>
              </div>
              
              {subscriptions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
                    <CreditCard className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Nenhuma assinatura encontrada
                  </h3>
                  <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
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
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              DEV ALEKSANDRO ALVES
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
