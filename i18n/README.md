# Sistema de Internacionalização (i18n) do EasyLink

Este documento descreve a implementação do sistema de internacionalização (i18n) no EasyLink, utilizando as bibliotecas i18next e react-i18next.

## Visão Geral

O sistema de internacionalização permite que a aplicação EasyLink seja disponibilizada em múltiplos idiomas, inicialmente português e inglês. A implementação usa as seguintes bibliotecas:

- **i18next**: Framework de internacionalização principal
- **react-i18next**: Integração do i18next com React
- **i18next-browser-languagedetector**: Detector automático do idioma do navegador

## Estrutura de Arquivos

```
/i18n
  ├── index.ts            # Configuração principal do i18n
  ├── README.md           # Documentação (este arquivo)
  ├── TESTING.md          # Plano de testes para i18n
  └── locales/            # Arquivos de tradução por idioma
      ├── pt/
      │   └── translation.json
      └── en/
          └── translation.json
```

## Como Usar

### 1. Importar e Inicializar

O sistema i18n é inicializado automaticamente quando o arquivo `/i18n/index.ts` é importado. Adicione essa importação no arquivo principal da aplicação:

```tsx
// app/layout.tsx ou semelhante
import '@/i18n';
```

### 2. Usar Traduções em Componentes

Para usar traduções em componentes React:

```tsx
import { useTranslation } from 'react-i18next';

function MeuComponente() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('chave.do.titulo')}</h1>
      <p>{t('chave.do.paragrafo')}</p>
    </div>
  );
}
```

### 3. Mudar o Idioma

Para mudar o idioma programaticamente:

```tsx
import { useTranslation } from 'react-i18next';

function SeletorDeIdioma() {
  const { i18n } = useTranslation();
  
  return (
    <button onClick={() => i18n.changeLanguage('en')}>
      Mudar para Inglês
    </button>
  );
}
```

Um componente de seleção de idioma já está disponível em `/components/language-selector.tsx`.

### 4. Adicionar Novas Traduções

Para adicionar novas chaves de tradução, atualize os arquivos JSON em `/i18n/locales/[idioma]/translation.json`.

Para adicionar um novo idioma:
1. Crie uma nova pasta com o código do idioma em `/i18n/locales/`
2. Adicione um arquivo `translation.json` com todas as chaves traduzidas
3. Atualize o arquivo `/i18n/index.ts` para incluir o novo idioma

## Persistência do Idioma

A preferência de idioma do usuário é automaticamente salva no `localStorage` do navegador com a chave `easylink_language`.

## Melhores Práticas

1. Use uma estrutura hierárquica nas chaves de tradução (ex: `"componente.secao.chave"`)
2. Mantenha os arquivos de tradução organizados em categorias lógicas
3. Use parâmetros para frases com valores dinâmicos: `t('bemVindo', { nome: usuario.nome })`
4. Evite concatenar strings traduzidas com variáveis
5. Certifique-se de que todas as chaves existem em todos os idiomas

## Benefícios da Implementação

- Interface consistente em múltiplos idiomas
- Facilidade para adicionar novos idiomas no futuro
- Manutenção simplificada com arquivos de tradução separados
- Persistência da preferência de idioma do usuário
