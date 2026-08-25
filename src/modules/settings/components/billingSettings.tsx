'use client';

import React, { useState } from 'react';
import { CheckCircle2, X, CreditCard } from 'lucide-react';
import { useParams } from 'next/navigation';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isCurrent?: boolean;
}

interface PaymentHistory {
  id: string;
  date: string;
  plan: string;
  billingPeriod: string;
  amount: number;
  status: 'Paid' | 'Failed';
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever',
    features: [
      'Up to 5 members',
      '2 projects',
      'Basic project management',
      'Kanban board',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    period: 'month',
    features: [
      'Up to 25 members',
      '10 projects',
      'Advanced reports',
      'Sprint planning',
      'Backlog & User stories',
      'Priority support',
    ],
    isCurrent: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 2499,
    period: 'month',
    features: [
      'Up to 100 members',
      '50 projects',
      'Advanced reporting',
      'Custom roles & permissions',
      'Organization management',
      'Dedicated support',
      'SSO / SAML',
    ],
  },
];

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 'pay_0X7kLeP9n2r4Tz',
    date: '2026-08-21',
    plan: 'Pro',
    billingPeriod: 'Aug 21 – Sep 21, 2026',
    amount: 999,
    status: 'Paid',
  },
  {
    id: 'pay_PMs6J1B0mla35y',
    date: '2026-07-21',
    plan: 'Pro',
    billingPeriod: 'Jul 21 – Aug 21, 2026',
    amount: 999,
    status: 'Paid',
  },
  {
    id: 'pay_0Vs11k7H10p2Rx',
    date: '2026-06-21',
    plan: 'Pro',
    billingPeriod: 'Jun 21 – Jul 21, 2026',
    amount: 999,
    status: 'Paid',
  },
  {
    id: 'pay_Nl4h1j60M9n1Qw',
    date: '2026-05-21',
    plan: 'Pro',
    billingPeriod: 'May 21 – Jun 21, 2026',
    amount: 999,
    status: 'Failed',
  },
  {
    id: '-',
    date: '2026-04-21',
    plan: 'Free',
    billingPeriod: 'Apr 21 – May 21, 2026',
    amount: 0,
    status: 'Paid',
  },
];

interface ConfirmSubscriptionModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmSubscriptionModal: React.FC<ConfirmSubscriptionModalProps> = ({
  isOpen,
  plan,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !plan) return null;

  const baseAmount = plan.price;
  const gstPercent = 18;
  const gstAmount = Math.round((baseAmount * gstPercent) / 100);
  const totalAmount = baseAmount + gstAmount;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <CreditCard className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 text-center mb-2">
            Confirm Subscription
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
            Review your order before payment
          </p>

          {/* Order Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Organization</span>
              <span className="text-gray-900 dark:text-slate-100 font-medium">Acme Corp</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Selected Plan</span>
              <span className="text-gray-900 dark:text-slate-100 font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Billing Cycle</span>
              <span className="text-gray-900 dark:text-slate-100 font-medium">Monthly</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200 dark:border-slate-700">
              <span className="text-gray-600 dark:text-slate-400">Base Amount</span>
              <span className="text-gray-900 dark:text-slate-100">₹{baseAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">GST (18%)</span>
              <span className="text-gray-900 dark:text-slate-100">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200 dark:border-slate-700">
              <span className="text-gray-900 dark:text-slate-100">Total</span>
              <span className="text-blue-600 dark:text-blue-400">₹{totalAmount}</span>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-xs text-center text-gray-500 dark:text-slate-400 mb-6">
            Clicking &quot;Proceed to Payment&quot; will open Razorpay secure checkout.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const BillingSettings = () => {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    plan: Plan | null;
  }>({
    isOpen: false,
    plan: null,
  });

  const currentPlan = plans.find((p) => p.isCurrent) || plans[1];

  const handleUpgrade = (plan: Plan) => {
    setConfirmModal({ isOpen: true, plan });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, plan: null });
  };

  const handleConfirmPayment = () => {
    // Initialize Razorpay
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX',
      amount: (confirmModal.plan?.price || 0) * 100 * 1.18, // Amount in paise with GST
      currency: 'INR',
      name: 'WorkPilot',
      description: `${confirmModal.plan?.name} Plan Subscription`,
      image: '/images/mitrahsoft-logo.png',
      handler: function (response: RazorpayResponse) {
        handleCloseModal();
        // Here you would typically send the payment details to your backend
      },
      prefill: {
        name: 'Acme Corp',
        email: 'admin@acmecorp.com',
        contact: '9999999999',
      },
      notes: {
        organization: orgSlug,
        plan_id: confirmModal.plan?.id || 'unknown',
      },
      theme: {
        color: '#7C3AED',
      },
    };

    if (typeof window !== 'undefined' && window.Razorpay) {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } else {
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <ConfirmSubscriptionModal
        isOpen={confirmModal.isOpen}
        plan={confirmModal.plan}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
      />

      {/* Current Plan Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Current Plan
            </p>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                {currentPlan.name}
              </h3>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30">
                Active
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                ₹{currentPlan.price}
              </span>
              <span className="text-base font-normal text-gray-500 dark:text-slate-400">
                /month
              </span>
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            Upgrade Plan
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              Billing Cycle
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-slate-100">Monthly</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              Current Period
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-slate-100">
              2026-06-21 — 2026-09-21
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              Next Billing
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-slate-100">2026-09-21</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              Members
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-slate-100">5 / 25</p>
          </div>
        </div>

        {/* Included Features */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Included Features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2
                  size={18}
                  className="text-green-500 dark:text-green-400 shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
          Available Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 p-8 transition-all ${
                plan.isCurrent
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md'
              }`}
            >
              {plan.isCurrent && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-green-500 dark:bg-green-600">
                    <CheckCircle2 size={14} />
                    CURRENT PLAN
                  </span>
                </div>
              )}
              <h4 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
                {plan.name}
              </h4>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                  ₹{plan.price}
                </span>
                <span className="text-base text-gray-500 dark:text-slate-400 font-normal">
                  {' '}
                  / {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={18}
                      className="text-green-500 dark:text-green-400 shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.isCurrent ? (
                <button
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold cursor-default"
                >
                  Current Plan
                </button>
              ) : plan.id === 'free' ? (
                <button className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Switch
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
          Payment History
        </h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  {['Payment ID', 'Date', 'Plan', 'Billing Period', 'Amount', 'Status', 'Invoice'].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {mockPaymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {payment.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {payment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {payment.billingPeriod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                        ₹{payment.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'Paid'
                            ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                            : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'Paid' && payment.amount > 0 ? (
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium hover:underline flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Invoice
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
