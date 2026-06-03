const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const hash = await bcrypt.hash('Triagull@9048A', 12);
    console.log('Generated hash for Triagull@9048A:');
    console.log(hash);
    
    // Test the hash
    const isValid = await bcrypt.compare('Triagull@9048A', hash);
    console.log('Hash verification test:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();