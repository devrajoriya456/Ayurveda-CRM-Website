import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Sym4nt3c!",
  database: "ayurveda_crm",
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const MIN_DOB = new Date(Date.UTC(1926, 0, 1));
const MAX_AGE = 100;

function parseAge(age) {
  if (age === undefined || age === null || age === "") {
    return null;
  }
  const parsed = Number(age);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseDateOnly(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }

  return null;
}

function isValidDob(dob) {
  if (!dob) return true;
  const date = parseDateOnly(dob);
  return date !== null && date.getTime() >= MIN_DOB.getTime();
}

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, name, email, password, dob, age, gender, city, state, country, 'admin' AS role, NULL AS is_online
     FROM admin
     WHERE email = ?
     UNION ALL
     SELECT id, name, email, password, dob, age, gender, city, state, country, 'patient' AS role, NULL AS is_online
     FROM patient
     WHERE email = ?
     UNION ALL
     SELECT id, name, email, password, dob, age, gender, city, state, country, 'doctor' AS role, is_online
     FROM doctors
     WHERE email = ?
     LIMIT 1`,
    [email, email, email],
  );

  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function getUsersByRole(role) {
  if (role === "doctor") {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'doctor' AS role, is_online
       FROM doctors`,
    );
    return rows;
  }

  if (role === "patient") {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'patient' AS role, NULL AS is_online
       FROM patient`,
    );
    return rows;
  }

  if (role === "admin") {
    const [rows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'admin' AS role, NULL AS is_online
       FROM admin`,
    );
    return rows;
  }

  return [];
}

async function isEmailTaken(email, includePending = true) {
  const baseQuery = `
    SELECT email FROM admin WHERE email = ?
    UNION ALL
    SELECT email FROM patient WHERE email = ?
    UNION ALL
    SELECT email FROM doctors WHERE email = ?`;

  const query = includePending
    ? `${baseQuery}
       UNION ALL
       SELECT email FROM admin_permissions WHERE email = ?
       LIMIT 1`
    : `${baseQuery}
       LIMIT 1`;

  const params = includePending
    ? [email, email, email, email]
    : [email, email, email];

  const [rows] = await pool.query(query, params);
  return Array.isArray(rows) && rows.length > 0;
}

