const proxyUrl = 'https://api.allorigins.win/raw?url=';
let page = 1;
let totalPages = 1;
const PAGE_SIZE = 24; // 24 notícias por página (4 por linha)

// Monitor simplificado - apenas para GNews
const apiStatus = {
  errors: 0,
  disabled: false,
  lastError: null,
  
  registerError: function() {
    this.errors++;
    this.lastError = Date.now();
    
    if (this.errors >= 3) {
      this.disabled = true;
      
      // Resetar após 30 minutos
      setTimeout(() => {
        this.disabled = false;
        this.errors = 0;
      }, 30 * 60 * 1000);
    }
  },
  
  isDisabled: function() {
    return this.disabled;
  },
  
  reset: function() {
    this.errors = 0;
    this.disabled = false;
    this.lastError = null;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const refreshBtn = document.getElementById('refresh-btn');
  const loadMoreBtn = document.getElementById('load-more');
  
  refreshBtn.addEventListener('click', function() {
    page = 1;
    getData(true);
  });
  
  loadMoreBtn.addEventListener('click', function() {
    page++;
    getData(false);
  });
  
  // Carregar na inicialização
  getData(true);
});

async function getData(clearContainer = false) {
  const cacheKey = `news_cache_gnews_${page}`;
  
  // Tentar obter do cache primeiro (exceto se estiver forçando atualização)
  if (!clearContainer) {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { articles, timestamp } = JSON.parse(cachedData);
      // Verificar se o cache tem menos de 5 minutos
      if ((Date.now() - timestamp) < 5 * 60 * 1000) {
        renderArticles(articles, clearContainer);
        return;
      }
    }
  }
  
  let articles = [];
  const newsContainer = document.querySelector('#news-container');
  
  // Adicionar loader
  if (clearContainer) {
    newsContainer.innerHTML = `
      <div class="loader">
        <i class="fas fa-spinner"></i>
        <p>Carregando notícias...</p>
      </div>`;
  } else {
    const loader = document.createElement('div');
    loader.classList.add('loader');
    loader.innerHTML = `
      <i class="fas fa-spinner"></i>
      <p>Carregando mais notícias...</p>`;
    newsContainer.appendChild(loader);
  }

  try {
    // Verificar se a API está desabilitada temporariamente
    if (apiStatus.isDisabled()) {
      console.warn("GNews API temporariamente desabilitada devido a erros frequentes");
      articles = getFallbackNews();
    } else {
      // Buscar notícias do GNews
      const gnewsUrl = `https://gnews.io/api/v4/top-headlines?q=Brasil&lang=pt&country=br&category=general&page=${page}&max=${PAGE_SIZE}&apikey=a6546bc14e610c34f8184da58cb2b9d2`;
      try {
        const response = await axios.get(proxyUrl + encodeURIComponent(gnewsUrl));
        
        // Verificar se response.data.articles existe e é um array
        if (response.data && response.data.articles && Array.isArray(response.data.articles)) {
          articles = response.data.articles;
          totalPages = Math.ceil(response.data.totalArticles / PAGE_SIZE);
        } else {
          console.warn("GNews não retornou um array de artigos:", response.data);
          apiStatus.registerError();
          articles = getFallbackNews();
        }
      } catch (error) {
        console.error("Erro ao acessar GNews:", error);
        apiStatus.registerError();
        articles = getFallbackNews();
      }
    }

    // Garantir que articles é um array válido
    if (!Array.isArray(articles) || articles.length === 0) {
      articles = getFallbackNews();
    } else {
      // Filtrar artigos sem imagem
      articles = articles.filter(article => {
        const hasImage = article.urlToImage || article.image_url || article.image;
        // Verificar se a URL da imagem é válida 
        return hasImage && 
               typeof hasImage === 'string' && 
               hasImage.trim() !== '' && 
               !hasImage.includes('placeholder');
      });
      
      // Ordenar por data mais recente
      articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.pubDate || a.published || Date.now());
        const dateB = new Date(b.publishedAt || b.pubDate || b.published || Date.now());
        return dateB - dateA;
      });
    }
    
    // Salvar no cache
    localStorage.setItem(cacheKey, JSON.stringify({
      articles,
      timestamp: Date.now()
    }));
    
    // Renderizar
    renderArticles(articles, clearContainer);
    
  } catch (error) {
    console.error("Erro geral:", error);
    
    // Remover loader e mostrar erro
    const loaders = newsContainer.querySelectorAll('.loader');
    loaders.forEach(loader => loader.remove());
    
    if (clearContainer) {
      const errorMsg = document.createElement('div');
      errorMsg.classList.add('error-message');
      errorMsg.innerHTML = `
        <h4><i class="fas fa-exclamation-triangle"></i> Erro ao carregar notícias</h4>
        <p>Não foi possível carregar as notícias. Por favor, tente novamente mais tarde.</p>`;
      newsContainer.appendChild(errorMsg);
    }
  }
}

