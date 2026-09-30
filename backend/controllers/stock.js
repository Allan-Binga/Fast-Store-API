const mongoose = require("mongoose");

const Product = require("../models/product");
const Order = require("../models/orders");
const InventoryMovement = require("../models/inventoryMovement");
const {
  asyncHandler,
  fail,
  pagination,
  requireId,
} = require("../utils/http");


const metricsPeriod = (query) => {
  const end =
    query.to === undefined
      ? new Date()
      : new Date(query.to);
  const start =
    query.from === undefined
      ? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(query.from);

  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  ) {
    throw fail(400, "Provide a valid from/to date range.");
  }

  const duration = end.getTime() - start.getTime();

  if (duration > 366 * 24 * 60 * 60 * 1000) {
    throw fail(400, "Stock metrics are limited to 366 days.");
  }

  return {
    start,
    end,
    previousStart: new Date(start.getTime() - duration),
    previousEnd: start,
  };
};


const salesSummary = async (start, end) => {
  const rows = await Order.aggregate([
    {
      $match: {
        paidAt: {
          $gte: start,
          $lt: end,
        },
        paymentStatus: {
          $in: ["paid", "partially_refunded", "refunded"],
        },
      },
    },
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: null,
        unitsSold: {
          $sum: "$items.quantity",
        },
        salesAmount: {
          $sum: {
            $multiply: [
              "$items.price",
              "$items.quantity",
            ],
          },
        },
        costOfGoodsSold: {
          $sum: {
            $multiply: [
              {
                $ifNull: ["$items.costPrice", 0],
              },
              "$items.quantity",
            ],
          },
        },
      },
    },
  ]);

  return rows[0] || {
    unitsSold: 0,
    salesAmount: 0,
    costOfGoodsSold: 0,
  };
};


const getStockMetrics = asyncHandler(async (req, res) => {
  const {
    start,
    end,
    previousStart,
    previousEnd,
  } = metricsPeriod(req.query);

  const [
    inventoryRows,
    currentSales,
    previousSales,
  ] = await Promise.all([
    Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: {
            $sum: 1,
          },
          totalUnits: {
            $sum: "$quantity",
          },
          inventoryValue: {
            $sum: {
              $multiply: [
                "$quantity",
                {
                  $ifNull: ["$costPrice", 0],
                },
              ],
            },
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gt: ["$quantity", 0],
                    },
                    {
                      $lte: [
                        "$quantity",
                        {
                          $ifNull: ["$reorderPoint", 5],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStockProducts: {
            $sum: {
              $cond: [
                {
                  $eq: ["$quantity", 0],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    salesSummary(start, end),
    salesSummary(previousStart, previousEnd),
  ]);

  const inventory = inventoryRows[0] || {
    totalProducts: 0,
    totalUnits: 0,
    inventoryValue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  };

  const percentage = (value, total) =>
    total === 0
      ? 0
      : Math.round((value / total) * 10000) / 100;

  const unitsSoldChangePercentage =
    previousSales.unitsSold === 0
      ? null
      : Math.round(
        (
          (
            currentSales.unitsSold -
            previousSales.unitsSold
          ) /
          previousSales.unitsSold
        ) *
        10000
      ) / 100;

  res.json({
    period: {
      from: start,
      to: end,
      comparisonFrom: previousStart,
      comparisonTo: previousEnd,
    },
    ...inventory,
    inventoryValue:
      Math.round(inventory.inventoryValue * 100) / 100,
    lowStockPercentage: percentage(
      inventory.lowStockProducts,
      inventory.totalProducts,
    ),
    outOfStockPercentage: percentage(
      inventory.outOfStockProducts,
      inventory.totalProducts,
    ),
    unitsSold: currentSales.unitsSold,
    previousUnitsSold: previousSales.unitsSold,
    unitsSoldChangePercentage,
    sellThroughRate: percentage(
      currentSales.unitsSold,
      currentSales.unitsSold + inventory.totalUnits,
    ),
    salesAmount:
      Math.round(currentSales.salesAmount * 100) / 100,
    costOfGoodsSold:
      Math.round(currentSales.costOfGoodsSold * 100) / 100,
    estimatedGrossProfit:
      Math.round(
        (
          currentSales.salesAmount -
          currentSales.costOfGoodsSold
        ) *
        100
      ) / 100,
  });
});


const getInventoryMovements = asyncHandler(
  async (req, res) => {
    const {
      limit,
      skip,
    } = pagination(req);

    const query = {};

    if (req.query.productId !== undefined) {
      query.product = requireId(req.query.productId);
    }

    const movements = await InventoryMovement.find(query)
      .sort({
        occurredAt: -1,
      })
      .skip(skip)
      .limit(limit);

    res.json(movements);
  }
);


const adjustStock = asyncHandler(async (req, res) => {
  const productId = requireId(req.params.productId);
  const quantityChange = Number(req.body.quantityChange);
  const reason = req.body.reason;

  if (
    !Number.isInteger(quantityChange) ||
    quantityChange === 0
  ) {
    throw fail(
      400,
      "Quantity change must be a non-zero integer."
    );
  }

  if (
    typeof reason !== "string" ||
    !reason.trim() ||
    reason.length > 500
  ) {
    throw fail(
      400,
      "Stock adjustment reason must contain 1–500 characters."
    );
  }

  let result;

  await mongoose.connection.transaction(async (session) => {
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        quantity: {
          $gte: Math.max(0, -quantityChange),
        },
      },
      {
        $inc: {
          quantity: quantityChange,
        },
      },
      {
        new: false,
        session,
      },
    );

    if (!product) {
      throw fail(
        409,
        "Product does not exist or the adjustment exceeds available stock."
      );
    }

    const quantityAfter =
      product.quantity + quantityChange;

    const [movement] = await InventoryMovement.create(
      [
        {
          product: product._id,
          type:
            quantityChange > 0
              ? "restock"
              : "manual_adjustment",
          quantityChange,
          quantityBefore: product.quantity,
          quantityAfter,
          reason: reason.trim(),
          performedBy: req.userId,
        },
      ],
      {
        session,
      },
    );

    result = {
      productId: product._id,
      quantity: quantityAfter,
      movement,
    };
  });

  res.json(result);
});


module.exports = {
  getStockMetrics,
  getInventoryMovements,
  adjustStock,
};
