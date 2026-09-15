'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { type Locale } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { StarRating } from '@/components/common/StarRating';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { addToast } from '@/store/slices/uiSlice';

interface ProductReviewsProps {
  product: Product;
  locale: Locale;
}

export function ProductReviews({ product, locale }: ProductReviewsProps) {
  const dict = getDictionary(locale);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [commentText, setCommentText] = useState('');

  // Sample verified reviews
  const reviews = [
    {
      id: 'rev-1',
      author: locale === 'ar' ? 'نورة المهيدب' : 'Noura Al-Muhaidib',
      rating: 5,
      date: '2026-03-02',
      comment:
        locale === 'ar'
          ? 'باقة استثنائية بكل ما تعنيه الكلمة! الورد كان طازجاً جداً والتغليف فخم والتوصيل في الموعد المحدد.'
          : 'Stunning bouquet! Stems were remarkably fresh, exquisite presentation wrap, and punctual delivery.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: locale === 'ar' ? 'خالد الفهد' : 'Khaled Al-Fahad',
      rating: 5,
      date: '2026-02-18',
      comment:
        locale === 'ar'
          ? 'الاهتمام بالتفاصيل وبطاقة الإهداء بالخط الجميل جعل الهدية مميزة جداً. سأكرر الطلب دائماً.'
          : 'The handwritten card and pristine blooms made this anniversary gift unforgettable.',
      verified: true,
    },
  ];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    dispatch(
      addToast({
        type: 'success',
        message:
          locale === 'ar'
            ? 'شكراً لك! تم إرسال تقييمك بنجاح وسينشر بعد المراجعة.'
            : 'Thank you! Your review has been submitted for approval.',
      })
    );
    setAuthorName('');
    setCommentText('');
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            <span>{dict.product.reviews}</span>
            <span className="text-sm font-normal text-text-muted">
              ({product.reviewCount})
            </span>
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <StarRating rating={product.rating} size="md" showCount={false} />
            <span className="text-xs text-text-muted">
              {product.rating} {locale === 'ar' ? 'من 5 نجوم' : 'out of 5 stars'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="font-bold"
        >
          <MessageSquare className="w-4 h-4 me-1.5" />
          <span>{dict.product.writeReview}</span>
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 max-w-3xl">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-text-main">
                  {rev.author}
                </span>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span>{locale === 'ar' ? 'مشتري موثق' : 'Verified Buyer'}</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-text-muted">{rev.date}</span>
            </div>

            <StarRating rating={rev.rating} size="sm" showCount={false} className="mb-2" />

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={dict.product.writeReview}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">
              {dict.product.rating}
            </label>
            <div className="flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRatingVal(s)}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Input
            label={locale === 'ar' ? 'اسمك' : 'Your Name'}
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1.5">
              {locale === 'ar' ? 'رأيك وتجربتك' : 'Your Review'}
            </label>
            <textarea
              required
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                locale === 'ar'
                  ? 'شاركنا رأيك في نضارة الزهور وجودة التغليف والتوصيل...'
                  : 'Share your experience with flower freshness and presentation...'
              }
              className="w-full p-3 text-xs sm:text-sm bg-surface border border-border rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full font-bold">
            {dict.common.submit}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
