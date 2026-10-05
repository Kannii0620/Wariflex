import PageLayout from './components/PageLayout';
import AddPayment from './components/AddPayment';
import PaymentList from './components/PaymentList';

export default function App() {
  return (
    <PageLayout>
      <main>
        <AddPayment />

        <hr className="my-6 border-gray-300/50" />
        <PaymentList />
        <hr className="my-6 border-gray-300/50" />
      </main>
    </PageLayout>
  );
}
