#!/usr/bin/env python3
"""Vast live integration tests for TransitOps API (run against a live stack)."""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8080"
PASSWORDS = "Password123!"


@dataclass
class Results:
    passed: int = 0
    failed: int = 0
    skipped: int = 0
    lines: list[str] = field(default_factory=list)

    def ok(self, name: str, detail: str = "") -> None:
        self.passed += 1
        self.lines.append(f"PASS  {name}" + (f" — {detail}" if detail else ""))

    def bad(self, name: str, detail: str = "") -> None:
        self.failed += 1
        self.lines.append(f"FAIL  {name}" + (f" — {detail}" if detail else ""))

    def skip(self, name: str, detail: str = "") -> None:
        self.skipped += 1
        self.lines.append(f"SKIP  {name}" + (f" — {detail}" if detail else ""))


R = Results()


def call(
    method: str,
    path: str,
    data: Any | None = None,
    token: str | None = None,
    expect: int | None = None,
) -> tuple[int, Any]:
    headers: dict[str, str] = {}
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            code = resp.status
    except urllib.error.HTTPError as e:
        raw = e.read()
        code = e.code
    try:
        parsed: Any = json.loads(raw.decode() or "null")
    except Exception:
        parsed = raw.decode(errors="replace")
    if expect is not None and code != expect:
        raise AssertionError(f"{method} {path} expected {expect} got {code}: {parsed}")
    return code, parsed


def expect_code(name: str, method: str, path: str, expect: int, **kwargs: Any) -> Any:
    try:
        code, body = call(method, path, expect=expect, **kwargs)
        R.ok(name, f"{code}")
        return body
    except Exception as e:
        R.bad(name, str(e)[:200])
        return None


def expect_fail(name: str, method: str, path: str, expect: int, **kwargs: Any) -> None:
    code, body = call(method, path, **kwargs)
    if code == expect:
        R.ok(name, f"{code}")
    else:
        R.bad(name, f"expected {expect} got {code}: {str(body)[:160]}")


def login(email: str) -> str:
    _, body = call("POST", "/api/auth/login", {"email": email, "password": PASSWORDS}, expect=200)
    return body["access_token"]


def find_by(items: list[dict], key: str, value: Any) -> dict | None:
    for it in items:
        if it.get(key) == value:
            return it
    return None


def all_items(path: str, token: str, page_size: int = 100) -> list[dict]:
    out: list[dict] = []
    offset = 0
    while True:
        _, page = call("GET", f"{path}?limit={page_size}&offset={offset}", token=token, expect=200)
        items = page.get("items") or []
        out.extend(items)
        total = page.get("total", len(out))
        offset += page_size
        if offset >= total or not items:
            break
    return out


