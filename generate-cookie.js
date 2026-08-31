const { SignJWT } = require('jose');

const secretKey = 'nora-super-secret-key-for-jwt-1234';
const key = new TextEncoder().encode(secretKey);

async function run() {
  const payload = {
    userId: 'cmt8g0jzi0000nbmonblz5nj0', // from check-counts.js admin user
    email: 'admin@nora.com',
    role: 'ADMIN',
    name: 'Admin'
  };

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

  console.log('COOKIE_SESSION=' + session);
}

run();
