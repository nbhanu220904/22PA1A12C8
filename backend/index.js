// server.js (or index.js)
const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory store
const urlStore = {};

// Helper to validate shortcode
function isValidShortcode(code) {
  const regex = /^[a-zA-Z0-9]{4,10}$/;
  return regex.test(code);
}

// Bulk shortener route
app.post("/shorturls/bulk", (req, res) => {
  const entries = req.body;

  if (!Array.isArray(entries) || entries.length === 0) {
    return res
      .status(400)
      .json({ error: "Request must be a non-empty array." });
  }

  const result = [];

  for (const entry of entries) {
    const { url, validity, shortcode } = entry;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Each entry must include a valid 'url'." });
    }

    let code = shortcode || nanoid(6);

    if (shortcode) {
      if (!isValidShortcode(shortcode)) {
        return res
          .status(400)
          .json({ error: `Invalid shortcode: ${shortcode}` });
      }
      if (urlStore[shortcode]) {
        return res
          .status(409)
          .json({ error: `Shortcode already exists: ${shortcode}` });
      }
    } else {
      while (urlStore[code]) {
        code = nanoid(6);
      }
    }

    const minutes = validity ? parseInt(validity) : 30;
    const expiry = new Date(Date.now() + minutes * 60 * 1000);

    urlStore[code] = { originalUrl: url, expiry };

    result.push({
      shortlink: `http://localhost:${PORT}/${code}`,
      expiry,
    });
  }

  res.status(201).json(result);
});

// Redirection route
app.get("/:code", (req, res) => {
  const { code } = req.params;
  const entry = urlStore[code];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode does not exist." });
  }

  if (new Date() > entry.expiry) {
    delete urlStore[code];
    return res.status(410).json({ error: "Link has expired." });
  }

  res.redirect(entry.originalUrl);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
