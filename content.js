chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getProductInfo') {
    const productName = getProductName();
    sendResponse({ name: productName });
  }
});

function getProductName() {
  let name = document.querySelector('#productTitle')?.textContent?.trim();
  if (name) return name;

  name = document.querySelector('[data-testid="product-title"]')?.textContent?.trim();
  if (name) return name;

  name = document.querySelector('.x-item-title__mainTitle')?.textContent?.trim();
  if (name) return name;

  const selectors = [
    'h1[itemprop="name"]',
    '.product-title',
    '.product-name',
    'h1.product-name',
    '[class*="product"][class*="title"]',
    'h1'
  ];
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent?.trim().length > 5) {
      return el.textContent.trim();
    }
  }

  return null;
}
