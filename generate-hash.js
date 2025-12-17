const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const hash = await bcrypt.hash('admin123', 12);
    console.log('Generated hash for admin123:');
    console.log(hash);
    
    // Test the hash
    const isValid = await bcrypt.compare('admin123', hash);
    console.log('Hash verification test:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();