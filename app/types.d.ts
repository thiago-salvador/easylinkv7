// app/types.d.ts
// Declarações de tipos globais para o projeto

// Para resolver o erro "Cannot find name 'process'"
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    VERCEL_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;
  }
}
