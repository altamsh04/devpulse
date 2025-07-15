const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

async function fetchGithubTrends(lang) {
  try {
    const url = `https://raw.githubusercontent.com/isboyjc/github-trending-api/main/data/daily/${lang.toLowerCase()}.json`;
    console.log('[API] Fetching GitHub trends from:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch GitHub trending repos');
    const data = await response.json();
    return (data.items || []).slice(0, 5);
  } catch (err) {
    console.error('[API] GitHub trends error:', err);
    return [];
  }
}

async function fetchTwitterTrends(lang) {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  if (!BEARER_TOKEN) {
    console.error('[API] No Twitter Bearer Token set in env');
    return [];
  }
  try {
    const query = `${lang} programming lang:en`;
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=author_id,created_at,text`;
    console.log('[API] Fetching Twitter trends from:', url);
    console.log('[API] Using Bearer Token:', BEARER_TOKEN ? 'Yes' : 'No');
    console.log('[API] Query param:', lang);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Twitter API error details:', errorText);
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data ? data.data.slice(0, 5) : [];
  } catch (err) {
    console.error('[API] Twitter trends error:', err);
    return [];
  }
}

module.exports = { fetchGithubTrends, fetchTwitterTrends }; 