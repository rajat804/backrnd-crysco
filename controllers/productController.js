import Product from "../models/Product.js";
import cloudinary from "../config/cloudnary.js";
import { Readable } from "stream";

console.log("Cloudinary Config Loaded:", cloudinary.config());
// Add Product
export const addProduct = async (req, res) => {
  try {
    const { title, category, categoryType, sizes, mrp, salePrice, amazonLink, description, highlights } = req.body;

    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(file => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "products" }, (err, result) => {
          if (result) resolve(result.secure_url);
          else reject(err);
        });
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
      }))
    );

    const product = await Product.create({
      title,
      category,
      categoryType,
      sizes: sizes ? JSON.parse(sizes) : [],
      mrp,
      salePrice,
      amazonLink,
      description,
      highlights: highlights ? JSON.parse(highlights) : [],
      images: imageUrls,
    });

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Get product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// UPDATE PRODUCT
// ==========================
// Update Product
export const updateProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      categoryType,
      sizes,
      mrp,
      salePrice,
      amazonLink,
      description,
      highlights,
      existingImages,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const parsedSizes = sizes ? JSON.parse(sizes) : [];
    const parsedHighlights = highlights ? JSON.parse(highlights) : [];
    const parsedExistingImages = existingImages
      ? JSON.parse(existingImages)
      : product.images;

    // Basic update
    product.title = title;
    product.category = category;

    if (category === "garbage bags") {
      product.categoryType = categoryType;
      product.sizes = parsedSizes;
    } else {
      product.categoryType = "";
      product.sizes = [];
    }

    product.mrp = mrp;
    product.salePrice = salePrice;
    product.amazonLink = amazonLink;
    product.description = description;
    product.highlights = parsedHighlights;

    // ✅ IMAGE MERGE SYSTEM
    let updatedImages = [...parsedExistingImages];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        updatedImages.push(result.secure_url);
      }
    }

    product.images = updatedImages;

    await product.save();

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};