import express from "express";
import bcrypt from "bcrypt-nodejs";
import cors from "cors";
import knex from 'knex'; 
import handleRegister from "./controllers/register.js";
import handleSignin from "./controllers/signin.js";
import handleProfileGet from "./controllers/profile.js";
// import handleImage from "./controllers/image.js";
import funcs from "./controllers/image.js";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnrwfwvbxkzbbsznyfag.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const db = knex({
    client: 'supabase',
    connection: {
      host : supabase, // the same as local host or home
      connectionString: supabaseUrl,
      ssl :true 
    }
});


const app = express();

app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('It is Working')
})

app.post('/signin', (req, res) => { handleSignin(req, res, db, bcrypt) })

app.post('/register', (req, res) => { handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => { handleProfileGet(req, res, db) })

app.put('/image', (req, res) => { funcs.handleImage(req, res, db) });

app.post('/imageurl', (req, res) => { funcs.handleApiCall(req, res) });

app.listen(process.env.PORT || 3000, ()=> {
    console.log(`We are alive on ${process.env.PORT}`);
})
