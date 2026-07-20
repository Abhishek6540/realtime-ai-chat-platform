import { createorder,  verifySignature, verifypayment} from "../services/RazorpayService.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const { amount, durationMonths = 1 } = req.body;

    const order = await createorder(amount);

    const payment = new Payment({
      userId: req.userId,
      razorpayOrderId: order.id,
      amount,
      premiumDurationMonths: durationMonths,
    });

    await payment.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const isValid = verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const paymentDetails = await verifypayment(
      razorpayPaymentId
    );

    if (paymentDetails.status !== "captured") {
      return res.status(400).json({
        success: false,
        error: "Payment not completed",
      });
    }

    const payment = await Payment.findById(paymentId);

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "completed";
    payment.completedAt = new Date();

    await payment.save();

    const user = await User.findById(req.userId);

    const premiumExpiresAt = new Date();
    premiumExpiresAt.setMonth(
      premiumExpiresAt.getMonth() + payment.premiumDurationMonths
    );

    user.isPremium = true;
    user.premiumExpiresAt = premiumExpiresAt;

    await user.save();

    res.json({
      success: true,
      message: "Payment verified and premium activated",
      user: {
        id: user._id,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};