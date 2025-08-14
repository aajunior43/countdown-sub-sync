import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, Settings, Download, Copy } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/use-local-storage";

interface TelegramBackupProps {
  subscriptions: Subscription[];
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export function TelegramBackup({ subscriptions }: TelegramBackupProps) {
  const [config, setConfig] = useLocalStorage<TelegramConfig>('telegramConfig', {
    botToken: '8275048279:AAFE4DKypfm6BpC_O_irY08gIsGA7EiqdPE',
    chatId: '942288759'
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [backupData, setBackupData] = useState('');
  const [isGettingChatId, setIsGettingChatId] = useState(false);
  const { toast } = useToast();

  // Gerar dados de backup
  const generateBackupData = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      subscriptions: subscriptions,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.isActive).length,
      totalMonthlySpending: subscriptions.reduce((sum, s) => s.billingPeriod === 'mensal' ? sum + s.price : sum, 0),
      totalAnnualSpending: subscriptions.reduce((sum, s) => s.billingPeriod === 'anual' ? sum + s.price : sum, 0)
    };
    
    return JSON.stringify(backupObj, null, 2);
  };

  // Gerar texto legível
  const generateReadableText = () => {
    const activeSubscriptions = subscriptions.filter(s => s.isActive);
    const monthlyTotal = subscriptions.reduce((sum, s) => s.billingPeriod === 'mensal' ? sum + s.price : sum, 0);
    const annualTotal = subscriptions.reduce((sum, s) => s.billingPeriod === 'anual' ? sum + s.price : sum, 0);
    
    let text = `📊 BACKUP DAS ASSINATURAS\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    text += `📈 RESUMO:\n`;
    text += `• Total de assinaturas: ${subscriptions.length}\n`;
    text += `• Assinaturas ativas: ${activeSubscriptions.length}\n`;
    text += `• Gasto mensal: R$ ${monthlyTotal.toFixed(2)}\n`;
    text += `• Gasto anual: R$ ${annualTotal.toFixed(2)}\n`;
    text += `• Projeção anual: R$ ${(monthlyTotal * 12 + annualTotal).toFixed(2)}\n\n`;
    
    if (activeSubscriptions.length > 0) {
      text += `📋 ASSINATURAS ATIVAS:\n`;
      activeSubscriptions.forEach((sub, index) => {
        const renewalDate = new Date(sub.renewalDate).toLocaleDateString('pt-BR');
        text += `${index + 1}. ${sub.name}\n`;
        text += `   💰 ${sub.currency} ${sub.price.toFixed(2)} (${sub.billingPeriod})\n`;
        text += `   📅 Renovação: ${renewalDate}\n`;
        text += `   🏷️ Categoria: ${sub.category}\n`;
        if (sub.description) {
          text += `   📝 ${sub.description}\n`;
        }
        text += `\n`;
      });
    }
    
    const inactiveSubscriptions = subscriptions.filter(s => !s.isActive);
    if (inactiveSubscriptions.length > 0) {
      text += `❌ ASSINATURAS INATIVAS:\n`;
      inactiveSubscriptions.forEach((sub, index) => {
        text += `${index + 1}. ${sub.name} - ${sub.currency} ${sub.price.toFixed(2)}\n`;
      });
    }
    
    return text;
  };

  // Buscar Chat ID automaticamente
  const getChatId = async () => {
    if (!config.botToken) {
      toast({
        title: "Erro",
        description: "Configure o token do bot primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsGettingChatId(true);
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getUpdates`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar atualizações');
      }
      
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        // Pegar o chat ID da mensagem mais recente
        const lastMessage = data.result[data.result.length - 1];
        const chatId = lastMessage.message?.chat?.id || lastMessage.message?.from?.id;
        
