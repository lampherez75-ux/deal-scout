export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  const mockResults = [
    { store: 'Amazon', price: '89.99', link: 'https://www.amazon.com/dp/B00000' },
    { store: 'eBay', price: '79.99', link: 'https://www.ebay.com/itm/0000' },
    { store: 'Walmart', price: '84.99', link: 'https://www.walmart.com/ip/0000' },
  ];

  res.status(200).json({ results: mockResults });
}
