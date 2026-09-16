// Test script: Verify reset password token expiration logic
// Runs directly against the database (not via HTTP)

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('='.repeat(60));
  console.log('RESET PASSWORD TOKEN EXPIRATION TESTS');
  console.log('='.repeat(60));

  // Find a test user (or create one)
  let testUser = await prisma.user.findFirst({
    where: { email: 'test-reset@nora.test' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'test-reset@nora.test',
        password: bcrypt.hashSync('TestPassword123', 10),
        name: 'Test Reset User',
        role: 'CUSTOMER',
      },
    });
    console.log('Created test user:', testUser.id);
  }

  const originalPasswordHash = testUser.password;
  let passed = 0;
  let failed = 0;

  // ── Helper: simulate the reset-password API logic ──
  async function simulateResetApi(rawToken, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();

    // Same logic as the fixed reset-password route
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      include: { user: true },
    });

    if (!resetTokenRecord) {
      return { ok: false, error: 'Token not found, expired, or already used (DB filter)' };
    }

    // JS defense-in-depth checks
    if (resetTokenRecord.expiresAt <= now) {
      return { ok: false, error: 'Token expired (JS check)' };
    }
    if (resetTokenRecord.usedAt) {
      return { ok: false, error: 'Token already used (JS check)' };
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: now },
      }),
    ]);

    return { ok: true, message: 'Password reset successful' };
  }

  // ── Helper: create a token with specific expiration ──
  async function createToken(userId, expiresAt) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return rawToken;
  }

  function assert(testName, condition) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // ────────────────────────────────────────────────
  // TEST A: Token with valid expiration (29 minutes from now)
  // ────────────────────────────────────────────────
  console.log('\n── TEST A: Valid token (29 min remaining) ──');
  const tokenA = await createToken(
    testUser.id,
    new Date(Date.now() + 29 * 60 * 1000)
  );
  const resultA = await simulateResetApi(tokenA, 'NewPassword123');
  assert('Valid token accepted', resultA.ok === true);

  // Reset password back
  await prisma.user.update({
    where: { id: testUser.id },
    data: { password: originalPasswordHash },
  });

  // ────────────────────────────────────────────────
  // TEST B: Token expired exactly 30 minutes ago
  // ────────────────────────────────────────────────
  console.log('\n── TEST B: Expired token (30 min ago) ──');
  const tokenB = await createToken(
    testUser.id,
    new Date(Date.now() - 30 * 60 * 1000) // Expired 30 min ago
  );
  const resultB = await simulateResetApi(tokenB, 'NewPassword123');
  assert('Expired token rejected', resultB.ok === false);

  // Verify password unchanged
  const userAfterB = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert('Password unchanged after expired token', userAfterB.password === originalPasswordHash);

  // ────────────────────────────────────────────────
  // TEST C: Token expired 1 minute ago
  // ────────────────────────────────────────────────
  console.log('\n── TEST C: Token expired 1 minute ago ──');
  const tokenC = await createToken(
    testUser.id,
    new Date(Date.now() - 60 * 1000) // Expired 1 min ago
  );
  const resultC = await simulateResetApi(tokenC, 'NewPassword123');
  assert('Recently expired token rejected', resultC.ok === false);

  // ────────────────────────────────────────────────
  // TEST D: Token expired 1 hour ago
  // ────────────────────────────────────────────────
  console.log('\n── TEST D: Token expired 1 hour ago ──');
  const tokenD = await createToken(
    testUser.id,
    new Date(Date.now() - 60 * 60 * 1000) // Expired 1 hour ago
  );
  const resultD = await simulateResetApi(tokenD, 'NewPassword123');
  assert('Hour-old expired token rejected', resultD.ok === false);

  // ────────────────────────────────────────────────
  // TEST E: Token reuse (already used)
  // ────────────────────────────────────────────────
  console.log('\n── TEST E: Token reuse ──');
  const tokenE = await createToken(
    testUser.id,
    new Date(Date.now() + 30 * 60 * 1000)
  );
  const resultE1 = await simulateResetApi(tokenE, 'NewPassword123');
  assert('First use accepted', resultE1.ok === true);

  // Reset password back
  await prisma.user.update({
    where: { id: testUser.id },
    data: { password: originalPasswordHash },
  });

  const resultE2 = await simulateResetApi(tokenE, 'AnotherPassword123');
  assert('Second use (reuse) rejected', resultE2.ok === false);

  // Verify password is still the original (not changed by the rejected second attempt)
  const userAfterE = await prisma.user.findUnique({ where: { id: testUser.id } });
  assert('Password unchanged after reuse attempt', userAfterE.password === originalPasswordHash);

  // ────────────────────────────────────────────────
  // TEST F: Invalid token
  // ────────────────────────────────────────────────
  console.log('\n── TEST F: Invalid token ──');
  const resultF = await simulateResetApi('totally-invalid-token-abc123', 'NewPassword123');
  assert('Invalid token rejected', resultF.ok === false);

  // ────────────────────────────────────────────────
  // TEST G: Old tokens invalidated when new one is created
  // ────────────────────────────────────────────────
  console.log('\n── TEST G: Old token invalidation ──');
  const tokenG1 = await createToken(
    testUser.id,
    new Date(Date.now() + 30 * 60 * 1000)
  );

  // Simulate creating a "new" token (invalidating old ones, like forgot-password does)
  const nowG = new Date();
  await prisma.passwordResetToken.updateMany({
    where: { userId: testUser.id, usedAt: null },
    data: { usedAt: nowG },
  });
  const tokenG2 = await createToken(
    testUser.id,
    new Date(Date.now() + 30 * 60 * 1000)
  );

  const resultG1 = await simulateResetApi(tokenG1, 'NewPassword123');
  assert('Old token rejected after new token created', resultG1.ok === false);

  const resultG2 = await simulateResetApi(tokenG2, 'NewPassword123');
  assert('New token accepted', resultG2.ok === true);

  // Reset password back
  await prisma.user.update({
    where: { id: testUser.id },
    data: { password: originalPasswordHash },
  });

  // ────────────────────────────────────────────────
  // CLEANUP
  // ────────────────────────────────────────────────
  console.log('\n── CLEANUP ──');
  await prisma.passwordResetToken.deleteMany({
    where: { userId: testUser.id },
  });
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log('  Cleaned up test user and tokens.');

  // ────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  console.log('='.repeat(60));

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (err) => {
  console.error('Test error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
