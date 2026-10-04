jest.mock('../services/stripe', () => jest.fn());
jest.mock('../services/paypal', () => jest.fn());
const mongoose = require('mongoose');
const Wallet = require('../models/wallet');
const Entry = require('../models/walletEntry');
const Refund = require('../models/refund');
const Order = require('../models/orders');
const PaymentTransaction = require('../models/paymentTransaction');
const { settleStripe, settlePayPal, creditEntry } = require('../services/wallet');
const { amountCents, confirmTopup } = require('../controllers/wallet');
const { processRefund } = require('../services/refunds');
const getStripe = require('../services/stripe');
const getPayPal = require('../services/paypal');
const { sendMail } = require('../services/email');
const { sendOrderConfirmationEmail } = require('../controllers/emailService');
const user = '507f191e810c19729de860ea';
const id = '507f1f77bcf86cd799439011';
const session = {};
beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(mongoose.connection, 'transaction').mockImplementation(callback => callback(session));
  process.env.CLIENT_URL = 'https://fast-store.skirill.org';
  process.env.BREVO_API_KEY = 'test-api-key';
  delete process.env.BREVO_SENDER_EMAIL;
});
test.each(['0', '-1', '1.001', '1001', true, {}, '1e2', 'NaN'])('invalid top-up amount %s is rejected', value => {
  expect(() => amountCents(value)).toThrow();
});
test('top-up amounts use integer cents', () => {
  expect(amountCents('10.29')).toBe(1029);
  expect(amountCents('1000')).toBe(100000);
});
test.each([{ amount_total: 1 }, { currency: 'eur' }, { metadata: { walletEntryId: id, user: id } }])('Stripe payment mismatch cannot credit funds', async changes => {
  jest.spyOn(Entry, 'findOne').mockResolvedValue({ _id: id, user, amountCents: 2500, currency: 'usd' });
  const credit = jest.spyOn(Wallet, 'updateOne');
  await expect(settleStripe({ id: 'cs_wallet', payment_status: 'paid', metadata: { walletEntryId: id, user }, currency: 'usd', amount_total: 2500, ...changes })).rejects.toThrow('does not match');
  expect(credit).not.toHaveBeenCalled();
});
test('an unpaid Stripe checkout does not credit a wallet', async () => {
  jest.spyOn(Entry, 'findOne').mockResolvedValue({ _id: id });
  const credit = jest.spyOn(Wallet, 'updateOne');
  expect(await settleStripe({ id: 'cs_wallet', payment_status: 'unpaid' })).toBe(true);
  expect(credit).not.toHaveBeenCalled();
});
test('repeated verified Stripe callbacks credit the wallet once', async () => {
  const entry = { _id: id, user, amountCents: 2500, currency: 'usd' };
  jest.spyOn(Entry, 'findOne').mockResolvedValue(entry);
  jest.spyOn(Entry, 'findOneAndUpdate').mockResolvedValueOnce(entry).mockResolvedValueOnce(null);
  const credit = jest.spyOn(Wallet, 'updateOne').mockResolvedValue({});
  const remote = { id: 'cs_wallet', payment_status: 'paid', payment_intent: 'pi_wallet', metadata: { walletEntryId: id, user }, currency: 'usd', amount_total: 2500 };
  await settleStripe(remote); await settleStripe(remote);
  expect(credit).toHaveBeenCalledTimes(1);
  expect(credit).toHaveBeenCalledWith({ user, currency: 'usd' }, { $inc: { balanceCents: 2500 } }, expect.objectContaining({ session }));
});
test('PayPal capture must match the stored wallet amount', async () => {
  jest.spyOn(Entry, 'findOne').mockResolvedValue({ _id: id, user, amountCents: 2500, currency: 'usd' });
  await expect(settlePayPal({ id: 'PP1', status: 'COMPLETED', purchaseUnits: [{ customId: id, payments: { captures: [{ id: 'CAP1', status: 'COMPLETED', amount: { currencyCode: 'USD', value: '0.01' } }] } }] })).rejects.toThrow('does not match');
});
test('wallet credit failure propagates through the transaction', async () => {
  jest.spyOn(Entry, 'findOneAndUpdate').mockResolvedValue({ _id: id });
  jest.spyOn(Wallet, 'updateOne').mockRejectedValue(new Error('database unavailable'));
  await expect(creditEntry({ _id: id, user, currency: 'usd', amountCents: 100 }, session)).rejects.toThrow('database unavailable');
});
test('customers cannot confirm another account top-up', async () => {
  const lookup = jest.spyOn(Entry, 'findOne').mockResolvedValue(null);
  const next = jest.fn();
  await confirmTopup({ params: { id }, userId: user }, {}, next);
  expect(lookup).toHaveBeenCalledWith({ _id: id, user, type: 'topup' });
  expect(next.mock.calls[0][0].status).toBe(404);
});
test('approved wallet refund credits the ledger without refunding at the provider', async () => {
  const refund = { _id: id, order: id, user, destination: 'wallet', provider: 'stripe', amount: 20, currency: 'usd', status: 'processing', save: jest.fn() };
  const order = { _id: id, user, totalAmount: 100, refundedAmount: 0, refundPendingAmount: 20, save: jest.fn() };
  jest.spyOn(Refund, 'findOneAndUpdate').mockResolvedValue(refund);
  jest.spyOn(Refund, 'findById').mockReturnValue({ session: async () => refund });
  jest.spyOn(Order, 'findById').mockReturnValue({ session: async () => order });
  const entry = { _id: id, user, currency: 'usd', amountCents: 2000 };
  const create = jest.spyOn(Entry, 'create').mockResolvedValue([entry]);
  jest.spyOn(Entry, 'findOneAndUpdate').mockResolvedValue(entry);
  const credit = jest.spyOn(Wallet, 'updateOne').mockResolvedValue({});
  jest.spyOn(PaymentTransaction, 'updateOne').mockResolvedValue({});
  getStripe.mockClear(); getPayPal.mockClear();
  await processRefund(id, user);
  expect(create.mock.calls[0][0][0].key).toBe(`refund:${id}`);
  expect(credit).toHaveBeenCalledTimes(1);
  expect(order.refundedAmount).toBe(20);
  expect(order.refundPendingAmount).toBe(0);
  expect(refund.status).toBe('succeeded');
  expect(getStripe).not.toHaveBeenCalled(); expect(getPayPal).not.toHaveBeenCalled();
});
test('purchase receipt uses Brevo, domain sender, escaped items, and correct currency', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ messageId: 'email1' }) });
  await sendOrderConfirmationEmail('customer@example.com', { _id: id, paidAt: new Date('2026-10-04'), paymentProvider: 'mpesa', mpesaReceiptNumber: 'MP123', currency: 'kes', totalAmount: 2500, items: [{ name: '<script>bad</script>', quantity: 2, price: 1250 }] });
  const [url, options] = fetchMock.mock.calls[0];
  const payload = JSON.parse(options.body);
  expect(url).toBe('https://api.brevo.com/v3/smtp/email');
  expect(payload.sender.email).toBe('info@fast-store.skirill.org');
  expect(payload.htmlContent).toContain('&lt;script&gt;');
  expect(payload.htmlContent).toContain('KES');
  expect(payload.htmlContent).toContain('MP123');
  expect(payload.htmlContent).toContain('FS-' + id.toUpperCase());
  expect(payload.textContent).toContain('Total paid');
});
test('Brevo failure is retryable and does not expose the API key', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false });
  await expect(sendMail('customer@example.com', 'Subject', '<p>Hello</p>')).rejects.toThrow('temporarily unavailable');
});
test('verified PayPal captures credit once across duplicate notifications', async () => {
  const entry = { _id: id, user, amountCents: 2500, currency: 'usd' };
  jest.spyOn(Entry, 'findOne').mockResolvedValue(entry);
  jest.spyOn(Entry, 'findOneAndUpdate').mockResolvedValueOnce(entry).mockResolvedValueOnce(null);
  const credit = jest.spyOn(Wallet, 'updateOne').mockResolvedValue({});
  const remote = { id: 'PP1', status: 'COMPLETED', purchaseUnits: [{ customId: id, payments: { captures: [{ id: 'CAP1', status: 'COMPLETED', amount: { currencyCode: 'USD', value: '25.00' } }] } }] };
  await settlePayPal(remote); await settlePayPal(remote);
  expect(credit).toHaveBeenCalledTimes(1);
  expect(entry.providerPaymentId).toBe('CAP1');
});
test('unapproved PayPal orders cannot credit funds', async () => {
  jest.spyOn(Entry, 'findOne').mockResolvedValue({ _id: id });
  const credit = jest.spyOn(Wallet, 'updateOne');
  await settlePayPal({ id: 'PP1', status: 'CREATED', purchaseUnits: [] });
  expect(credit).not.toHaveBeenCalled();
});
