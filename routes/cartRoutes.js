import express from "express";
const router = express.Router();

// Example route
router.post("/", async (req, res) => {
  res.json({ message: "Add to cart route works!" });
});

export default router; // ✅ default export