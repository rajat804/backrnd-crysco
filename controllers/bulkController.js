import BulkProduct from "../models/BulkProduct.js";
import cloudinary from "../config/cloudnary.js";

// ✅ CREATE
export const createBulkProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      variants,
      amazonLink,
      description,
      highlights,
    } = req.body;

    const parsedVariants = JSON.parse(variants || "[]");
    const parsedHighlights = JSON.parse(highlights || "[]");

    const uploadedImages = [];

    for (let file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "bulk_products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      uploadedImages.push(result.secure_url);
    }

    const product = await BulkProduct.create({
      title,
      category,
      variants: parsedVariants,
      amazonLink,
      description,
      highlights: parsedHighlights,
      images: uploadedImages,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Create Bulk Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL
export const getBulkProducts = async (req, res) => {
  try {
    const products = await BulkProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching bulk products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET SINGLE
export const getBulkProductById = async (req, res) => {
  try {
    const product = await BulkProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE
export const updateBulkProduct = async (req, res) => {
  try {
    const {
      title,
      category,
      variants,
      amazonLink,
      description,
      highlights,
    } = req.body;

    const parsedVariants = JSON.parse(variants || "[]");
    const parsedHighlights = JSON.parse(highlights || "[]");

    let uploadedImages = [];

    // If new images provided, upload them
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bulk_products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedImages.push(result.secure_url);
      }
    }

    const updatedProduct = await BulkProduct.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        variants: parsedVariants,
        amazonLink,
        description,
        highlights: parsedHighlights,
        ...(uploadedImages.length > 0 && { images: uploadedImages }),
      },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Update Bulk Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE
export const deleteBulkProduct = async (req, res) => {
  try {
    const deleted = await BulkProduct.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Bulk Product deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Bulk Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};