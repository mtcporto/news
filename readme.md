Collecting workspace information# Notícias Atuais

Um agregador de notícias que exibe conteúdo de múltiplas fontes de API de notícias.

## Descrição

Este projeto é um site de notícias que coleta e exibe as últimas manchetes de várias fontes de API de notícias, incluindo NewsAPI, NewsData.io e GNews. O site permite aos usuários selecionar a fonte de API preferida e navegar pelas notícias com funcionalidade de "carregar mais".

## Tecnologias Utilizadas

- **HTML5**: Estrutura básica da página web
- **CSS3**: Estilização da interface, incluindo:
  - Bootstrap 4.5.2: Framework CSS para design responsivo
  - Estilos personalizados para os cards de notícias
- **JavaScript**: 
  - Fetch API para consumo de dados das APIs de notícias
  - Manipulação do DOM para criar elementos de notícias dinamicamente
  - Axios para requisições HTTP
- **APIs de Notícias**:
  - [NewsAPI.org](https://newsapi.org/)
  - [NewsData.io](https://newsdata.io/)
  - [GNews](https://gnews.io/)
  - [Currents API](https://currentsapi.services/)

## Funcionalidades

- Exibição de notícias em formato de cards
- Filtragem de notícias por fonte de API
- Carregamento de mais notícias com botão "Mais Notícias"
- Design responsivo para diferentes tamanhos de tela
- Exibição de tempo relativo de publicação (ex: "Há 2 horas", "Ontem")
- Links para ler a notícia completa no site de origem

## Como usar

1. Abra o arquivo index.html em um navegador web
2. Selecione a fonte de API desejada no menu dropdown
3. Navegue pelas notícias exibidas
4. Clique em "Mais Notícias" para carregar mais conteúdo
5. Clique em qualquer card para ler a notícia completa no site original