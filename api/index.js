const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { fetchGithubTrends, fetchTwitterTrends } = require('./trends');

const app = express();
app.use(cors());

app.get('/api/v1/trend/language/:lang', async (req, res) => {
  const lang = req.params.lang;
  try {
    const [github, twitter] = await Promise.all([
      fetchGithubTrends(lang),
      fetchTwitterTrends(lang)
    ]);
    res.json({ github, twitter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`)); 