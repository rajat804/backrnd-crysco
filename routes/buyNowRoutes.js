import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ✅ CREATE ORDER
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: "Missing data" });
    }

    const totalAmount = product.price * quantity;

    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ VERIFY PAYMENT
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product,
      quantity,
      shippingAddress,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const newOrder = new Order({
      user: req.user.id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity,
          size: product.size,
          image: product.image,
        },
      ],
      shippingAddress,
      totalAmount: product.price * quantity,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "Processing",
    });

    await newOrder.save();

    res.json({ message: "Order placed successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;