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
      altNames,
      stock
    } = req.body;

    if (!productID || !name) {
      return res.status(400).json({ message: "productID and name are required" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const result = await pool.query(
      `
      INSERT INTO products
      (product_id, name, category, description, price, labeled_price, images, alt_names, stock)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
        altNames,
        stock ?? 0
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

/**
 * UPDATE PRODUCT
 * PUT /api/products/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productID,
      name,
      category,
      description,
      price,
      labeledPrice,
      images,
      altNames,
      stock
    } = req.body;

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const result = await pool.query(
      `
      UPDATE products
      SET
        product_id = COALESCE($1, product_id),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        labeled_price = COALESCE($6, labeled_price),
        images = COALESCE($7, images),
        alt_names = COALESCE($8, alt_names),
        stock = COALESCE($9, stock)
      WHERE id = $10
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
        altNames,
        stock,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;