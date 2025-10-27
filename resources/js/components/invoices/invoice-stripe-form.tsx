import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { router } from '@inertiajs/react';

interface InvoiceStripeFormProps {
  invoice: {
    id: number;
    balance_due: number;
  };
  stripeKey: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ invoice, onSuccess, onCancel }: Omit<InvoiceStripeFormProps, 'stripeKey'>) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !cardholderName.trim()) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (error) {
      toast.error(error.message || t('Payment failed'));
      setProcessing(false);
      return;
    }

    // Process payment through our invoice payment endpoint
    router.post(route('invoices.process-payment', invoice.id), {
      payment_method: 'stripe',
      payment_data: {
        payment_method_id: paymentMethod.id,
        cardholder_name: cardholderName,
      }
    }, {
      onSuccess: () => {
        toast.success(t('Payment processed successfully'));
        onSuccess();
      },
      onError: (errors) => {
        toast.error(errors.message || t('Payment failed'));
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardholder-name">{t('Name on card')}</Label>
        <Input
          id="cardholder-name"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder={t('Enter cardholder name')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('Card details')}</Label>
        <div className="p-3 border rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          {t('Cancel')}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('Processing...')}
            </>
          ) : (
            t('Pay Now')
          )}
        </Button>
      </div>
    </form>
  );
};

export function InvoiceStripeForm({ invoice, stripeKey, onSuccess, onCancel }: InvoiceStripeFormProps) {
  const { t } = useTranslation();
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    if (stripeKey && stripeKey.startsWith('pk_')) {
      setStripePromise(loadStripe(stripeKey));
    }
  }, [stripeKey]);

  if (!stripePromise) {
    return <div className="p-4 text-center text-red-500">{t('Stripe not configured properly')}</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        invoice={invoice}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}