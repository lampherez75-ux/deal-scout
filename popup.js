const API_URL = 'https://deal-scout-bzpjxyi0p-lampherez75-5227s-projects.vercel.app/api/search';

const productNameEl = document.getElementById('productName');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');

let currentProduct = 'Loading...';

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.id) {
    productNameEl.textContent = 'No active tab';
    return;
  }
  
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'getProductInfo' }, (response) => {
      if (chrome.runtime.lastError) {
        productNameEl.textContent = 'Unable to detect product';
        return;
      }
      if (response && response.name) {
        currentProduct = response.name;
        productNameEl.textContent = response.name;
      } else {
        productNameEl.textContent = 'No product detected';
      }
    });
  } catch (err) {
    productNameEl.textContent = 'Error: ' + err.message;
  }
}

searchBtn.addEventListener('click', async () => {
  if (!currentProduct || currentProduct === 'Loading...' || currentProduct.includes('Unable') || currentProduct.includes('Error') || currentProduct.includes('No product')) {
    resultsEl.innerHTML = '<div class="error">Please visit a product page first</div>';
    return;
  }
  
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  resultsEl.innerHTML = '<div class="loading">Comparing prices...</div>';

  try {
    const res = await fetch(`${API_URL}?product=${encodeURIComponent(currentProduct)}`);
    const data = await res.json();

    resultsEl.innerHTML = '';
    
    if (data.shopping_results && data.shopping_results.length > 0) {
      data.shopping_results.slice(0, 10).forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        const price = item.price || 'N/A';
        const rating = item.rating ? `⭐ ${item.rating} (${item.reviews} reviews)` : '';
        div.innerHTML = `
          <div class="result-info">
            <div class="store">${item.source || 'Unknown'}</div>
            <div class="title">${item.title ? item.title.substring(0, 35) + '...' : 'N/A'}</div>
            ${rating ? `<div class="rating">${rating}</div>` : ''}
          </div>
          <div class="result-right">
            <div class="price">${price}</div>
            <a href="${item.product_link}" target="_blank">View Deal</a>
          </div>
        `;
        resultsEl.appendChild(div);
      });
    } else {
      resultsEl.innerHTML = '<div class="error">No results found</div>';
    }
  } catch (err) {
    resultsEl.innerHTML = '<div class="error">Error: ' + err.message + '</div>';
  }

  searchBtn.disabled = false;
  searchBtn.textContent = 'Compare Prices';
});

// Initialize on load
init();
