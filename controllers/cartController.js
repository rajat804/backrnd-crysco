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

    if (!productId || !price) {
      return res.status(400).json({ message: "Product data missing" });
    }

    quantity = Number(quantity) || 1;
    size = size ? String(size) : null;
    color = color ? String(color) : null;

    let cart = await Cart.findOne({ user: userId });

    // Agar cart exist nahi karta toh create karo
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    // Same product + same size + same color check
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      // ✅ Already exists → quantity increase karo
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // ✅ New item add karo
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

    res.status(200).json({
      message: "Cart updated successfully",
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
  try {
    const { productId, size, color, quantity } = req.body;

    if (!productId || !size || !color) {
      return res.status(400).json({ message: "Product info missing" });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // quantity 0 ho toh remove kar do
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.json({
      message: "Cart updated",
      cart,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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