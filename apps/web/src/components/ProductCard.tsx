'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import { StarRating } from './StarRating';

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('common');
  const tp = useTranslations('product');
  const locale = useLocale();
  const { addToCart } = useStore();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const name = locale === 'fa' ? product.nameFa : product.nameEn;
  const firstVariant = product.variants[0];

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant || adding) return;
    setAdding(true);
    try {
      await addToCart(firstVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/${locale}/product/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] ?? 'https://picsum.photos/seed/placeholder/600/600'}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {product.isNew && <span className="badge bg-emerald-600 text-white">New</span>}
          {product.ratingAvg >= 4.5 && product.soldCount > 50 && (
            <span className="badge bg-amber-400 text-white">#</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-slate-800 text-white">{tp('outOfStock')}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-11 text-sm font-bold leading-6 text-slate-800">{name}</h3>
        <div className="flex items-center gap-1.5">
          <StarRating value={product.ratingAvg} size={13} />
          <span className="text-xs text-slate-400">({product.ratingCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-brand-600">
              {formatPrice(product.minPrice, locale)}{' '}
              <span className="text-xs font-semibold text-slate-500">{t('toman')}</span>
            </div>
            {product.stock === 0 && <div className="text-xs font-bold text-rose-500">{tp('outOfStock')}</div>}
          </div>
          <button
            onClick={onAdd}
            disabled={!firstVariant || product.stock === 0 || adding}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition hover:bg-brand-600 hover:text-white disabled:opacity-40"
            aria-label={t('addToCart')}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}
