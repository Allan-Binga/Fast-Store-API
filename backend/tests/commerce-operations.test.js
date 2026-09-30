jest.mock("../services/stripe", () => jest.fn());
jest.mock("../services/paypal", () => jest.fn());

const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/product");
const Refund = require("../models/refund");
const Delivery = require("../models/delivery");
const InventoryMovement = require("../models/inventoryMovement");
const PaymentTransaction = require("../models/paymentTransaction");
const getStripe = require("../services/stripe");
const { processRefund } = require("../services/refunds");
const refundController = require("../controllers/refund");
const deliveryController = require("../controllers/delivery");
const stockController = require("../controllers/stock");
const paymentController = require("../controllers/paymentTransaction");

const id = "507f1f77bcf86cd799439011";
const secondId = "507f191e810c19729de860ea";
const session = {};

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

beforeEach(() => {
  jest.restoreAllMocks();
  getStripe.mockReset();
  jest
    .spyOn(mongoose.connection, "transaction")
    .mockImplementation((callback) => callback(session));
});

test("a damage refund request reserves the balance and stores uploaded evidence", async () => {
  const order = {
    _id: id,
    user: secondId,
    paymentProvider: "stripe",
    stripePaymentIntentId: "pi_paid",
    currency: "usd",
    totalAmount: 100,
    refundedAmount: 20,
    refundPendingAmount: 10,
    save: jest.fn(),
  };
  const refund = { _id: secondId, amount: 25 };
  jest.spyOn(Order, "findOne").mockReturnValue({
    session: async () => order,
  });
  const create = jest
    .spyOn(Refund, "create")
    .mockResolvedValue([refund]);
  const res = response();
  const next = jest.fn();

  await refundController.requestRefund(
    {
      params: { orderId: id },
      userId: secondId,
      body: {
        reason: "damaged_product",
        amount: 25,
        explanation: "The casing arrived cracked",
      },
      files: [
        {
          location: "https://fast-store.s3.example/refund-evidence/damage-1.jpg",
        },
        {
          location: "https://fast-store.s3.example/refund-evidence/damage-2.webp",
        },
      ],
    },
    res,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(order.refundPendingAmount).toBe(35);
  expect(create.mock.calls[0][0][0]).toMatchObject({
    order: id,
    user: secondId,
    provider: "stripe",
    providerPaymentId: "pi_paid",
    amount: 25,
    currency: "usd",
    reason: "damaged_product",
    evidenceImages: [
      "https://fast-store.s3.example/refund-evidence/damage-1.jpg",
      "https://fast-store.s3.example/refund-evidence/damage-2.webp",
    ],
  });
  expect(res.status).toHaveBeenCalledWith(201);
});

test("a wrong-product refund accepts photos of the received item", async () => {
  const order = {
    _id: id,
    user: secondId,
    paymentProvider: "paypal",
    paypalCaptureId: "CAPTURE-123",
    currency: "usd",
    totalAmount: 60,
    refundedAmount: 0,
    refundPendingAmount: 0,
    save: jest.fn(),
  };
  jest.spyOn(Order, "findOne").mockReturnValue({
    session: async () => order,
  });
  const create = jest
    .spyOn(Refund, "create")
    .mockImplementation(async ([value]) => [value]);
  const next = jest.fn();

  await refundController.requestRefund(
    {
      params: { orderId: id },
      userId: secondId,
      body: {
        reason: "wrong_product",
        explanation: "The delivered item does not match my order",
      },
      files: [
        {
          location: "https://fast-store.s3.example/refund-evidence/wrong-item.jpg",
        },
      ],
    },
    response(),
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0][0]).toMatchObject({
    reason: "wrong_product",
    provider: "paypal",
    evidenceImages: [
      "https://fast-store.s3.example/refund-evidence/wrong-item.jpg",
    ],
  });
});

test("photo evidence is rejected for a unrelated refund reason", async () => {
  const create = jest.spyOn(Refund, "create");
  const next = jest.fn();

  await refundController.requestRefund(
    {
      params: { orderId: id },
      userId: secondId,
      body: {
        reason: "customer_request",
      },
      files: [
        {
          location: "https://fast-store.s3.example/refund-evidence/unrelated.jpg",
        },
      ],
    },
    response(),
    next,
  );

  expect(next.mock.calls[0][0]).toMatchObject({ status: 400 });
  expect(create).not.toHaveBeenCalled();
});

