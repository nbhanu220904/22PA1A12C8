const axios = require("axios");

const BASE_URL = "http://20.244.56.144/evaluation-service";

const LOG_CONSTRAINTS = {
  stack: ["backend", "frontend"],
  level: ["debug", "info", "warn", "error", "fatal"],
  package: {
    backend: [
      "cache",
      "controller",
      "cron_job",
      "db",
      "domain",
      "handler",
      "repository",
      "route",
      "service",
    ],
    frontend: ["api", "component", "hook", "page", "state", "style"],
    both: ["auth", "config", "middleware", "utils"],
  },
};

let accessToken = null;
let tokenExpiry = null;

async function authenticate(email, name, rollNo, clientID, clientSecret) {
  try {
    const response = await axios.post(`${BASE_URL}/auth`, {
      email,
      name,
      rollNo,
      clientID,
      clientSecret,
    });
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    console.log("Authentication Successful. Token obtained.");
    return accessToken;
  } catch (error) {
    console.error(
      "Authentication Failed:",
      error.response ? error.response.data : error.message
    );
    accessToken = null;
    tokenExpiry = null;
    throw error;
  }
}

function getToken() {
  return accessToken;
}

function isTokenExpired() {
  return !accessToken || !tokenExpiry || Date.now() >= tokenExpiry;
}

const YOUR_EMAIL = "22pa1a12c8@vishnu.edu.in";
const YOUR_NAME = "yaswanth";
const YOUR_ROLL_NO = "22pa1a12c8";
const YOUR_CLIENT_ID = "d74ecff5-a55f-40dd-8494-e9e349b54592";
const YOUR_CLIENT_SECRET = "JFhBZjhQBNnSSmrf";

function validateLogParams(stack, level, packageName) {
  if (!LOG_CONSTRAINTS.stack.includes(stack.toLowerCase())) {
    console.error(
      `Invalid stack: ${stack}. Must be one of ${LOG_CONSTRAINTS.stack.join(
        ", "
      )}`
    );
    return false;
  }
  if (!LOG_CONSTRAINTS.level.includes(level.toLowerCase())) {
    console.error(
      `Invalid level: ${level}. Must be one of ${LOG_CONSTRAINTS.level.join(
        ", "
      )}`
    );
    return false;
  }

  const validPackagesForStack = [];
  if (stack.toLowerCase() === "backend") {
    validPackagesForStack.push(...LOG_CONSTRAINTS.package.backend);
  } else if (stack.toLowerCase() === "frontend") {
    validPackagesForStack.push(...LOG_CONSTRAINTS.package.frontend);
  }
  validPackagesForStack.push(...LOG_CONSTRAINTS.package.both);

  if (!validPackagesForStack.includes(packageName.toLowerCase())) {
    console.error(
      `Invalid package name for ${stack} stack: ${packageName}. Valid packages: ${validPackagesForStack.join(
        ", "
      )}`
    );
    return false;
  }
  return true;
}

async function Log(stack, level, packageName, message) {
  if (!validateLogParams(stack, level, packageName)) {
    console.error("Log parameters are invalid. Skipping API call.");
    return;
  }

  try {
    if (isTokenExpired()) {
      console.log("Token expired or not available. Authenticating...");
      await authenticate(
        YOUR_EMAIL,
        YOUR_NAME,
        YOUR_ROLL_NO,
        YOUR_CLIENT_ID,
        YOUR_CLIENT_SECRET
      );
    }

    const token = getToken();
    if (!token) {
      console.error("Could not obtain access token. Skipping log.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message: message,
    };

    const response = await axios.post(`${BASE_URL}/logs`, payload, { headers });
    console.log("Log created successfully:", response.data);
  } catch (error) {
    console.error(
      "Failed to send log:",
      error.response ? error.response.data : error.message
    );
  }
}

async function runExampleLogs() {
  console.log("--- Attempting to send valid logs ---");

  await Log(
    "backend",
    "error",
    "handler",
    "If an error occurs in your application's handler due to a data type mismatch Log('backend', 'error', 'handler', 'received string, expected bool')"
  );

  await Log(
    "frontend",
    "info",
    "component",
    "User clicked on the submit button."
  );

  await Log(
    "backend",
    "fatal",
    "db",
    "If an error occurs in your application's db layer Log('backend', 'fatal', 'db', 'critical database connection failure.')"
  );

  await Log(
    "backend",
    "debug",
    "middleware",
    "Processing request for user ID 123."
  );
  await Log(
    "frontend",
    "debug",
    "utils",
    "Utility function called for data transformation."
  );

  console.log("\n--- Attempting to send invalid logs (will show errors) ---");

  await Log(
    "unknown",
    "info",
    "controller",
    "This log should fail due to invalid stack."
  );

  await Log(
    "backend",
    "critical",
    "service",
    "This log should fail due to invalid level."
  );

  await Log(
    "backend",
    "warn",
    "api",
    "This log should fail as 'api' is for frontend."
  );

  await Log(
    "frontend",
    "error",
    "repository",
    "This log should fail as 'repository' is for backend."
  );
}

runExampleLogs();
