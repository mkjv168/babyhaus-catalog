import { CheckoutForm } from '@/components/CheckoutForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Checkout | Baby Haus',
  description: 'Complete your order at Baby Haus',
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <CheckoutForm />
      <Footer />
    </main>
  );
}