import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getProducts } from '@/lib/server';
import type { Category, Product } from '@/lib/types';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  const [featuredRes, newRes, bestRes, catRes] = await Promise.all([
    getProducts('?sort=newest&limit=8&minRating=4'),
    getProducts('?sort=newest&limit=8'),
    getProducts('?sort=bestselling&limit=8'),
    getCategories(),
  ]);

  const featured = (featuredRes?.data as Product[]) ?? [];
  const newArrivals = (newRes?.data as Product[]) ?? [];
  const bestSellers = (bestRes?.data as Product[]) ?? [];
  const categories = (catRes?.data as Category[]) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-700 to-brand-500 text-white">
        <div className="container-x flex flex-col items-start gap-6 py-16 md:py-24">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">{t('heroTitle')}</h1>
          <p className="max-w-xl text-sm leading-7 text-white/85 md:text-base">{t('heroSubtitle')}</p>
          <Link href={`/${locale}/catalog`} className="btn bg-white px-6 py-3 text-brand-700 hover:bg-brand-50">
            {t('heroCta')} →
          </Link>
        </div>
      </section>

      <div className="container-x space-y-14 py-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <SectionTitle title={t('categoriesTitle')} />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-5">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/${locale}/catalog?category=${c.slug}`}
                  className="card flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-0.5 hover:border-brand-200"
                >
                  <span className="text-3xl">{c.icon ?? '🛍️'}</span>
                  <span className="text-xs font-bold text-slate-700 sm:text-sm">
                    {locale === 'fa' ? c.nameFa : c.nameEn}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ProductRow title={t('featuredTitle')} products={featured} locale={locale} viewAll={tc('viewAll')} />
        <ProductRow title={t('newArrivalsTitle')} products={newArrivals} locale={locale} viewAll={tc('viewAll')} />
        <ProductRow title={t('bestSellersTitle')} products={bestSellers} locale={locale} viewAll={tc('viewAll')} />

        {/* Why us */}
        <section>
          <SectionTitle title={t('whyTitle')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">
                  {['✔', '🚚', '🔒', '🎧'][i - 1]}
                </div>
                <h3 className="mb-1.5 font-extrabold">{t(`why${i}Title`)}</h3>
                <p className="text-sm leading-6 text-slate-500">{t(`why${i}Body`)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-6 w-1.5 rounded-full bg-brand-600" />
      <h2 className="text-xl font-extrabold md:text-2xl">{title}</h2>
    </div>
  );
}

function ProductRow({
  title,
  products,
  locale,
  viewAll,
}: {
  title: string;
  products: Product[];
  locale: string;
  viewAll: string;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <SectionTitle title={title} />
        <Link href={`/${locale}/catalog`} className="text-sm font-bold text-brand-600 hover:underline">
          {viewAll} →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
