import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subscription, SubscriptionFormData } from '@/types/subscription';
import { useToast } from '@/hooks/use-toast';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch subscriptions from Supabase
  const fetchSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          title: "Erro ao carregar assinaturas",
          description: "Não foi possível carregar suas assinaturas. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Map database fields to subscription interface
      const mappedSubscriptions: Subscription[] = (data || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        price: parseFloat(sub.price.toString()),
        currency: sub.currency,
        renewalDate: sub.renewal_date,
        category: sub.category,
        description: sub.description || '',
        isActive: sub.is_active,
        billingPeriod: sub.billing_period as 'mensal' | 'anual'
      }));

      setSubscriptions(mappedSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erro ao carregar assinaturas",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new subscription
  const addSubscription = async (data: SubscriptionFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar assinaturas.",
          variant: "destructive",
        });
        return;
      }

      const subscriptionData = {
        user_id: user.id,
        name: data.name,
        price: data.price,
        currency: data.currency,
        renewal_date: data.renewalDate,
        category: data.category,
        description: data.description || null,
        is_active: true,
        billing_period: data.billingPeriod
      };

      const { data: newSub, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        console.error('Error adding subscription:', error);
        toast({
          title: "Erro ao adicionar assinatura",
          description: "Não foi possível adicionar a assinatura. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Map database fields to subscription interface
      const mappedSubscription: Subscription = {
        id: newSub.id,
        name: newSub.name,
        price: parseFloat(newSub.price.toString()),
        currency: newSub.currency,
        renewalDate: newSub.renewal_date,
        category: newSub.category,
        description: newSub.description || '',
        isActive: newSub.is_active,
        billingPeriod: newSub.billing_period as 'mensal' | 'anual'
      };

      setSubscriptions(prev => [mappedSubscription, ...prev]);
      
      toast({
        title: "Assinatura adicionada",
        description: "Sua assinatura foi adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast({
        title: "Erro ao adicionar assinatura",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Update subscription
  const updateSubscription = async (id: string, data: SubscriptionFormData) => {
    try {
      const updateData = {
        name: data.name,
        price: data.price,
        currency: data.currency,
        renewal_date: data.renewalDate,
        category: data.category,
        description: data.description || null,
        billing_period: data.billingPeriod
      };

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: "Erro ao atualizar assinatura",
          description: "Não foi possível atualizar a assinatura. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.id === id 
          ? { 
              ...sub, 
              ...data,
              price: data.price
            }
          : sub
      ));
      
      toast({
        title: "Assinatura atualizada",
        description: "Sua assinatura foi atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Erro ao atualizar assinatura",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Delete subscription
  const deleteSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        toast({
          title: "Erro ao excluir assinatura",
          description: "Não foi possível excluir a assinatura. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      
      toast({
        title: "Assinatura excluída",
        description: "Sua assinatura foi excluída com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Erro ao excluir assinatura",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubscriptions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchSubscriptions();
      } else if (event === 'SIGNED_OUT') {
        setSubscriptions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions: fetchSubscriptions
  };
}