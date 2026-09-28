process.env.CLIENT_URL = "http://localhost:5173";
const Order = require("../models/orders");
const Address = require("../models/address");
const Cart = require("../models/cart");
jest.mock("../services/stripe", () => jest.fn());
jest.mock("../services/cart", () => ({ resolveItem: jest.fn() }));
jest.mock("../services/orders", () => ({
  reserveOrder: jest.fn(),
  settleOrder: jest.fn(),
}));
jest.mock("../services/confirmation", () => ({
  confirmOrder: jest.fn(),
}));
jest.mock("../controllers/emailService", () => ({
  sendOrderConfirmationEmail: jest.fn(),
}));
const getStripe = require("../services/stripe");
const { resolveItem } = require("../services/cart");
const { reserveOrder, settleOrder } = require("../services/orders");
const { confirmOrder } = require("../services/confirmation");
const {
  createCheckoutSession,
  resumeCheckoutSession,
} = require("../controllers/checkout");
const { handleWebhook } = require("../controllers/webhook");
const id = "507f1f77bcf86cd799439011";
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

// Verify trust boundaries and retry behavior without contacting Stripe.
test("checkout rejects prices from the browser and charges catalog prices", async () => {
  const create = jest.fn().mockResolvedValue({
    id: "cs_demo",
    url: "https://checkout.stripe.com/demo",
  });
  getStripe.mockReturnValue({ checkout: { sessions: { create } } });
  jest.spyOn(Order, "findOne").mockResolvedValue(null);
  jest.spyOn(Order, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  jest
    .spyOn(Address, "findOne")
    .mockReturnValue({ lean: async () => ({ _id: id, street: "Street" }) });
  jest.spyOn(Cart, "findOne").mockResolvedValue(null);
  resolveItem.mockResolvedValue({
    productId: id,
    name: "Headphones",
    price: 99.99,
    quantity: 2,
  });
  reserveOrder.mockImplementation(async (data) => ({ ...data, _id: id }));
  const next = jest.fn(),
    response = res();
  await createCheckoutSession(
    {
      userId: id,
      get: () => "checkout-key-123456",
      body: {
        items: [{ productId: id, quantity: 2, price: 0.01 }],
        addressId: id,
      },
    },
    response,
    next,
  );
  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(
    9999,
  );
  expect(create.mock.calls[0][0].cancel_url).toBe(
    `http://localhost:5173/payment-result?order_id=${id}&cancelled=1`,
  );
  expect(create.mock.calls[0][1].idempotencyKey).toBe(`order-${id}`);
});
test("missing checkout idempotency key is rejected before database access", async () => {
  getStripe.mockReturnValue({});
  const next = jest.fn();
  await createCheckoutSession({ get: () => undefined, body: {} }, res(), next);
  expect(next.mock.calls[0][0].status).toBe(400);
});
test("webhook database failure is not acknowledged as success", async () => {
  process.env.WEBHOOK_SECRET = "test-webhook";
  getStripe.mockReturnValue({
    webhooks: {
      constructEvent: () => ({
        type: "checkout.session.completed",
        data: { object: { metadata: { orderId: id, user: id } } },
      }),
    },
  });
  settleOrder.mockRejectedValue(new Error("Database unavailable"));
  const response = res(),
    next = jest.fn();
  await handleWebhook(
    { body: Buffer.from("{}"), headers: { "stripe-signature": "signature" } },
    response,
    next,
  );
  expect(next).toHaveBeenCalled();
  expect(response.json).not.toHaveBeenCalled();
});
test("duplicate paid events skip already-confirmed emails", async () => {
  process.env.WEBHOOK_SECRET = "test-webhook";
  getStripe.mockReturnValue({
    webhooks: {
      constructEvent: () => ({
        type: "checkout.session.completed",
        data: { object: { metadata: { orderId: id, user: id } } },
      }),
    },
  });
  settleOrder.mockResolvedValue({
    paymentStatus: "paid",
    confirmationSent: true,
  });
  const next = jest.fn(),
    response = res();
  await handleWebhook({ body: Buffer.from("{}"), headers: {} }, response, next);
  expect(next).not.toHaveBeenCalled();
  expect(response.json).toHaveBeenCalledWith({ received: true });
  await new Promise(setImmediate);
  expect(confirmOrder).not.toHaveBeenCalled();
});

test("webhook acknowledges payment before confirmation email delivery", async () => {
  process.env.WEBHOOK_SECRET = "test-webhook";
  getStripe.mockReturnValue({
    webhooks: {
      constructEvent: () => ({
        type: "checkout.session.completed",
        data: { object: { metadata: { orderId: id, user: id } } },
      }),
    },
  });
  settleOrder.mockResolvedValue({
    _id: id,
    paymentStatus: "paid",
    confirmationSent: false,
  });

  let finishEmail;
  confirmOrder.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishEmail = resolve;
      }),
  );
  const response = res();
  const next = jest.fn();

  await handleWebhook({ body: Buffer.from("{}"), headers: {} }, response, next);

  expect(next).not.toHaveBeenCalled();
  expect(response.json).toHaveBeenCalledWith({ received: true });
  expect(confirmOrder).not.toHaveBeenCalled();

  await new Promise(setImmediate);
  expect(confirmOrder).toHaveBeenCalledWith(id);
  finishEmail();
  await Promise.resolve();
});

