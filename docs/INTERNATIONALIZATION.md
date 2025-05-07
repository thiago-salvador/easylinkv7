# Guia de Internacionalização do EasyLink

Este documento descreve o sistema de internacionalização (i18n) simplificado implementado no EasyLink.

## Visão Geral

O EasyLink utiliza um sistema de internacionalização baseado em contexto React que permite que a aplicação seja disponibilizada em múltiplos idiomas, atualmente português e inglês. A implementação é leve, simples e totalmente compatível com o Next.js 14 App Router.

## Estrutura de Arquivos

```text
/lib
  └── language-context.tsx   # Contexto e hook para gerenciar o idioma

/i18n
  └── locales/               # Arquivos de tradução por idioma
      ├── pt/
      │   └── translation.json
      └── en/
          └── translation.json

/components
  └── simple-language-selector.tsx  # Componente de seleção de idioma
```

## Como Usar

### 1. Acessar Traduções em Componentes

Para usar traduções em componentes React, adicione a diretiva `'use client'` e importe o hook `useLanguage`:

```tsx
'use client';
import { useLanguage } from "@/lib/language-context";

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
    </div>
  );
}
```

### 2. Mudar o Idioma Programaticamente

Para mudar o idioma em qualquer componente:

```tsx
'use client';

import { useLanguage } from "@/lib/language-context";

function AlgumaFuncionalidade() {
  const { setLanguage } = useLanguage();
  
  return (
    <button onClick={() => setLanguage('en')}>
      Mudar para Inglês
    </button>
  );
}
```

### 3. Adicionar Novas Traduções

Para adicionar novas chaves de tradução, atualize os arquivos JSON em `/i18n/locales/[idioma]/translation.json`.

Exemplo de estrutura de tradução:

```json
{
  "secao": {
    "subsecao": {
      "chave": "Valor traduzido"
    }
  }
}
```

Para acessar esta tradução, use: `t('secao.subsecao.chave')`

### Interpolação de Parâmetros

O sistema suporta interpolação de parâmetros nas traduções. Você pode definir parâmetros nas strings de tradução usando chaves `{paramName}` e passar os valores ao chamar a função `t`:

```json
{
  "fileUpload": {
    "fileTooLarge": "Arquivo muito grande (máx. {maxSize}MB)."
  }
}
```

```tsx
t('fileUpload.fileTooLarge', { maxSize: 10 }) // "Arquivo muito grande (máx. 10MB)."
```

### 4. Adicionar um Novo Idioma

Para adicionar um novo idioma:

1. Crie uma nova pasta com o código do idioma em `/i18n/locales/`
2. Adicione um arquivo `translation.json` com todas as chaves traduzidas
3. Atualize o tipo `Language` em `/lib/language-context.tsx` para incluir o novo código de idioma

## Componentes Principais

### LanguageProvider

Este componente envolve a aplicação e fornece o contexto de idioma para todos os componentes filhos. Já está configurado no arquivo `app/layout.tsx`.

### SimpleLanguageSelector

Um componente de interface para permitir que os usuários alternem entre os idiomas disponíveis. Já está integrado nos cabeçalhos da aplicação.

## Persistência

A preferência de idioma do usuário é automaticamente salva no `localStorage` do navegador com a chave `easylink_language`.

## Componentes Traduzidos

Os seguintes componentes já foram atualizados para usar o sistema de internacionalização:

- `app/page.tsx`: Página inicial com título, subtítulo e botões
- `components/rotating-words.tsx`: Componente de palavras rotativas
- `components/how-it-works.tsx`: Seção "Como Funciona"
- `components/features-section.tsx`: Seção de recursos
- `components/footer.tsx`: Rodapé do site
- `components/for-you-section.tsx`: Seção "Para Você"
- `components/header.tsx`: Cabeçalho do site
- `components/pricing-section.tsx`: Seção de preços
- `components/faq-section.tsx`: Seção de perguntas frequentes
- `components/user-nav.tsx`: Navegação do usuário
- `components/pdf-viewer.tsx`: Visualizador de PDF simples
- `components/vertical-pdf-viewer.tsx`: Visualizador de PDF avançado
- `components/file-upload.tsx`: Componente de upload de arquivos
- `components/login-form.tsx`: Formulário de login
- `components/signup-form.tsx`: Formulário de cadastro
- `components/dashboard-header.tsx`: Cabeçalho do dashboard
- `components/dashboard-client-content.tsx`: Conteúdo principal do dashboard
- `app/login/page.tsx`: Página de login
- `app/signup/page.tsx`: Página de cadastro
- `components/account-modal.tsx`: Modal de gerenciamento de conta
- `components/upgrade-modal.tsx`: Modal de upgrade de plano
- `components/delete-account-modal.tsx`: Modal de exclusão de conta
- `components/team-management-modal.tsx`: Modal de gerenciamento de equipe

## Melhores Práticas

1. Use uma estrutura hierárquica nas chaves de tradução (ex: `"componente.secao.chave"`)
2. Mantenha os arquivos de tradução organizados em categorias lógicas
3. Certifique-se de que todas as chaves existem em todos os idiomas
4. **IMPORTANTE**: Sempre adicione a diretiva `'use client'` no início de qualquer arquivo de componente que use o hook `useLanguage`. Esta diretiva é essencial para que o Next.js saiba que o componente deve ser renderizado no lado do cliente, onde os hooks do React podem ser utilizados.
5. Evite usar strings literais para textos que serão exibidos ao usuário - sempre use o sistema de tradução
6. Ao adicionar novas traduções, atualize sempre ambos os arquivos de idioma (pt e en)
7. Use interpolação de parâmetros para valores dinâmicos em vez de concatenação de strings
8. Verifique se o componente está sendo renderizado corretamente tanto no servidor quanto no cliente

## Vantagens desta Implementação

- **Simplicidade**: Implementação direta e fácil de entender
- **Compatibilidade**: Funciona perfeitamente com Next.js 14 e App Router
- **Performance**: Menos dependências externas e código mais leve
- **Manutenção**: Código totalmente sob seu controle
- **Persistência**: Mantém a preferência de idioma do usuário
