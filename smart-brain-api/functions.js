import bcrypt from "bcrypt-nodejs";
import knex from 'knex'; 
import handleRegister from "../controllers/register.js";
import handleSignin from "../controllers/signin.js";
import handleProfileGet from "../controllers/profile.js";
import funcs from "../controllers/image.js";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnrwfwvbxkzbbsznyfag.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const db = knex({
    client: 'supabase',
    connection: {
      host : supabaseUrl, // fixed host to supabaseUrl
      ssl: { rejectUnauthorized: false },
    }
});

export async function handler(event, context) {
  const { path, httpMethod } = event;
  
  // define the allowed paths and methods
  const allowedPathsAndMethods = [
    { path: '/api/signin', method: 'POST', handler: handleSignin },
    { path: '/api/register', method: 'POST', handler: handleRegister },
    { path: '/profile/', method: 'GET', handler: handleProfileGet },
    { path: '/image', method: 'PUT', handler: funcs.handleImage },
    { path: '/imageurl', method: 'POST', handler: funcs.handleApiCall }
  ];

  // check if the requested path and method are allowed
  const allowed = allowedPathsAndMethods.find(
    (allowedPathAndMethod) =>
      allowedPathAndMethod.path === path && allowedPathAndMethod.method === httpMethod
  );

  if (!allowed) {
    return {
      statusCode: 404,
      body: 'Not found',
    };
  }

  // if allowed, execute the corresponding handler
  const { handler } = allowed;
  try {
    const response = await handler(event, db, bcrypt);
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString(),
    };
  }
}
