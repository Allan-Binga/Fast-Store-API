const Wallet = require('../models/wallet');
const Entry = require('../models/walletEntry');
const User = require('../models/users');
const Order = require('../models/orders');
const { listAdminWallets, getAdminUserWallet } = require('../controllers/wallet');
const { getPendingDeliveries } = require('../controllers/delivery');
const id = '507f1f77bcf86cd799439011';
const response = () => ({ json: jest.fn() });
function chain(data) {
  const result = {};
  for (const method of ['populate','sort','skip','limit','select']) result[method] = jest.fn().mockReturnValue(result);
  result.lean = jest.fn().mockResolvedValue(data);
  result.then = (resolve, reject) => Promise.resolve(data).then(resolve, reject);
  return result;
}
beforeEach(() => jest.restoreAllMocks());
test('admin wallets list filters the customer and paginates with a total', async () => {
  const query = chain([{ user: { email: 'customer@example.com' }, balanceCents: 2500 }]);
  jest.spyOn(Wallet, 'find').mockReturnValue(query);
  jest.spyOn(Wallet, 'countDocuments').mockResolvedValue(23);
  const res = response();
  await listAdminWallets({ query: { userId: id, page: '2', limit: '20' } }, res, jest.fn());
  expect(Wallet.find).toHaveBeenCalledWith({ user: id });
  expect(query.skip).toHaveBeenCalledWith(20);
  expect(query.limit).toHaveBeenCalledWith(20);
  expect(query.populate).toHaveBeenCalledWith('user', 'firstName lastName email');
  expect(res.json.mock.calls[0][0].total).toBe(23);
});
test('customer wallet detail only queries the requested customer ledger', async () => {
  jest.spyOn(User, 'findOne').mockReturnValue(chain({ _id: id }));
  jest.spyOn(Wallet, 'find').mockReturnValue(chain([]));
  const ledger = chain([{ amountCents: 1000 }]);
  jest.spyOn(Entry, 'find').mockReturnValue(ledger);
  jest.spyOn(Entry, 'countDocuments').mockResolvedValue(1);
  const res = response();
  await getAdminUserWallet({ params: { userId: id }, query: { page: '1', limit: '20' } }, res, jest.fn());
  expect(User.findOne).toHaveBeenCalledWith({ _id: id, role: 'Customer' });
  expect(Entry.find).toHaveBeenCalledWith({ user: id });
  expect(res.json.mock.calls[0][0].entries).toEqual([{ amountCents: 1000 }]);
});
test('missing customers return an error rather than another wallet', async () => {
  jest.spyOn(User, 'findOne').mockReturnValue(chain(null));
  const next = jest.fn();
  await getAdminUserWallet({ params: { userId: id }, query: {} }, response(), next);
  expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
});
test('pending queue contains only paid orders awaiting initiation and accepts deep links', async () => {
  const query = chain([{ _id: id }]);
  jest.spyOn(Order, 'find').mockReturnValue(query);
  jest.spyOn(Order, 'countDocuments').mockResolvedValue(1);
  const res = response();
  await getPendingDeliveries({ query: { orderId: id, page: '1', limit: '20' } }, res, jest.fn());
  expect(Order.find).toHaveBeenCalledWith({ _id: id, paymentStatus: { $in: ['paid', 'partially_refunded'] }, fulfillmentStatus: { $in: ['unfulfilled', 'requested'] } });
  expect(res.json).toHaveBeenCalledWith({ orders: [{ _id: id }], total: 1 });
});
