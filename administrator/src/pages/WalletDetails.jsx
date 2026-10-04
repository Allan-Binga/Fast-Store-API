import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, errorMessage } from '../api';
import { Button, Card, Empty, PageHeader, SkeletonRows, StatusBadge, money, shortDate } from '../components/UI';
export default function WalletDetails() {
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const current = result?.userId === userId && result?.page === page && result?.attempt === attempt;
  useEffect(() => {
    let active = true;
    adminApi.get(`/wallet/admin/users/${userId}`, { params: { limit: 20, page } }).then(({ data }) => { if (active) setResult({ userId, page, attempt, data }); }).catch(error => { if (active) setResult({ userId, page, attempt, error: errorMessage(error) }); });
    return () => { active = false; };
  }, [userId, page, attempt]);
  if (!current) return <Card><SkeletonRows /></Card>;
  if (result.error) return <Card className="space-y-3 p-5"><p role="alert">{result.error}</p><Button onClick={() => setAttempt(value => value + 1)}>Try again</Button></Card>;
  const { user, balances, entries, total } = result.data;
  return <><Link to="/wallets" className="mb-5 inline-block font-semibold text-primary">← Wallets</Link><PageHeader eyebrow="Customer wallet" title={`${user.firstName} ${user.lastName}`} description={user.email} /><div className="mb-6 grid gap-4 sm:grid-cols-3">{(balances.length ? balances : [{ currency: 'usd', balanceCents: 0 }]).map(balance => <Card key={balance.currency} className="p-5"><p className="text-xs font-bold uppercase text-muted">{balance.currency} available balance</p><p className="mt-3 text-2xl font-extrabold text-primary">{money(balance.balanceCents / 100, balance.currency)}</p></Card>)}</div><Card>
    {!entries.length ? <Empty title="No wallet activity" /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-5 py-3">Activity</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-line">{entries.map(entry => <tr key={entry._id}><td className="px-5 py-4 capitalize"><strong>{entry.type}</strong><p className="text-xs text-muted">{entry.provider}</p>{entry.order && <Link to={`/orders/${entry.order}`} className="text-xs text-primary">View order</Link>}</td><td className="px-5 py-4 font-bold">{entry.type === 'purchase' ? '−' : '+'}{money(entry.amountCents / 100, entry.currency)}</td><td className="px-5 py-4"><StatusBadge value={entry.status} /></td><td className="px-5 py-4 text-muted">{shortDate(entry.createdAt)}</td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between border-t border-line p-4"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-sm text-muted">Page {page} · {total} entries</span><Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage(value => value + 1)}>Next</Button></div>
  </Card></>;
}
