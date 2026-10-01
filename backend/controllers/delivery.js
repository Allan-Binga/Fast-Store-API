const mongoose = require("mongoose");

const Delivery = require("../models/delivery");
const Order = require("../models/orders");
const {
  asyncHandler,
  fail,
  pagination,
  requireId,
} = require("../utils/http");


const initiateDelivery = asyncHandler(async (req, res) => {
  const orderId = requireId(req.params.orderId);
  const note = req.body.note;

  if (
    note !== undefined &&
    (
      typeof note !== "string" ||
      !note.trim() ||
      note.length > 500
    )
  ) {
    throw fail(
      400,
      "Delivery note must contain 1–500 characters."
    );
  }

  let estimatedDeliveryAt;

  if (req.body.estimatedDeliveryAt !== undefined) {
    estimatedDeliveryAt = new Date(
      req.body.estimatedDeliveryAt
    );

    if (
      !Number.isFinite(estimatedDeliveryAt.getTime()) ||
      estimatedDeliveryAt <= new Date()
    ) {
      throw fail(
        400,
        "Estimated delivery time must be in the future."
      );
    }
  }

  let delivery;

  await mongoose.connection.transaction(async (session) => {
    const order = await Order.findOne({
      _id: orderId,
      paymentStatus: {
        $in: ["paid", "partially_refunded"],
      },
      fulfillmentStatus: "unfulfilled",
    }).session(session);

    if (!order) {
      throw fail(
        409,
        "Only paid, unfulfilled orders can start delivery."
      );
    }

    [delivery] = await Delivery.create(
      [
        {
          order: order._id,
          user: order.user,
          initiatedBy: req.userId,
          estimatedDeliveryAt,
          note: note?.trim(),
        },
      ],
      {
        session,
      },
    );

    order.fulfillmentStatus = "initiated";

    await order.save({
      session,
    });
  });

  res.status(201).json(delivery);
});


const confirmDelivery = asyncHandler(async (req, res) => {
  const deliveryId = requireId(req.params.id);
  let delivered;

  await mongoose.connection.transaction(async (session) => {
    const delivery = await Delivery.findOne({
      _id: deliveryId,
      user: req.userId,
      status: "initiated",
    }).session(session);

    if (!delivery) {
      throw fail(
        404,
        "An active delivery was not found for this account."
      );
    }

    const deliveredAt = new Date();

    delivery.status = "delivered";
    delivery.deliveredAt = deliveredAt;
    delivery.confirmedByCustomerAt = deliveredAt;

    await delivery.save({
      session,
    });

    await Order.updateOne(
      {
        _id: delivery.order,
        user: req.userId,
      },
      {
        $set: {
          fulfillmentStatus: "delivered",
        },
      },
      {
        session,
      },
    );

    delivered = delivery;
  });

  res.json(delivered);
});


const getDeliveries = asyncHandler(async (req, res) => {
  const {
    limit,
    skip,
  } = pagination(req);

  const query = {};

  if (req.query.orderId !== undefined) {
    query.order = requireId(req.query.orderId);
  }

  const deliveries = await Delivery.find(query)
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  res.json(deliveries);
});



const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(requireId(req.params.id));

  if (!delivery) {
    throw fail(404, "Delivery not found.");
  }

  res.json(delivery);
});

const getUserDeliveries = asyncHandler(async (req, res) => {
  const {
    limit,
    skip,
  } = pagination(req);

  const deliveries = await Delivery.find({
    user: req.userId,
  })
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit);

  res.json(deliveries);
});


module.exports = {
  initiateDelivery,
  confirmDelivery,
  getDeliveries,
  getDelivery,
  getUserDeliveries,
};
