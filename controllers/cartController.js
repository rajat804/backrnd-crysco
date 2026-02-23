import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, products: [] });
    }

    // Check if product already exists
    const itemIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === (size || "") &&
        p.color === (color || "")
    );

    if (itemIndex > -1) {
      // Update quantity
      cart.products[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.products.push({ productId, quantity, size, color });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "products.productId"
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity, size, color } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === (size || "") &&
        p.color === (color || "")
    );
    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  const id = req.params.id;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter((p) => p.productId.toString() !== id);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};