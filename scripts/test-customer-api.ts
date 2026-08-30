import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });
async function check() {
    const page = 1;
    const limit = 20;
    const q = '';
    const sort = 'newest';

    const where: any = { role: 'CUSTOMER' };

    let orderBy: any = { createdAt: 'desc' };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true, status: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const res = {
      success: true,
      data: customers.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        orderCount: c._count.orders,
        totalSpent: c.orders
          .filter((o: any) => o.status !== 'CANCELLED')
          .reduce((sum: number, o: any) => sum + o.total, 0),
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    console.log(JSON.stringify(res, null, 2));
}
check();
