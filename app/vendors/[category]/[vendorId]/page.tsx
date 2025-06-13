'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { vendors } from '@/data/vendors';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/vendorUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import StarRatingInput from '@/components/StarRatingInput';
import StarRatingDisplay from '@/components/StarRatingDisplay';

export default function VendorDetailPage() {
  const { category, vendorId } = useParams();
  const router = useRouter();

  const vendor = vendors.find((v) => v.category === category && v.id === vendorId);

  const [reviews, setReviews] = useLocalStorage<Record<string, Review[]>>(
    'vendorReviews',
    {}
  );

  const [messages, setMessages] = useLocalStorage<Record<string, Message[]>>(
    'vendorMessages',
    {}
  );

  const isSignedIn = true; // Replace with real auth
  const userName = 'DemoUser'; // Replace with real user

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

  const vendorReviews = reviews[vendorId] || [];
  const vendorMessages = messages[vendorId] || [];

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState('');

  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState('');

  function handleSubmitReview() {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    if (!reviewText.trim()) {
      setError('Please enter a review message');
      return;
    }

    const newReview: Review = {
      id: `${Date.now()}`,
      author: userName,
      rating,
      comment: reviewText.trim(),
      date: new Date().toISOString(),
    };

    const updatedVendorReviews = [newReview, ...vendorReviews];

    setReviews({
      ...reviews,
      [vendorId]: updatedVendorReviews,
    });

    setRating(5);
    setReviewText('');
    setError('');
  }

  function handleSubmitMessage() {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!messageText.trim()) {
      setMessageError('Please enter a message');
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}`,
      sender: userName,
      content: messageText.trim(),
      date: new Date().toISOString(),
    };

    const updatedVendorMessages = [newMessage, ...vendorMessages];

    setMessages({
      ...messages,
      [vendorId]: updatedVendorMessages,
    });

    setMessageText('');
    setMessageError('');
    alert('Message sent successfully!');
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href={`/vendors/${category}`} className="text-blue-600 underline mb-4 inline-block">
        &larr; Back to {getCategoryLabel(category)}
      </Link>

      <h1 className="text-4xl font-bold text-[#1D3557] mb-4">{vendor.name}</h1>

      <div className="flex gap-4 overflow-x-auto mb-6">
        {vendor.images?.map((img, idx) => (
          <div key={idx} className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow">
            <Image src={img} alt={`${vendor.name} image ${idx + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      <p className="mb-6 text-gray-700 whitespace-pre-line">{vendor.description}</p>

      <div className="mb-6 space-y-1 text-gray-800">
        <p><strong>Location:</strong> {vendor.location}</p>
        {vendor.phone && (
          <p><strong>Phone:</strong> <a href={`tel:${vendor.phone}`} className="text-blue-600 underline">{vendor.phone}</a></p>
        )}
        {vendor.email && (
          <p><strong>Email:</strong> <a href={`mailto:${vendor.email}`} className="text-blue-600 underline">{vendor.email}</a></p>
        )}
        {vendor.website && (
          <p><strong>Website:</strong> <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{vendor.website}</a></p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Send a Message</h2>
        {isSignedIn ? (
          <div className="p-4 border rounded bg-gray-50">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Write your message here..."
            />
            {messageError && <p className="text-red-600 mt-2">{messageError}</p>}
            <button
              onClick={handleSubmitMessage}
              className="mt-3 bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
            >
              Send Message
            </button>
          </div>
        ) : (
          <p><Link href="/sign-in" className="text-blue-600 underline">Sign in</Link> to message this vendor.</p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews ({vendorReviews.length})</h2>

        <div className="mb-6 p-4 border rounded bg-gray-50">
          {isSignedIn ? (
            <>
              <label className="block mb-1 font-medium">Rating:</label>
              <StarRatingInput rating={rating} onChange={setRating} />

              <label className="block mt-4 mb-1 font-medium">Your Review:</label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border rounded p-2"
              />

              {error && <p className="text-red-600 mt-2">{error}</p>}

              <button
                onClick={handleSubmitReview}
                className="mt-3 bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
              >
                Submit Review
              </button>
            </>
          ) : (
            <p>
              <Link href="/sign-in" className="text-blue-600 underline">Sign in</Link> to post a review.
            </p>
          )}
        </div>

        <ul>
          {vendorReviews.length === 0 && <li>No reviews yet.</li>}
          {vendorReviews.map((rev) => (
            <li key={rev.id} className="mb-4 border-b pb-2">
              <p className="font-semibold">{rev.author} <StarRatingDisplay rating={rev.rating} size={16} /></p>
              <p className="text-gray-700 whitespace-pre-line">{rev.comment}</p>
              <p className="text-gray-500 text-sm">{new Date(rev.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// Types

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

type Message = {
  id: string;
  sender: string;
  content: string;
  date: string;
};
