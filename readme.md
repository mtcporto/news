# Notícias Atuais

Um agregador de notícias que exibe conteúdo da API GNews.

## Descrição

Este projeto é um site de notícias que coleta e exibe as últimas manchetes utilizando a API GNews. O site apresenta uma interface limpa e moderna com sistema de carregamento de mais notícias e fallback para conteúdo de demonstração quando a API apresenta problemas.

## Tecnologias Utilizadas

- **HTML5**: Estrutura básica da página web
- **CSS3**: 
  - Bootstrap 4.5.2: Framework CSS para design responsivo
  - Font Awesome 5.15.3: Ícones utilizados na interface
  - Estilos personalizados para os cards de notícias
- **JavaScript**: 
  - Manipulação do DOM para criar cards de notícias dinamicamente
  - Axios para requisições HTTP
  - Sistema de cache local para reduzir chamadas à API
  - Tratamento de erros com fallback para conteúdo de demonstração
- **API de Notícias**:
  - [GNews](https://gnews.io/): Fonte principal de notícias

## Funcionalidades

- Exibição de notícias em formato de cards (24 por página)
- Layout responsivo com 4 notícias por linha
- Carregamento de mais notícias com botão "Carregar Mais Notícias"
- Sistema de monitoramento de disponibilidade da API
- Conteúdo de demonstração quando a API apresenta problemas
- Exibição de tempo relativo de publicação (ex: "Há 2 horas", "Ontem")
- Botão para ler a notícia completa no site de origem
- Botão para compartilhar notícias

## Como usar

1. Abra o arquivo index.html em um navegador web
2. Navegue pelas notícias exibidas em cards
3. Clique em "Carregar Mais Notícias" para visualizar mais conteúdo
4. Clique em qualquer card ou no botão "Ler notícia" para abrir a notícia completa no site original
5. Use o botão de compartilhamento para copiar o link da notícia
6. Clique em "Atualizar Notícias" para buscar o conteúdo mais recente