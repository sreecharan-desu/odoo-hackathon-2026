// k6 load test for the TransitOps API (apps/api). Logs in once in setup(), then hits one endpoint per run.
import http from "k6/http";
import { check } from "k6";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:8000";
const PATH = __ENV.PATH_UNDER_TEST || "/api/vehicles";
const METHOD = __ENV.METHOD || "GET";

export const options = {
  vus: Number(__ENV.VUS || 50),
  duration: __ENV.DURATION || "30s",
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const CREDS = JSON.stringify({ email: "fleet@example.com", password: "Password123!" }); // seed.py demo user
const JSON_H = { "Content-Type": "application/json" };

export function setup() {
  const r = http.post(`${BASE}/api/auth/login`, CREDS, { headers: JSON_H });
  return { token: r.json("access_token") };
}

export default function (data) {
  let res;
  if (METHOD === "LOGIN") {
    res = http.post(`${BASE}/api/auth/login`, CREDS, { headers: JSON_H });
  } else {
    res = http.get(`${BASE}${PATH}`, { headers: { Authorization: `Bearer ${data.token}` } });
  }
  check(res, { "status 200": (r) => r.status === 200 });
}
