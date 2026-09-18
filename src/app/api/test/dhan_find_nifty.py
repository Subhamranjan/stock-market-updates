from dhanhq import DhanContext, dhanhq
import pandas as pd

# ── Fill these ────────────────────────────────────────────────────────────────
CLIENT_ID    = "your_client_id_here"
ACCESS_TOKEN = "your_access_token_here"
# ─────────────────────────────────────────────────────────────────────────────

ctx  = DhanContext(CLIENT_ID, ACCESS_TOKEN)
dhan = dhanhq(ctx)

print("Fetching security list...")
df = dhan.fetch_security_list("compact")

print(f"Total instruments: {len(df)}")
print(f"Columns: {list(df.columns)}\n")

# ── Find all IDX segment instruments ─────────────────────────────────────────
print("=" * 60)
print("All IDX_I segment instruments:")
print("=" * 60)
idx_df = df[df["SEM_SEGMENT"].astype(str).str.contains("IDX_I", na=False)]
print(idx_df[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SM_SYMBOL_NAME"]].to_string())

# ── Find NIFTY specifically ───────────────────────────────────────────────────
print("\n" + "=" * 60)
print("All instruments with NIFTY in name:")
print("=" * 60)
nifty_df = df[df["SM_SYMBOL_NAME"].astype(str).str.contains("NIFTY", case=False, na=False)]
print(nifty_df[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SM_SYMBOL_NAME"]].head(30).to_string())

# ── All unique segments ───────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("All unique segments in instrument list:")
print("=" * 60)
print(df["SEM_SEGMENT"].unique())

# ── Test option chain with IDX_I security IDs ────────────────────────────────
print("\n" + "=" * 60)
print("Testing option_chain with IDX_I instruments...")
print("=" * 60)

if len(idx_df) > 0:
    for _, row in idx_df.iterrows():
        sid  = int(row["SEM_SMST_SECURITY_ID"])
        name = str(row["SM_SYMBOL_NAME"])
        seg  = str(row["SEM_SEGMENT"])
        try:
            result = dhan.option_chain(
                under_security_id=sid,
                under_exchange_segment=seg,
                expiry=""
            )
            status = result.get("status")
            data   = result.get("data", [])
            dlen   = len(data) if isinstance(data, list) else str(data)[:50]
            print(f"  [{sid}] {name} ({seg}): status={status}, rows={dlen}")
            if status == "success" and isinstance(data, list) and len(data) > 0:
                print(f"  SUCCESS! security_id={sid}, segment={seg}, name={name}")
        except Exception as e:
            print(f"  [{sid}] {name}: ERROR - {e}")
else:
    print("  No IDX_I instruments found. Showing all unique segments...")
    print(df["SEM_SEGMENT"].value_counts())
    print("\nNSE_FNO NIFTY instruments:")
    fno_nifty = df[
        df["SEM_SEGMENT"].astype(str).str.contains("NSE_FNO", na=False) &
        df["SM_SYMBOL_NAME"].astype(str).str.contains("NIFTY", case=False, na=False)
    ]
    print(fno_nifty[["SEM_SMST_SECURITY_ID", "SEM_SEGMENT", "SEM_EXCH_INSTRUMENT_TYPE", "SM_SYMBOL_NAME"]].head(10).to_string())

print("\nDone.")
