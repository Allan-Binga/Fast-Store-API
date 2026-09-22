process.env.CLIENT_URL = "http://localhost:5173";
const Order = require("../models/orders");
const Address = require("../models/address");
const Cart = require("../models/cart");
jest.mock("../services/stripe", () => jest.fn());
jest.mock("../services/cart", () => ({ resolveItem: jest.fn() }));
jest.mock("../services/orders", () => ({ reserveOrder: jest.fn(), settleOrder: jest.fn() }));
jest.mock("../controllers/emailService", () => ({ sendOrderConfirmationEmail: jest.fn() }));
const getStripe = require("../services/stripe");
const { resolveItem } = require("../services/cart");
const { reserveOrder, settleOrder } = require("../services/orders");
const { createCheckoutSession } = require("../controllers/checkout");
const { handleWebhook } = require("../controllers/webhook");
const id = "507f1f77bcf86cd799439011";
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });
beforeEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); });

// Verify trust boundaries and retry behavior without contacting Stripe.
test("checkout rejects prices from the browser and charges catalog prices", async () => {
  const create = jest.fn().mockResolvedValue({ id: "cs_demo", url: "https://checkout.stripe.com/demo" });
  getStripe.mockReturnValue({ checkout: { sessions: { create } } });
  jest.spyOn(Order, "findOne").mockResolvedValue(null);
  jest.spyOn(Order, "updateOne").mockResolvedValue({ modifiedCount: 1 });
  jest.spyOn(Address, "findOne").mockReturnValue({ lean: async () => ({ _id: id, street: "Street" }) });
  jest.spyOn(Cart, "findOne").mockResolvedValue(null);
  resolveItem.mockResolvedValue({ productId: id, name: "Headphones", price: 99.99, quantity: 2 });
  reserveOrder.mockImplementation(async data => ({ ...data, _id: id }));
  const next = jest.fn(), response = res();
  await createCheckoutSession({ userId: id, get: () => "checkout-key-123456", body: { items: [{ productId: id, quantity: 2, price: 0.01 }], addressId: id } }, response, next);
  expect(next).not.toHaveBeenCalled();
  expect(create.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(9999);
  expect(create.mock.calls[0][0].cancel_url).toBe("http://localhost:5173/cart");
  expect(create.mock.calls[0][1].idempotencyKey).toBe(`order-${id}`);
});
test("missing checkout idempotency key is rejected before database access", async () => {
  getStripe.mockReturnValue({}); const next = jest.fn();
  await createCheckoutSession({ get: () => undefined, body: {} }, res(), next);
  expect(next.mock.calls[0][0].status).toBe(400);
});
test("webhook database failure is not acknowledged as success", async () => {
  process.env.WEBHOOK_SECRET = "test-webhook";
  getStripe.mockReturnValue({ webhooks: { constructEvent: () => ({ type: "checkout.session.completed", data: { object: { metadata: { orderId: id, user: id } } } }) } });
  settleOrder.mockRejectedValue(new Error("Database unavailable"));
  const response = res(), next = jest.fn();
  await handleWebhook({ body: Buffer.from("{}"), headers: { "stripe-signature": "signature" } }, response, next);
  expect(next).toHaveBeenCalled(); expect(response.json).not.toHaveBeenCalled();
});
test("duplicate paid events skip already-confirmed emails", async () => {
  process.env.WEBHOOK_SECRET = "test-webhook";
  getStripe.mockReturnValue({ webhooks: { constructEvent: () => ({ type: "checkout.session.completed", data: { object: { metadata: { orderId: id, user: id } } } }) } });
  settleOrder.mockResolvedValue({ paymentStatus: "paid", confirmationSent: true });
  const next = jest.fn(), response = res();
  await handleWebhook({ body: Buffer.from("{}"), headers: {} }, response, next);
  expect(next).not.toHaveBeenCalled(); expect(response.json).toHaveBeenCalledWith({ received: true });
});
