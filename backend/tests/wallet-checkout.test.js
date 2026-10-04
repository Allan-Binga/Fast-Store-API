jest.mock('../services/cart', () => ({ resolveItem: jest.fn() }));
jest.mock('../services/confirmation', () => ({ confirmOrder: jest.fn().mockResolvedValue(undefined) }));
const mongoose = require('mongoose');
const Order = require('../models/orders');
const Wallet = require('../models/wallet');
const Entry = require('../models/walletEntry');
const Product = require('../models/product');
const Address = require('../models/address');
const Cart = require('../models/cart');
const InventoryMovement = require('../models/inventoryMovement');
const PaymentTransaction = require('../models/paymentTransaction');
const { payWalletOrder } = require('../services/walletCheckout');
const { createWalletCheckout } = require('../controllers/walletCheckout');
const { resolveItem } = require('../services/cart');
const id = '507f1f77bcf86cd799439011';
const user = '507f191e810c19729de860ea';
const session = {};
const data = () => ({ user, checkoutKey: 'wallet-checkout-12345', requestHash: 'hash', paymentProvider: 'wallet', totalAmount: 10, currency: 'usd', paymentStatus: 'pending', cartItems: [{ itemId: id, quantity: 1 }], items: [{ productId: id, quantity: 1, price: 10 }], expiresAt: new Date(Date.now() + 60000) });
let order;
beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(require("../models/delivery"), "updateOne").mockResolvedValue({});
  resolveItem.mockReset();
  order = { ...data(), _id: id, stockReserved: true, save: jest.fn() };
  jest.spyOn(mongoose.connection, 'transaction').mockImplementation(callback => callback(session));
  jest.spyOn(Order, 'findOne').mockReturnValue({ session: async () => null });
  jest.spyOn(Order, 'create').mockImplementation(async values => { Object.assign(order, values[0]); return [order]; });
  jest.spyOn(Product, 'findOneAndUpdate').mockReturnValue({ select: async () => ({ quantity: 3, costPrice: 5 }) });
  jest.spyOn(InventoryMovement, 'create').mockResolvedValue([]);
  jest.spyOn(Wallet, 'findOneAndUpdate').mockResolvedValue({ balanceCents: 500 });
  jest.spyOn(Entry, 'create').mockResolvedValue([]);
  jest.spyOn(Cart, 'updateOne').mockResolvedValue({});
  jest.spyOn(PaymentTransaction, 'updateOne').mockResolvedValue({});
});
test('wallet checkout debits, reserves stock, clears purchased cart items, and records payment in one session', async () => {
  const paid = await payWalletOrder(data());
  expect(paid.paymentStatus).toBe('paid');
  expect(paid.stockReserved).toBe(false);
  expect(mongoose.connection.transaction).toHaveBeenCalledTimes(1);
  expect(Product.findOneAndUpdate.mock.calls[0][2].session).toBe(session);
  expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith({ user, currency: 'usd', balanceCents: { $gte: 1000 } }, { $inc: { balanceCents: -1000 } }, { new: true, session });
  expect(Entry.create).toHaveBeenCalledWith([expect.objectContaining({ type: 'purchase', key: `purchase:${id}`, amountCents: 1000, status: 'succeeded' })], { session });
  expect(Cart.updateOne.mock.calls[0][2]).toEqual({ session });
  expect(PaymentTransaction.updateOne.mock.calls[0][0]).toEqual({ provider: 'wallet', type: 'payment', providerTransactionId: `wallet-${id}` });
  expect(PaymentTransaction.updateOne.mock.calls[0][2]).toEqual({ upsert: true, session });
});
test.each(['paid', 'partially_refunded', 'refunded'])('replaying a %s wallet order never debits or reserves again', async status => {
  order.paymentStatus = status;
  Order.findOne.mockReturnValue({ session: async () => order });
  expect(await payWalletOrder(data())).toBe(order);
  expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
  expect(Entry.create).not.toHaveBeenCalled();
});
test('a checkout key for another request or provider cannot spend funds', async () => {
  Order.findOne.mockReturnValue({ session: async () => ({ ...order, paymentProvider: 'stripe' }) });
  await expect(payWalletOrder(data())).rejects.toMatchObject({ status: 409 });
  expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
});
test('insufficient funds abort before recording a purchase or confirming the order', async () => {
  Wallet.findOneAndUpdate.mockResolvedValue(null);
  await expect(payWalletOrder(data())).rejects.toMatchObject({ status: 409 });
  expect(Entry.create).not.toHaveBeenCalled();
  expect(order.save).not.toHaveBeenCalled();
  expect(PaymentTransaction.updateOne).not.toHaveBeenCalled();
});
test('out-of-stock checkout never debits the wallet', async () => {
  Product.findOneAndUpdate.mockReturnValue({ select: async () => null });
  await expect(payWalletOrder(data())).rejects.toMatchObject({ status: 409 });
  expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
});
test('competing purchases cannot overdraft the same available wallet balance', async () => {
  let balance = 1500;
  Wallet.findOneAndUpdate.mockImplementation(async (filter, update) => {
    if (balance < filter.balanceCents.$gte) return null;
    balance += update.$inc.balanceCents;
    return { balanceCents: balance };
  });
  const results = await Promise.allSettled([payWalletOrder(data()), payWalletOrder({ ...data(), checkoutKey: 'wallet-another-purchase' })]);
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect(balance).toBe(500);
  expect(Entry.create).toHaveBeenCalledTimes(1);
});
test('a unique-key race safely replays a committed purchase', async () => {
  mongoose.connection.transaction.mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: 11000 }));
  order.paymentStatus = 'paid';
  Order.findOne.mockReturnValue({ session: async () => order });
  expect(await payWalletOrder(data())).toBe(order);
  expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
});
const request = (total = 1000) => ({ userId: user, get: () => 'wallet-checkout-12345', body: { items: [{ productId: id, quantity: 1, price: 0.01 }], addressId: id, expectedTotalCents: total } });
const response = () => ({ json: jest.fn(), status: jest.fn().mockReturnThis() });
test('wallet checkout requires review when catalog price changes', async () => {
  Order.findOne.mockResolvedValue(null);
  jest.spyOn(Address, 'findOne').mockReturnValue({ lean: async () => ({ _id: id }) });
  jest.spyOn(Cart, 'findOne').mockResolvedValue(null);
  resolveItem.mockResolvedValue({ productId: id, quantity: 1, price: 12 });
  const res = response(); const next = jest.fn();
  await createWalletCheckout(request(), res, next);
  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(409);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ checkoutCreated: false }));
  expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  expect(Product.findOneAndUpdate).not.toHaveBeenCalled();
});
test('wallet checkout uses catalog prices and owner-scoped addresses', async () => {
  Order.findOne.mockResolvedValueOnce(null).mockReturnValue({ session: async () => null });
  jest.spyOn(Address, 'findOne').mockReturnValue({ lean: async () => ({ _id: id }) });
  jest.spyOn(Cart, 'findOne').mockResolvedValue(null);
  resolveItem.mockResolvedValue({ productId: id, quantity: 1, price: 10 });
  const res = response(); const next = jest.fn();
  await createWalletCheckout(request(), res, next);
  expect(next).not.toHaveBeenCalled();
  expect(Address.findOne).toHaveBeenCalledWith({ _id: id, user });
  expect(Wallet.findOneAndUpdate.mock.calls[0][1].$inc.balanceCents).toBe(-1000);
  expect(res.json).toHaveBeenCalledWith({ orderId: id, paymentStatus: 'paid' });
  await new Promise(setImmediate);
});
test('unconfirmed totals cannot reach the database', async () => {
  const next = jest.fn();
  await createWalletCheckout(request(0), response(), next);
  expect(next.mock.calls[0][0].status).toBe(400);
  expect(Order.findOne).not.toHaveBeenCalled();
});
test('wallet purchases are refundable only as wallet credit, even if the request says original', async () => {
  const Refund = require('../models/refund');
  const { requestRefund } = require('../controllers/refund');
  order.paymentProvider = 'wallet';
  order.paymentStatus = 'paid';
  order.refundedAmount = 0;
  order.refundPendingAmount = 0;
  Order.findOne.mockReturnValue({ session: async () => order });
  const create = jest.spyOn(Refund, 'create').mockResolvedValue([{ _id: id }]);
  const next = jest.fn();
  await requestRefund({ userId: user, params: { orderId: id }, body: { reason: 'customer_request', destination: 'original' } }, response(), next);
  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0][0]).toMatchObject({ provider: 'wallet', destination: 'wallet', providerPaymentId: id, amount: 10 });
});
