import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const tn = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="mt-16 border-t border-slate-100 bg-white">
      <div className="container-x grid gap-10 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-slate-900">{t('aboutTitle')}</h3>
          <p className="text-sm leading-7 text-slate-500">{t('aboutBody')}</p>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-slate-900">{t('linksTitle')}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href={`/${locale}/catalog`} className="hover:text-brand-600">{tn('catalog')}</Link></li>
            <li><Link href={`/${locale}/account`} className="hover:text-brand-600">{tn('orders')}</Link></li>
            <li><Link href={`/${locale}/account/wishlist`} className="hover:text-brand-600">{tn('wishlist')}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-lg font-extrabold text-slate-900">{t('contactTitle')}</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>{t('support')}</li>
            <li>{t('address')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">{t('rights')}</div>
    </footer>
  );
}
