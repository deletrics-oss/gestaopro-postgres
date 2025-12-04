import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users2, UserPlus, Trash2, Key, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

export default function Usuarios() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users');
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e senha",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/users', {
        name,
        email,
        password,
        role,
        active: true
      });

      toast({
        title: "Usuário criado!",
        description: `Usuário ${name} foi criado com sucesso`,
      });

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      
      // Recarregar lista
      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/users/${userId}`);
      
      toast({
        title: "Usuário excluído!",
        description: "Usuário foi excluído com sucesso",
      });
      
      await loadUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
            <Users2 className="h-8 w-8 text-primary" />
            Gerenciamento de Usuários
          </h1>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <Label>Nome Completo</Label>
              <Input 
                placeholder="Nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input 
                type="password" 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={role} onValueChange={setRole} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="gap-2" 
            onClick={handleCreateUser}
            disabled={loading}
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Criando...' : 'Adicionar Usuário'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={loading || user.email === 'admin@gestaopro.com'}
                  title={user.email === 'admin@gestaopro.com' ? 'Não é possível excluir o admin principal' : 'Excluir usuário'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
