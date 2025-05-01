// app/login/page.tsx
import { LoginForm } from '@/components/login-form'; // Importa o componente do formulário
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Entrar na sua Conta
        </h1>
        <LoginForm /> {/* Usa o componente do formulário aqui */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Registe-se
          </Link>
        </p>
      </div>
    </div>
  );
}