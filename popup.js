const API_URL = 'https://dealscout.online/api/search';

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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentProduct })
      });
      const data = await res.json();

      resultsEl.innerHTML = '';
      if (data.results && data.results.length > 0) {
        data.results.forEach(item => {
          const div = document.createElement('div');
          div.className = 'result-item';
          div.innerHTML = `
            <div>
              <div class="store">${item.store}</div>
              <div class="price">$${item.price}</div>
            </div>
            <a href="${item.link}" target="_blank">View Deal</a>
          `;
          resultsEl.appendChild(div);
        });
      } else {
        resultsEl.innerHTML = '<div class="error">No results found</div>';
      }
    } catch (err) {
      resultsEl.innerHTML = '<div class="error">Error searching prices</div>';
    }

    searchBtn.disabled = false;
    searchBtn.textContent = 'Compare Prices';
  });
});