test("approving a Stripe refund updates the order and financial ledger", async () => {
  const refund = {
    _id: id,
    order: secondId,
    user: id,
    provider: "stripe",
    providerPaymentId: "pi_paid",
    amount: 40,
    currency: "usd",
    reason: "customer_request",
    status: "processing",
    save: jest.fn(),
  };
  const order = {
    _id: secondId,
    user: id,
    totalAmount: 100,
    refundedAmount: 0,
    refundPendingAmount: 40,
    paymentStatus: "paid",
    save: jest.fn(),
  };
  jest
    .spyOn(Refund, "findOneAndUpdate")
    .mockResolvedValue(refund);
  jest.spyOn(Refund, "findById").mockReturnValue({
    session: async () => refund,
  });
  jest.spyOn(Order, "findById").mockReturnValue({
    session: async () => order,
  });
  const ledger = jest
    .spyOn(PaymentTransaction, "updateOne")
    .mockResolvedValue({ upsertedCount: 1 });
  getStripe.mockReturnValue({
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: "re_123",
        status: "succeeded",
      }),
    },
  });

  const result = await processRefund(id, secondId);

  expect(result.status).toBe("succeeded");
  expect(order.refundedAmount).toBe(40);
  expect(order.refundPendingAmount).toBe(0);
  expect(order.paymentStatus).toBe("partially_refunded");
  expect(ledger).toHaveBeenCalledWith(
    {
      provider: "stripe",
      type: "refund",
      providerTransactionId: "re_123",
    },
    expect.any(Object),
    { upsert: true, session },
  );
});

test("an administrator starts delivery and the owning customer confirms it", async () => {
  const order = {
    _id: id,
    user: secondId,
    fulfillmentStatus: "unfulfilled",
    save: jest.fn(),
  };
  const delivery = {
    _id: secondId,
    order: id,
    user: secondId,
    status: "initiated",
    save: jest.fn(),
  };
  jest.spyOn(Order, "findOne").mockReturnValue({
    session: async () => order,
  });
  jest
    .spyOn(Delivery, "create")
    .mockResolvedValue([delivery]);
  const initiatedResponse = response();

  await deliveryController.initiateDelivery(
    {
      params: { orderId: id },
      userId: id,
      body: { note: "Packed for dispatch" },
    },
    initiatedResponse,
    jest.fn(),
  );

  expect(order.fulfillmentStatus).toBe("initiated");
  expect(initiatedResponse.status).toHaveBeenCalledWith(201);

  jest.spyOn(Delivery, "findOne").mockReturnValue({
    session: async () => delivery,
  });
  const updateOrder = jest
    .spyOn(Order, "updateOne")
    .mockResolvedValue({ modifiedCount: 1 });
  const confirmedResponse = response();

  await deliveryController.confirmDelivery(
    {
      params: { id: secondId },
      userId: secondId,
    },
    confirmedResponse,
    jest.fn(),
  );

  expect(delivery.status).toBe("delivered");
  expect(delivery.confirmedByCustomerAt).toBeInstanceOf(Date);
  expect(updateOrder).toHaveBeenCalledWith(
    { _id: id, user: secondId },
    { $set: { fulfillmentStatus: "delivered" } },
    { session },
  );
});

test("stock adjustment records the before and after quantities", async () => {
  jest
    .spyOn(Product, "findOneAndUpdate")
    .mockResolvedValue({ _id: id, quantity: 4 });
  const movement = { _id: secondId };
  const create = jest
    .spyOn(InventoryMovement, "create")
    .mockResolvedValue([movement]);
  const res = response();

  await stockController.adjustStock(
    {
      params: { productId: id },
      userId: secondId,
      body: {
        quantityChange: 6,
        reason: "Supplier delivery",
      },
    },
    res,
    jest.fn(),
  );

  expect(create.mock.calls[0][0][0]).toMatchObject({
    product: id,
    type: "restock",
    quantityChange: 6,
    quantityBefore: 4,
    quantityAfter: 10,
    performedBy: secondId,
  });
  expect(res.json).toHaveBeenCalledWith({
    productId: id,
    quantity: 10,
    movement,
  });
});

test("financial metrics compare gross paid revenue and subtract refunds", async () => {
  jest
    .spyOn(PaymentTransaction, "aggregate")
    .mockResolvedValueOnce([
      {
        _id: { currency: "usd", type: "payment" },
        amount: 1000,
        count: 5,
      },
      {
        _id: { currency: "usd", type: "refund" },
        amount: 100,
        count: 1,
      },
    ])
    .mockResolvedValueOnce([
      {
        _id: { currency: "usd", type: "payment" },
        amount: 800,
        count: 4,
      },
    ]);
  const res = response();

  await paymentController.getFinancialMetrics(
    {
      query: {
        from: "2026-09-01T00:00:00.000Z",
        to: "2026-10-01T00:00:00.000Z",
      },
    },
    res,
    jest.fn(),
  );

  expect(res.json.mock.calls[0][0].byCurrency).toEqual([
    {
      currency: "usd",
      grossPaidRevenue: 1000,
      refundedAmount: 100,
      paidTransactions: 5,
      refundTransactions: 1,
      netSales: 900,
      previousGrossPaidRevenue: 800,
      revenueChangePercentage: 25,
    },
  ]);
});
