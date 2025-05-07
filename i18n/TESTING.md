# Plano de Testes para Internacionalização (i18n)

Este documento descreve o plano de testes para verificar o correto funcionamento do sistema de internacionalização do EasyLink.

## Testes Manuais

### 1. Detecção de Idioma

**Objetivo**: Verificar se o sistema detecta corretamente o idioma do navegador.

**Procedimento**:

1. Limpe o localStorage do navegador
2. Configure o navegador para usar português como idioma principal
3. Acesse a aplicação
4. Verifique se o conteúdo é exibido em português

**Resultado esperado**: A aplicação deve ser exibida no idioma configurado no navegador (português).

### 2. Mudança de Idioma

**Objetivo**: Verificar se a mudança de idioma funciona corretamente.

**Procedimento**:

1. Acesse a aplicação
2. Clique no seletor de idioma
3. Selecione "English"
4. Navegue por diferentes páginas da aplicação

**Resultado esperado**:

- Todo o conteúdo deve ser exibido em inglês após a seleção
- A mudança deve persistir entre diferentes páginas
- Elementos dinâmicos também devem ser traduzidos

### 3. Persistência da Preferência

**Objetivo**: Verificar se a preferência de idioma é salva corretamente.

**Procedimento**:

1. Acesse a aplicação
2. Mude o idioma para inglês
3. Feche o navegador
4. Reabra o navegador e acesse a aplicação novamente

**Resultado esperado**: A aplicação deve abrir em inglês, mantendo a preferência do usuário.

### 4. Testes de Internacionalização Específicos

#### 4.1 Visualizador de PDF

**Objetivo**: Verificar se os elementos do visualizador de PDF são traduzidos corretamente.

**Procedimento**:

1. Faça login na aplicação
2. Abra um arquivo PDF
3. Verifique os textos nos controles (zoom, página, carregamento)
4. Mude o idioma e verifique novamente os mesmos elementos

**Resultado esperado**: Todos os textos do visualizador de PDF devem ser traduzidos conforme o idioma selecionado.

#### 4.2 Página Inicial

**Objetivo**: Verificar se o conteúdo da página inicial é traduzido corretamente.

**Procedimento**:

1. Acesse a página inicial
2. Verifique os textos de título, subtítulo e botões
3. Mude o idioma e verifique os mesmos elementos

**Resultado esperado**: Todo o conteúdo da página inicial deve ser traduzido conforme o idioma selecionado.

#### 4.3 Autenticação

**Objetivo**: Verificar se as páginas de login e cadastro são traduzidas corretamente.

**Procedimento**:

1. Acesse as páginas de login e cadastro
2. Verifique os textos dos formulários, botões e mensagens
3. Mude o idioma e verifique os mesmos elementos

**Resultado esperado**: Todo o conteúdo das páginas de autenticação deve ser traduzido conforme o idioma selecionado.

## Verificações Adicionais

### 1. Caracteres Especiais

**Objetivo**: Verificar se caracteres especiais (acentos, cedilhas) são exibidos corretamente.

**Procedimento**:

1. Verifique textos com caracteres especiais em português
2. Mude para outros idiomas e volte para português

**Resultado esperado**: Caracteres especiais devem ser exibidos corretamente em todos os idiomas.

### 2. Conteúdo Dinâmico

**Objetivo**: Verificar se conteúdo gerado dinamicamente é traduzido corretamente.

**Procedimento**:

1. Verifique mensagens de erro que aparecem em situações específicas
2. Teste notificações e alertas do sistema

**Resultado esperado**: Conteúdo dinâmico deve ser traduzido conforme o idioma selecionado.

### 3. Responsividade

**Objetivo**: Verificar se os textos traduzidos não quebram o layout em diferentes tamanhos de tela.

**Procedimento**:

1. Teste a aplicação em diferentes tamanhos de tela
2. Alterne entre os idiomas disponíveis em cada tamanho

**Resultado esperado**: O layout deve se adaptar corretamente aos textos traduzidos, independentemente do tamanho da tela.

## Regressão

**Objetivo**: Garantir que a implementação de i18n não afetou outras funcionalidades.

**Procedimento**:

1. Teste as principais funcionalidades da aplicação
2. Verifique se há algum comportamento inesperado

**Resultado esperado**: Todas as funcionalidades devem continuar funcionando normalmente após a implementação de i18n.
