# TransitOps — Demo scripts (team)

**URL:** http://localhost:8080  
**Password (all roles):** `Password123!`  
**Money:** ₹ · ROI revenue = ₹40 / completed trip km  

Reset before judging (clean spine):

```bash
docker compose down -v && docker compose up --build
# or with custom ports:
WEB_PORT=8080 BACKEND_PORT=8002 POSTGRES_PORT=5433 docker-compose down -v
WEB_PORT=8080 BACKEND_PORT=8002 POSTGRES_PORT=5433 docker-compose up --build
```

---

## Demo spine (use these names on screen)

| Thing | Exact value | Why |
|-------|-------------|-----|
| Primary vehicle | **MH04AB1234** (Van 05) | Available, **500 kg** capacity |
| In Shop vehicle | **DL01XY9876** (Truck 12) | Cannot dispatch |
| Retired vehicle | **GJ05ZZ5555** (Van 99) | Hidden from dispatch pool |
| Good driver | **Alex** | Valid license · linked to `driver@` |
| Bad driver | **Expired Sam** | Expired license → blocked |

| Role | Login |
|------|--------|
| Fleet Manager | `fleet@example.com` |
| Driver | `driver@example.com` |
| Safety Officer | `safety@example.com` |
| Financial Analyst | `finance@example.com` |

---

## Who does what (4 people)

| Person | Role in demo | Owns on screen |
|--------|----------------|----------------|
| **SreeCharan** | Narrator + stack | Opening, architecture one-liner, API rules, reset if anything breaks |
| **Mohan** | Landing / brand | Landing page + theme toggle (30–40s) |
| **Bhanu** | Ops console | Dashboard → Fleet → Trips happy path + fail beats |
| **Anand** | Data + finance close | Seed story, Drivers/Safety, Analytics CSV + PDF |

Keep **one laptop** shared (or one shared screen). Others stand by with lines below — do not fight for the mouse.

**Total live time target: 4–5 minutes** (plus 30s buffer).

---

## Master script (say this / show this)

### 0. Prep (2 min before — SreeCharan)

- [ ] App healthy at `/api/health`
- [ ] Fresh seed if needed
- [ ] Sidebar **expanded** (labels visible)
- [ ] Browser zoom 100–110%
- [ ] Trips board: scroll past Cancelled or create a fresh Draft so first cards aren’t all red
- [ ] Bookmark logins in notepad

---

### 1. Hook + landing (0:00–0:40) — Mohan speaks, SreeCharan clicks

**Show:** `/` landing (dark)

**Say (Mohan):**  
> “TransitOps is a smart transport operations platform — fleet, drivers, dispatch, maintenance, fuel, and analytics — with business rules enforced in the API, not only in the UI.”

**Do:**
1. Point at hero + brand
2. Toggle light/dark once (prove theme)
3. Click **Login** / **Request Demo**

**Say (SreeCharan, 10s):**  
> “Stack is PostgreSQL, FastAPI, React, Docker Compose — one command to run.”

---

### 2. Auth + RBAC (0:40–1:10) — Bhanu

**Show:** `/login` → sign in as **Fleet Manager**

**Do:**
1. Email `fleet@example.com` / `Password123!`
2. Point at note: *role comes from the account* (no role dropdown)
3. Land on **Operations Overview** dashboard

**Say:**  
> “Four desks — Fleet Manager, Driver, Safety, Finance — same product, different nav.”

*(Optional 15s later: quick logout → `safety@` or `finance@` to flash different sidebar — only if time.)*

---

### 3. Live KPIs (1:10–1:35) — Bhanu

**Show:** Dashboard

**Do:**
1. Point KPI cards: Active / Available / In Maintenance / Active trips / Utilization
2. Point donut: Available · On Trip · In Shop · Retired
3. Flick filters Type / Status / Region once

**Say:**  
> “This is live data from Postgres — not a static mock.”

---

### 4. Fleet spine (1:35–2:00) — Bhanu

**Show:** Vehicle Registry

**Do:**
1. Search `MH04AB1234` → **Van 05**, Available, **500 kg**
2. Search `DL01XY9876` → **In Shop**
3. Mention `GJ05ZZ5555` is **Retired** (excluded from dispatch)

