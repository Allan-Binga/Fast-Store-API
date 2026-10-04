jest.mock('../services/email', () => ({ ...jest.requireActual('../services/email'), sendMail: jest.fn() }));
const Order = require('../models/orders');
const Delivery = require('../models/delivery');
const User = require('../models/users');
const { sendMail } = require('../services/email');
const { notifyPendingDelivery, notifyDeliveryStarted } = require('../services/deliveryNotifications');
const id = '507f1f77bcf86cd799439011';
beforeEach(() => {
  jest.restoreAllMocks(); sendMail.mockReset().mockResolvedValue({});
  process.env.ADMIN_CLIENT_URL = 'https://admin.example.com';
  process.env.CLIENT_URL = 'https://store.example.com';
  jest.spyOn(Order, 'updateOne').mockResolvedValue({});
  jest.spyOn(Delivery, 'updateOne').mockResolvedValue({});
});
test('requested deliveries have no initiation metadata', () => {
  const delivery = new Delivery({ order: id, user: id, status: 'requested' });
  expect(delivery.validateSync()).toBeUndefined();
  expect(delivery.initiatedAt).toBeUndefined();
});
test('paid order alerts verified admins with a deep link, then marks sent', async () => {
  jest.spyOn(Order, 'findOneAndUpdate').mockResolvedValue({ _id: id, totalAmount: 25, currency: 'usd', items: [{ quantity: 2 }] });
  jest.spyOn(User, 'find').mockReturnValue({ select: () => ({ limit: () => ({ lean: async () => [{ email: 'admin@example.com' }] }) }) });
  await notifyPendingDelivery(id);
  expect(User.find).toHaveBeenCalledWith({ role: 'Admin', isVerified: true });
  expect(Order.findOneAndUpdate.mock.calls[0][0]).toMatchObject({ paymentStatus: { $in: ['paid', 'partially_refunded'] }, fulfillmentStatus: { $in: ['unfulfilled', 'requested'] } });
  expect(sendMail.mock.calls[0][2]).toContain(`https://admin.example.com/deliveries/pending?orderId=${id}`);
  expect(Order.updateOne.mock.calls[0][1].$set.adminDeliveryEmailSent).toBe(true);
});
test('failed admin emails release the lease and remain retryable', async () => {
  jest.spyOn(Order, 'findOneAndUpdate').mockResolvedValue({ _id: id, totalAmount: 25, currency: 'usd', items: [] });
  jest.spyOn(User, 'find').mockReturnValue({ select: () => ({ limit: () => ({ lean: async () => [{ email: 'admin@example.com' }] }) }) });
  sendMail.mockRejectedValue(Error('provider unavailable'));
  await expect(notifyPendingDelivery(id)).rejects.toThrow('provider unavailable');
  expect(Order.updateOne).toHaveBeenCalledWith({ _id: id }, { $unset: { adminDeliveryEmailClaimUntil: 1 } });
});
test('completed claims do not send duplicate alerts', async () => {
  jest.spyOn(Order, 'findOneAndUpdate').mockResolvedValue(null);
  await notifyPendingDelivery(id);
  expect(sendMail).not.toHaveBeenCalled();
});
test('delivery initiation email escapes notes and links to the customer order', async () => {
  jest.spyOn(Delivery, 'findOneAndUpdate').mockResolvedValue({ _id: id, user: id, order: id, note: '<script>bad</script>' });
  jest.spyOn(User, 'findById').mockResolvedValue({ email: 'customer@example.com' });
  await notifyDeliveryStarted(id);
  const html = sendMail.mock.calls[0][2];
  expect(html).toContain(`https://store.example.com/deliveries?orderId=${id}`);
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
  expect(Delivery.updateOne.mock.calls[0][1].$set.customerEmailSent).toBe(true);
});