function renderArticles(articles, clearContainer) {
  const newsContainer = document.querySelector('#news-container');
  
  // Remover loader
  const loaders = newsContainer.querySelectorAll('.loader');
  loaders.forEach(loader => loader.remove());
  
  // Limpar container se solicitado
  if (clearContainer) {
    newsContainer.innerHTML = '';
  }
  
  if (!Array.isArray(articles) || articles.length === 0) {
    const noNewsMsg = document.createElement('div');
    noNewsMsg.classList.add('no-news-message');
    noNewsMsg.innerHTML = `
      <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 15px;"></i>
      <h4>Nenhuma notícia com imagem encontrada</h4>
      <p>Tente atualizar a página em alguns momentos.</p>`;
    newsContainer.appendChild(noNewsMsg);
    
    // Ocultar botão "Carregar mais"
    document.getElementById('load-more').style.display = 'none';
    return;
  } else {
    // Mostrar botão "Carregar mais"
    document.getElementById('load-more').style.display = 'block';
  }
  
  // Organizar cards em linhas (4 cards por linha)
  let currentRow;
  
  articles.forEach((article, index) => {
    // Criar nova linha a cada 4 cards ou no início
    if (index % 4 === 0) {
      currentRow = document.createElement('div');
      currentRow.classList.add('row', 'news-row');
      newsContainer.appendChild(currentRow);
    }
    
    // Criar coluna para este card
    const cardCol = document.createElement('div');
    cardCol.classList.add('col-md-3', 'mb-4');
    
    const card = document.createElement('div');
    card.classList.add('card');
    
    const imageUrl = article.urlToImage || article.image_url || article.image;
    const image = document.createElement('img');
    image.classList.add('card-img-top');
    image.src = imageUrl;
    image.loading = 'lazy';
    image.alt = article.title || 'Imagem da notícia';
    
    // Se a imagem falhar, removemos o card completamente
    image.onerror = () => {
      if (cardCol.parentNode) {
        cardCol.parentNode.removeChild(cardCol);
      }
    };
    
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    
    // Fonte da notícia
    const sourceName = (article.source && article.source.name) || article.source_id || '';
    if (sourceName) {
      const sourceTag = document.createElement('div');
      sourceTag.classList.add('source-tag');
      sourceTag.innerHTML = `<i class="fas fa-newspaper"></i> ${sourceName}`;
      cardBody.appendChild(sourceTag);
    }
    
    // Título
    const title = document.createElement('h5');
    title.classList.add('card-title');
    title.textContent = article.title || 'Sem título';
    cardBody.appendChild(title);
    
    // Tempo de publicação
    const publishedAt = article.publishedAt || article.pubDate || article.published;
    if (publishedAt) {
      const timeElement = document.createElement('div');
      timeElement.classList.add('time-indicator', 'mb-3');
      
      const timeDiff = Date.now() - new Date(publishedAt.replace(" ", "T")).getTime();
      const timeDiffInMinutes = Math.round(timeDiff / (1000 * 60));
      
      let timeText;
      if (timeDiffInMinutes < 60) {
        timeText = `Há ${timeDiffInMinutes} minutos`;
      } else {
        const timeDiffInHours = Math.round(timeDiffInMinutes / 60);
        if (timeDiffInHours < 24) {
          timeText = `Há ${timeDiffInHours} horas`;
        } else {
          const timeDiffInDays = Math.round(timeDiffInHours / 24);
          if (timeDiffInDays === 1) {
            timeText = 'Ontem';
          } else if (timeDiffInDays < 7) {
            timeText = `Há ${timeDiffInDays} dias`;
          } else if (timeDiffInDays < 14) {
            timeText = 'Semana passada';
          } else if (timeDiffInDays < 30) {
            timeText = `Há ${Math.round(timeDiffInDays / 7)} semanas`;
          } else if (timeDiffInDays < 60) {
            timeText = 'Mês passado';
          } else {
            timeText = `Há ${Math.round(timeDiffInDays / 30)} meses`;
          }
        }
      }
      
      timeElement.innerHTML = `<i class="far fa-clock"></i> ${timeText}`;
      cardBody.appendChild(timeElement);
    }
    
    // Rodapé do card
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    cardFooter.style.marginTop = 'auto'; // Empurra o footer para baixo
    
    // Botão de leitura
    const readLink = document.createElement('a');
    readLink.href = article.url || article.link;
    readLink.target = '_blank';
    readLink.classList.add('btn', 'btn-primary', 'btn-sm');
    readLink.innerHTML = '<i class="fas fa-book-open"></i> Ler notícia';
    
    // Botão de compartilhamento
    const shareButton = document.createElement('button');
    shareButton.classList.add('share-btn');
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
    shareButton.title = 'Compartilhar';
    
    shareButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const shareUrl = article.url || article.link;
      
      if (navigator.share) {
        navigator.share({
          title: article.title,
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          shareButton.innerHTML = '<i class="fas fa-check"></i>';
          shareButton.title = 'Link copiado!';
          setTimeout(() => {
            shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
            shareButton.title = 'Compartilhar';
          }, 2000);
        }).catch(err => {
          console.error('Erro ao copiar link:', err);
        });
      }
    };
    
    cardFooter.appendChild(readLink);
    cardFooter.appendChild(shareButton);
    cardBody.appendChild(cardFooter);
    
    // Montar o card
    card.appendChild(image);
    card.appendChild(cardBody);
    
    // Criar link para a notícia
    const cardLink = document.createElement('a');
    cardLink.href = article.url || article.link;
    cardLink.target = '_blank';
    cardLink.classList.add('card-link');
    cardLink.style.textDecoration = 'none';
    cardLink.style.color = 'inherit';
    cardLink.appendChild(card);
    
    // Adicionar card à coluna
    cardCol.appendChild(cardLink);
    
    // Adicionar coluna à linha atual
    currentRow.appendChild(cardCol);
  });
}

/**
 * Retorna alguns artigos de demonstração quando a API falha
 */
function getFallbackNews() {
  const currentDate = new Date();
  return [
    {
      title: "Aplicativo de notícias implementa sistema de fallback para melhorar experiência do usuário",
      source: { name: "Demo News" },
      publishedAt: currentDate.toISOString(),
      url: "#",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Como garantir que seu site de notícias continue funcionando mesmo com falhas em APIs",
      source: { name: "Demo News" },
      publishedAt: new Date(currentDate - 7200000).toISOString(),
      url: "#",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1352&q=80"
    },
    {
      title: "APIs de notícias enfrentam problemas: Como desenvolvedores estão contornando a situação",
      source: { name: "Demo News" },
      publishedAt: new Date(currentDate - 10800000).toISOString(),
      url: "#",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1350&q=80"
    },
    {
      title: "Desenvolvedores criam solução robusta para lidar com falhas de APIs externas",
      source: { name: "Demo News" },
      publishedAt: new Date(currentDate - 3600000).toISOString(),
      url: "#",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1350&q=80"
    }
  ];
}