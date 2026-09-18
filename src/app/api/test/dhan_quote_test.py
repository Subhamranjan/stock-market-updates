from dhanhq import DhanContext, dhanhq
import warnings
import pandas as pd

warnings.filterwarnings("ignore")

CLIENT_ID    = "1108475094"
ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyUmVnaW9uIjoiUjEiLCJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzg4MDU1MTU1LCJpYXQiOjE3ODc5Njg3NTUsInRva2VuQ29uc3VtZXJUeXBlIjoiU0VMRiIsIndlYmhvb2tVcmwiOiIiLCJkaGFuQ2xpZW50SWQiOiIxMTA4NDc1MDk0In0.q4Am7Yls38mOd4DIRY43TNS-miBhEjocvRxeSO4V5YoaWHmHOTsemlxWuIsebhzCW-C7-09801nh49tNiuMEmA"

ctx  = DhanContext(CLIENT_ID, ACCESS_TOKEN)
dhan = dhanhq(ctx)

df = dhan.fetch_security_list("compact")

# Get a few NIFTY option security IDs
nifty_opts = df[
    (df["SEM_SEGMENT"].astype(str) == "D") &
    (df["SEM_EXCH_INSTRUMENT_TYPE"].astype(str) == "OP") &
    (df["SEM_TRADING_SYMBOL"].astype(str).str.startswith("NIFTY-"))
].head(5)

print("Sample NIFTY options:")
print(nifty_opts[["SEM_SMST_SECURITY_ID","SEM_TRADING_SYMBOL","SEM_EXPIRY_DATE","SEM_STRIKE_PRICE","SEM_OPTION_TYPE"]].to_string())

sample_ids = nifty_opts["SEM_SMST_SECURITY_ID"].astype(str).tolist()
print("\nSample security IDs:", sample_ids)

# Test 1 — quote_data with NSE_FNO
print("\n[Test 1] quote_data with NSE_FNO:")
try:
    r = dhan.quote_data(securities={"NSE_FNO": sample_ids})
    print("Status:", r.get("status"))
    print("Data:", str(r.get("data",""))[:300])
except Exception as e:
    print("Error:", e)

# Test 2 — quote_data with D segment
print("\n[Test 2] quote_data with D:")
try:
    r = dhan.quote_data(securities={"D": sample_ids})
    print("Status:", r.get("status"))
    print("Data:", str(r.get("data",""))[:300])
except Exception as e:
    print("Error:", e)

# Test 3 — ohlc_data
print("\n[Test 3] ohlc_data with NSE_FNO:")
try:
    r = dhan.ohlc_data(securities={"NSE_FNO": sample_ids})
    print("Status:", r.get("status"))
    print("Data:", str(r.get("data",""))[:300])
except Exception as e:
    print("Error:", e)

# Test 4 — ticker_data (LTP only)
print("\n[Test 4] ticker_data with NSE_FNO:")
try:
    r = dhan.ticker_data(securities={"NSE_FNO": sample_ids})
    print("Status:", r.get("status"))
    print("Data:", str(r.get("data",""))[:300])
except Exception as e:
    print("Error:", e)

# Test 5 — market_quote
print("\n[Test 5] market_quote:")
try:
    r = dhan.quote_data(
        securities={"NSE_FNO": [sample_ids[0]]}
    )
    print("Full response:", str(r)[:500])
except Exception as e:
    print("Error:", e)

# Test 6 — check what exchange segment code works
print("\n[Test 6] Trying all segment codes for quote_data:")
for seg in ["NSE_FNO","BSE_FNO","D","NSE","BSE","IDX_I","I"]:
    try:
        r = dhan.quote_data(securities={seg: [sample_ids[0]]})
        status = r.get("status")
        data   = r.get("data",{})
        print(f"  {seg}: status={status} data_keys={list(data.keys()) if isinstance(data,dict) else str(data)[:50]}")
        if status == "success" and data:
            print(f"  ✓ WORKS with seg={seg}")
    except Exception as e:
        print(f"  {seg}: ERROR - {e}")

print("\nDone.")
