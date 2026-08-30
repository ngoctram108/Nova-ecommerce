import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });
const url = 'https://nova-ecommerce-psi.vercel.app';

async function testApi() {
  try {
    const email = 'audit_customers@nora.com';
    const pwd = 'audit123';
    
    // 1. Create or ensure user exists in DB
    const hash = bcrypt.hashSync(pwd, 10);
    await prisma.user.upsert({
      where: { email },
      update: { password: hash, role: 'ADMIN' },
      create: { email, password: hash, role: 'ADMIN', name: 'Audit Admin' }
    });

    // 2. Login
    const loginRes = await fetch(url + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    
    const cookies = loginRes.headers.getSetCookie();
    const cookie = cookies.map(c => c.split(';')[0]).join('; ');

    // 3. Call API
    const apiRes = await fetch(url + '/api/admin/customers', { headers: { Cookie: cookie } });
    console.log('API Status:', apiRes.status);
    const data = await apiRes.json();
    console.log(JSON.stringify(data, null, 2));

    // 4. Cleanup
    await prisma.user.delete({ where: { email } });
  } catch(e) {
    console.error(e);
  }
}
testApi();
