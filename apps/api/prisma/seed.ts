/**
 * MehrShopping demo seed.
 * Creates an admin account, a bilingual catalog (categories, brands, products
 * with variants), sample reviews and coupons.
 *
 * Run: npm run db:seed -w @mhr/api
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/800`;

async function main() {
  console.log('Seeding MehrShopping database...');

  // --- Admin -------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@mhrshop.ir';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@1234';
  const adminPhone = process.env.ADMIN_PHONE ?? '09120000001';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      phone: adminPhone,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      firstName: 'مدیر',
      lastName: 'مهرشاپینگ',
      role: Role.ADMIN,
      cart: { create: {} },
    },
  });
  console.log(`admin: ${admin.email} / ${adminPassword}`);

  // Demo customer
  await prisma.user.upsert({
    where: { email: 'demo@mhrshop.ir' },
    update: {},
    create: {
      email: 'demo@mhrshop.ir',
      phone: '09120000002',
      passwordHash: await bcrypt.hash('Demo@1234', 10),
      firstName: 'سارا',
      lastName: 'محمدی',
      cart: { create: {} },
    },
  });

  // --- Categories --------------------------------------------------------
  const categoriesData = [
    { slug: 'mobile', nameFa: 'موبایل و تبلت', nameEn: 'Mobiles & Tablets', icon: '📱', order: 1 },
    {
      slug: 'laptop',
      nameFa: 'لپتاپ و کامپیوتر',
      nameEn: 'Laptops & Computers',
      icon: '💻',
      order: 2,
      children: [
        { slug: 'laptop-gaming', nameFa: 'لپتاپ گیمینگ', nameEn: 'Gaming Laptops', icon: '🎮', order: 1 },
      ],
    },
    { slug: 'home-appliance', nameFa: 'لوازم خانگی', nameEn: 'Home Appliances', icon: '🏠', order: 3 },
    { slug: 'fashion', nameFa: 'مد و پوشاک', nameEn: 'Fashion', icon: '👕', order: 4 },
    { slug: 'health', nameFa: 'سلامت و زیبایی', nameEn: 'Health & Beauty', icon: '💊', order: 5 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameFa: c.nameFa, nameEn: c.nameEn, icon: c.icon, order: c.order },
      create: { slug: c.slug, nameFa: c.nameFa, nameEn: c.nameEn, icon: c.icon, order: c.order },
    });
    categories[c.slug] = parent.id;
    for (const child of c.children ?? []) {
      const sub = await prisma.category.upsert({
        where: { slug: child.slug },
        update: { nameFa: child.nameFa, nameEn: child.nameEn, parentId: parent.id },
        create: {
          slug: child.slug,
          nameFa: child.nameFa,
          nameEn: child.nameEn,
          icon: child.icon,
          order: child.order,
          parentId: parent.id,
        },
      });
      categories[child.slug] = sub.id;
    }
  }

  // --- Brands ------------------------------------------------------------
  const brandsData = [
    { slug: 'samsung', nameFa: 'سامسونگ', nameEn: 'Samsung' },
    { slug: 'apple', nameFa: 'اپل', nameEn: 'Apple' },
    { slug: 'xiaomi', nameFa: 'شیائومی', nameEn: 'Xiaomi' },
    { slug: 'asus', nameFa: 'ایسوس', nameEn: 'ASUS' },
    { slug: 'lg', nameFa: 'ال‌جی', nameEn: 'LG' },
    { slug: 'nike', nameFa: 'نایک', nameEn: 'Nike' },
  ];
  const brands: Record<string, string> = {};
  for (const b of brandsData) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { nameFa: b.nameFa, nameEn: b.nameEn },
      create: { ...b, logoUrl: img(`brand-${b.slug}`) },
    });
    brands[b.slug] = row.id;
  }

  // --- Products ----------------------------------------------------------
  interface SeedProduct {
    slug: string;
    nameFa: string;
    nameEn: string;
    descriptionFa: string;
    descriptionEn: string;
    category: string;
    brand?: string;
    basePrice: number;
    featured?: boolean;
    isNew?: boolean;
    attributes?: Record<string, string>;
    variants: Array<{ sku: string; nameFa?: string; nameEn?: string; stock: number; price?: number; attributes?: Record<string, string> }>;
    rating: number;
    soldCount: number;
  }

  const products: SeedProduct[] = [
    {
      slug: 'samsung-galaxy-s24-ultra',
      nameFa: 'گوشی موبایل سامسونگ گلکسی S24 Ultra',
      nameEn: 'Samsung Galaxy S24 Ultra',
      descriptionFa:
        'گلکسی S24 اولترا با نمایشگر 6.8 اینچی Dynamic AMOLED، دوربین 200 مگاپیکسلی و قلم S Pen. پردازنده اسنپدراگون 8 نسل 3 و باتری 5000 میلی‌آمپر ساعت.',
      descriptionEn:
        'Galaxy S24 Ultra with a 6.8" Dynamic AMOLED display, 200 MP camera and S Pen. Snapdragon 8 Gen 3, 5000 mAh battery.',
      category: 'mobile',
      brand: 'samsung',
      basePrice: 72_500_000,
      featured: true,
      isNew: true,
      attributes: { 'نمایشگر': '6.8 اینچ', 'دوربین': '200 مگاپیکسل', 'باتری': '5000 mAh' },
      variants: [
        { sku: 'S24U-256-TI', nameFa: 'تیتانیوم خاکستری 256GB', nameEn: 'Titanium Gray 256GB', stock: 24, attributes: { color: 'خاکستری', storage: '256GB' } },
        { sku: 'S24U-512-BK', nameFa: 'تیتانیوم مشکی 512GB', nameEn: 'Titanium Black 512GB', stock: 12, price: 78_900_000, attributes: { color: 'مشکی', storage: '512GB' } },
      ],
      rating: 4.8,
      soldCount: 312,
    },
    {
      slug: 'apple-iphone-15-pro-max',
      nameFa: 'گوشی موبایل اپل آیفون 15 پرو مکس',
      nameEn: 'Apple iPhone 15 Pro Max',
      descriptionFa:
        'آیفون 15 پرو مکس با تیتانیوم طبیعی، تراشه A17 Pro و دوربین تله‌فوتو 5x. درگاه USB-C و دکمه اکشن.',
      descriptionEn:
        'iPhone 15 Pro Max with natural titanium, A17 Pro chip and 5x telephoto camera. USB-C and Action button.',
      category: 'mobile',
      brand: 'apple',
      basePrice: 89_000_000,
      featured: true,
      variants: [
        { sku: 'IP15PM-256-NAT', nameFa: 'تیتانیوم طبیعی 256GB', nameEn: 'Natural Titanium 256GB', stock: 18, attributes: { color: 'طوسی', storage: '256GB' } },
        { sku: 'IP15PM-512-BLU', nameFa: 'آبی تیتانیوم 512GB', nameEn: 'Blue Titanium 512GB', stock: 7, price: 99_500_000, attributes: { color: 'آبی', storage: '512GB' } },
      ],
      rating: 4.9,
      soldCount: 421,
    },
    {
      slug: 'xiaomi-14t-pro',
      nameFa: 'گوشی موبایل شیائومی 14T پرو',
      nameEn: 'Xiaomi 14T Pro',
      descriptionFa: 'شیائومی 14T پرو با دوربین لایکا، نمایشگر 144 هرتز و شارژ 120 وات.',
      descriptionEn: 'Xiaomi 14T Pro with Leica optics, 144 Hz display and 120 W charging.',
      category: 'mobile',
      brand: 'xiaomi',
      basePrice: 34_800_000,
      isNew: true,
      variants: [
        { sku: 'X14TP-256-TB', nameFa: 'آبی تایتان 256GB', nameEn: 'Titan Blue 256GB', stock: 40, attributes: { color: 'آبی' } },
        { sku: 'X14TP-512-BK', nameFa: 'مشکی 512GB', nameEn: 'Black 512GB', stock: 22, price: 38_200_000, attributes: { color: 'مشکی' } },
      ],
      rating: 4.5,
      soldCount: 180,
    },
    {
      slug: 'redmi-note-13-pro',
      nameFa: 'گوشی موبایل شیائومی ردمی نوت 13 پرو',
      nameEn: 'Xiaomi Redmi Note 13 Pro',
      descriptionFa: 'ردمی نوت 13 پرو؛ دوربین 200 مگاپیکسل، باتری 5100 میلی‌آمپر ساعت، شارژ 67 وات.',
      descriptionEn: 'Redmi Note 13 Pro; 200 MP camera, 5100 mAh battery, 67 W charging.',
      category: 'mobile',
      brand: 'xiaomi',
      basePrice: 12_900_000,
      variants: [{ sku: 'RN13P-128-BK', nameFa: 'مشکی 128GB', nameEn: 'Black 128GB', stock: 65, attributes: { color: 'مشکی' } }],
      rating: 4.3,
      soldCount: 990,
    },
    {
      slug: 'asus-rog-strix-g16',
      nameFa: 'لپتاپ گیمینگ ایسوس ROG Strix G16',
      nameEn: 'ASUS ROG Strix G16 Gaming Laptop',
      descriptionFa: 'لپتاپ گیمینگ 16 اینچی با RTX 4060، پردازنده Core i7-13650HX و نمایشگر 165 هرتز.',
      descriptionEn: '16" gaming laptop with RTX 4060, Core i7-13650HX and a 165 Hz display.',
      category: 'laptop-gaming',
      brand: 'asus',
      basePrice: 96_000_000,
      featured: true,
      variants: [
        { sku: 'ROG-G16-16-512', nameFa: '16GB/512GB', nameEn: '16GB/512GB', stock: 9 },
        { sku: 'ROG-G16-32-1T', nameFa: '32GB/1TB', nameEn: '32GB/1TB', stock: 4, price: 112_000_000 },
      ],
      rating: 4.7,
      soldCount: 88,
    },
    {
      slug: 'macbook-air-m3',
      nameFa: 'لپتاپ اپل مک‌بوک ایر M3',
      nameEn: 'Apple MacBook Air M3',
      descriptionFa: 'مک‌بوک ایر 13 اینچی با تراشه M3، 8 گیگابایت رم و 256 گیگابایت حافظه. تا 18 ساعت عمر باتری.',
      descriptionEn: '13" MacBook Air with M3 chip, 8 GB RAM and 256 GB storage. Up to 18 h battery.',
      category: 'laptop',
      brand: 'apple',
      basePrice: 68_000_000,
      variants: [{ sku: 'MBA-M3-8-256', nameFa: 'نیمه‌شب 256GB', nameEn: 'Midnight 256GB', stock: 15 }],
      rating: 4.8,
      soldCount: 143,
    },
    {
      slug: 'lg-InstaView-fridge',
      nameFa: 'یخچال فریزر ال‌جی اینستا‌ویو 635 لیتری',
      nameEn: 'LG InstaView Refrigerator 635L',
      descriptionFa: 'یخچال فریزر دوقلو با فناوری InstaView، کمپرسor اینورتر خطی و مصرف انرژی بهینه.',
      descriptionEn: 'Side-by-side refrigerator with InstaView, linear inverter compressor and low energy use.',
      category: 'home-appliance',
      brand: 'lg',
      basePrice: 84_500_000,
      variants: [{ sku: 'LG-635-SS', nameFa: 'استیل', nameEn: 'Stainless', stock: 6 }],
      rating: 4.4,
      soldCount: 52,
    },
    {
      slug: 'xiaomi-air-purifier-4',
      nameFa: 'تصفیه‌کننده هوا شیائومی مدل 4',
      nameEn: 'Xiaomi Smart Air Purifier 4',
      descriptionFa: 'تصفیه‌کننده هوا با فیلتر HEPA تا 99.97٪، مناسب فضاهای تا 48 متر مربع.',
      descriptionEn: 'Air purifier with 99.97% HEPA filtration for rooms up to 48 m².',
      category: 'home-appliance',
      brand: 'xiaomi',
      basePrice: 4_300_000,
      variants: [{ sku: 'XAP4-WH', stock: 35 }],
      rating: 4.2,
      soldCount: 610,
    },
    {
      slug: 'nike-air-max-270',
      nameFa: 'کفش ورزشی نایک ایرمکس 270',
      nameEn: 'Nike Air Max 270 Sneakers',
      descriptionFa: 'کفش دویدن نایک ایرمکس 270 با کفه هوا و رویه مش تنفس‌پذیر.',
      descriptionEn: 'Nike Air Max 270 running shoes with Air sole and breathable mesh.',
      category: 'fashion',
      brand: 'nike',
      basePrice: 6_800_000,
      featured: true,
      variants: [
        { sku: 'AM270-42-BK', nameFa: 'سایز 42 مشکی', nameEn: 'Size 42 Black', stock: 12, attributes: { size: '42', color: 'مشکی' } },
        { sku: 'AM270-43-WH', nameFa: 'سایز 43 سفید', nameEn: 'Size 43 White', stock: 8, attributes: { size: '43', color: 'سفید' } },
        { sku: 'AM270-44-RD', nameFa: 'سایز 44 قرمز', nameEn: 'Size 44 Red', stock: 5, attributes: { size: '44', color: 'قرمز' } },
      ],
      rating: 4.6,
      soldCount: 274,
    },
    {
      slug: 'nike-dri-fit-tee',
      nameFa: 'تیشرت ورزشی نایک درای‌فیت',
      nameEn: 'Nike Dri-FIT T-Shirt',
      descriptionFa: 'تیشرت ورزشی نایک با فناوری درای‌فیت برای خشک ماندن در تمرین.',
      descriptionEn: 'Nike training tee with Dri-FIT moisture-wicking technology.',
      category: 'fashion',
      brand: 'nike',
      basePrice: 1_250_000,
      variants: [
        { sku: 'NKT-M-BL', nameFa: 'سایز M آبی', nameEn: 'Medium Blue', stock: 50, attributes: { size: 'M' } },
        { sku: 'NKT-L-BK', nameFa: 'سایز L مشکی', nameEn: 'Large Black', stock: 44, attributes: { size: 'L' } },
      ],
      rating: 4.1,
      soldCount: 1204,
    },
    {
      slug: 'samsung-galaxy-tab-s9',
      nameFa: 'تبلت سامسونگ گلکسی تب S9',
      nameEn: 'Samsung Galaxy Tab S9',
      descriptionFa: 'تبلت 11 اینچی Dynamic AMOLED با قلم S Pen و ضدآب IP68.',
      descriptionEn: '11" Dynamic AMOLED tablet with S Pen, IP68 water resistance.',
      category: 'mobile',
      brand: 'samsung',
      basePrice: 41_000_000,
      variants: [{ sku: 'TABS9-128-GR', nameFa: '128GB خاکستری', nameEn: '128GB Gray', stock: 11 }],
      rating: 4.6,
      soldCount: 96,
    },
    {
      slug: 'la-roche-posay-serum',
      nameFa: 'سرم ضد لک لاروش پوزه مدل Effaclar',
      nameEn: 'La Roche-Posay Effaclar Serum',
      descriptionFa: 'سرم لایه‌بردار با اسید سالیسیلیک برای پوست چرب و مستعد آکنه.',
      descriptionEn: 'Exfoliating serum with salicylic acid for oily, acne-prone skin.',
      category: 'health',
      basePrice: 980_000,
      isNew: true,
      variants: [{ sku: 'LRP-EF-30', stock: 80 }],
      rating: 4.5,
      soldCount: 430,
    },
  ];

  const productIds: string[] = [];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        nameFa: p.nameFa,
        nameEn: p.nameEn,
        descriptionFa: p.descriptionFa,
        descriptionEn: p.descriptionEn,
        basePrice: p.basePrice,
        isFeatured: p.featured ?? false,
        isNew: p.isNew ?? false,
        status: 'ACTIVE',
      },
      create: {
        slug: p.slug,
        nameFa: p.nameFa,
        nameEn: p.nameEn,
        descriptionFa: p.descriptionFa,
        descriptionEn: p.descriptionEn,
        status: 'ACTIVE',
        images: [img(p.slug), img(`${p.slug}-2`), img(`${p.slug}-3`)],
        attributes: p.attributes ?? undefined,
        basePrice: p.basePrice,
        isFeatured: p.featured ?? false,
        isNew: p.isNew ?? false,
        soldCount: p.soldCount,
        ratingAvg: p.rating,
        ratingCount: Math.max(1, Math.round(p.soldCount / 20)),
        categoryId: categories[p.category],
        brandId: p.brand ? brands[p.brand] : undefined,
      },
    });
    productIds.push(product.id);

    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { stock: v.stock, price: v.price ?? null },
        create: {
          productId: product.id,
          sku: v.sku,
          nameFa: v.nameFa ?? null,
          nameEn: v.nameEn ?? null,
          price: v.price ?? null,
          stock: v.stock,
          attributes: v.attributes ?? undefined,
        },
      });
    }
  }

  // --- Reviews -----------------------------------------------------------
  const demo = await prisma.user.findUnique({ where: { email: 'demo@mhrshop.ir' } });
  if (demo && productIds[0]) {
    await prisma.review.upsert({
      where: { productId_userId: { productId: productIds[0], userId: demo.id } },
      update: {},
      create: {
        productId: productIds[0],
        userId: demo.id,
        rating: 5,
        title: 'عالی بود',
        body: 'کیفیت ساخت فوق‌العاده‌ای دارد و دوربین واقعاً چشمگیر است. ارسال هم سریع انجام شد.',
      },
    });
  }

  // --- Coupons -----------------------------------------------------------
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      descriptionFa: 'تخفیف خوش‌آمدید: ۱۰٪ تا سقف ۲۰۰ هزار تومان',
      descriptionEn: 'Welcome discount: 10% up to 2,000,000 Toman',
      type: 'PERCENT',
      value: 10,
      maxDiscount: 200_000,
      minOrderAmount: 300_000,
      expiresAt: in30Days,
    },
  });
  await prisma.coupon.upsert({
    where: { code: 'MEHR500' },
    update: {},
    create: {
      code: 'MEHR500',
      descriptionFa: '۵۰۰ هزار تومان تخفیف برای سفارش‌های بالای ۲ میلیون تومان',
      descriptionEn: '500,000 Toman off orders above 2,000,000 Toman',
      type: 'FIXED',
      value: 500_000,
      minOrderAmount: 2_000_000,
      usageLimit: 1000,
      expiresAt: in30Days,
    },
  });

  console.log(`Seeded ${products.length} products, ${categoriesData.length} top-level categories, 2 coupons.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
