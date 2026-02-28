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


export default router;