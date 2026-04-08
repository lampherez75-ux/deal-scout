const API_URL = 'https://deal-scout-bzpjxyi0p-lampherez75-5227s-projects.vercel.app/api/search';

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
  const productNameEl = document.getElementById('productName');
  const searchBtn = document.getElementById('searchBtn');
  const resultsEl = document.getElementById('results');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { type: 'getProductInfo' }, (response) => {
    if (response && response.name) {
      currentProduct = response.name;
      productNameEl.textContent = response.name;
    } else {
      productNameEl.textContent = 'Unable to detect product';
      searchBtn.disabled = true;
    }
  });

  searchBtn.addEventListener('click', async () => {
    if (!currentProduct) return;
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    resultsEl.innerHTML = '<div class="loading">Comparing prices...</div>';

    try {
      // Use GET request with query parameter
      const res = await fetch(`${API_URL}?product=${encodeURIComponent(currentProduct)}`);
      const data = await res.json();

      resultsEl.innerHTML = '';
      
      // SerpAPI returns results in shopping_results
      if (data.shopping_results && data.shopping_results.length > 0) {
        data.shopping_results.slice(0, 10).forEach(item => {
          const div = document.createElement('div');
          div.className = 'result-item';
          div.innerHTML = `
            <div>
              <div class="store">${item.source}</div>
              <div class="title">${item.title.substring(0, 50)}${'...'}</div>
              <div class="price">${item.price}</div>
              <div class="rating">${item.rating ? item.rating + ' ⭐ (' + item.reviews + ' reviews)' : ''}</div>
            </div>
            <a href="${item.product_link}" target="_blank">View Deal</a>
          `;
          resultsEl.appendChild(div);
        });
      } else {
        resultsEl.innerHTML = '<div class="error">No results found</div>';
      }
    } catch (err) {
      console.error(err);
      resultsEl.innerHTML = '<div class="error">Error searching prices</div>';
    }

    searchBtn.disabled = false;
    searchBtn.textContent = 'Compare Prices';
  });
});
