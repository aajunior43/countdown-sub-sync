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
      // Timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 30000)
      );

      const operationPromise = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }

        // Validar dados antes de enviar
        if (!data.name?.trim()) {
          throw new Error('Nome da assinatura é obrigatório');
        }

        if (!data.price || data.price <= 0) {
          throw new Error('Preço deve ser maior que zero');
        }



        if (!data.renewalDate) {
          throw new Error('Data de renovação é obrigatória');
        }

        // Validar formato da data
        const renewalDate = new Date(data.renewalDate);
        if (isNaN(renewalDate.getTime())) {
          throw new Error('Data de renovação inválida');
        }

        const subscriptionData = {
          user_id: user.id,
          name: data.name.trim(),
          price: Number(data.price),
          currency: data.currency || 'R$',
          renewal_date: data.renewalDate,
          category: 'Outros', // TEMPORÁRIO: Remover após aplicar migração SQL
          description: data.description?.trim() || null,
          is_active: true,
          billing_period: data.billingPeriod
        };

        const { data: newSub, error } = await supabase
          .from('subscriptions')
          .insert([subscriptionData])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Erro do banco de dados: ${error.message}`);
        }

        if (!newSub) {
          throw new Error('Nenhum dado retornado do banco de dados');
        }

        return newSub;
      };

      const newSub = await Promise.race([operationPromise(), timeoutPromise]);

      // Map database fields to subscription interface
      const mappedSubscription: Subscription = {
        id: newSub.id,
        name: newSub.name,
        price: parseFloat(newSub.price.toString()),
        currency: newSub.currency,
        renewalDate: newSub.renewal_date,
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
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = "A operação demorou muito para responder. Verifique sua conexão e tente novamente.";
        } else if (error.message.includes('Usuário não autenticado')) {
          errorMessage = "Você precisa estar logado para adicionar assinaturas.";
        } else if (error.message.includes('obrigatório') || error.message.includes('inválida')) {
          errorMessage = error.message;
        } else if (error.message.includes('banco de dados')) {
          errorMessage = "Erro no servidor. Tente novamente em alguns instantes.";
        }
      }
      
      toast({
        title: "Erro ao adicionar assinatura",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw para que o formulário possa lidar com o erro
    }
  };

  // Update subscription
  const updateSubscription = async (id: string, data: SubscriptionFormData) => {
    try {
      // Timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou muito para responder')), 30000)
      );

      const operationPromise = async () => {
        // Validar dados antes de enviar
        if (!data.name?.trim()) {
          throw new Error('Nome da assinatura é obrigatório');
        }

        if (!data.price || data.price <= 0) {
          throw new Error('Preço deve ser maior que zero');
        }



        if (!data.renewalDate) {
          throw new Error('Data de renovação é obrigatória');
        }

        // Validar formato da data
        const renewalDate = new Date(data.renewalDate);
        if (isNaN(renewalDate.getTime())) {
          throw new Error('Data de renovação inválida');
        }

        const updateData = {
          name: data.name.trim(),
          price: Number(data.price),
          currency: data.currency || 'R$',
          renewal_date: data.renewalDate,
          category: 'Outros', // TEMPORÁRIO: Remover após aplicar migração SQL
          description: data.description?.trim() || null,
          billing_period: data.billingPeriod
        };

        const { error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', id);

        if (error) {
          console.error('Supabase error:', error);
          throw new Error(`Erro do banco de dados: ${error.message}`);
        }

        return updateData;
      };

      await Promise.race([operationPromise(), timeoutPromise]);

      setSubscriptions(prev => prev.map(sub => 
        sub.id === id 
          ? { 
              ...sub, 
              ...data,
              price: Number(data.price)
            }
          : sub
      ));
      
      toast({
        title: "Assinatura atualizada",
        description: "Sua assinatura foi atualizada com sucesso!",
      });

    } catch (error) {
      console.error('Error updating subscription:', error);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = "A operação demorou muito para responder. Verifique sua conexão e tente novamente.";
        } else if (error.message.includes('obrigatório') || error.message.includes('inválida')) {
          errorMessage = error.message;
        } else if (error.message.includes('banco de dados')) {
          errorMessage = "Erro no servidor. Tente novamente em alguns instantes.";
        }
      }
      
      toast({
        title: "Erro ao atualizar assinatura",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw para que o formulário possa lidar com o erro
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