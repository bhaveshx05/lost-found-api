const pool = require("../database/db");

async function getItems(filters = {}) {
  const values = [];
  const conditions = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.category) {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }
  if (filters.location) {
    values.push(`%${filters.location}%`);
    conditions.push(`location ILIKE $${values.length}`);
  }
  if (filters.date) {
    values.push(filters.date);
    conditions.push(`date = $${values.length}`);
  }

  let query = "SELECT * FROM lost_and_found";
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY created_at DESC";

  try {
    const { rows } = await pool.query(query, values);
    return rows;
  } catch (err) {
    console.error("Error fetching items:", err);
    throw err;
  }
}

async function getItemById(id) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM lost_and_found WHERE id = $1",
      [id],
    );
    return rows[0] || null;
  } catch (err) {
    console.error("Error fetching item by ID:", err);
    throw err;
  }
}

async function addItem(item) {
  const {
    title,
    description,
    status,
    category,
    location,
    date,
    contact_info,
    image_url,
  } = item;

  const query = `
    INSERT INTO lost_and_found 
    (title, description, status, category, location, date, contact_info, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    title,
    description,
    status,
    category,
    location,
    date,
    contact_info,
    image_url,
  ];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error("Error adding item:", err);
    throw err;
  }
}

async function updateItem(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in updates) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  values.push(id);

  const query = `
    UPDATE lost_and_found
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING *;
  `;

  try {
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  } catch (err) {
    console.error("Error updating item:", err);
    throw err;
  }
}

async function deleteItem(id) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM lost_and_found WHERE id = $1",
      [id],
    );
    return rowCount > 0;
  } catch (err) {
    console.error("Error deleting item:", err);
    throw err;
  }
}

module.exports = { getItems, getItemById, addItem, updateItem, deleteItem };
