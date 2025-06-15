'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type ChecklistItem = {
  id: string;
  text: string;
};

const checklistByCategory: { title: string; items: ChecklistItem[] }[] = [
  {
    title: 'As Soon As Possible',
    items: [
      { id: 'notify-family', text: 'Notify immediate family and close friends' },
      { id: 'obtain-death-certificate', text: 'Obtain official death certificate' },
      { id: 'contact-funeral-home', text: 'Contact funeral home or mortuary' },
      { id: 'review-prepaid-funeral-plans', text: 'Review any prepaid funeral plans or instructions' },
      { id: 'locate-will-and-legal-documents', text: 'Locate will, trusts, and important legal documents' },
      { id: 'notify-employer', text: 'Notify deceased’s employer (if applicable)' },
      { id: 'secure-property-and-pets', text: 'Secure home, property, and arrange care for pets' },
    ],
  },
  {
    title: 'Next Few Days',
    items: [
      { id: 'choose-funeral-venue', text: 'Choose funeral or memorial venue' },
      { id: 'select-burial-or-cremation', text: 'Decide on burial, cremation, or other disposition' },
      { id: 'choose-casket-urn', text: 'Select casket or urn' },
      { id: 'write-obituary', text: 'Write obituary or death notice' },
      { id: 'notify-vendors', text: 'Notify vendors such as florists, caterers, clergy, musicians' },
      { id: 'plan-funeral-service', text: 'Plan funeral or memorial service details' },
      { id: 'arrange-transportation', text: 'Arrange transportation for family and deceased' },
      { id: 'collect-photos-and-mementos', text: 'Gather photos and keepsakes for service' },
      { id: 'contact-beneficiaries', text: 'Notify beneficiaries of will and insurance' },
      { id: 'handle-social-security', text: 'Report death to Social Security Administration' },
      { id: 'cancel-utilities-subscriptions', text: 'Begin cancelling or transferring utilities and subscriptions' },
    ],
  },
  {
    title: 'Longer Term',
    items: [
      { id: 'create-tribute-page', text: 'Create tribute or memorial website/page' },
      { id: 'handle-estate-administration', text: 'Initiate estate probate and administration' },
      { id: 'close-bank-accounts', text: 'Close or transfer bank accounts and financial assets' },
      { id: 'cancel-credit-cards', text: 'Cancel credit cards and notify creditors' },
      { id: 'notify-government-agencies', text: 'Notify IRS, DMV, voter registration, and other agencies' },
      { id: 'update-legal-documents', text: 'Update your own legal documents as needed' },
      { id: 'thank-you-notes', text: 'Send thank-you notes to funeral attendees and helpers' },
      { id: 'grief-support', text: 'Consider grief counseling or support groups' },
      { id: 'preserve-memory', text: 'Preserve memory through photo albums, videos, or memory books' },
      { id: 'review-insurance', text: 'Review life insurance, health insurance, and pensions' },
    ],
  },
];

export default function ChecklistPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [checkedItems, setCheckedItems] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const stored = localStorage.getItem('checklist');
    if (stored) setCheckedItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleToggle = (id: string) => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/checklist');
      return;
    }
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
      <h1 className="text-4xl font-extrabold text-[#1D3557] mb-12 text-center">
        Funeral Planning Checklist
      </h1>

      {checklistByCategory.map(({ title, items }) => (
        <section key={title} className="mb-12">
          <h2 className="text-2xl font-semibold text-[#457B9D] mb-6 border-b-2 border-[#1D3557] pb-2">
            {title}
          </h2>
          <ul className="space-y-4">
            {items.map(({ id, text }) => {
              const checked = !!checkedItems[id];
              return (
                <li
                  key={id}
                  onClick={() => handleToggle(id)}
                  className={`flex items-center cursor-pointer select-none rounded-lg p-4 transition-colors duration-300 
                    ${
                      checked
                        ? 'bg-[#E0E6ED] text-gray-500 line-through'
                        : 'bg-[#F8FAFC] hover:bg-[#D9E2EC] text-[#1D3557]'
                    }
                    shadow-sm
                  `}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggle(id);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="w-6 h-6 mr-4 cursor-pointer text-[#1D3557]"
                  />
                  <span className="text-lg">{text}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {!isSignedIn && (
        <p className="mt-10 text-center text-gray-500 text-sm">
          Please{' '}
          <a href="/sign-in?redirect_url=/checklist" className="text-[#1D3557] underline font-semibold">
            sign in
          </a>{' '}
          to track your checklist progress.
        </p>
      )}
    </main>
  );
}
