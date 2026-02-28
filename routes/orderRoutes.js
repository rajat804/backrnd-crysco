import express from "express";
import Order from "../models/Order.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


router.get("/admin/all-orders",  async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.put("/admin/update-status/:id", async (req, res) => {
  try {
   
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// PUT /api/orders/cancel/:id

router.put("/cancel/:id", authMiddleware, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.orderStatus !== "Processing") {
    return res.status(400).json({ message: "Cannot cancel this order" });
  }

  order.orderStatus = "Cancelled";
  await order.save();

  res.json({ message: "Order cancelled successfully" });
});

// ✅ Create Razorpay order for Buy Now
router.post("/buy-now", authMiddleware, async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: "Product data missing" });
    }

    const totalAmount = product.price * quantity;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create Buy Now order" });
  }
});



// ✅ Verify payment and save order
router.post("/verify-buy-now", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      product,
      quantity,
      shippingAddress,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const totalAmount = product.price * quantity;

    const newOrder = new Order({
      user: req.user._id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity,
          size: product.size,
          color: product.color,
          image: product.image,
        },
      ],
      shippingAddress,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Paid",
      orderStatus: "Processing",
    });

    await newOrder.save();

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
});





export default router;