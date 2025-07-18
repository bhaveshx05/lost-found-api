require("dotenv").config();
const express = require("express");
const isAdmin = require("./middlewares/isAdmin");
const { isUser } = require("./middlewares/isUser");
const app = express();
const {
  getItems,
  getItemById,
  addItem,
  updateItem,
  deleteItem,
} = require("./controllers/items");
const { userLogin, adminLogin } = require("./controllers/login");
const pool = require("./database/db");

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Lost & Found API is running");
});

// GET /items : Fetch all items with optional filters
app.get("/items", async (req, res) => {
  try {
    const items = await getItems(req.query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET /items/:id : Fetch a specific item
app.get("/items/:id", async (req, res) => {
  try {
    const item = await getItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// POST /items : Add a new item
app.post("/items", async (req, res) => {
  try {
    const { title, status } = req.body;
    if (!title || !status) {
      return res.status(400).json({ error: "Title and status are required" });
    }
    if (!["Lost", "Found"].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be "Lost" or "Found"' });
    }

    const newItem = await addItem(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

// PUT /items/:id : Update an item
app.put("/items/:id", isUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user = req.user; // { email, role }

  try {
    // Get the existing item to check ownership
    const { rows } = await pool.query(
      "SELECT * FROM lost_and_found WHERE id = $1",
      [id],
    );
    const existingItem = rows[0];

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check permissions:
    if (user.role !== "admin" && existingItem.created_by !== user.email) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this item" });
    }

    // Optional: Validate allowed update fields
    const allowedFields = [
      "title",
      "description",
      "status",
      "category",
      "location",
      "date",
      "contact_info",
      "image_url",
    ];
    for (const key in updates) {
      if (!allowedFields.includes(key)) {
        return res
          .status(400)
          .json({ error: `Field '${key}' cannot be updated` });
      }
    }

    // Optional: Validate status if included
    if (updates.status && !["Lost", "Found"].includes(updates.status)) {
      return res
        .status(400)
        .json({ error: 'Status must be "Lost" or "Found"' });
    }

    const updatedItem = await updateItem(id, updates);
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /items/:id : Delete an item (admin only)
app.delete("/items/:id", isAdmin, async (req, res) => {
  try {
    const success = await deleteItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

//admin and user login
app.post("/login/user", userLogin);
app.post("/login/admin", adminLogin);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lost & Found API server running on http://localhost:${PORT}`);
});
