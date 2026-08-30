import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });
const url = 'https://nova-ecommerce-psi.vercel.app';

async function validate() {
  try {
    console.log('\n--- POSTGRESQL STATS ---');
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const inventoryCount = await prisma.inventory.count();

    console.log(`POSTGRESQL PRODUCT COUNT: ${productCount}`);
    console.log(`POSTGRESQL ORDER COUNT: ${orderCount}`);
    console.log(`POSTGRESQL CUSTOMER COUNT: ${customerCount}`);
    console.log(`POSTGRESQL INVENTORY COUNT: ${inventoryCount}`);

    console.log('PRISMA CONNECTION: PASS');

    console.log('\n--- ADMIN AUTH & API ---');
    const email = 'audit_validate@nora.com';
    const pwd = 'audit123';
    
    const hash = bcrypt.hashSync(pwd, 10);
    await prisma.user.upsert({
      where: { email },
      update: { password: hash, role: 'ADMIN' },
      create: { email, password: hash, role: 'ADMIN', name: 'Audit Admin' }
    });

    const loginRes = await fetch(url + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    
    if (!loginRes.ok) {
      console.log('ADMIN SESSION: FAIL (' + await loginRes.text() + ')');
      return;
    }
    console.log('ADMIN SESSION: PASS');

    const cookies = loginRes.headers.getSetCookie();
    const cookie = cookies.map(c => c.split(';')[0]).join('; ');

    // API calls
    const fetchApi = async (endpoint: string) => {
      const res = await fetch(url + endpoint, { headers: { Cookie: cookie } });
      const status = res.status;
      let count = 0;
      if (status === 200) {
        try {
            const data = await res.json();
            if (data.data) count = data.data.length;
            else if (data.recentOrders) count = data.recentOrders.length;
        } catch(e) {}
      }
      return { status, count };
    };

    const products = await fetchApi('/api/admin/products');
    console.log(`ADMIN API PRODUCTS:\nSTATUS ${products.status}\nCOUNT ${products.count}`);

    const orders = await fetchApi('/api/admin/orders');
    console.log(`ADMIN API ORDERS:\nSTATUS ${orders.status}\nCOUNT ${orders.count}`);

    const customers = await fetchApi('/api/admin/customers');
    console.log(`ADMIN API CUSTOMERS:\nSTATUS ${customers.status}\nCOUNT ${customers.count}`);

    const inventory = await fetchApi('/api/admin/inventory');
    console.log(`ADMIN API INVENTORY:\nSTATUS ${inventory.status}\nCOUNT ${inventory.count}`);

    const analyticsRes = await fetch(url + '/admin/analytics', { headers: { Cookie: cookie } });
    console.log(`ADMIN API ANALYTICS:\nSTATUS ${analyticsRes.status}`);

    await prisma.user.delete({ where: { email } });

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
validate();