app.get("/api/users", async (req, res) => {
  try {
    const role = req.query.role ? String(req.query.role) : "";
    if (!role) {
      return res.status(400).json({ error: "Role query parameter is required." });
    }

    const rows = await getUsersByRole(role);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    const email = req.query.email ? String(req.query.email) : "";
    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.get("/api/admin/permissions", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM admin_permissions",
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.post("/api/admin/permissions/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const [permRows] = await pool.query(
      `SELECT id, name, email, password, DATE_FORMAT(dob, '%Y-%m-%d') AS dob, age, gender, city, state, country, occupation, status
       FROM admin_permissions WHERE id = ? LIMIT 1`,
      [id],
    );
    const permission =
      Array.isArray(permRows) && permRows.length > 0 ? permRows[0] : null;
    if (!permission) {
      return res.status(404).json({ error: "Permission request not found." });
    }

    if (permission.status !== "pending") {
      return res.status(400).json({ error: "Permission request is not pending." });
    }

    if (await isEmailTaken(permission.email, false)) {
      return res.status(409).json({ error: "Email is already taken." });
    }

    const parsedAge = parseAge(permission.age);
    if (permission.age !== undefined && permission.age !== null && permission.age !== "" && parsedAge === null) {
      return res.status(400).json({ error: "Pending doctor age must be a valid number." });
    }

    if (parsedAge !== null && (parsedAge < 0 || parsedAge > MAX_AGE)) {
      return res.status(400).json({ error: `Pending doctor age must be between 0 and ${MAX_AGE}.` });
    }

    if (!isValidDob(permission.dob)) {
      return res.status(400).json({ error: "Pending doctor date of birth must be 1926-01-01 or later." });
    }

    await pool.query(
      `INSERT INTO doctors (name, email, password, dob, age, gender, city, state, country, is_online)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        permission.name,
        permission.email,
        permission.password,
        permission.dob,
        parsedAge !== null ? parsedAge : null,
        permission.gender,
        permission.city,
        permission.state,
        permission.country,
      ],
    );

    await pool.query(
      "UPDATE admin_permissions SET status = 'approved', decision_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );

    const user = await findUserByEmail(permission.email);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.post("/api/admin/permissions/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE admin_permissions SET status = 'rejected', decision_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id],
    );
    return res.status(204).end();
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || "").trim();
    const password = String(req.body.password || "");
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/username and password are required." });
    }

    // Check admin table
    const [adminRows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'admin' AS role, NULL AS is_online
       FROM admin
       WHERE (LOWER(TRIM(email)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?))) AND password = ?
       LIMIT 1`,
      [identifier, identifier, password],
    );

    if (Array.isArray(adminRows) && adminRows.length > 0) {
      return res.json(adminRows[0]);
    }

    // Check patient table
    const [patientRows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'patient' AS role, NULL AS is_online
       FROM patient
       WHERE (LOWER(TRIM(email)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?))) AND password = ?
       LIMIT 1`,
      [identifier, identifier, password],
    );

    if (Array.isArray(patientRows) && patientRows.length > 0) {
      return res.json(patientRows[0]);
    }

    // Check doctors table
    const [doctorRows] = await pool.query(
      `SELECT id, name, email, password, dob, age, gender, city, state, country, 'doctor' AS role, is_online
       FROM doctors
       WHERE (LOWER(TRIM(email)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?))) AND password = ?
       LIMIT 1`,
      [identifier, identifier, password],
    );

    if (Array.isArray(doctorRows) && doctorRows.length > 0) {
      return res.json(doctorRows[0]);
    }

    return res.status(401).json({ error: "Invalid credentials." });
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      dob,
      age,
      gender,
      city,
      state,
      country,
      occupation,
    } = req.body;

    if (!name || !email || !password || !occupation) {
      return res.status(400).json({ error: "Name, email, password, and occupation are required." });
    }

    const parsedAge = parseAge(age);
    if (age !== undefined && age !== null && age !== "" && parsedAge === null) {
      return res.status(400).json({ error: "Age must be a valid number." });
    }

    if (parsedAge !== null && (parsedAge < 0 || parsedAge > MAX_AGE)) {
      return res.status(400).json({ error: `Age must be between 0 and ${MAX_AGE}.` });
    }

    if (!isValidDob(dob)) {
      return res.status(400).json({ error: "Date of birth must be 1926-01-01 or later." });
    }

    if (await isEmailTaken(email)) {
      return res.status(409).json({ error: "Email already registered or pending approval." });
    }

    if (occupation === "doctor") {
      await pool.query(
        `INSERT INTO admin_permissions (name, email, password, dob, age, gender, city, state, country, occupation, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          name,
          email,
          password,
          dob || null,
          parsedAge !== null ? parsedAge : null,
          gender || null,
          city || null,
          state || null,
          country || null,
          occupation,
        ],
      );

      return res.status(201).json({ status: "pending", email, occupation: "doctor" });
    }

    if (occupation === "admin") {
      await pool.query(
        `INSERT INTO admin (name, email, password, dob, age, gender, city, state, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          password,
          dob || null,
          parsedAge !== null ? parsedAge : null,
          gender || null,
          city || null,
          state || null,
          country || null,
        ],
      );
    } else {
      await pool.query(
        `INSERT INTO patient (name, email, password, dob, age, gender, city, state, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          password,
          dob || null,
          parsedAge !== null ? parsedAge : null,
          gender || null,
          city || null,
          state || null,
          country || null,
        ],
      );
    }

    const user = await findUserByEmail(email);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: String(error?.message || error) });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
