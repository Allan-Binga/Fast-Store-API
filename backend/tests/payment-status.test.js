const Order = require("../models/orders");
const { getPaymentStatus } = require("../controllers/orders");

const ownerId = "507f1f77bcf86cd799439011";
const orderId = "507f1f77bcf86cd799439012";
const response = () => ({ set: jest.fn(), json: jest.fn() });

beforeEach(() => jest.restoreAllMocks());

test.each([
  [{ session_id: "cs_test_purchase" }, { stripeSessionId: "cs_test_purchase" }],
  [{ order_id: orderId }, { _id: orderId }],
  [
    { checkout_key: "checkout-key-123456" },
    { checkoutKey: "checkout-key-123456" },
  ],
])(
  "payment lookup is always scoped to the authenticated owner: %j",
  async (query, filter) => {
    const order = {
      _id: orderId,
      paymentStatus: "pending",
      totalAmount: 20,
      currency: "usd",
      expiresAt: new Date(0),
      stripeSessionUrl: "https://checkout.stripe.com/private",
      requestHash: "internal",
    };
    jest.spyOn(Order, "findOne").mockReturnValue({ lean: async () => order });
    const res = response();
    const next = jest.fn();

    await getPaymentStatus({ userId: ownerId, query }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(Order.findOne).toHaveBeenCalledWith({ user: ownerId, ...filter });
    expect(res.json.mock.calls[0][0]).toMatchObject({
      paymentStatus: "pending",
    });
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("stripeSessionUrl");
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("requestHash");
    expect(res.set).toHaveBeenCalledWith("Cache-Control", "no-store");
  },
);

test.each([
  {},
  { session_id: "cs_demo", order_id: orderId },
  { session_id: { $ne: null } },
  { order_id: "invalid" },
  { checkout_key: ["checkout-key-123456"] },
])(
  "invalid payment references are rejected before database access: %j",
  async (query) => {
    const find = jest.spyOn(Order, "findOne");
    const next = jest.fn();
    await getPaymentStatus({ userId: ownerId, query }, response(), next);
    expect(next.mock.calls[0][0].status).toBe(400);
    expect(find).not.toHaveBeenCalled();
  },
);

test("missing or other-owner payments return 404 instead of a payment claim", async () => {
  jest.spyOn(Order, "findOne").mockReturnValue({ lean: async () => null });
  const res = response();
  const next = jest.fn();
  await getPaymentStatus(
    { userId: ownerId, query: { order_id: orderId } },
    res,
    next,
  );
  expect(next.mock.calls[0][0].status).toBe(404);
  expect(res.json).not.toHaveBeenCalled();
});
