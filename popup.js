const API_URL = 'https://deal-scout-bzpjxyi0p-lampherez75-5227s-projects.vercel.app/api/search';

document.addEventListener('DOMContentLoaded', async () => {
  const productNameEl = document.getElementById('productName');
  const searchBtn = document.getElementById('searchBtn');
  const resultsEl = document.getElementById('results');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    chrome.tabs.sendMessage(tab.id, { type: 'getProductInfo' }, (response) => {
      console.log('Content script response:', response);
      if (response && response.name) {
        productNameEl.textContent = response.name;
      } else {
        productNameEl.textContent = 'No product detected - enter manually';
      }
    });
  } catch (err) {
    console.error('Error:', err);
    productNameEl.textContent = 'Error detecting product';
  }

  searchBtn.addEventListener('click', async () => {
    const productName = productNameEl.textContent;
    if (!productName || productName.includes('Unable') || productName.includes('Error')) return;
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    resultsEl.innerHTML = '<div class="loading">Comparing prices...</div>';

    try {
      const res = await fetch(`${API_URL}?product=${encodeURIComponent(productName)}`);
      const data = await res.json();
      console.log('API Response:', data);

      resultsEl.innerHTML = '';
      
      if (data.shopping_results && data.shopping_results.length > 0) {
        data.shopping_results.slice(0, 10).forEach(item => {
          const div = document.createElement('div');
          div.className = 'result-item';
          div.innerHTML = `
            <div style="flex:1;">
              <div class="store"><strong>${item.source}</strong></div>
              <div class="title">${item.title ? item.title.substring(0, 40) + '...' : 'N/A'}</div>
              <div class="price" style="font-size:18px; color:green; font-weight:bold;">${item.price || 'N/A'}</div>
              ${item.rating ? `<div class="rating">⭐ ${item.rating} (${item.reviews} reviews)</div>` : ''}
            </div>
            <a href="${item.product_link}" target="_blank" style="background:#007bff;color:white;padding:8px 12px;text-decoration:none;border-radius:4px;">View Deal</a>
          `;
          resultsEl.appendChild(div);
        });
      } else {
        resultsEl.innerHTML = '<div class="error">No results found</div>';
      }
    } catch (err) {
      console.error('Error:', err);
      resultsEl.innerHTML = '<div class="error">Error: ' + err.message + '</div>';
    }

    searchBtn.disabled = false;
    searchBtn.textContent = 'Compare Prices';
  });
});
