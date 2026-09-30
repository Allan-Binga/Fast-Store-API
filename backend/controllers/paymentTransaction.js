const PaymentTransaction = require("../models/paymentTransaction");
const {
  asyncHandler,
  fail,
  pagination,
} = require("../utils/http");


const dateRange = (query) => {
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

  if (
    end.getTime() - start.getTime() >
    366 * 24 * 60 * 60 * 1000
  ) {
    throw fail(
      400,
      "Financial metrics are limited to 366 days."
    );
  }

  const duration = end.getTime() - start.getTime();

  return {
    start,
    end,
    previousStart: new Date(start.getTime() - duration),
    previousEnd: start,
  };
};


const summarize = async (start, end) =>
  PaymentTransaction.aggregate([
    {
      $match: {
        status: "succeeded",
        occurredAt: {
          $gte: start,
          $lt: end,
        },
        type: {
          $in: ["payment", "refund"],
        },
      },
    },
    {
      $group: {
        _id: {
          currency: "$currency",
          type: "$type",
        },
        amount: {
          $sum: "$amount",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);


const metricsByCurrency = (rows) => {
  const currencies = new Map();

  for (const row of rows) {
    const currency = row._id.currency;

    if (!currencies.has(currency)) {
      currencies.set(currency, {
        currency,
        grossPaidRevenue: 0,
        refundedAmount: 0,
        paidTransactions: 0,
        refundTransactions: 0,
      });
    }

    const metrics = currencies.get(currency);

    if (row._id.type === "payment") {
      metrics.grossPaidRevenue = row.amount;
      metrics.paidTransactions = row.count;
    } else {
      metrics.refundedAmount = row.amount;
      metrics.refundTransactions = row.count;
    }
  }

  return currencies;
};


const getFinancialMetrics = asyncHandler(async (req, res) => {
  const {
    start,
    end,
    previousStart,
    previousEnd,
  } = dateRange(req.query);

  const [
    currentRows,
    previousRows,
  ] = await Promise.all([
    summarize(start, end),
    summarize(previousStart, previousEnd),
  ]);

  const current = metricsByCurrency(currentRows);
  const previous = metricsByCurrency(previousRows);
  const currencyCodes = new Set([
    ...current.keys(),
    ...previous.keys(),
  ]);

  const byCurrency = [...currencyCodes]
    .sort()
    .map((currency) => {
      const now = current.get(currency) || {
        currency,
        grossPaidRevenue: 0,
        refundedAmount: 0,
        paidTransactions: 0,
        refundTransactions: 0,
      };
      const before = previous.get(currency) || {
        grossPaidRevenue: 0,
      };

      const revenueChangePercentage =
        before.grossPaidRevenue === 0
          ? null
          : Math.round(
            (
              (
                now.grossPaidRevenue -
                before.grossPaidRevenue
              ) /
              before.grossPaidRevenue
            ) *
            10000
          ) / 100;

      return {
        ...now,
        netSales:
          Math.round(
            (
              now.grossPaidRevenue -
              now.refundedAmount
            ) *
            100
          ) / 100,
        previousGrossPaidRevenue:
          before.grossPaidRevenue,
        revenueChangePercentage,
      };
    });

  res.json({
    period: {
      from: start,
      to: end,
      comparisonFrom: previousStart,
      comparisonTo: previousEnd,
    },
    byCurrency,
  });
});


const getPaymentTransactions = asyncHandler(
  async (req, res) => {
    const {
      limit,
      skip,
    } = pagination(req);

    const query = {};

    if (req.query.provider !== undefined) {
      if (
        !["stripe", "paypal"].includes(req.query.provider)
      ) {
        throw fail(400, "Invalid payment provider.");
      }

      query.provider = req.query.provider;
    }

    if (req.query.type !== undefined) {
      if (
        ![
          "payment",
          "refund",
          "fee",
          "dispute",
          "payout",
        ].includes(req.query.type)
      ) {
        throw fail(400, "Invalid transaction type.");
      }

      query.type = req.query.type;
    }

    const transactions = await PaymentTransaction.find(query)
      .sort({
        occurredAt: -1,
      })
      .skip(skip)
      .limit(limit);

    res.json(transactions);
  }
);


module.exports = {
  getFinancialMetrics,
  getPaymentTransactions,
};
