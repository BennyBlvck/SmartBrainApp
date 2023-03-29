const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://mnrwfwvbxkzbbsznyfag.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucndmd3ZieGt6YmJzem55ZmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzk1Nzk1MzgsImV4cCI6MTk5NTE1NTUzOH0.UEEcYkD-8kfozJoqZBtAWvQs1Mmm8jfJpzhvxHl3AXY');

const app = express();

app.use(express.json());
app.use(cors());

const database = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
});

app.get('/', (req, res) => {
    res.send('Server is working!');
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Incorrect form submission');
    }
    database.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if (isValid) {
                return database.select('*').from('users')
                    .where('email', '=', email)
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json('Unable to get user'));
            } else {
                res.status(400).json('Wrong credentials');
            }
        })
        .catch(err => res.status(400).json('Wrong credentials'));
});

app.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json('Incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
    database.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json('Unable to register'));
});

app.put('/image', (req, res) => {
    const { id } = req.body;
    supabase
      .from('users')
      .eq('id', id)
      .increment('entries', 1)
      .then(response => {
          if (response.error) {
              return res.status(400).json('Unable to update entries');
          }
          return res.json(response.data[0]);
      })
      .catch(err => res.status(400).json('Unable to update entries'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`App is running on port ${process.env.PORT}`);
});

// Netlify Functions syntax for a serverless backend
module.exports.handler = serverless(app);