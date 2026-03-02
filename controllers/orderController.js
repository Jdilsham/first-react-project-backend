import pool from "../config/db.js"; 

function makeOrderIdFromNumber(n) {
  return "CBC" + String(n).padStart(7, "0");
}

export async function createOrder(req, res) {
  const client = await pool.connect();

  try {
    const { customerName, email, phone, address, items } = req.body;

    // ✅ validation
    if (!customerName || !email || !phone || !address) {
      return res.status(400).json({ message: "Missing customer details" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    for (const it of items) {
      if (!it.productID || !it.name || it.price == null || it.quantity == null || !it.image) {
        return res.status(400).json({
          message: "Each item must have productID, name, price, quantity, image",
        });
      }
      if (Number(it.quantity) < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
    }

    // ✅ compute total from items (don’t trust client)
    const total = items.reduce(
      (sum, it) => sum + Number(it.price) * Number(it.quantity),
      0
    );

    await client.query("BEGIN");

    // ✅ generate next CBC id safely
    // lock ensures two requests won't generate same ID
    const last = await client.query(
      `SELECT order_id FROM orders ORDER BY id DESC LIMIT 1 FOR UPDATE`
    );

    let nextNumber = 1;
    if (last.rows.length > 0) {
      const lastId = last.rows[0].order_id; // CBC0000001
      const lastNo = parseInt(lastId.slice(3), 10) || 0;
      nextNumber = lastNo + 1;
    }

    const newOrderId = makeOrderIdFromNumber(nextNumber);

    // ✅ insert order
    await client.query(
      `INSERT INTO orders (order_id, customer_name, email, phone, address, total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [newOrderId, customerName, email, phone, address, total, "Pending"]
    );

    // ✅ insert items
    const insertItemSql = `
      INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
      VALUES ($1,$2,$3,$4,$5,$6)
    `;

    for (const it of items) {
      await client.query(insertItemSql, [
        newOrderId,
        String(it.productID),
        String(it.name),
        Number(it.price),
        Number(it.quantity),
        String(it.image),
      ]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      orderID: newOrderId,
      total,
      status: "Pending",
    });
  } catch (err) {
    await client.query("ROLLBACK");

    // unique error (rare if locked properly, but safe)
    if (err.code === "23505") {
      return res.status(409).json({ message: "Duplicate order id. Try again." });
    }

    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    client.release();
  }
}