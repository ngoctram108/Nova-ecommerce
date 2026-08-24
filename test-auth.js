const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function testAuth() {
  const loginUrl = 'http://localhost:3000/api/auth/login';
  
  // Find a customer
  const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  let custEmail = customer ? customer.email : 'demo@example.com';
  
  // 1. Admin Login
  const adminRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nora.com', password: 'admin123456' })
  });
  const adminCookie = adminRes.headers.get('set-cookie');
  console.log('Admin login status:', adminRes.status);
  
  // 2. Customer Login
  const custRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: custEmail, password: 'customer123456' })
  });
  const custCookie = custRes.headers.get('set-cookie');
  console.log('Customer login status (email: ' + custEmail + '):', custRes.status);

  // 3. Test Middleware for Admin accessing /account
  const adminAccountRes = await fetch('http://localhost:3000/account', {
    headers: { cookie: adminCookie },
    redirect: 'manual'
  });
  console.log('Admin accessing /account status:', adminAccountRes.status, 'Location:', adminAccountRes.headers.get('location'));
  
  // 4. Test Middleware for Admin accessing /admin
  const adminAdminRes = await fetch('http://localhost:3000/admin', {
    headers: { cookie: adminCookie },
    redirect: 'manual'
  });
  console.log('Admin accessing /admin status:', adminAdminRes.status, 'Location:', adminAdminRes.headers.get('location'));

  if (custRes.ok) {
    // 5. Test Middleware for Customer accessing /admin
    const custAdminRes = await fetch('http://localhost:3000/admin', {
      headers: { cookie: custCookie },
      redirect: 'manual'
    });
    console.log('Customer accessing /admin status:', custAdminRes.status, 'Location:', custAdminRes.headers.get('location'));
    
    // 6. Test Middleware for Customer accessing /account
    const custAccountRes = await fetch('http://localhost:3000/account', {
      headers: { cookie: custCookie },
      redirect: 'manual'
    });
    console.log('Customer accessing /account status:', custAccountRes.status, 'Location:', custAccountRes.headers.get('location'));
  }
}

testAuth().catch(console.error).finally(() => prisma.$disconnect());
