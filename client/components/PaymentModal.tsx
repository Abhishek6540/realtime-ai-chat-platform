'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { loadScript } from '@/utils/loadScript';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'1' | '3' | '12'>('1');

  const plans = {
    '1': { duration: '1 Month', price: 499, months: 1 },
    '3': { duration: '3 Months', price: 1299, months: 3 },
    '12': { duration: '1 Year', price: 4299, months: 12 },
  };

  const currentPlan = plans[selectedPlan];

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Create order on backend
      const orderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: currentPlan.price,
            durationMonths: currentPlan.months,
          }),
        }
      );

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order, paymentId } = await orderResponse.json();

      // Load Razorpay script
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/verify`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  paymentId,
                  razorpayOrderId: order.id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }
            );

            if (verifyResponse.ok) {
              onSuccess();
              onClose();
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            console.error('[v0] Payment verification error:', err);
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#7c3aed',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('[v0] Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Upgrade to Premium</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selection */}
        <div className="space-y-3 mb-6">
          {(Object.entries(plans) as Array<[string, typeof currentPlan]>).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key as '1' | '3' | '12')}
              className={`w-full p-3 rounded-lg border-2 transition text-left ${
                selectedPlan === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{plan.duration}</span>
                <span className="text-lg font-bold text-primary">₹{plan.price}</span>
              </div>
              {plan.months > 1 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ₹{Math.round(plan.price / plan.months)}/month
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-6 p-4 bg-background rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-3">Premium Benefits:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-accent">✓</span> AI-powered reply suggestions
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-accent">✓</span> Priority support
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-accent">✓</span> Unlimited messaging
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-accent">✓</span> Advanced analytics
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition font-semibold flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Processing...' : `Pay ₹${currentPlan.price}`}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
}
