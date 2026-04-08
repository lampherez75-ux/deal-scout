export default async function handler(req, res) {
  const { product } = req.query;
  
  if (!product) {
    return res.status(400).json({ error: 'Missing product name' });
  }

  const apiKey = process.env.SERPAPI_KEY;
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(product)}&engine=google_shopping&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
}
