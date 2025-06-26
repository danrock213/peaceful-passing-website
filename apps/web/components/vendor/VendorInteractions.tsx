'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import StarRatingInput from '@/components/StarRatingInput';
import StarRatingDisplay from '@/components/StarRatingDisplay';
import type { Review } from '@/types/vendor';
import type { Message } from '@/types/message';

interface VendorInteractionsProps {
  vendorId: string;
}

export default function VendorInteractions({ vendorId }: VendorInteractionsProps) {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const userName = user?.firstName || 'Anonymous';

  // --- Reviews state ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  // --- Messages state ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState('');

  // Fetch reviews on vendorId change
  useEffect(() => {
    if (!vendorId) return;

    async function fetchReviews() {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: false });

      if (error) console.error('Failed to fetch reviews:', error);
      setReviews(data ?? []);
      setLoadingReviews(false);
    }

    fetchReviews();
  }, [vendorId]);

  // Fetch messages on vendorId change
  useEffect(() => {
    if (!vendorId) return;

    async function fetchMessages() {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to fetch messages:', error);
        setLoadingMessages(false);
        return;
      }

      const messagesData = data ?? [];
      setMessages(messagesData);
      setLoadingMessages(false);

      // Mark unread user messages as read
      const unreadUserMessageIds = messagesData
        .filter((msg) => msg.sender_type === 'user' && !msg.read)
        .map((msg) => msg.id);

      if (unreadUserMessageIds.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadUserMessageIds);

        if (updateError) {
          console.error('Failed to mark messages as read:', updateError);
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              unreadUserMessageIds.includes(msg.id) ? { ...msg, read: true } : msg
            )
          );
        }
      }
    }

    fetchMessages();
  }, [vendorId]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  // Get user's recent messages
  const recentUserMessages = useMemo(
    () => messages.filter((msg) => msg.sender === userName).slice(0, 3),
    [messages, userName]
  );

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!isSignedIn) return router.push('/sign-in');

    if (!reviewText.trim()) return setReviewError('Please enter a review message.');
    if (rating < 1 || rating > 5) return setReviewError('Rating must be between 1 and 5.');

    const newReview = {
      vendor_id: vendorId,
      author: userName,
      rating,
      comment: reviewText.trim(),
      date: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();

    if (error) {
      console.error(error);
      setReviewError('Failed to submit review.');
      return;
    }

    setReviews((prev) => [data as Review, ...prev]);
    setRating(5);
    setReviewText('');
    setReviewError('');
  };

  // Handle message submission
  const handleSubmitMessage = async () => {
    if (!isSignedIn) return router.push('/sign-in');
    if (!messageText.trim()) return setMessageError('Please enter a message.');

    const newMessage = {
      vendor_id: vendorId,
      sender: userName,
      sender_type: 'user' as const,
      content: messageText.trim(),
      date: new Date().toISOString(),
      read: false,
    };

    const { data, error } = await supabase.from('messages').insert([newMessage]).select().single();

    if (error) {
      console.error(error);
      setMessageError('Failed to send message.');
      return;
    }

    setMessages((prev) => [data as Message, ...prev]);
    setMessageText('');
    setMessageError('');
    alert('Message sent successfully!');
  };

  return (
    <>
      {/* Average Rating Display */}
      {averageRating !== null && (
        <div className="text-yellow-600 mb-4 flex items-center gap-2">
          <StarRatingDisplay rating={averageRating} size={16} />
          <span className="font-semibold">
            {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* Messaging Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Send a Message</h2>
        {isSignedIn ? (
          <div className="p-4 border rounded bg-gray-50">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border rounded p-2 resize-none"
              placeholder="Write your message here..."
              disabled={loadingMessages}
              aria-label="Message input"
            />
            {messageError && <p className="text-red-600 mt-2">{messageError}</p>}
            <button
              type="button"
              onClick={handleSubmitMessage}
              className="mt-3 bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
              disabled={loadingMessages}
            >
              {loadingMessages ? 'Sending...' : 'Send Message'}
            </button>

            {recentUserMessages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Your Recent Messages</h3>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {recentUserMessages.map((msg) => (
                    <li key={msg.id} className="border p-2 rounded bg-white text-sm text-gray-700">
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(msg.date).toLocaleDateString()} at{' '}
                        {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>
            <Link href="/sign-in" className="text-blue-600 underline">
              Sign in
            </Link>{' '}
            to message this vendor.
          </p>
        )}
      </section>

      {/* Reviews Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Reviews ({reviews.length})</h2>
        <div className="mb-6 p-4 border rounded bg-gray-50">
          {isSignedIn ? (
            <>
              <label className="block mb-1 font-medium" htmlFor="rating-input">
                Rating:
              </label>
              <StarRatingInput rating={rating} onChange={setRating} />

              <label htmlFor="review-textarea" className="block mt-4 mb-1 font-medium">
                Your Review:
              </label>
              <textarea
                id="review-textarea"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border rounded p-2 resize-none"
                aria-label="Review input"
                disabled={loadingReviews}
              />
              {reviewError && <p className="text-red-600 mt-2">{reviewError}</p>}

              <button
                type="button"
                onClick={handleSubmitReview}
                className="mt-3 bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
                disabled={loadingReviews}
              >
                {loadingReviews ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          ) : (
            <p>
              <Link href="/sign-in" className="text-blue-600 underline">
                Sign in
              </Link>{' '}
              to post a review.
            </p>
          )}
        </div>

        <ul>
          {reviews.length === 0 && <li>No reviews yet.</li>}
          {reviews.map((rev) => (
            <li key={rev.id} className="mb-4 border-b pb-2">
              <p className="font-semibold flex items-center gap-2">
                {rev.author} <StarRatingDisplay rating={rev.rating} size={16} />
              </p>
              <p className="text-gray-700 whitespace-pre-line">{rev.comment}</p>
              <p className="text-gray-500 text-sm">{new Date(rev.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Placeholder for Booking Requests Feature */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Booking Requests (Coming Soon)</h2>
        <p className="text-gray-600 italic">Booking requests feature is under development.</p>
      </section>
    </>
  );
}
