const API_URL = 'https://deal-scout-bzpjxyi0p-lampherez75-5227s-projects.vercel.app/api/search';

document.addEventListener('DOMContentLoaded', function() {
  const productNameEl = document.getElementById('productName');
  const searchBtn = document.getElementById('searchBtn');
  const resultsEl = document.getElementById('results');

  let currentProduct = null;

  async function init() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      productNameEl.textContent = 'No active tab';
      return;
    }
    
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'getProductInfo' }, (response) => {
        if (chrome.runtime.lastError) {
          productNameEl.textContent = 'Unable to detect product';
          currentProduct = null;
          return;
        }
        if (response && response.name) {
          currentProduct = response.name;
          productNameEl.textContent = response.name;
        } else {
          productNameEl.textContent = 'No product detected';
          currentProduct = null;
        }
      });
    } catch (err) {
      productNameEl.textContent = 'Error: ' + err.message;
      currentProduct = null;
    }
  }

  searchBtn.addEventListener('click', function() {
    if (!currentProduct) {
      resultsEl.innerHTML = '<div class="error">Please visit a product page first</div>';
      return;
    }
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    resultsEl.innerHTML = '<div class="loading">Comparing prices...</div>';

    fetch(`${API_URL}?product=${encodeURIComponent(currentProduct)}`)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        resultsEl.innerHTML = '';
        
        if (data.shopping_results && data.shopping_results.length > 0) {
          data.shopping_results.slice(0, 10).forEach(function(item) {
            var div = document.createElement('div');
            div.className = 'result-item';
            var price = item.price || 'N/A';
            var rating = item.rating ? '⭐ ' + item.rating + ' (' + item.reviews + ' reviews)' : '';
            div.innerHTML = '<div class="result-info"><div class="store">' + (item.source || 'Unknown') + '</div><div class="title">' + (item.title ? item.title.substring(0, 35) + '...' : 'N/A') + '</div>' + (rating ? '<div class="rating">' + rating + '</div>' : '') + '</div><div class="result-right"><div class="price">' + price + '</div><a href="' + item.product_link + '" target="_blank">View Deal</a></div>';
            resultsEl.appendChild(div);
          });
        } else {
          resultsEl.innerHTML = '<div class="error">No results found</div>';
        }
      })
      .catch(function(err) {
        resultsEl.innerHTML = '<div class="error">Error: ' + err.message + '</div>';
      })
      .finally(function() {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Compare Prices';
      });
  });

  init();
});
