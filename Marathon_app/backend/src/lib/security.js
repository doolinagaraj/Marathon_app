import crypto from "crypto";

export function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function newToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function newOtpCode() {
  // 6-digit numeric code
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

