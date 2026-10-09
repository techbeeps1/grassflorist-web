'use client';

import React from 'react';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { StarRating } from '@/components/common/StarRating';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { useGetGoogleReviewsQuery, GoogleReviewItem } from '@/store/api/cmsApi';

interface ProductReviewsProps {
  product: Product;
  locale: Locale;
}

const GoogleGIcon = () => (
  <svg className="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export function ProductReviews({ product, locale }: ProductReviewsProps) {
  const dict = getDictionary(locale);

  // Fetch randomly selected visible Google Reviews from backend
  const { data: reviewsResponse, isLoading } = useGetGoogleReviewsQuery({
    limit: 4,
    random: true,
  });

  const reviews: GoogleReviewItem[] = reviewsResponse?.data || [];
  const googleBusinessUrl =
    reviewsResponse?.meta?.google_business_url || 'https://share.google/z7BTvYwJ4iPqWjQTK';
  const writeReviewUrl =
    reviewsResponse?.meta?.write_review_url ||
    reviewsResponse?.meta?.google_business_url ||
    'https://share.google/z7BTvYwJ4iPqWjQTK';
  const averageRating = reviewsResponse?.meta?.average_rating || 5.0;
  const totalReviewsCount = reviewsResponse?.meta?.total_reviews || 22;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      {/* Header and Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <span>{dict.product.reviews}</span>
              <span className="text-sm font-normal text-text-muted">
                ({totalReviewsCount})
              </span>
            </h3>

            {/* Google Rating Badge */}
            <a
              href={googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border/80 text-xs font-semibold text-text-main hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              <GoogleGIcon />
              <span>{locale === 'ar' ? 'تقييمات Google' : 'Google Reviews'}</span>
              <span className="text-amber-500 font-bold">★ {averageRating}</span>
              <ExternalLink className="w-3 h-3 text-text-muted" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={averageRating} size="md" showCount={false} />
            <span className="text-xs text-text-muted">
              {averageRating} {locale === 'ar' ? 'من 5 نجوم على خرائط Google' : 'out of 5 stars on Google Business'}
            </span>
          </div>
        </div>

        {/* Direct Google Write Review Action */}
        <a
          href={writeReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs sm:text-sm transition-all hover:border-primary/40 shadow-2xs group"
          title={locale === 'ar' ? 'أضف تقييمك على خرائط Google' : 'Write a review on Google Business'}
        >
          <MessageSquare className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span>{dict.product.writeReview}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-w-3xl">
        {isLoading && (
          <div className="p-6 rounded-2xl bg-surface border border-border/80 animate-pulse text-sm text-text-muted">
            {locale === 'ar' ? 'جاري تحميل تقييمات Google...' : 'Loading verified Google reviews...'}
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="p-6 rounded-2xl bg-surface border border-border/80 text-center text-sm text-text-muted">
            {dict.product.noReviewsYet}
          </div>
        )}

        {reviews.map((rev) => {
          const commentDisplay = rev.comment;

          return (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-2xs hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  {/* Reviewer Avatar */}
                  {rev.author_photo_url ? (
                    <img
                      src={rev.author_photo_url}
                      alt={rev.author_name}
                      className="w-8 h-8 rounded-full object-cover border border-border/60"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {rev.author_name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-text-main">
                        {rev.author_name}
                      </span>
                      {/* Google Verified Review Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-full border border-blue-100/80">
                        <GoogleGIcon />
                        <span>{locale === 'ar' ? 'تقييم Google موثق' : 'Google Verified'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-text-muted">
                  {rev.relative_time_description || rev.published_at}
                </span>
              </div>

              <StarRating rating={rev.rating} size="sm" showCount={false} className="mb-2" />

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {commentDisplay}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
