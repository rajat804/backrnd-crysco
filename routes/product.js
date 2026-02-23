import express from "express";
import multer from "multer";
import { addProduct, getProducts, getProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// CRUD
router.post("/", upload.array("images", 10), addProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.single("image",10), updateProduct);
router.delete("/:id", deleteProduct);

export default router;