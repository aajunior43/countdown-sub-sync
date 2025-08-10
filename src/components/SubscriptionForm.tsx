import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Subscription, SubscriptionFormData } from "@/types/subscription";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionFormProps {
  onSubmit: (data: SubscriptionFormData) => void;
  editingSubscription?: Subscription | null;
  onCancel?: () => void;
}

export function SubscriptionForm({ onSubmit, editingSubscription, onCancel }: SubscriptionFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: editingSubscription?.name || "",
    price: editingSubscription?.price || 0,
    currency: editingSubscription?.currency || "R$",
    renewalDate: editingSubscription?.renewalDate || "",
    category: editingSubscription?.category || "",
    description: editingSubscription?.description || "",
    billingPeriod: editingSubscription?.billingPeriod || 'mensal',
  });
  const { toast } = useToast();

  const categories = [
    "Streaming",
    "Software",
    "Música",
    "Jogos",
    "Produtividade",
    "Educação",
    "Saúde",
    "Outros"
  ];

const currencies = ["R$", "US$", "€", "£"];

  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.billingPeriod) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    let submission: SubscriptionFormData = { ...formData };

    if (!formData.renewalDate) {
      const now = new Date();
      const daysToAdd = formData.billingPeriod === 'mensal' ? 30 : 365;
      const ms = daysToAdd * 24 * 60 * 60 * 1000;
      const next = new Date(now.getTime() + ms);
      submission.renewalDate = formatDateTimeLocal(next);
    }

    onSubmit(submission);
    setFormData({
      name: "",
      price: 0,
      currency: "R$",
      renewalDate: "",
      category: "",
      description: "",
      billingPeriod: 'mensal',
    });
    setOpen(false);
    
    if (onCancel) onCancel();
    
    toast({
      title: editingSubscription ? "Assinatura atualizada!" : "Assinatura adicionada!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const isEditing = !!editingSubscription;

  if (isEditing) {
    return (
      <div className="space-y-4 p-6 bg-gradient-secondary rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground">Editar Assinatura</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Assinatura *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Netflix, Spotify..."
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPeriod">Periodicidade *</Label>
              <Select value={formData.billingPeriod} onValueChange={(value) => setFormData({ ...formData, billingPeriod: value as 'mensal' | 'anual' })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione a periodicidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal (30 dias)</SelectItem>
                  <SelectItem value="anual">Anual (365 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <div className="flex gap-2">
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="w-20 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewalDate">Data de Renovação *</Label>
              <Input
                id="renewalDate"
                type="datetime-local"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informações adicionais sobre a assinatura..."
              className="bg-background"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Nova Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Adicionar Nova Assinatura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Assinatura *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Netflix, Spotify..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPeriod">Periodicidade *</Label>
              <Select value={formData.billingPeriod} onValueChange={(value) => setFormData({ ...formData, billingPeriod: value as 'mensal' | 'anual' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a periodicidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal (30 dias)</SelectItem>
                  <SelectItem value="anual">Anual (365 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <div className="flex gap-2">
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="renewalDate">Data de Renovação *</Label>
              <Input
                id="renewalDate"
                type="datetime-local"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informações adicionais sobre a assinatura..."
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
            Adicionar Assinatura
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}