**Say:**  
> “Statuses drive the dispatch pool — In Shop and Retired never appear as assignable vehicles.”

---

### 5. Drivers + compliance (2:00–2:25) — Anand

**Show:** Driver Roster

**Do:**
1. Search **Alex** → valid license, Available
2. Search **Expired Sam** → expired license (setup for fail beat)

**Say:**  
> “License expiry is enforced when assigning a trip — Safety Officer desk focuses on this compliance view.”

---

### 6. Happy path trip (2:25–3:25) — Bhanu (core of the demo)

**Show:** Trip Dispatch

**Do — create:**
1. Source: `Gandhinagar Depot`
2. Destination: `Ahmedabad Hub`
3. Vehicle: **MH04AB1234** (500 kg)
4. Driver: **Alex**
5. Cargo: **450** (show capacity bar OK)
6. Distance: `40`
7. **Create Draft**

**Do — dispatch:**
1. Click **Dispatch** on that draft
2. Point statuses → vehicle + driver **On Trip**

**Say:**  
> “450 is under 500, so dispatch is allowed. Both assets lock to On Trip so they can’t take a second job.”

**Do — complete (fast):**
1. Complete with final odometer + fuel
2. Point both back to **Available**

**Say:**  
> “Complete records odometer and fuel — costs feed analytics.”

---

### 7. Fail beats (3:25–4:00) — Bhanu (prove rules)

Do **two** of these (don’t overdo):

| Fail | Action | Expected |
|------|--------|----------|
| Overweight | Same vehicle, cargo **600** (or 9999) | Blocked — over capacity |
| Expired license | Driver **Expired Sam** | Blocked — expired license |
| In Shop | Try to pick **DL01XY9876** | Not in dispatch pool |

**Say:**  
> “Rules live in the FastAPI service layer — the UI can’t bypass them.”

---

### 8. Maintenance (4:00–4:25) — Bhanu

**Show:** Shop & Maintenance

**Do:**
1. Open maintenance on **MH04AB1234** (or show existing open job on Truck 12)
2. Vehicle → **In Shop**
3. Back to Trips → confirm vehicle **gone from dispatch pool**

**Say:**  
> “Open maintenance removes the vehicle from dispatch until the job is closed.”

*(If time: close job → Available again.)*

---

### 9. Finance close (4:25–4:55) — Anand

**Show:** Fleet Reports / Analytics

**Do:**
1. Point Avg Fuel Efficiency + Utilization
2. Point cost breakdown bars (Fuel / Maintenance / Other)
3. Click **Export CSV**
4. Click **Export PDF** — open the PDF briefly (branded report)

**Say:**  
> “Finance gets operational cost and ROI in rupees — CSV for sheets, PDF for submission packs.”

---

### 10. Close (4:55–5:10) — SreeCharan

**Say:**  
> “TransitOps covers the full lifecycle: register → dispatch → complete → maintain → report, with four roles and API-enforced rules. Repo runs with Docker Compose; docs and seed are in the README.”

Stop. Don’t keep clicking.

---

## Backup lines (if asked)

| Question | Who answers | Answer |
|----------|-------------|--------|
| Why not Firebase? | SreeCharan | Own Postgres + FastAPI — real CRUD and rules |
| Driver role? | Bhanu | `driver@` → trip desk; Alex linked to that user |
| PDF? | Anand | ReportLab `/api/reports/operational.pdf` |
| Mobile? | Mohan / Bhanu | Responsive landing + app shell breakpoints |
| Seed size? | Anand | Compact realistic set + fixed demo spine plates |

---

## What NOT to show

- Don’t dig through Cancelled-only noise — create a fresh trip first if the board looks red
- Don’t demo SMTP email (needs config)
- Don’t claim live GPS / passenger ridership (landing marketing only)
- Don’t open random PRs or git history during judging

---

## 60-second emergency script (if cut short)

1. Landing → Login fleet  
2. Dashboard KPIs  
3. Trip: MH04AB1234 + Alex + 450 → Dispatch  
4. Overweight or Expired Sam → error  
5. Analytics → Export PDF  

Done.
