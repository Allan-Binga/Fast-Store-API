import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, errorMessage } from '../api';
import { Button, Card, Empty, PageHeader, SkeletonRows, money, shortDate } from '../components/UI';
export default function Wallets() {
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const current = result?.page === page && result?.attempt === attempt;
  useEffect(() => {
    let active = true;
    adminApi.get('/wallet/admin', { params: { limit: 20, page } }).then(({ data }) => { if (active) setResult({ page, attempt, data }); }).catch(error => { if (active) setResult({ page, attempt, error: errorMessage(error) }); });
    return () => { active = false; };
  }, [page, attempt]);
  const wallets = current ? result.data?.wallets || [] : [];
  return <><PageHeader eyebrow="Customer funds" title="Wallets" description="View customer balances and wallet activity. All balances are stored separately by currency." /><Card>
    {!current ? <SkeletonRows /> : result.error ? <div role="alert" className="space-y-3 p-5 text-red-700"><p>{result.error}</p><Button onClick={() => setAttempt(value => value + 1)}>Try again</Button></div> : !wallets.length ? <Empty title="No wallets on this page" text="Wallets appear when a customer adds funds or receives a wallet refund." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Currency</th><th className="px-5 py-3">Available balance</th><th className="px-5 py-3">Updated</th></tr></thead><tbody className="divide-y divide-line">{wallets.map(wallet => <tr key={wallet._id}><td className="px-5 py-4"><Link to={`/wallets/${wallet.user?._id}`} className="font-bold text-primary">{wallet.user?.firstName} {wallet.user?.lastName}</Link><p className="mt-1 text-xs text-muted">{wallet.user?.email || 'Customer unavailable'}</p></td><td className="px-5 py-4 uppercase">{wallet.currency}</td><td className="px-5 py-4 font-bold">{money(wallet.balanceCents / 100, wallet.currency)}</td><td className="px-5 py-4 text-muted">{shortDate(wallet.updatedAt)}</td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between border-t border-line p-4"><Button variant="secondary" disabled={page === 1 || !current} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-sm text-muted">Page {page}{current && result.data ? ` · ${result.data.total} wallets` : ''}</span><Button variant="secondary" disabled={!current || !result.data || page * 20 >= result.data.total} onClick={() => setPage(value => value + 1)}>Next</Button></div>
  </Card></>;
}
