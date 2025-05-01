// components/signup-form.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Ícone do Google
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="M6.306 14.691c-1.229 1.994-1.98 4.32-1.98 6.813s.751 4.819 1.98 6.813l5.657-5.657C11.045 21.334 10.833 19.71 10.833 18s.212-3.334.973-4.691l-5.5-5.618z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.32-4.496 2.094-7.219 2.094c-4.402 0-8.158-2.434-9.936-5.951l-5.657 5.657C8.146 39.945 15.49 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.23-2.23 4.146-4.087 5.571l6.19 5.238C39.999 36.814 44 31.014 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
);


export function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }
    if (!name.trim()) {
        setError('Por favor, insira o seu nome.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ email, password, name }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Falha no registo');
      setSuccessMessage(responseData.message || 'Verifique o seu email para confirmar o registo!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Função para Login/Signup com Google ATUALIZADA ---
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // --- CORREÇÃO: Adicionar redirectTo para a rota de callback ---
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (oauthError) {
      console.error("Erro no login com Google:", oauthError);
      setError(`Erro ao tentar login com Google: ${oauthError.message}`);
      setIsGoogleLoading(false);
    }
    // Se não houver erro, o utilizador será redirecionado...
  };

  return (
    <div className="space-y-6">
      {/* Botão Google */}
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        type="button"
      >
        {isGoogleLoading ? ( <Loader2 className="h-4 w-4 animate-spin" /> ) : ( <GoogleIcon /> )}
        Continuar com Google
      </Button>

      {/* Divisor "OU" */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou continue com</span></div>
      </div>

      {/* Formulário Email/Senha */}
      <form onSubmit={handleSignup} className="space-y-4">
        {error && ( <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-sm"><AlertTriangle className="h-4 w-4" /><span>{error}</span></div>)}
        {successMessage && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">{successMessage}</p>}
        <div className="space-y-1"><Label htmlFor="signup-name">Nome</Label><Input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading || isGoogleLoading} placeholder="Seu nome completo"/></div>
        <div className="space-y-1"><Label htmlFor="signup-email">Email</Label><Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading || isGoogleLoading} placeholder="seu@email.com"/></div>
        <div className="space-y-1"><Label htmlFor="signup-password">Senha</Label><Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={isLoading || isGoogleLoading} placeholder="Pelo menos 6 caracteres"/></div>
        <div className="space-y-1"><Label htmlFor="signup-confirm-password">Confirmar Senha</Label><Input id="signup-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} disabled={isLoading || isGoogleLoading} placeholder="Repita a senha"/></div>
        <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Criar Conta
        </Button>
      </form>
    </div>
  );
}
