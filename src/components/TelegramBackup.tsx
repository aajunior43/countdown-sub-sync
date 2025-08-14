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
    chatId: '+5544991082795'
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [backupData, setBackupData] = useState('');
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

  // Enviar backup via Telegram
  const sendTelegramBackup = async () => {
    if (!config.botToken) {
      toast({
        title: "Erro",
        description: "Configure o token do bot do Telegram primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const jsonData = generateBackupData();
      const textData = generateReadableText();
      
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
        throw new Error('Erro ao enviar arquivo JSON');
      }
      
      // Enviar texto legível
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
        throw new Error('Erro ao enviar texto');
      }
      
      toast({
        title: "✅ Backup enviado!",
        description: "Backup enviado com sucesso para o Telegram."
      });
      
    } catch (error) {
      console.error('Erro ao enviar backup:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar backup. Verifique o token e tente novamente.",
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
                  <Label htmlFor="chatId">Número/Chat ID</Label>
                  <Input
                    id="chatId"
                    placeholder="+5544991082495"
                    value={config.chatId}
                    onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Seu número de telefone ou chat ID do Telegram
                  </p>
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
            disabled={isSending || !config.botToken}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Enviando...' : 'Fazer Backup'}
          </Button>
        </div>

        {/* Status */}
        <div className="text-sm text-muted-foreground">
          {config.botToken ? (
            <p className="text-green-600">✅ Bot configurado - Pronto para backup</p>
          ) : (
            <p className="text-yellow-600">⚠️ Configure o bot do Telegram primeiro</p>
          )}
          <p>Destino: {config.chatId}</p>
          <p>Total de assinaturas: {subscriptions.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}