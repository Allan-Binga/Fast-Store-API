const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/product");
const FlashSale = require("../models/flashsale");
const Cart = require("../models/cart");
const {
  reserveOrder,
  settleOrder,
  settlePayPalOrder,
} = require("../services/orders");
const id = "507f1f77bcf86cd799439011";
const session = {};
beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(mongoose.connection, "transaction").mockImplementation(callback => callback(session));
});

// Settlement must be retry-safe independently of webhook delivery timing.
test("paid event replays do not touch stock or the current cart", async () => {
  const order = { _id: id, user: id, currency: "usd", totalAmount: 10, paymentStatus: "paid", save: jest.fn() };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });
  const update = jest.spyOn(Cart, "updateOne");
  await settleOrder({ id: "cs_test", metadata: { orderId: id, user: id }, amount_total: 1000, currency: "usd", payment_status: "paid" });
  expect(update).not.toHaveBeenCalled(); expect(order.save).not.toHaveBeenCalled();
});
test("settlement refuses a mismatched payment amount", async () => {
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => ({ user: id, currency: "usd", totalAmount: 10 }) });
  await expect(settleOrder({ id: "cs_test", metadata: { orderId: id, user: id }, amount_total: 1, currency: "usd", payment_status: "paid" })).rejects.toMatchObject({ status: 409 });
});
test("paid settlement removes only the unchanged cart snapshot items", async () => {
  const order = { user: id, currency: "usd", totalAmount: 10, stockReserved: true, paymentStatus: "pending", cartItems: [{ itemId: id, quantity: 2 }], save: jest.fn() };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });
  const update = jest.spyOn(Cart, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  await settleOrder({ id: "cs_test", metadata: { orderId: id, user: id }, amount_total: 1000, currency: "usd", payment_status: "paid" });
  expect(update.mock.calls[0][1].$pull.products).toEqual({ $or: [{ _id: id, quantity: 2 }] });
  expect(order.paymentStatus).toBe("paid"); expect(order.stockReserved).toBe(false);
});
test("expired checkout releases reserved product and sale quantities", async () => {
  const order = { user: id, currency: "usd", totalAmount: 10, stockReserved: true, paymentStatus: "pending", items: [{ productId: id, saleId: id, quantity: 2 }], save: jest.fn() };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });
  const product = jest.spyOn(Product, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  const sale = jest.spyOn(FlashSale, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  await settleOrder({ id: "cs_test", metadata: { orderId: id, user: id }, amount_total: 1000, currency: "usd", status: "expired", payment_status: "unpaid" });
  expect(product).toHaveBeenCalledWith({ _id: id }, { $inc: { quantity: 2 } }, { session });
  expect(sale).toHaveBeenCalledWith({ _id: id }, { $inc: { quantityAvailable: 2 } }, { session });
  expect(order.stockReserved).toBe(false);
});
test("reservation checks stock atomically and stops before creating an order", async () => {
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => null });
  jest.spyOn(Product, "updateOne").mockResolvedValue({ modifiedCount: 0 });
  const create = jest.spyOn(Order, "create");
  await expect(reserveOrder({ user: id, checkoutKey: "key", items: [{ productId: id, quantity: 2 }] })).rejects.toMatchObject({ status: 409 });
  expect(create).not.toHaveBeenCalled();
});


test("completed PayPal capture settles the reserved order", async () => {
  const order = {
    user: id,
    currency: "usd",
    totalAmount: 10,
    stockReserved: true,
    paymentStatus: "pending",
    cartItems: [],
    save: jest.fn(),
  };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });

  await settlePayPalOrder({
    id: "PAYPAL-ORDER",
    status: "COMPLETED",
    purchaseUnits: [{
      payments: {
        captures: [{
          id: "PAYPAL-CAPTURE",
          status: "COMPLETED",
          amount: { currencyCode: "USD", value: "10.00" },
        }],
      },
    }],
  });

  expect(order.paymentStatus).toBe("paid");
  expect(order.stockReserved).toBe(false);
  expect(order.paypalCaptureId).toBe("PAYPAL-CAPTURE");
});

test("PayPal settlement refuses a mismatched capture amount", async () => {
  const order = {
    currency: "usd",
    totalAmount: 10,
    stockReserved: true,
    paymentStatus: "pending",
  };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });

  await expect(settlePayPalOrder({
    id: "PAYPAL-ORDER",
    status: "COMPLETED",
    purchaseUnits: [{
      payments: {
        captures: [{
          status: "COMPLETED",
          amount: { currencyCode: "USD", value: "1.00" },
        }],
      },
    }],
  })).rejects.toMatchObject({ status: 409 });
});

test("successful M-Pesa callback settles the reserved order", async () => {
  const order = {
    user: id,
    currency: "kes",
    totalAmount: 1500,
    stockReserved: true,
    paymentStatus: "pending",
    cartItems: [],
    save: jest.fn(),
  };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });

  await require("../services/orders").settleMpesaOrder({
    checkoutRequestId: "ws_CO_123",
    merchantRequestId: "merchant-123",
    amount: 1500,
    receiptNumber: "MPESA123",
  });

  expect(order.paymentStatus).toBe("paid");
  expect(order.stockReserved).toBe(false);
  expect(order.mpesaReceiptNumber).toBe("MPESA123");
});

test("M-Pesa settlement refuses a mismatched callback amount", async () => {
  const order = {
    currency: "kes",
    totalAmount: 1500,
    stockReserved: true,
    paymentStatus: "pending",
  };
  jest.spyOn(Order, "findOne").mockReturnValue({ session: async () => order });

  await expect(require("../services/orders").settleMpesaOrder({
    checkoutRequestId: "ws_CO_123",
    amount: 1,
  })).rejects.toMatchObject({ status: 409 });
});
