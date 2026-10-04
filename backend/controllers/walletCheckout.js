const crypto = require('crypto');
const Order = require('../models/orders');
const Address = require('../models/address');
const Cart = require('../models/cart');
const { resolveItem } = require('../services/cart');
const { payWalletOrder, validateExisting } = require('../services/walletCheckout');
const { asyncHandler, fail, requireId } = require('../utils/http');
const { confirmOrder } = require('../services/confirmation');

const createWalletCheckout = asyncHandler(async (req, res) => {
  const checkoutKey = req.get('Idempotency-Key');
  if (typeof checkoutKey !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(checkoutKey)) throw fail(400, 'Provide an Idempotency-Key and reuse it when retrying.');
  if (!Array.isArray(req.body.items) || !req.body.items.length || req.body.items.length > 100) throw fail(400, 'Provide 1–100 items.');
  const inputs = req.body.items.map(item => ({ productId: requireId(item?.productId), quantity: item?.quantity }));
  if (inputs.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) || new Set(inputs.map(item => item.productId)).size !== inputs.length) throw fail(400, 'Invalid quantities or duplicate product IDs.');
  const addressId = requireId(req.body.addressId);
  const source = req.body.source || 'cart';
  if (!['cart', 'buy-now'].includes(source)) throw fail(400, 'Invalid checkout source.');
  const expectedTotalCents = req.body.expectedTotalCents;
  if (!Number.isSafeInteger(expectedTotalCents) || expectedTotalCents < 1) throw fail(400, 'Confirm the purchase total before paying.');
  const requestHash = crypto.createHash('sha256').update(JSON.stringify({ items: [...inputs].sort((a, b) => a.productId.localeCompare(b.productId)), addressId, source, expectedTotalCents })).digest('hex');
  const data = { user: req.userId, checkoutKey, requestHash, paymentProvider: 'wallet' };
  const existing = await Order.findOne({ user: req.userId, checkoutKey });
  let order;
  try {
    if (existing) {
      validateExisting(existing, data);
      order = await payWalletOrder(data);
    } else {
      const address = await Address.findOne({ _id: addressId, user: req.userId }).lean();
      if (!address) throw fail(404, 'Shipping address not found.');
      const cart = source === 'cart' ? await Cart.findOne({ userId: req.userId }) : null;
      const items = [];
      for (const input of inputs) items.push(await resolveItem(input.productId, input.quantity));
      const totalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
      if (totalCents !== expectedTotalCents) throw fail(409, 'Prices have changed. Review the updated total before paying.');
      const cartItems = (cart?.products || []).filter(item => inputs.some(input => input.productId === String(item.productId) && input.quantity === item.quantity)).map(item => ({ itemId: item._id, quantity: item.quantity }));
      order = await payWalletOrder({ ...data, items, cartItems, totalAmount: totalCents / 100, currency: 'usd', paymentStatus: 'pending', shippingAddress: address, expiresAt: new Date(Date.now() + 3600000) });
    }
  } catch (error) {
    if (error.status === 409 && !existing) return res.status(409).json({ message: error.message, checkoutCreated: false });
    throw error;
  }
  res.json({ orderId: order._id, paymentStatus: order.paymentStatus });
  setImmediate(() => confirmOrder(order._id).catch(() => console.error('Wallet purchase receipt delivery deferred.')));
});
module.exports = { createWalletCheckout };
