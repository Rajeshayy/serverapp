const express = require('express');
const bcrypt = require('bcrypt');
const serverless = require('serverless-http')
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const router = express.Router();

JWT_SECRET='121212121212121212121212121'

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const supabaseUrl = 'https://qvefmgcsnzgghdqddpsy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2ZWZtZ2NzbnpnZ2hkcWRkcHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkyODEwNzUsImV4cCI6MjAyNDg1NzA3NX0.ulcJxGh00aInEfE9empluc6EugAdFMsLNGl0VcphUUo';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Register Endpoint
app.post('/register', async (req, res) => {
  try {
      const { username, password, role } = req.body;

      // Insert user into the 'users' table
      const { data, error } = await supabase
          .from('users')
          .insert([{ username, password, role }]);

      if (error) {
          throw error;
      }

      res.status(201).json({ message: 'User registered successfully!', data });
  } catch (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      // Fetch user from the 'users' table based on username and password
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .single();

      if (error) {
          throw error;
      }

      if (!data) {
          return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ username: data.username }, JWT_SECRET);

      res.status(200).json({ username: data.username, token });
  } catch (error) {
      console.error('Error logging in:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/.netlify/functions/api',router);
module.exports.handler = serverless(app);