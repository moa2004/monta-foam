import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';
import argon2 from 'argon2';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const masterEmail = process.env.MASTER_ADMIN_EMAIL ?? 'admin@example.com';
  const masterPassword = process.env.MASTER_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const masterName = process.env.MASTER_ADMIN_NAME ?? 'Master Admin';

  const existingMaster = await prisma.user.findUnique({ where: { email: masterEmail } });

  if (!existingMaster) {
    const hashed = await argon2.hash(masterPassword, { type: argon2.argon2id });
    await prisma.user.create({
      data: {
        fullName: masterName,
        email: masterEmail,
        password: hashed,
        role: Role.MASTER_ADMIN,
        isVerified: true,
      },
    });
    console.log(`✅ MASTER_ADMIN created: ${masterEmail}`);
  } else {
    console.log(`ℹ️  MASTER_ADMIN already exists: ${masterEmail}`);
  }

  const services = [
    {
      title: 'غرف التخزين البارد',
      slug: 'cold-storage-rooms',
      description: 'غرف تخزين بارد مصممة خصيصًا لكل عميل، توفر تحكمًا دقيقًا في درجة الحرارة وكفاءة عالية في استهلاك الطاقة للأغذية والأدوية والاستخدامات الصناعية.',
    },
    {
      title: 'غرف التجميد',
      slug: 'freezing-rooms',
      description: 'غرف تجميد عالية الأداء مصممة هندسيًا للحفظ العميق للمواد القابلة للتلف عند درجات حرارة تحت الصفر.',
    },
    {
      title: 'أنظمة التبريد الصناعي',
      slug: 'industrial-cooling-systems',
      description: 'حلول تبريد صناعية واسعة النطاق مصممة خصيصًا للمستودعات والمصانع ومراكز التوزيع.',
    },
    {
      title: 'خدمات الصيانة',
      slug: 'maintenance-services',
      description: 'صيانة دورية وطارئة لأنظمة التبريد والتجميد لضمان استمرارية التشغيل بكفاءة وموثوقية.',
    },
    {
      title: 'خدمات التركيب',
      slug: 'installation-services',
      description: 'تركيب احترافي شامل لمعدات التبريد والتجميد، من تجهيز الموقع حتى الاختبار والتشغيل.',
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: { title: service.title, description: service.description },
      create: service,
    });
  }
  console.log(`✅ Seeded ${services.length} services`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
