'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendors } from '@/data/vendors';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/vendorUtils';

// Replace this with your actual auth hook
const useAuth = () => {
  return {
    user: { name: 'John Doe', email: 'john@example.com' }, // set to null if not signed in
    isAuthenticated: true,
  };
};

type Review = {
  name: string;
  text: string;
  date: string;
  rating: number;
};

export default function VendorDetailPage() {
  const { category, vendorId } = useParams();
  const router = useRouter();

  const vendor = vendors.find((v) => v.category === category && v.id === vendorId);

  const { user, isAuthenticated } = useAuth();

  const [isMessaging, setIsMessaging] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const localStorageKey = `reviews-${vendor?.id}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);

  useEffect(() => {
    if (vendor?.id) {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        setReviews(vendor.reviews || []);
      }
    }
  }, [vendor?.id]);

  useEffect(() => {
    if (vendor?.id) {
      localStorage.setItem(localStorageKey, JSON.stringify(reviews));
    }
  }, [reviews, vendor?.id]);

  function handleSendMessage() {
    if (message.trim().length === 0) return;
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  }

  function handleSubmitReview() {
    if (!reviewText.trim() || reviewRating === 0 || !user) return;

    const newReview: Review = {
      name: user.name,
      text: reviewText.trim(),
      date: new Date().toISOString(),
      rating: reviewRating,
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewText('');
    setReviewRating(0);
  }

  function handleMessageClick() {
    if (!isAuthenticated) {
      router.push('/sign-in');
    } else {
      setIsMessaging(true);
    }
  }

  if (!vendor) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">Vendor not found.</p>
        <Link href={`/vendors/${category}`} className="text-blue-600 underline">
          Back to {getCategoryLabel(category)}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-10">
      <Link href={`/vendors/${category}`} className="text-blue-600 underline inline-block">
        &larr; Back to {getCategoryLabel(category)}
      </Link>

      <div>
        <h1 className="text-4xl font-bold text-[#1D3557] mb-4">{vendor.name}</h1>

        {vendor.images?.length > 0 && (
          <div className="flex gap-4 overflow-x-auto mb-6">
            {vendor.images.map((img, idx) => (
              <div key={idx} className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow">
                <Image src={img} alt={`${vendor.name} image ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        <p className="mb-6 text-gray-700 whitespace-pre-line">{vendor.description}</p>

        <div className="mb-6 space-y-1 text-gray-800">
          <p><strong>Location:</strong> {vendor.location}</p>
          {vendor.phone && (
            <p><strong>Phone:</strong>{' '}
              <a href={`tel:${vendor.phone}`} className="text-blue-600 underline">{vendor.phone}</a>
            </p>
          )}
          {vendor.email && (
            <p><strong>Email:</strong>{' '}
              <a href={`mailto:${vendor.email}`} className="text-blue-600 underline">{vendor.email}</a>
            </p>
          )}
          {vendor.website && (
            <p><strong>Website:</strong>{' '}
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {vendor.website}
              </a>
            </p>
          )}
        </div>

        {!isMessaging ? (
          <button
            onClick={handleMessageClick}
            className="bg-[#1D3557] text-white px-6 py-3 rounded hover:bg-[#16324a] transition"
          >
            Message Vendor
          </button>
        ) : (
          <div className="mt-6">
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full border rounded p-3 mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition disabled:opacity-50"
                disabled={message.trim().length === 0}
              >
                Send
              </button>
              <button
                onClick={() => {
                  setIsMessaging(false);
                  setMessage('');
                }}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
            {sent && <p className="text-green-600 mt-2">Message sent! (Demo only)</p>}
          </div>
        )}
      </div>

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-semibold text-[#1D3557] mb-4">Reviews</h2>

        {isAuthenticated ? (
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-600">Leaving a review as <strong>{user.name}</strong></p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-2xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  aria-label={`Rate ${star} star`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Write a review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border rounded p-2"
            />
            <button
              onClick={handleSubmitReview}
              className="bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition disabled:opacity-50"
              disabled={!reviewText.trim() || reviewRating === 0}
            >
              Submit Review
            </button>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">
            <Link href="/sign-in" className="text-blue-600 underline">Sign in</Link> to leave a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review, idx) => (
              <li key={idx} className="border rounded p-4 shadow-sm bg-white">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-[#1D3557]">{review.name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${review.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                <p className="text-gray-700 whitespace-pre-line mt-1">{review.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
