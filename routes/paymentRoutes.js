import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ================= CREATE ORDER =================
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user._id,
      items: cart.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
    });

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount * 100,
      orderId: razorpayOrder.id,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order creation failed" });
  }
});


// ================= VERIFY PAYMENT =================
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // 🔥 Clear Cart
    await Cart.findOneAndUpdate(
      { user: order.user },
      { items: [] }
    );

    res.json({ message: "Payment successful" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;