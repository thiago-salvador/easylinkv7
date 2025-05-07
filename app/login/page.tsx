// app/login/page.tsx
"use client";

import { LoginForm } from '@/components/login-form'; // Importa o componente do formulário
import Link from 'next/link';
import { useLanguage } from "@/lib/language-context";

export default function LoginPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {t('auth.loginToYourAccount')}
        </h1>
        <LoginForm /> {/* Usa o componente do formulário aqui */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}