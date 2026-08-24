const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@nora.com' } });
  if (admin) {
    const isMatch123456 = bcrypt.compareSync('123456', admin.password);
    const isMatchAdmin123456 = bcrypt.compareSync('admin123456', admin.password);
    console.log('Admin:', admin.email, 'Role:', admin.role);
    console.log('Password is 123456?', isMatch123456);
    console.log('Password is admin123456?', isMatchAdmin123456);
  }
}
main().finally(() => prisma.$disconnect());
