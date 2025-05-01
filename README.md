# EasyLink - Compartilhamento de Arquivos Simplificado

EasyLink é uma plataforma que permite aos usuários fazer upload, compartilhar e publicar seus arquivos em segundos.

## Funcionalidades

- Upload de arquivos (PDF, PPT, Keynote, HTML, ZIP)
- Visualização de arquivos diretamente no navegador
- Links personalizados
- Estatísticas de visualização
- Planos gratuitos e premium

## Tecnologias Utilizadas

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Autenticação, Banco de Dados e Storage)
- React PDF para visualização de PDFs

## Requisitos

- Node.js 18+
- Conta no Supabase

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`
3. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase
   \`\`\`
4. Execute o projeto em modo de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

## Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Execute os scripts SQL em `lib/config.ts` para criar as tabelas necessárias
3. Configure o storage bucket `files` com acesso público
4. Configure as políticas de segurança RLS conforme necessário

## Estrutura do Projeto

- `app/` - Rotas e páginas da aplicação (Next.js App Router)
- `components/` - Componentes React reutilizáveis
- `lib/` - Utilitários e configurações
- `public/` - Arquivos estáticos

## Funcionalidades Principais

### Visualização de Arquivos

- PDFs e apresentações (PPT/Keynote) são visualizados usando o componente `VerticalPDFViewer`
- Arquivos HTML são renderizados diretamente usando o componente `HTMLViewer`
- Arquivos ZIP são extraídos e o conteúdo HTML é renderizado

### Conversão de Arquivos

- Apresentações (PPT/Keynote) são convertidas para PDF para visualização
- Arquivos ZIP são extraídos para visualização do conteúdo HTML

### Segurança

- Middleware para adicionar headers de segurança
- Content Security Policy (CSP) para visualizadores de arquivos
- Row Level Security (RLS) no Supabase

## Implantação

O projeto pode ser implantado em qualquer plataforma que suporte Next.js, como Vercel, Netlify ou AWS.

### Implantação na Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Implante o projeto

## Licença

Este projeto está licenciado sob a licença MIT.
