import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      productId,
      title,
      price,
      quantity,
      size,
      color,
      image,
    } = req.body;

    let cart = await Cart.findOne({ user: userId });

    // 🆕 Agar cart nahi hai toh create karo
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // 🔎 Check karo product already cart me hai ya nahi
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        title,
        price,
        quantity,
        size,
        color,
        image,
      });
    }

    await cart.save();

    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
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

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    res.json({ message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};