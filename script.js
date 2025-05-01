const proxyUrl = 'https://api.allorigins.win/raw?url=';
const targetUrl = 'https://newsapi.org/v2/everything?q=Paraíba -"Vale do Paraíba" -"Paraíba do Sul"&excludeDomains=unam.mx, upsocl.com,  conjur.com.br&sortBy=publishedAt&pageSize=9&source=google-news&apiKey=13ac1ea75e734b659f2dca3b3c0ecfcc';
//&from=2023-06-10
let page = 1;
let totalPages = 1;
let nextPage = "";

async function getData() {
  const apiSelect = document.querySelector('#api-select');
  const selectedApi = apiSelect.value;
  let articles = [];

  if (selectedApi === 'newsapi') {
    try {
      const response = await axios.get(
        proxyUrl +
          encodeURIComponent(
            `${targetUrl}&page=${page}`
          )
      );
      articles = response.data.articles;
      totalPages = Math.ceil(response.data.totalResults / 9);
    } catch (error) {
      console.error(error);
    }
  } else if (selectedApi === 'newsdata') {
    let newsdataUrl =
      'https://newsdata.io/api/1/news?apikey=pub_24083303090369c3d75b30fbd770eebd12ce9&country=br&category=entertainment,top,environment,science,technology';
    if (nextPage) {
      newsdataUrl += `&page=${nextPage}`;
    }
    try {
      const response = await axios.get(proxyUrl + encodeURIComponent(newsdataUrl));
      articles = response.data.results;
      totalPages = Math.ceil(response.data.totalResults / 9);
      nextPage = response.data.nextPage;
    } catch (error) {
      console.error(error);
    }
  } else if (selectedApi === 'gnews') {
    const gnewsUrl = `https://gnews.io/api/v4/top-headlines?q=Paraíba NOT "Vale do Paraíba" NOT "Paraíba do Sul"&lang=pt&country=br&category=general&page=${page}&apikey=a6546bc14e610c34f8184da58cb2b9d2`;
    try {
      const response = await axios.get(gnewsUrl);
      console.log(response);

      articles = response.data.articles;
      totalPages = Math.ceil(response.data.totalArticles / 9);
    } catch (error) {
      console.error(error);
    }
  }
  const newsContainer = document.querySelector('#news-container');

  // Only clear the newsContainer element if we are loading the first page of results
  if (page === 1) {
    newsContainer.innerHTML = '';
  }

  articles.forEach((article) => {
    const cardLink = document.createElement('a');
    cardLink.href = article.url || article.link;
    cardLink.target = '_blank';
    cardLink.classList.add('block');

    const card = document.createElement('div');
    card.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col');

    const image = document.createElement('img');
    image.src =
      article.urlToImage ||
      article.image_url ||
      article.image ||
      'https://via.placeholder.com/300x200';
    image.classList.add('rounded-lg', 'mb-4');
    image.height = 200;
    image.style.objectFit = 'cover';
    card.appendChild(image);

    if (article.source_id) {
      const source = document.createElement('p');
      source.textContent = article.source_id;
      source.classList.add('text-gray-700', 'mb-2');
      card.appendChild(source);
    }

    if (article.source && article.source.name) {
      const source = document.createElement('p');
      source.textContent = article.source.name;
      source.classList.add('text-gray-700', 'mb-2');
      card.appendChild(source);
    }

    const title = document.createElement('h2');
    title.textContent = article.title;
    title.classList.add('text-lg', 'font-bold', 'mb-2');
    card.appendChild(title);

    const description = document.createElement('p');
    description.textContent =
      article.description || article.summary || 'No description available';
      description.classList.add('text-gray-700', 'mb-4');
      description.style.display = '-webkit-box';
      description.style.webkitBoxOrient = 'vertical';
      description.style.webkitLineClamp = '4';
      description.style.overflow = 'hidden';
      card.appendChild(description);
  
      const footer = document.createElement('div');
      footer.classList.add('flex', 'justify-between', 'items-center', 'mt-auto');   

      const publishedAt = article.publishedAt || article.pubDate;
if (publishedAt) {
  const pubDate = document.createElement('span');
  const timeDiff = Date.now() - new Date(publishedAt.replace(" ", "T")).getTime();
  const timeDiffInMinutes = Math.round(timeDiff / (1000 * 60));
  if (timeDiffInMinutes < 60) {
    pubDate.textContent = `Há ${timeDiffInMinutes} minutos`;
  } else {
    const timeDiffInHours = Math.round(timeDiffInMinutes / 60);
    if (timeDiffInHours < 24) {
      pubDate.textContent = `Há ${timeDiffInHours} horas`;
    } else {
      const timeDiffInDays = Math.round(timeDiffInHours / 24);
      if (timeDiffInDays === 1) {
        pubDate.textContent = `Ontem`;
      } else if (timeDiffInDays < 7) {
        pubDate.textContent = `Há ${timeDiffInDays} dias`;
      } else if (timeDiffInDays < 14) {
        pubDate.textContent = `Semana passada`;
      } else if (timeDiffInDays < 30) {
        const weeksAgo = Math.round(timeDiffInDays / 7);
        pubDate.textContent = `Há ${weeksAgo} semanas`;
      } else if (timeDiffInDays < 60) {
        pubDate.textContent = `Mês passado`;
      } else {
        const monthsAgo = Math.round(timeDiffInDays / 30);
        pubDate.textContent = `Há ${monthsAgo} meses`;
      }
    }
  }
        pubDate.classList.add('text-gray-700');
        footer.appendChild(pubDate);
      }
      

  
      card.appendChild(footer);
  
      cardLink.appendChild(card);
      newsContainer.appendChild(cardLink);
    });
  
    updatePagination();
  }
  
  function updatePagination() {
    const pageInfo = document.querySelector('#page-info');
  }
  

getData();

const apiSelect = document.querySelector('#api-select');
apiSelect.addEventListener('change', () => {
  page = 1;
  nextPage = '';
  getData();
});


const loadMoreBtn = document.createElement('button');
loadMoreBtn.textContent = 'Mais Notícias';
loadMoreBtn.classList.add(
  'bg-blue-500',
  'text-white',
  'px-4',
  'py-2',
  'rounded-lg',
  'disabled:opacity-50'
);

// Add an event listener for the "click" event on the "load more" button
loadMoreBtn.addEventListener('click', () => {
  if (page < totalPages) {
    page++;
    getData();
  }
});

// Add the "load more" button to the page
const paginationContainer = document.querySelector('.flex.justify-center.my-4');
paginationContainer.appendChild(loadMoreBtn);