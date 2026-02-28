import express from "express";
import Order from "../models/Order.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

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

export default router;