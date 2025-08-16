import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Erro de login',
            description: 'Email ou senha incorretos.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: 'Conta já existe',
            description: 'Este email já está cadastrado. Tente fazer login.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: 'Senha muito fraca',
            description: 'A senha deve ter pelo menos 6 caracteres.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu email para confirmar a conta.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2d2d2d 50%, #1a1a1a 75%, #000000 100%)',
      fontFamily: 'Tahoma, sans-serif'
    }}>
      {/* Windows XP Style Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Windows XP Login Box */}
      <div className="relative w-full max-w-md" style={{
         background: 'linear-gradient(180deg, #f0f0f0 0%, #e8e8e8 50%, #d0d0d0 100%)',
         border: '2px outset #c0c0c0',
         boxShadow: '4px 4px 8px rgba(0,0,0,0.3)'
       }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between p-2" style={{
           background: 'linear-gradient(180deg, #0078d4 0%, #005a9e 100%)',
           borderBottom: '1px solid #003d6b'
         }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white flex items-center justify-center text-xs font-bold text-blue-600">🔐</div>
            <span className="text-white text-sm font-bold">Login do Sistema</span>
          </div>
          <div className="flex gap-1">
             {/* Minimizar */}
             <div className="w-5 h-4 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs font-bold text-gray-700" style={{
               borderStyle: 'outset',
               borderWidth: '1px',
               backgroundColor: '#e0e0e0'
             }}>_</div>
             {/* Maximizar */}
             <div className="w-5 h-4 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs font-bold text-gray-700" style={{
               borderStyle: 'outset',
               borderWidth: '1px',
               backgroundColor: '#e0e0e0'
             }}>□</div>
             {/* Fechar */}
             <div className="w-5 h-4 bg-red-400 border border-red-500 flex items-center justify-center text-xs font-bold text-white" style={{
               borderStyle: 'outset',
               borderWidth: '1px',
               backgroundColor: '#dc3545'
             }}>×</div>
           </div>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          {/* Windows XP Logo Area */}
           <div className="text-center mb-6">
             <h1 className="text-xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Tahoma, sans-serif' }}>
               Minhas Assinaturas
             </h1>
           </div>
          
          {/* Windows XP Style Tabs */}
           <div className="mb-4">
             <div className="flex border-b border-gray-400">
               <button 
                 onClick={() => setActiveTab('signin')}
                 className={`px-4 py-2 text-sm font-medium border-t border-l border-r ${
                   activeTab === 'signin' 
                     ? 'bg-white border-gray-400 text-gray-800 -mb-px' 
                     : 'bg-gray-200 border-gray-300 text-gray-600'
                 }`}
                 style={{
                   borderBottom: activeTab === 'signin' ? '1px solid white' : '1px solid #ccc',
                   fontFamily: 'Tahoma, sans-serif'
                 }}
               >
                 🔑 Entrar
               </button>
               <button 
                 onClick={() => setActiveTab('signup')}
                 className={`px-4 py-2 text-sm font-medium border-t border-l border-r ${
                   activeTab === 'signup' 
                     ? 'bg-white border-gray-400 text-gray-800 -mb-px' 
                     : 'bg-gray-200 border-gray-300 text-gray-600'
                 }`}
                 style={{
                   borderBottom: activeTab === 'signup' ? '1px solid white' : '1px solid #ccc',
                   fontFamily: 'Tahoma, sans-serif'
                 }}
               >
                 👤 Cadastrar
               </button>
             </div>
           </div>
          
          <div className="w-full">
            {activeTab === 'signin' && (
              <div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    📧 Nome de usuário:
                  </label>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm"
                    style={{
                       border: '2px inset #c0c0c0',
                       fontFamily: 'Tahoma, sans-serif',
                       backgroundColor: 'white'
                     }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    🔒 Senha:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm pr-10"
                      style={{
                         border: '2px inset #c0c0c0',
                         fontFamily: 'Tahoma, sans-serif',
                         backgroundColor: 'white'
                       }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                         border: '1px outset #c0c0c0',
                         backgroundColor: '#f0f0f0',
                         fontSize: '10px'
                       }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 text-sm font-bold text-white mt-6"
                  style={{
                     background: loading ? '#cccccc' : 'linear-gradient(180deg, #4CAF50 0%, #45a049 50%, #3d8b40 100%)',
                     border: '2px outset #4CAF50',
                     fontFamily: 'Tahoma, sans-serif',
                     cursor: loading ? 'not-allowed' : 'pointer',
                     boxShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                   }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.currentTarget.style.border = '2px inset #4CAF50';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading) {
                      e.currentTarget.style.border = '2px outset #4CAF50';
                    }
                  }}
                >
                  {loading ? '⏳ Entrando...' : '✅ Entrar no Sistema'}
                </button>
              </form>
              </div>
            )}
            
            {activeTab === 'signup' && (
              <div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    📧 Email para cadastro:
                  </label>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm"
                    style={{
                       border: '2px inset #c0c0c0',
                       fontFamily: 'Tahoma, sans-serif',
                       backgroundColor: 'white'
                     }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    🔒 Criar senha:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crie uma senha segura"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 text-sm pr-10"
                      style={{
                         border: '2px inset #c0c0c0',
                         fontFamily: 'Tahoma, sans-serif',
                         backgroundColor: 'white'
                       }}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                         border: '1px outset #c0c0c0',
                         backgroundColor: '#f0f0f0',
                         fontSize: '10px'
                       }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                    ⚠️ Mínimo de 6 caracteres
                  </p>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 text-sm font-bold text-white mt-6"
                  style={{
                     background: loading ? '#cccccc' : 'linear-gradient(180deg, #2196F3 0%, #1976D2 50%, #1565C0 100%)',
                     border: '2px outset #2196F3',
                     fontFamily: 'Tahoma, sans-serif',
                     cursor: loading ? 'not-allowed' : 'pointer',
                     boxShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                   }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.currentTarget.style.border = '2px inset #2196F3';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading) {
                      e.currentTarget.style.border = '2px outset #2196F3';
                    }
                  }}
                >
                  {loading ? '⏳ Cadastrando...' : '🆕 Criar Conta'}
                </button>
              </form>
              </div>
            )}
          </div>
          
          {/* Windows XP Footer */}
           <div className="mt-6 pt-4 border-t border-gray-400 text-center">
             <div className="flex justify-center items-center gap-2 mt-2">
               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               <span className="text-xs text-gray-600" style={{ fontFamily: 'Tahoma, sans-serif' }}>Conectado</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;