test("stock rejection before reservation allows the shopper to revise the purchase", async () => {
  getStripe.mockReturnValue({});
  jest.spyOn(Order, "findOne").mockResolvedValue(null);
  jest
    .spyOn(Address, "findOne")
    .mockReturnValue({ lean: async () => ({ _id: id }) });
  jest.spyOn(Cart, "findOne").mockResolvedValue(null);
  resolveItem.mockRejectedValue(
    Object.assign(new Error("Requested quantity is out of stock."), {
      status: 409,
    }),
  );
  const response = res();
  const next = jest.fn();

  await createCheckoutSession(
    {
      userId: id,
      get: () => "checkout-key-123456",
      body: { items: [{ productId: id, quantity: 2 }], addressId: id },
    },
    response,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(response.status).toHaveBeenCalledWith(409);
  expect(response.json).toHaveBeenCalledWith({
    message: "Requested quantity is out of stock.",
    checkoutCreated: false,
  });
  expect(reserveOrder).not.toHaveBeenCalled();
});

test("retrying a saved checkout reuses its existing Stripe session", async () => {
  const crypto = require("crypto");
  const inputs = [{ productId: id, quantity: 2 }];
  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ items: inputs, addressId: id, source: "cart" }))
    .digest("hex");
  const create = jest.fn();
  getStripe.mockReturnValue({ checkout: { sessions: { create } } });
  jest.spyOn(Order, "findOne").mockResolvedValue({
    _id: id,
    requestHash,
    paymentStatus: "pending",
    expiresAt: new Date(Date.now() + 60000),
    stripeSessionId: "cs_existing",
    stripeSessionUrl: "https://checkout.stripe.com/existing",
  });
  const response = res();
  const next = jest.fn();

  await createCheckoutSession(
    {
      userId: id,
      get: () => "checkout-key-123456",
      body: { items: inputs, addressId: id },
    },
    response,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(create).not.toHaveBeenCalled();
  expect(reserveOrder).not.toHaveBeenCalled();
  expect(response.json).toHaveBeenCalledWith({
    id: "cs_existing",
    url: "https://checkout.stripe.com/existing",
    orderId: id,
  });
});

test("resuming checkout returns the same open Stripe session for its owner", async () => {
  const response = res();
  response.set = jest.fn();
  const next = jest.fn();
  const expiresAt = new Date(Date.now() + 60000);
  jest.spyOn(Order, "findOne").mockResolvedValue({
    _id: id,
    user: id,
    paymentStatus: "pending",
    stockReserved: true,
    stripeSessionId: "cs_existing",
    expiresAt,
  });
  const retrieve = jest.fn().mockResolvedValue({
    id: "cs_existing",
    status: "open",
    url: "https://checkout.stripe.com/existing",
    metadata: { orderId: id, user: id },
  });
  getStripe.mockReturnValue({ checkout: { sessions: { retrieve } } });

  await resumeCheckoutSession(
    { userId: id, body: { orderId: id } },
    response,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(Order.findOne).toHaveBeenCalledWith({ _id: id, user: id });
  expect(retrieve).toHaveBeenCalledWith("cs_existing");
  expect(reserveOrder).not.toHaveBeenCalled();
  expect(response.set).toHaveBeenCalledWith("Cache-Control", "no-store");
  expect(response.json).toHaveBeenCalledWith({
    url: "https://checkout.stripe.com/existing",
    expiresAt,
  });
});

test("resuming checkout cannot access another customer's order", async () => {
  jest.spyOn(Order, "findOne").mockResolvedValue(null);
  const response = res();
  const next = jest.fn();

  await resumeCheckoutSession(
    { userId: id, body: { orderId: id } },
    response,
    next,
  );

  expect(next.mock.calls[0][0]).toMatchObject({
    status: 404,
    message: "Checkout not found.",
  });
  expect(getStripe).not.toHaveBeenCalled();
  expect(response.json).not.toHaveBeenCalled();
});

test("resuming a remotely expired session settles it instead of returning its URL", async () => {
  jest.spyOn(Order, "findOne").mockResolvedValue({
    _id: id,
    user: id,
    paymentStatus: "pending",
    stockReserved: true,
    stripeSessionId: "cs_expired",
  });
  const remote = {
    id: "cs_expired",
    status: "expired",
    metadata: { orderId: id, user: id },
  };
  getStripe.mockReturnValue({
    checkout: { sessions: { retrieve: jest.fn().mockResolvedValue(remote) } },
  });
  settleOrder.mockResolvedValue({ paymentStatus: "expired" });
  const response = res();
  const next = jest.fn();

  await resumeCheckoutSession(
    { userId: id, body: { orderId: id } },
    response,
    next,
  );

  expect(next).not.toHaveBeenCalled();
  expect(settleOrder).toHaveBeenCalledWith(remote);
  expect(response.status).toHaveBeenCalledWith(409);
  expect(response.json).toHaveBeenCalledWith({
    message: "This checkout has expired. Return to your cart to try again.",
    paymentStatus: "expired",
  });
});
