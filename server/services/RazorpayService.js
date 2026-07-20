import axios from "axios";
import crypto from "crypto";

export const createorder = async (amount, currency = "INR") => {
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: Math.round(amount * 100),
        currency,
        receipt: `receipt_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Razorpay create order error:", error.message);
    throw error;
  }
};

export const verifySignature = (
  orderId,
  paymentId,
  signature
) => {
  const body = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};

export const verifypayment = async (paymentId) => {
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Razorpay verify error:", error.message);
    return null;
  }
};