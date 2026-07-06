import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
        toast.error('Informe o seu e-mail');
        return;
    }
    setLoading(true);
    try {
        await api.post('/auth/forgot-password', { email });
        setSubmitted(true);
        toast.success('Verifique seu e‑mail para o link de recuperação');
    } catch (err) {
        if (err.response?.status === 429) {
          toast.error('Demasiadas tentativas. Aguarde 10 minutos antes de tentar novamente.');
        } else {
            toast.error('Erro ao enviar solicitação. Tente novamente.');
        }
    } finally {
        setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Sassus Medical</CardTitle>
            <CardDescription>Link de recuperação enviado</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              <p className="font-medium">Verifique a sua caixa de entrada</p>
              <p className="text-sm mt-1">
                Enviamos um link para <strong>{email}</strong>. Siga as instruções para redefinir a sua senha.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              O link é válido por 15 minutos. Não se esqueça de verificar a pasta de spam.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-primary hover:bg-primary-dark"
            >
              Voltar ao login
            </Button>
            <Button
              variant="outline"
              onClick={() => { setSubmitted(false); setEmail(''); }}
              className="w-full"
            >
              Reenviar e‑mail
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Sassus Medical</CardTitle>
          <CardDescription>Recuperar senha</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E‑mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Digite o e‑mail que usou no registo. Enviaremos um link para redefinir a senha.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? 'A enviar...' : 'Enviar link de recuperação'}
            </Button>
            <div className="flex justify-between w-full text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
              <Link to="/" className="text-gray-500 hover:underline">
                Página inicial
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};