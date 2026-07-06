import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ paymentId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      const { data } = await api.post(`/payments/${paymentId}/create-intent`);
      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        try {
          await api.post(`/payments/${paymentId}/verify-status/${paymentId}`);
          toast.success('Pagamento confirmado!');
          onSuccess();
        } catch (err) {
          console.error('Erro ao atualizar pagamento no sistema:', err);
          toast.error('Erro ao atualizar pagamento no sistema');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="border p-2 rounded bg-white shadow-sm" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!stripe || processing} className="bg-green-600 hover:bg-green-700 text-white">
          {processing ? 'A processar...' : `Pagar USD$ ${amount}`}
        </Button>
      </div>
    </form>
  );
};

export const PaymentModal = ({ isOpen, onClose, paymentId, amount, onPaymentSuccess }) => {
  const handleSuccess = () => {
    onClose();
    if (onPaymentSuccess) onPaymentSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento da Consulta</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-gray-600 mb-4 text-sm">
            Insira os dados do cartão de testes para concluir o pagamento de{' '}
            <span className="font-bold text-gray-800">USD$ {amount}</span>.
          </p>
          <Elements stripe={stripePromise}>
            <PaymentForm
              paymentId={paymentId}
              amount={amount}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </DialogContent>
    </Dialog>
  );
};