const mongoose = require('mongoose');
const Order = require('../models/orders');
const Wallet = require('../models/wallet');
const Entry = require('../models/walletEntry');
const { reserveOrder, markPaid } = require('./orders');
const { fail } = require('../utils/http');

function validateExisting(order, data) {
  if (order.requestHash !== data.requestHash || order.paymentProvider !== 'wallet') {
    throw fail(409, 'This checkout key belongs to a different purchase or payment method.');
  }
}
async function payWalletOrder(data) {
  let paidOrder;
  const pay = async session => {
    let order = await Order.findOne({ user: data.user, checkoutKey: data.checkoutKey }).session(session);
    if (order) {
      validateExisting(order, data);
      if (['paid', 'partially_refunded', 'refunded'].includes(order.paymentStatus)) {
        paidOrder = order;
        return;
      }
      if (order.paymentStatus !== 'pending' || !order.stockReserved || order.expiresAt <= new Date()) throw fail(409, 'This checkout has expired. Start a new checkout.');
    } else {
      order = await reserveOrder(data, session);
      validateExisting(order, data);
    }
    const cents = Math.round(order.totalAmount * 100);
    if (!Number.isSafeInteger(cents) || cents < 1) throw fail(400, 'Invalid purchase total.');
    const wallet = await Wallet.findOneAndUpdate(
      { user: order.user, currency: order.currency, balanceCents: { $gte: cents } },
      { $inc: { balanceCents: -cents } },
      { new: true, session },
    );
    if (!wallet) throw fail(409, 'Your wallet does not have enough funds for this purchase. Add funds or choose another payment method.');
    await Entry.create([{ user: order.user, order: order._id, key: `purchase:${order._id}`, type: 'purchase', provider: 'wallet', amountCents: cents, currency: order.currency, status: 'succeeded', emailSent: true }], { session });
    await markPaid(order, session, {}, { provider: 'wallet', providerTransactionId: `wallet-${order._id}` });
    paidOrder = order;
  };
  try {
    await mongoose.connection.transaction(pay);
  } catch (error) {
    // A concurrent request with the same key may commit first. Replay the
    // transaction to read that purchase without debiting or reserving twice.
    if (error.code !== 11000) throw error;
    await mongoose.connection.transaction(pay);
  }
  return paidOrder;
}
module.exports = { payWalletOrder, validateExisting };
