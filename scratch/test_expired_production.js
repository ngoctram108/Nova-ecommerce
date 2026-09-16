// Test expired token on production database
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function testExpiredToken() {
  // Find admin user
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!user) {
    console.log('No admin user found');
    process.exit(1);
  }

  const originalPasswordHash = user.password;
  console.log('User:', user.email, 'ID:', user.id);

  // Create an expired token (expired 1 hour ago)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiredAt = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: expiredAt,
    },
  });

  console.log('Created expired token, expiresAt:', expiredAt.toISOString());
  console.log('Current time:', new Date().toISOString());

  // Try to use it via the production API
  const appUrl = 'https://nova-ecommerce-psi.vercel.app';
  console.log('\nCalling production API with expired token...');

  const res = await fetch(`${appUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: rawToken, password: 'HackerPassword123' }),
  });

  const body = await res.json();
  console.log('Response status:', res.status);
  console.log('Response body:', JSON.stringify(body));

  // Verify password was NOT changed
  const userAfter = await prisma.user.findUnique({ where: { id: user.id } });
  const passwordChanged = userAfter.password !== originalPasswordHash;

  console.log('\nPassword changed:', passwordChanged);

  if (res.status === 400 && !passwordChanged) {
    console.log('\n✅ TEST PASSED: Expired token was correctly rejected, password unchanged');
  } else {
    console.log('\n❌ TEST FAILED: Expired token was NOT properly rejected!');
    console.log('  Status:', res.status, '(expected 400)');
    console.log('  Password changed:', passwordChanged, '(expected false)');
  }

  // Cleanup the test token
  await prisma.passwordResetToken.deleteMany({
    where: { tokenHash },
  });
  console.log('Cleaned up test token.');

  await prisma.$disconnect();
}

testExpiredToken().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
