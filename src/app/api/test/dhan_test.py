from dhanhq import DhanContext, dhanhq

# ── Fill these ────────────────────────────────────────────────────────────────
CLIENT_ID    = "1108475094"
ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyUmVnaW9uIjoiUjEiLCJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzg4MDU1MTU1LCJpYXQiOjE3ODc5Njg3NTUsInRva2VuQ29uc3VtZXJUeXBlIjoiU0VMRiIsIndlYmhvb2tVcmwiOiIiLCJkaGFuQ2xpZW50SWQiOiIxMTA4NDc1MDk0In0.q4Am7Yls38mOd4DIRY43TNS-miBhEjocvRxeSO4V5YoaWHmHOTsemlxWuIsebhzCW-C7-09801nh49tNiuMEmA"
# ─────────────────────────────────────────────────────────────────────────────

print("=" * 60)
print("Dhan API Test Script")
print("=" * 60)

ctx  = DhanContext(CLIENT_ID, ACCESS_TOKEN)
dhan = dhanhq(ctx)

# ── Test 1: Fund limits (basic token validity check) ─────────────────────────
print("\n[1] Testing token with get_fund_limits()...")
try:
    result = dhan.get_fund_limits()
    print("Result:", result)
    if isinstance(result, dict) and result.get("status") == "success":
        print("✓ Token is VALID")
    else:
        print("✗ Token may be INVALID or EXPIRED")
        print("  Please regenerate token from Dhan app")
except Exception as e:
    print("✗ Error:", e)

# ── Test 2: Expiry list with different security IDs ───────────────────────────
print("\n[2] Testing expiry_list with different NIFTY security IDs...")
for sid in [13, 26000, 26009, 26074, 99926000]:
    try:
        result = dhan.expiry_list(
            under_security_id=sid,
            under_exchange_segment="IDX_I"
        )
        status = result.get("status", "unknown")
        data   = result.get("data", "")
        print(f"  security_id={sid}: status={status}, data={str(data)[:80]}")
    except Exception as e:
        print(f"  security_id={sid}: ERROR - {e}")

# ── Test 3: Option chain with different security IDs ─────────────────────────
print("\n[3] Testing option_chain with different NIFTY security IDs...")
for sid in [13, 26000, 26009]:
    try:
        result = dhan.option_chain(
            under_security_id=sid,
            under_exchange_segment="IDX_I",
            expiry=""
        )
        status = result.get("status", "unknown")
        data   = result.get("data", [])
        print(f"  security_id={sid}: status={status}, data_len={len(data) if isinstance(data, list) else data}")
    except Exception as e:
        print(f"  security_id={sid}: ERROR - {e}")

# ── Test 4: List all available methods ───────────────────────────────────────
print("\n[4] Available dhanhq methods:")
methods = [m for m in dir(dhan) if not m.startswith("_")]
print("  " + ", ".join(methods))

# ── Test 5: Fetch security list to find NIFTY ────────────────────────────────
print("\n[5] Searching for NIFTY in security list...")
try:
    sec_list = dhan.fetch_security_list("compact")
    print("  Security list type:", type(sec_list))
    if isinstance(sec_list, list):
        nifty_entries = [s for s in sec_list if "NIFTY" in str(s).upper() and "IDX" in str(s).upper()]
        print(f"  Found {len(nifty_entries)} NIFTY index entries:")
        for entry in nifty_entries[:10]:
            print("   ", entry)
    else:
        print("  Raw:", str(sec_list)[:300])
except Exception as e:
    print("  Error:", e)

print("\n" + "=" * 60)
print("Test complete. Paste the output here.")
print("=" * 60)
