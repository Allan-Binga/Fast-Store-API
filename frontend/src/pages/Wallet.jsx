import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PayPalProvider, PayPalOneTimePaymentButton } from '@paypal/react-paypal-js/sdk-v6';
import { customerRequest, errorMessage } from '../api';
import { useStore } from '../store/context';
import useCustomerResource from '../hooks/useCustomerResource';
import Skeleton from "../components/Skeleton";
import CustomerAccountNav from '../components/CustomerAccountNav';
import CheckoutLayout, { AccountRequired, panelClass, primaryClass, secondaryClass } from '../components/checkout/CheckoutLayout';
import { paymentMoney } from '../store/checkout';
function WalletContent() {
  const [params, setParams] = useSearchParams();
  const [amount, setAmount] = useState('25');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const attempt = useRef(null);
  const paypalEntry = useRef(null);
  const topup = params.get('topup');
  const resource = useCustomerResource(`/wallet?return=${encodeURIComponent(topup || '')}`);
  useEffect(() => {
    if (!topup) return;
    let active = true;
    customerRequest({ method: 'post', url: `/wallet/topups/${encodeURIComponent(topup)}/confirm` }).then(({ data }) => {
      if (!active) return;
      setMessage(data.status === 'succeeded' ? 'Funds added to your wallet.' : 'Your payment is awaiting confirmation. Refresh to check again.');
      setParams({}, { replace: true });
    }).catch(error => { if (active) setMessage(errorMessage(error)); });
    return () => { active = false; };
  }, [topup, setParams]);
  async function create(provider) {
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) < 1 || Number(amount) > 1000) throw new Error('Enter $1–$1,000 with up to two decimal places.');
    const signature = `${provider}:${amount}`;
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() };
    return (await customerRequest({ method: 'post', url: '/wallet/topups', data: { amount, provider }, headers: { 'Idempotency-Key': attempt.current.key } })).data;
  }
  async function confirm(id) {
    try { const { data } = await customerRequest({ method: 'post', url: `/wallet/topups/${id}/confirm` }); setMessage(data.status === 'succeeded' ? 'Funds added to your wallet.' : 'Payment is awaiting confirmation.'); if (data.status === 'succeeded') attempt.current = null; resource.retry(); }
    catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function startStripe() {
    setBusy(true); setMessage('');
    try { const data = await create('stripe'); if (data.status === 'succeeded') { setMessage('This payment has already been credited.'); resource.retry(); attempt.current = null; } else window.location.assign(data.url); }
    catch (error) { setMessage(error.response ? errorMessage(error) : error.message); }
    finally { setBusy(false); }
  }
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const configured = (import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox').toLowerCase();
  const environment = configured === 'live' ? 'production' : configured;
  return <><CustomerAccountNav /><div className="grid gap-6 lg:grid-cols-2">
    <section className={panelClass}><p className="text-sm font-semibold uppercase tracking-wide text-outline">Available funds</p>
      {resource.loading ? <div role="status" aria-label="Loading wallet balance" aria-busy="true" className="my-4"><span className="sr-only">Loading wallet balance…</span><div aria-hidden="true" className="h-12 w-48 animate-pulse rounded-sm bg-surface-container-high" /></div> : resource.error ? <p className="my-4 text-on-surface-variant">Balance unavailable</p> : <div className="my-4">{(resource.data?.balances?.length ? resource.data.balances : [{ currency: 'usd', balanceCents: 0 }]).map(balance => <p key={balance.currency} className="text-4xl font-bold text-primary">{paymentMoney(balance.balanceCents / 100, balance.currency)}</p>)}</div>}
      <p className="text-on-surface-variant">Keep top-ups and approved refund credits together. Top-ups are in USD. Use your balance at checkout whenever it covers the full purchase. Withdrawals are not available.</p>
      <h2 className="mt-8 text-xl font-bold">Add funds</h2><label className="mt-4 block">Amount (USD)<input type="number" min="1" max="1000" step="0.01" value={amount} disabled={busy || resource.loading || Boolean(resource.error)} onChange={event => setAmount(event.target.value)} className="mt-2 min-h-11 w-full rounded-sm border border-outline-variant p-3" /></label><p className="mt-2 text-xs text-outline">Add $1–$1,000 per payment.</p>
      <button className={`${primaryClass} my-4 w-full`} disabled={busy || resource.loading || Boolean(resource.error)} onClick={startStripe}>{busy ? 'Preparing payment…' : 'Add funds with Stripe'}</button>
      {clientId && ['sandbox', 'production'].includes(environment) && <PayPalProvider clientId={clientId} environment={environment} components={['paypal-payments']} pageType="checkout"><PayPalOneTimePaymentButton disabled={busy || resource.loading || Boolean(resource.error)} createOrder={async () => {
        setBusy(true); setMessage('');
        try { const entry = await create('paypal'); paypalEntry.current = entry._id; return { orderId: entry.providerId }; }
        catch (error) { setBusy(false); setMessage(error.response ? errorMessage(error) : error.message); throw error; }
      }} onApprove={() => confirm(paypalEntry.current)} onCancel={() => { setBusy(false); setMessage('Payment cancelled. No funds were added.'); }} onError={() => { setBusy(false); setMessage('PayPal could not finish. Please try again.'); }} /></PayPalProvider>}
      {(message || params.get('cancelled')) && <p role="status" className="mt-4 rounded-sm bg-surface-container-low p-4">{message || 'Payment cancelled. No funds were added.'}</p>}
    </section><section className={panelClass}><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Wallet activity</h2><button onClick={resource.retry} className={secondaryClass}>Refresh</button></div>
      {resource.loading && <Skeleton label="Loading wallet activity" count={3} />}
      {resource.error && <p role="alert" className="mt-4 text-error">{resource.error}</p>}
      {!resource.loading && !resource.error && !resource.data?.entries?.length && <p className="mt-6 text-outline">Your top-ups and refund credits will appear here.</p>}
      <ul className="mt-4 divide-y divide-outline-variant">{resource.data?.entries?.map(entry => <li key={entry._id} className="py-4"><div className="flex justify-between gap-4"><strong>{entry.type === 'purchase' ? 'Purchase' : entry.type === 'refund' ? 'Refund credit' : 'Wallet top-up'}</strong><strong className="text-primary">{entry.type === 'purchase' ? '−' : '+'}{paymentMoney(entry.amountCents / 100, entry.currency)}</strong></div><p className="mt-1 text-sm text-outline">{new Date(entry.createdAt).toLocaleString()} · {entry.provider} · {entry.status === 'succeeded' ? (entry.type === 'purchase' ? 'Paid' : 'Credited') : 'Awaiting payment'}</p>{entry.status === 'pending' && entry.providerId && <button disabled={busy} className="mt-2 text-sm font-semibold text-primary underline" onClick={() => confirm(entry._id)}>Check payment status</button>}</li>)}</ul>
    </section></div></>;
}
export default function Wallet() {
  const { session } = useStore();
  useEffect(() => { document.title = 'Wallet | FastStore'; }, []);
  return <CheckoutLayout title="Your wallet" showCartBreadcrumb={false}><AccountRequired><WalletContent key={session.user?._id || session.user?.email} /></AccountRequired></CheckoutLayout>;
}