        if (chatId) {
          setConfig({ ...config, chatId: chatId.toString() });
          toast({
            title: "✅ Chat ID encontrado!",
            description: `Chat ID: ${chatId}`
          });
        } else {
          toast({
            title: "⚠️ Nenhuma mensagem encontrada",
            description: "Envie uma mensagem para o bot primeiro e tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "⚠️ Nenhuma mensagem encontrada",
          description: "Envie uma mensagem para o bot primeiro e tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar Chat ID:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar Chat ID. Verifique o token do bot.",
        variant: "destructive"
      });
    } finally {
      setIsGettingChatId(false);
    }
  };

  // Verificar se o bot pode acessar o chat
  const testBotAccess = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: '🤖 Teste de conexão do bot'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.description || 'Erro desconhecido'}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Enviar backup via Telegram
  const sendTelegramBackup = async () => {
    if (!config.botToken || !config.chatId) {
      toast({
        title: "Erro",
        description: "Configure o token do bot e o chat ID do Telegram primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Primeiro, testar se o bot pode acessar o chat
      await testBotAccess();
      
      const jsonData = generateBackupData();
      const textData = generateReadableText();
      
      // Enviar texto legível primeiro (mais simples)
      const textResponse = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: textData,
          parse_mode: 'HTML'
        })
      });
      
      if (!textResponse.ok) {
        const errorData = await textResponse.json();
        console.error('Erro da API Telegram (sendMessage):', errorData);
        throw new Error(`Erro ao enviar texto: ${textResponse.status} - ${errorData.description}`);
      }
      
      // Enviar arquivo JSON
      const jsonBlob = new Blob([jsonData], { type: 'application/json' });
      const formData = new FormData();
      formData.append('chat_id', config.chatId);
      formData.append('document', jsonBlob, `backup-assinaturas-${new Date().toISOString().split('T')[0]}.json`);
      formData.append('caption', '📄 Backup das assinaturas em formato JSON');
      
      const fileResponse = await fetch(`https://api.telegram.org/bot${config.botToken}/sendDocument`, {
        method: 'POST',
        body: formData
      });
      
      if (!fileResponse.ok) {
        const errorData = await fileResponse.json();
        console.error('Erro da API Telegram (sendDocument):', errorData);
        throw new Error(`Erro ao enviar arquivo JSON: ${fileResponse.status} - ${errorData.description}`);
      }

      
      toast({
        title: "✅ Backup enviado!",
        description: "Backup enviado com sucesso para o Telegram."
      });
      
    } catch (error) {
      console.error('Erro ao enviar backup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: `Erro ao enviar backup: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Copiar dados para clipboard
  const copyToClipboard = async (data: string) => {
    try {
      await navigator.clipboard.writeText(data);
      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar dados.",
        variant: "destructive"
      });
    }
  };

  // Preparar dados de backup para visualização
  const prepareBackupData = () => {
    const data = generateBackupData();
    setBackupData(data);
    setIsBackupOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Backup via Telegram
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Configurar Telegram */}
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurar Bot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Bot do Telegram</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botToken">Token do Bot</Label>
                  <Input
                    id="botToken"
                    type="password"
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={config.botToken}
                    onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha o token criando um bot com @BotFather no Telegram
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatId">Chat ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="chatId"
                      placeholder="123456789"
                      value={config.chatId}
                      onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getChatId}
                      disabled={isGettingChatId || !config.botToken}
                      className="whitespace-nowrap"
                    >
                      {isGettingChatId ? 'Buscando...' : 'Buscar ID'}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Como obter seu Chat ID:</strong></p>
                    <p>1. Envie uma mensagem para seu bot</p>
                    <p>2. Clique em "Buscar ID" para encontrar automaticamente</p>
                    <p>3. Ou insira manualmente se souber o número</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsConfigOpen(false)}
                  className="w-full"
                >
                  Salvar Configuração
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Visualizar Backup */}
          <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={prepareBackupData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Visualizar Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Dados do Backup</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(backupData)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateReadableText())}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Texto
                  </Button>
                </div>
                <Textarea
                  value={backupData}
                  readOnly
                  className="min-h-[400px] font-mono text-xs"
                  placeholder="Dados do backup aparecerão aqui..."
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Enviar Backup */}
          <Button 
            onClick={sendTelegramBackup}
            disabled={isSending || !config.botToken || !config.chatId}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Enviando...' : 'Fazer Backup'}
          </Button>
        </div>

        {/* Status */}
        <div className="text-sm text-muted-foreground">
          {config.botToken && config.chatId ? (
            <p className="text-green-600">✅ Bot configurado - Pronto para backup</p>
          ) : (
            <p className="text-yellow-600">⚠️ Configure o bot e chat ID do Telegram primeiro</p>
          )}
          <p>Destino: {config.chatId}</p>
          <p>Total de assinaturas: {subscriptions.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}