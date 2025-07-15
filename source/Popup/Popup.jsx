import * as React from 'react';
import './styles.scss';

const ALL_LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'C++', 'HTML', 'Rust', 'Go', 'Java', 'C#', 'PHP', 'Ruby', 'Kotlin', 'Swift', 'Scala', 'Shell', 'Dart', 'All'
];

const API_BASE = `${import.meta.env.BACKEND_URL}/api/v1/trend/language/`;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

const getCacheKey = (lang) => `trends_${lang.toLowerCase()}`;

const popupContainerStyle = {
  minWidth: 700,
  maxWidth: 900,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const trendsRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: 24,
  width: '100%',
  justifyContent: 'center',
};

const cardStyle = {
  background: '#23272b',
  borderRadius: 10,
  boxShadow: '0 2px 8px 0 rgba(40,167,69,0.05)',
  marginBottom: 16,
  padding: '14px 14px 10px 14px',
  fontFamily: 'monospace',
  flex: 1,
  minWidth: 320,
  maxWidth: 420,
};

const externalIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: 8, verticalAlign: 'middle' }}
    className="lucide lucide-external-link-icon lucide-external-link"
  >
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const Popup = () => {
  const [search, setSearch] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [language, setLanguage] = React.useState('python');
  const [repos, setRepos] = React.useState([]);
  const [tweets, setTweets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Update suggestions as user types
  React.useEffect(() => {
    if (search.trim() === '') {
      setSuggestions([]);
      return;
    }
    const filtered = ALL_LANGUAGES.filter(lang =>
      lang.toLowerCase().includes(search.toLowerCase())
    );
    setSuggestions(filtered);
  }, [search]);

  const fetchAndCacheTrends = async (lang) => {
    setLoading(true);
    setError(null);
    const cacheKey = getCacheKey(lang);
    try {
      // Try to load from cache first
      const cachedRaw = localStorage.getItem(cacheKey);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        setRepos(cached.github || []);
        setTweets(cached.twitter || []);
        setLoading(false);
        return;
      }
      // Fetch from unified API
      const response = await fetch(`${API_BASE}${lang}`);
      if (!response.ok) throw new Error('Failed to fetch trends from API');
      const data = await response.json();
      setRepos(data.github || []);
      setTweets(data.twitter || []);
      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify({
        github: data.github || [],
        twitter: data.twitter || [],
        timestamp: Date.now(),
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch trends.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on first load (for default language)
  React.useEffect(() => {
    fetchAndCacheTrends(language);
    // eslint-disable-next-line
  }, []);

  const handleSuggestionClick = (lang) => {
    setLanguage(lang.toLowerCase());
    setSearch('');
    setSuggestions([]);
    fetchAndCacheTrends(lang.toLowerCase());
  };

  return (
    <section id="devpulse-popup" className="devpulse-dark" style={popupContainerStyle}>
      <h1 style={{ color: '#28a745', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginBottom: 4 }}>DevPulse</h1>
      <p style={{color : '#ececec', fontFamily:'monospace', fontWeight:'normal', fontSize:14, textAlign: 'center', marginBottom: 8}}>Get programming trend at your fingertip</p>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search language..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid #444',
            width: 160,
            marginRight: 8
          }}
        />
        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: 36,
            left: 0,
            background: '#23272b',
            border: '1px solid #444',
            borderRadius: 6,
            zIndex: 10,
            width: 160,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: 120,
            overflowY: 'auto'
          }}>
            {suggestions.map(lang => (
              <li
                key={lang}
                onClick={() => handleSuggestionClick(lang)}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: 15,
                  background: lang.toLowerCase() === language ? '#28a745' : 'transparent'
                }}
              >
                {lang}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
        Selected: <b style={{ color: '#28a745' }}>{language.charAt(0).toUpperCase() + language.slice(1)}</b>
      </div>
      <div style={trendsRowStyle}>
        <div className="section" style={cardStyle}>
          <h2 style={{ color: '#28a745', fontFamily: 'monospace', fontSize: 18, marginBottom: 10 }}>GitHub Trends</h2>
          {loading ? (
            <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 16 }}>Loading trends...</div>
          ) : error ? (
            <div style={{ color: 'red', fontFamily: 'monospace', fontSize: 15 }}>{error}</div>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {repos
                .slice()
                .sort((a, b) => {
                  const aStars = typeof a.stars === 'string' ? parseInt(a.stars.replace(/,/g, ''), 10) : a.stars || 0;
                  const bStars = typeof b.stars === 'string' ? parseInt(b.stars.replace(/,/g, ''), 10) : b.stars || 0;
                  return bStars - aStars;
                })
                .map(repo => (
                  <li key={repo.url} style={{ color: '#fff', marginBottom: 18, borderBottom: '1px solid #333', paddingBottom: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ color: '#28a745', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 16, textDecoration: 'none' }}>
                        {repo.title}
                      </a>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" title="Open on GitHub" style={{ color: '#aaa' }}>{externalIcon}</a>
                    </span>
                    <span style={{ color: '#aaa', marginLeft: 8, fontSize: 15 }}>{repo.language}</span>
                    <span style={{ color: '#fff', marginLeft: 8, fontSize: 15 }}>★ {repo.stars}</span>
                    <div style={{ color: '#ececec', fontFamily: 'monospace', fontSize: 16, fontWeight: 500, marginTop: 4, marginBottom: 2, lineHeight: 1.5 }}>{repo.description}</div>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="section" style={cardStyle}>
          <h2 style={{ color: '#1DA1F2', fontFamily: 'monospace', fontSize: 18, marginBottom: 10 }}>Twitter/X Trends</h2>
          {loading ? (
            <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 16 }}>Loading trends...</div>
          ) : error ? (
            <div style={{ color: 'red', fontFamily: 'monospace', fontSize: 15 }}>{error}</div>
          ) : (
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {tweets.map((tweet, idx) => (
                <li key={tweet.id || idx} style={{ color: '#fff', marginBottom: 18, borderBottom: '1px solid #333', paddingBottom: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {tweet.author_id ? (
                      <a href={`https://twitter.com/i/web/status/${tweet.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 16, textDecoration: 'none' }}>
                        @{tweet.author_id}
                      </a>
                    ) : null}
                    <a href={`https://twitter.com/i/web/status/${tweet.id}`} target="_blank" rel="noopener noreferrer" title="Open on Twitter/X" style={{ color: '#aaa' }}>{externalIcon}</a>
                  </span>
                  <span style={{
                    display: 'block',
                    color: '#ececec',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: 500,
                    marginTop: 4,
                    marginBottom: 2,
                    lineHeight: 1.5
                  }}>{tweet.text || '[No text]'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Popup;
