import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const totalAmount = user.cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const options = {
      amount: totalAmount * 100, // paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = new Order({
      user: user._id,
      items: user.cart,
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      shippingAddress: req.body.shippingAddress,
    });

    await order.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      amount: options.amount,
      orderId: razorpayOrder.id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating order" });
  }
});

// ✅ Verify Payment
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
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      order.status = "Paid";
      order.razorpayPaymentId = razorpay_payment_id;
      await order.save();

      // 🔥 Clear Cart
      const user = await User.findById(order.user);
      user.cart = [];
      await user.save();

      res.json({ message: "Payment successful" });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;