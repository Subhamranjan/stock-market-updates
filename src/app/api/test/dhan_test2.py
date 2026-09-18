from dhanhq import DhanContext, dhanhq

CLIENT_ID    = "1108475094"
ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VyUmVnaW9uIjoiUjEiLCJpc3MiOiJkaGFuIiwicGFydG5lcklkIjoiIiwiZXhwIjoxNzg4MDU1MTU1LCJpYXQiOjE3ODc5Njg3NTUsInRva2VuQ29uc3VtZXJUeXBlIjoiU0VMRiIsIndlYmhvb2tVcmwiOiIiLCJkaGFuQ2xpZW50SWQiOiIxMTA4NDc1MDk0In0.q4Am7Yls38mOd4DIRY43TNS-miBhEjocvRxeSO4V5YoaWHmHOTsemlxWuIsebhzCW-C7-09801nh49tNiuMEmA"

ctx  = DhanContext(CLIENT_ID, ACCESS_TOKEN)
dhan = dhanhq(ctx)

import warnings
warnings.filterwarnings("ignore")

df = dhan.fetch_security_list("compact")

# ── Show segment I instruments ────────────────────────────────────────────────
print("=" * 60)
print("Segment 'I' instruments (likely INDEX):")
print("=" * 60)
seg_i = df[df["SEM_SEGMENT"].astype(str) == "I"]
print(seg_i[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SEM_TRADING_SYMBOL", "SM_SYMBOL_NAME"]].to_string())

# ── Show segment D instruments with NIFTY ────────────────────────────────────
print("\n" + "=" * 60)
print("Segment 'D' instruments with NIFTY in trading symbol:")
print("=" * 60)
seg_d_nifty = df[
    (df["SEM_SEGMENT"].astype(str) == "D") &
    (df["SEM_TRADING_SYMBOL"].astype(str).str.contains("NIFTY", case=False, na=False))
]
print(seg_d_nifty[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SEM_TRADING_SYMBOL", "SEM_EXPIRY_DATE", "SEM_STRIKE_PRICE", "SEM_OPTION_TYPE"]].head(20).to_string())

# ── Get unique instrument types in segment D ──────────────────────────────────
print("\n" + "=" * 60)
print("Unique instrument types in segment D:")
print("=" * 60)
print(df[df["SEM_SEGMENT"].astype(str) == "D"]["SEM_EXCH_INSTRUMENT_TYPE"].value_counts().head(20))

# ── Find OPTIDX in segment D ──────────────────────────────────────────────────
print("\n" + "=" * 60)
print("OPTIDX instruments in segment D (NIFTY options):")
print("=" * 60)
optidx = df[
    (df["SEM_SEGMENT"].astype(str) == "D") &
    (df["SEM_EXCH_INSTRUMENT_TYPE"].astype(str).str.contains("OPTIDX|OPT", case=False, na=False)) &
    (df["SEM_TRADING_SYMBOL"].astype(str).str.contains("NIFTY", case=False, na=False))
]
print(optidx[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SEM_TRADING_SYMBOL", "SEM_EXPIRY_DATE", "SEM_STRIKE_PRICE", "SEM_OPTION_TYPE"]].head(20).to_string())

# ── Now test option_chain with segment I security IDs ─────────────────────────
print("\n" + "=" * 60)
print("Testing option_chain with segment I IDs...")
print("=" * 60)

# Dhan API segment mapping
seg_map = {
    "I": ["IDX_I", "NSE", "NSE_EQ", "BSE", "BSE_EQ", "I"],
    "D": ["NSE_FNO", "BSE_FNO", "D"],
}

for _, row in seg_i.iterrows():
    sid  = str(row["SEM_SMST_SECURITY_ID"])
    name = str(row["SM_SYMBOL_NAME"])
    sym  = str(row["SEM_TRADING_SYMBOL"])
    for seg_code in ["IDX_I", "NSE", "NSE_EQ"]:
        try:
            result = dhan.option_chain(
                under_security_id=int(sid),
                under_exchange_segment=seg_code,
                expiry=""
            )
            status = result.get("status")
            data   = result.get("data", [])
            if status == "success":
                print(f"  SUCCESS! sid={sid} sym={sym} seg={seg_code} rows={len(data) if isinstance(data,list) else data}")
                break
            else:
                print(f"  fail: sid={sid} sym={sym} seg={seg_code} status={status}")
        except Exception as e:
            print(f"  error: sid={sid} seg={seg_code} - {e}")
    break  # test first one only

# ── Also try expiry_list ──────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("Testing expiry_list with segment I IDs...")
print("=" * 60)
for _, row in seg_i.iterrows():
    sid  = str(row["SEM_SMST_SECURITY_ID"])
    name = str(row["SM_SYMBOL_NAME"])
    for seg_code in ["IDX_I", "NSE", "NSE_EQ", "I"]:
        try:
            result = dhan.expiry_list(
                under_security_id=int(sid),
                under_exchange_segment=seg_code
            )
            status = result.get("status")
            data   = result.get("data", "")
            if status == "success":
                print(f"  SUCCESS expiry! sid={sid} name={name} seg={seg_code} data={str(data)[:100]}")
                break
        except Exception as e:
            print(f"  error expiry: sid={sid} seg={seg_code} - {e}")
    break

print("\nDone.")
