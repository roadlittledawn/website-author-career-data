/**
 * Generate bcrypt hash for password
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js <password>');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\nGenerated bcrypt hash:');
console.log(hash);
console.log('\nAdd this to your .env file as ADMIN_PASSWORD_HASH');
