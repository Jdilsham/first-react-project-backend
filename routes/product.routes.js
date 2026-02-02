import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * CREATE PRODUCT
 * POST /api/products
 */
router.post("/", async (req, res) => {
  try {
    const {
      productID,
      name,
      category,
      description,
      price,
      labeledPrice,
      images,
      altNames
    } = req.body;

    if (!productID || !name) {
      return res.status(400).json({ message: "productID and name are required" });
    }

    const result = await pool.query(
      `
      INSERT INTO products
      (product_id, name, category, description, price, labeled_price, images, alt_names)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        productID,
        name,
        category,
        description,
        price,
        labeledPrice,
        images,
        altNames
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;


/**
 * GET ALL PRODUCTS
 * GET /api/products
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
