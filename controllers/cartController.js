import Cart from "../models/Cart.js";
import Product from "../models/Product.js"; // 🔥 Important

// ================= ADD TO CART =================
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

    // 🔥 Get real product from DB (Secure Method)
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ✅ Dynamic Size Check
    if (product.sizes && product.sizes.length > 0 && !size) {
      return res.status(400).json({ message: "Size is required" });
    }

    // ✅ Dynamic Color Check
    if (product.colors && product.colors.length > 0 && !color) {
      return res.status(400).json({ message: "Color is required" });
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
        (item.size || null) === size &&
        (item.color || null) === color
    );

    // ❌ Strict Mode (No duplicate)
    if (existingItem) {
      return res.status(400).json({
        message: "This product variant already exists in cart",
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

// ================= GET CART =================
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

// ================= UPDATE CART ITEM =================
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        (item.size || null) === (size || null) &&
        (item.color || null) === (color || null)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = Number(quantity);
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Item not found in cart" });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= REMOVE FROM CART =================
export const removeFromCart = async (req, res) => {
  try {
    const { productId, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          (item.size || null) === (size || null) &&
          (item.color || null) === (color || null)
        )
    );

    await cart.save();

    res.json({ message: "Item removed", cart });

  } catch (error) {
    console.log("REMOVE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};