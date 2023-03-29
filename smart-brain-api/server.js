const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const supabase = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3000

// Define endpoints
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await db.select('email', 'hash')
      .from('login')
      .where('email', '=', email)
      .first();
    const isValid = bcrypt.compareSync(password, data.hash);
    if (isValid) {
      const user = await db.select('*')
        .from('users')
        .where('email', '=', email)
        .first();
      const { id, name, email, entries, joined } = user;
      res.json({ id, name, email, entries, joined });
    } else {
      res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password);
  try {
    const response = await supabaseClient.from('users').insert([{ name, email, entries: 0 }]);
    const user = response.data[0];
    await db('login').insert({ email, hash });
    const { id, entries, joined } = user;
    res.json({ id, name, email, entries, joined });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Unable to register' });
  }
});

app.get('/profile/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.select('').from('users').where({ id }).first();
    if (user) {
      res.json(user);
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Unable to get user profile' });
  }
});

app.put('/image', async (req, res) => {
  const { id } = req.body;
  try {
    const entries = await db('users').where('id', '=', id).increment('entries', 1).returning('entries');
    if (entries.length) {
      res.json({ entries: entries[0] });
    } else {
      res.status(400).json({ error: 'Unable to update entries' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Unable to update entries' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
