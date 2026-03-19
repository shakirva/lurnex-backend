// Simple test for debugging request body parsing

const express = require('express');
const app = express();

// Make sure body parsing is enabled
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/test', (req, res) => {
  console.log('📝 Test request body:', req.body);
  console.log('📝 Test headers:', req.headers);
  
  res.json({
    success: true,
    received_body: req.body,
    body_type: typeof req.body,
    content_type: req.headers['content-type']
  });
});

app.listen(5001, () => {
  console.log('🧪 Test server running on http://localhost:5001');
});