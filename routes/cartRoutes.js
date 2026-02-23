import express from "express";
import Cart from "../models/Cart.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add to cart
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, title, price, quantity, size, color, image } = req.body;
    const userId = req.user._id; // comes from authMiddleware

    // Optional: Check if item already exists in cart for this user, same product, size & color
    const existingItem = await Cart.findOne({
      user: userId,
      productId,
      size: size || null,
      color: color || null,
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json({ message: "Cart updated successfully", cart: existingItem });
    }

    // Create new cart item
    const cartItem = new Cart({
      user: userId,
      productId,
      title,
      price,
      quantity,
      size: size || null,
      color: color || null,
      image,
    });

    await cartItem.save();
    res.status(201).json({ message: "Added to cart successfully", cart: cartItem });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;