def main() -> int:
    print(f"Vast integration tests → {BASE}\n")

    # ── 0. Health / public ─────────────────────────────────────────────
    expect_code("health", "GET", "/api/health", 200)
    expect_fail("no-token vehicles", "GET", "/api/vehicles", 401)
    expect_fail("no-token kpis", "GET", "/api/dashboard/kpis", 401)
    expect_fail("bad-token kpis", "GET", "/api/dashboard/kpis", 401, token="x.y.z")

    # ── 1. Login all roles ─────────────────────────────────────────────
    tokens: dict[str, str] = {}
    for email, role in [
        ("fleet@example.com", "fleet_manager"),
        ("driver@example.com", "driver"),
        ("safety@example.com", "safety_officer"),
        ("finance@example.com", "financial_analyst"),
    ]:
        try:
            tok = login(email)
            me = call("GET", "/api/auth/me", token=tok, expect=200)[1]
            if me.get("role") != role:
                R.bad(f"login {role}", f"got role {me.get('role')}")
            else:
                R.ok(f"login {role}", me.get("email"))
            tokens[role] = tok
        except Exception as e:
            R.bad(f"login {role}", str(e)[:160])

    fleet = tokens.get("fleet_manager")
    driver = tokens.get("driver")
    safety = tokens.get("safety_officer")
    finance = tokens.get("financial_analyst")
    if not fleet:
        print("Cannot continue without fleet login")
        print("\n".join(R.lines))
        return 1

    # ── 2. Pagination shape ────────────────────────────────────────────
    page = expect_code("vehicles page shape", "GET", "/api/vehicles?limit=5&offset=0", 200, token=fleet)
    if page and {"items", "total", "limit", "offset"} <= set(page.keys()) and page["limit"] == 5:
        R.ok("pagination keys")
    else:
        R.bad("pagination keys", str(page)[:120])

    page2 = call("GET", "/api/vehicles?limit=5&offset=5", token=fleet, expect=200)[1]
    if page and page2 and page["items"] and page2["items"]:
        ids1 = {v["id"] for v in page["items"]}
        ids2 = {v["id"] for v in page2["items"]}
        if ids1.isdisjoint(ids2):
            R.ok("pagination offset distinct")
        else:
            R.bad("pagination offset distinct", "pages overlap")

    # ── 3. Seed spine presence ─────────────────────────────────────────
    vehicles = all_items("/api/vehicles", fleet)
    drivers = all_items("/api/drivers", fleet)
    van05 = find_by(vehicles, "registration_number", "VAN-05")
    trk12 = find_by(vehicles, "registration_number", "TRK-12")
    van99 = find_by(vehicles, "registration_number", "VAN-99")
    alex = find_by(drivers, "name", "Alex")
    expired = find_by(drivers, "name", "Expired Sam")

    for label, obj, pred in [
        ("VAN-05 exists", van05, lambda v: v and v["status"] in ("Available", "On Trip", "In Shop")),
        ("TRK-12 In Shop", trk12, lambda v: v and v["status"] == "In Shop"),
        ("VAN-99 Retired", van99, lambda v: v and v["status"] == "Retired"),
        ("Alex exists", alex, lambda d: d is not None),
        ("Expired Sam exists", expired, lambda d: d is not None),
    ]:
        if pred(obj):
            R.ok(label, str(obj.get("status") if isinstance(obj, dict) else ""))
        else:
            R.bad(label, str(obj))

    # ── 4. Dispatch pool rules ─────────────────────────────────────────
    pool = expect_code("dispatch-pool", "GET", "/api/vehicles/dispatch-pool", 200, token=fleet) or []
    pool_regs = {v["registration_number"] for v in pool}
    if "TRK-12" not in pool_regs and "VAN-99" not in pool_regs:
        R.ok("pool excludes In Shop / Retired")
    else:
        R.bad("pool excludes In Shop / Retired", str(pool_regs & {"TRK-12", "VAN-99"}))
    if any(v["status"] != "Available" for v in pool):
        R.bad("pool only Available", "non-available found")
    else:
        R.ok("pool only Available", f"n={len(pool)}")

    # ── 5. Business rule rejects ───────────────────────────────────────
    if alex and trk12:
        expect_fail(
            "reject trip TRK-12 In Shop",
            "POST",
            "/api/trips",
            400,
            token=fleet,
            data={
                "source": "A",
                "destination": "B",
                "vehicle_id": trk12["id"],
                "driver_id": alex["id"],
                "cargo_weight": 100,
                "planned_distance": 10,
            },
        )
    if alex and van99:
        expect_fail(
            "reject trip VAN-99 Retired",
            "POST",
            "/api/trips",
            400,
            token=fleet,
            data={
                "source": "A",
                "destination": "B",
                "vehicle_id": van99["id"],
                "driver_id": alex["id"],
                "cargo_weight": 100,
                "planned_distance": 10,
            },
        )
    if expired and van05 and van05["status"] == "Available":
        expect_fail(
            "reject Expired Sam",
            "POST",
            "/api/trips",
            400,
            token=fleet,
            data={
                "source": "A",
                "destination": "B",
                "vehicle_id": van05["id"],
                "driver_id": expired["id"],
                "cargo_weight": 100,
                "planned_distance": 10,
            },
        )
    if alex and van05 and van05["status"] == "Available":
        expect_fail(
            "reject overweight cargo",
            "POST",
            "/api/trips",
            400,
            token=fleet,
            data={
                "source": "A",
                "destination": "B",
                "vehicle_id": van05["id"],
                "driver_id": alex["id"],
                "cargo_weight": van05["max_load_kg"] + 50,
                "planned_distance": 10,
            },
        )

    # ── 6. Happy path trip lifecycle (use a free pool vehicle ≠ VAN-05 if busy) ─
    pool_now = call("GET", "/api/vehicles/dispatch-pool", token=fleet, expect=200)[1]
    avail_drivers = [
        d
        for d in all_items("/api/drivers", fleet)
        if d["status"] == "Available" and d["name"] != "Expired Sam"
    ]
    trip_vehicle = next((v for v in pool_now if v["registration_number"] != "VAN-05"), None) or (
        pool_now[0] if pool_now else None
    )
    trip_driver = avail_drivers[0] if avail_drivers else None

    if trip_vehicle and trip_driver:
        trip = expect_code(
            "create draft trip",
            "POST",
            "/api/trips",
            200,
            token=fleet,
            data={
                "source": "Depot Test",
                "destination": "Hub Test",
                "vehicle_id": trip_vehicle["id"],
                "driver_id": trip_driver["id"],
                "cargo_weight": min(100, trip_vehicle["max_load_kg"]),
                "planned_distance": 25,
            },
        )
        if trip:
            tid = trip["id"]
            if trip.get("status") != "Draft":
                R.bad("trip status Draft", trip.get("status"))
            else:
                R.ok("trip status Draft")

            dispatched = expect_code("dispatch trip", "POST", f"/api/trips/{tid}/dispatch", 200, token=fleet)
            if dispatched and dispatched.get("status") == "Dispatched":
                R.ok("trip Dispatched")
            v_after = call("GET", f"/api/vehicles/{trip_vehicle['id']}", token=fleet, expect=200)[1]
            d_after = call("GET", f"/api/drivers/{trip_driver['id']}", token=fleet, expect=200)[1]
            if v_after["status"] == "On Trip" and d_after["status"] == "On Trip":
                R.ok("assets On Trip after dispatch")
            else:
                R.bad("assets On Trip after dispatch", f"v={v_after['status']} d={d_after['status']}")

            # double-book vehicle should fail
            if avail_drivers[1:]:
                expect_fail(
                    "reject double-book On Trip vehicle",
                    "POST",
                    "/api/trips",
                    400,
                    token=fleet,
                    data={
                        "source": "X",
                        "destination": "Y",
                        "vehicle_id": trip_vehicle["id"],
                        "driver_id": avail_drivers[1]["id"],
                        "cargo_weight": 10,
                        "planned_distance": 5,
                    },
                )

            odo = float(v_after["odometer"])
            completed = expect_code(
                "complete trip",
                "POST",
                f"/api/trips/{tid}/complete",
                200,
                token=fleet,
                data={"final_odometer": odo + 30, "fuel_consumed": 4.5, "fuel_cost": 500},
            )
            if completed and completed.get("status") == "Completed":
                R.ok("trip Completed")
            v_done = call("GET", f"/api/vehicles/{trip_vehicle['id']}", token=fleet, expect=200)[1]
            d_done = call("GET", f"/api/drivers/{trip_driver['id']}", token=fleet, expect=200)[1]
            if v_done["status"] == "Available" and d_done["status"] == "Available":
                R.ok("assets Available after complete")
            else:
                R.bad("assets Available after complete", f"v={v_done['status']} d={d_done['status']}")
            if float(v_done["odometer"]) >= odo + 30:
                R.ok("odometer advanced")
            else:
                R.bad("odometer advanced", str(v_done["odometer"]))

            expect_fail(
                "reject complete odometer decrease",
                "POST",
                f"/api/trips/{tid}/complete",
                400,
                token=fleet,
                data={"final_odometer": 0, "fuel_consumed": 1, "fuel_cost": 1},
            )
    else:
        R.skip("trip lifecycle", "no free vehicle/driver in pool")

    # ── 7. Cancel path ─────────────────────────────────────────────────
    pool2 = call("GET", "/api/vehicles/dispatch-pool", token=fleet, expect=200)[1]
    drivers2 = [
        d
        for d in all_items("/api/drivers", fleet)
        if d["status"] == "Available" and d["name"] != "Expired Sam"
    ]
    if pool2 and drivers2:
        t2 = call(
            "POST",
            "/api/trips",
            {
                "source": "C1",
                "destination": "C2",
                "vehicle_id": pool2[0]["id"],
                "driver_id": drivers2[0]["id"],
                "cargo_weight": 10,
                "planned_distance": 5,
            },
            token=fleet,
            expect=200,
        )[1]
        call("POST", f"/api/trips/{t2['id']}/dispatch", token=fleet, expect=200)
        cancelled = expect_code("cancel dispatched trip", "POST", f"/api/trips/{t2['id']}/cancel", 200, token=fleet)
        if cancelled and cancelled.get("status") == "Cancelled":
            R.ok("trip Cancelled")
        v3 = call("GET", f"/api/vehicles/{pool2[0]['id']}", token=fleet, expect=200)[1]
        if v3["status"] == "Available":
            R.ok("vehicle Available after cancel")
        else:
            R.bad("vehicle Available after cancel", v3["status"])
    else:
        R.skip("cancel path", "no free assets")

    # ── 8. Maintenance open/close ──────────────────────────────────────
    pool3 = call("GET", "/api/vehicles/dispatch-pool", token=fleet, expect=200)[1]
    if pool3:
        vid = pool3[0]["id"]
        log = expect_code(
            "open maintenance",
            "POST",
            "/api/maintenance",
            200,
            token=fleet,
            data={"vehicle_id": vid, "title": "Vast Test Service", "description": "integration", "estimated_cost": 1500},
        )
        v_shop = call("GET", f"/api/vehicles/{vid}", token=fleet, expect=200)[1]
        if v_shop["status"] == "In Shop":
            R.ok("vehicle In Shop after open maint")
        else:
            R.bad("vehicle In Shop after open maint", v_shop["status"])
        pool_check = {v["id"] for v in call("GET", "/api/vehicles/dispatch-pool", token=fleet, expect=200)[1]}
        if vid not in pool_check:
            R.ok("In Shop hidden from dispatch pool")
        else:
            R.bad("In Shop hidden from dispatch pool")
        if log:
            closed = expect_code("close maintenance", "POST", f"/api/maintenance/{log['id']}/close", 200, token=fleet)
            if closed and closed.get("status") == "Closed":
                R.ok("maintenance Closed")
            v_back = call("GET", f"/api/vehicles/{vid}", token=fleet, expect=200)[1]
            if v_back["status"] == "Available":
                R.ok("vehicle Available after close maint")
            else:
                R.bad("vehicle Available after close maint", v_back["status"])
    else:
        R.skip("maintenance cycle", "no available vehicle")

    # ── 9. Fuel + expenses ─────────────────────────────────────────────
    if van05:
        expect_code(
            "log fuel",
            "POST",
            "/api/fuel-logs",
            200,
            token=fleet,
            data={"vehicle_id": van05["id"], "liters": 12.5, "cost": 1200, "trip_id": None},
        )
        expect_code(
            "log expense",
            "POST",
            "/api/expenses",
            200,
            token=fleet,
            data={"vehicle_id": van05["id"], "category": "Tolls", "amount": 250, "note": "vast test"},
        )
        cost = expect_code(
            "operational-cost",
            "GET",
            f"/api/vehicles/{van05['id']}/operational-cost",
            200,
            token=fleet,
        )
        if cost and {"fuel_cost", "maintenance_cost", "total_operational_cost", "roi", "fuel_efficiency_km_per_l"} <= set(
            cost.keys()
        ):
            R.ok("operational-cost fields")
        else:
            R.bad("operational-cost fields", str(cost)[:160])

        bulk = expect_code(
            "operational-costs bulk",
            "GET",
            "/api/reports/operational-costs",
            200,
            token=fleet,
        )
        items = bulk.get("items") if isinstance(bulk, dict) else bulk
        if isinstance(items, list) and items and "registration_number" in items[0] and "total_operational_cost" in items[0]:
            R.ok("operational-costs bulk fields", f"n={len(items)}")
        else:
            R.bad("operational-costs bulk fields", str(bulk)[:160])

    csv_code, csv_body = call("GET", "/api/reports/operational.csv", token=fleet)
    if csv_code == 200 and isinstance(csv_body, str) and "registration_number" in csv_body:
        R.ok("CSV report", f"bytes~{len(csv_body)}")
    else:
        R.bad("CSV report", f"{csv_code}")

    # ── 10. KPIs ───────────────────────────────────────────────────────
    kpis = expect_code("dashboard kpis", "GET", "/api/dashboard/kpis", 200, token=fleet)
    if kpis:
        needed = {
            "active_vehicles",
            "available_vehicles",
            "vehicles_in_shop",
            "active_trips",
            "pending_trips",
            "drivers_on_duty",
            "fleet_utilization_pct",
        }
        if needed <= set(kpis.keys()):
            R.ok("kpi fields present")
        else:
            R.bad("kpi fields present", str(set(kpis.keys())))

    # ── 11. RBAC matrix ────────────────────────────────────────────────
    if driver:
        expect_fail(
            "driver cannot create vehicle",
            "POST",
            "/api/vehicles",
            403,
            token=driver,
            data={
                "registration_number": f"DENY-{int(time.time())}",
                "name": "No",
                "vehicle_type": "Van",
                "max_load_kg": 100,
                "odometer": 0,
                "acquisition_cost": 0,
            },
        )
        expect_fail(
            "driver cannot open maintenance",
            "POST",
            "/api/maintenance",
            403,
            token=driver,
            data={"vehicle_id": 1, "title": "x", "description": "y", "estimated_cost": 1},
        )
        expect_fail(
            "driver cannot dispatch",
            "POST",
            "/api/trips/1/dispatch",
            403,
            token=driver,
        )
        expect_fail(
            "driver cannot read operational cost",
            "GET",
            f"/api/vehicles/{van05['id'] if van05 else 1}/operational-cost",
            403,
            token=driver,
        )
        expect_fail(
            "driver cannot read operational costs bulk",
            "GET",
            "/api/reports/operational-costs",
            403,
            token=driver,
        )
    if safety:
        expect_fail(
            "safety cannot create vehicle",
            "POST",
            "/api/vehicles",
            403,
            token=safety,
            data={
                "registration_number": f"SAFE-{int(time.time())}",
                "name": "No",
                "vehicle_type": "Van",
                "max_load_kg": 100,
                "odometer": 0,
                "acquisition_cost": 0,
            },
        )
        # safety can create driver
        expect_code(
            "safety can create driver",
            "POST",
            "/api/drivers",
            200,
            token=safety,
            data={
                "name": f"Safety Hire {int(time.time()) % 100000}",
                "license_number": f"DL-SAFE-{int(time.time())}",
                "license_category": "LMV",
                "license_expiry": (date.today() + timedelta(days=400)).isoformat(),
                "contact_number": "+91-9000099999",
                "safety_score": 88,
            },
        )
    if finance:
        expect_code(
            "finance can log expense",
            "POST",
            "/api/expenses",
            200,
            token=finance,
            data={"vehicle_id": van05["id"] if van05 else 1, "category": "Other", "amount": 10, "note": "rbac"},
        )
        expect_fail(
            "finance cannot dispatch",
            "POST",
            "/api/trips/1/dispatch",
            403,
            token=finance,
        )

    # ── 12. CRUD uniqueness ────────────────────────────────────────────
    stamp = int(time.time())
    created_v = expect_code(
        "create vehicle",
        "POST",
        "/api/vehicles",
        200,
        token=fleet,
        data={
            "registration_number": f"TST-{stamp}",
            "name": "Test Van",
            "vehicle_type": "Van",
            "max_load_kg": 400,
            "odometer": 1000,
            "acquisition_cost": 500000,
            "region": "West",
        },
    )
    if created_v:
        expect_fail(
            "reject duplicate plate",
            "POST",
            "/api/vehicles",
            409,
            token=fleet,
            data={
                "registration_number": f"TST-{stamp}",
                "name": "Dup",
                "vehicle_type": "Van",
                "max_load_kg": 400,
                "odometer": 0,
                "acquisition_cost": 0,
            },
        )
        expect_code(
            "patch vehicle",
            "PATCH",
            f"/api/vehicles/{created_v['id']}",
            200,
            token=fleet,
            data={"region": "North"},
        )

    # ── 13. Validation errors ──────────────────────────────────────────
    expect_fail(
        "invalid login",
        "POST",
        "/api/auth/login",
        401,
        data={"email": "fleet@example.com", "password": "wrong"},
    )
    expect_fail(
        "invalid email register",
        "POST",
        "/api/auth/register",
        422,
        data={"email": "not-an-email", "name": "X", "password": "Password123!", "role": "driver"},
    )

    # ── Report ─────────────────────────────────────────────────────────
    print("\n".join(R.lines))
    print(
        f"\n=== SUMMARY ===\nPASS={R.passed}  FAIL={R.failed}  SKIP={R.skipped}  "
        f"TOTAL={R.passed + R.failed + R.skipped}"
    )
    return 1 if R.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
