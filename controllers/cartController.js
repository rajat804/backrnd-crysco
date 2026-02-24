import Cart from "../models/Cart.js";

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let {
      productId,
      title,
      price,
      quantity,
      size,
      color,
      image,
    } = req.body;

    quantity = Number(quantity) || 1;
    size = size ? String(size) : null;
    color = color ? String(color) : null;

    if (!size) {
      return res.status(400).json({ message: "Size is required" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    // ❌ Strict mode — no duplicate
    if (existingItem) {
      return res.status(400).json({
        message: "This size already exists in cart",
      });
    }

    cart.items.push({
      productId,
      title,
      price,
      quantity,
      size,
      color,
      image,
    });

    await cart.save();

    res.status(200).json({
      message: "Item added successfully",
      cart,
    });

  } catch (error) {
    console.log("CART ERROR:", error);
    res.status(500).json({ message: error.message });
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
    if (!size || !color)
      return res.status(400).json({ message: "Size and color required" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
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