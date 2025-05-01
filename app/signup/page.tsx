// app/signup/page.tsx
import { SignupForm } from '@/components/signup-form'; // Importa o componente do formulário de registo
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Criar Nova Conta
        </h1>
        {/* Usa o componente SignupForm aqui */}
        <SignupForm />
        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
