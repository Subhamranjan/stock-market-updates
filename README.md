# 📈 Stock Dashboard

A real-time stock market dashboard built with Next.js, PostgreSQL, and Python.

---

## 🚀 Features

- Real-time stock price tracking (NSE, BSE, NASDAQ, NYSE, and more)
- Target and stoploss tracking with P&L calculation
- Index compare chart (Nifty 50 vs sectoral/thematic indices)
- Option chain viewer (via Dhan API)
- Commodity prices (Gold, Silver, Crude Oil, etc.)
- Global market clocks with open/close countdown
- Drag and drop card reordering
- Dark / Light mode
- Data persisted in PostgreSQL

---

## 🛠 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | Next.js 16, React, Tailwind CSS   |
| Backend     | Next.js API Routes (TypeScript)   |
| Database    | PostgreSQL                        |
| Market Data | Yahoo Finance (unofficial), Dhan API |
| Option Data | Python FastAPI microservice       |
| Charts      | Custom SVG (no library)           |

---

## 📁 Project Structure

stock_data/
├── src/
│ ├── app/
│ │ ├── page.js # Main dashboard
│ │ ├── actions.ts # Server actions (getQuote, getHistory)
│ │ ├── globals.css
│ │ ├── layout.js
│ │ └── api/
│ │ ├── watchlist/
│ │ │ ├── route.ts # GET, POST watchlist
│ │ │ └── [id]/
│ │ │ └── route.ts # PUT, DELETE watchlist item
│ │ ├── clocks/
│ │ │ └── route.ts # GET, PUT market clocks
│ │ ├── options/
│ │ │ └── route.ts # GET option chain (proxy to Python)
│ │ └── index-history/
│ │ └── route.ts # GET index history from PostgreSQL
│ └── lib/
│ └── db.ts # PostgreSQL connection pool
├── src/app/option_server.py # Python FastAPI for option chain
├── .env.local # Environment variables
└── README.md


---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/stock_data.git
cd stock_data
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up PostgreSQL

```bash
# Create database and user
sudo -u postgres psql
CREATE USER stockuser WITH PASSWORD 'yourpassword';
CREATE DATABASE stockdashboard OWNER stockuser;
GRANT ALL PRIVILEGES ON DATABASE stockdashboard TO stockuser;
\q

# Run schema
psql postgresql://stockuser:yourpassword@localhost:5432/stockdashboard \
  -f src/app/db/schema.sql
```

### 4. Configure environment

```bash
# .env.local
DATABASE_URL=postgresql://stockuser:yourpassword@localhost:5432/stockdashboard
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🐍 Option Chain Server (Python)

Required for live option chain data via Dhan API.

### Setup

```bash
pip install fastapi uvicorn dhanhq pandas
```

### Configure

Edit `src/app/option_server.py`:

```python
DHAN_CLIENT_ID    = "your_client_id"
DHAN_ACCESS_TOKEN = "your_access_token"
```

### Run

```bash
cd src/app
python option_server.py
```

Runs on `http://localhost:8001`

> **Note:** Requires Dhan trading account with API access enabled at [dhanhq.co](https://dhanhq.co)

---

## 🗄️ Database Schema

```sql
-- Watchlist
CREATE TABLE watchlist (
    id         SERIAL PRIMARY KEY,
    symbol     VARCHAR(30) NOT NULL,
    market     VARCHAR(20) NOT NULL DEFAULT 'NSE',
    target     NUMERIC DEFAULT 0,
    stop_loss  NUMERIC DEFAULT 0,
    buy_price  NUMERIC DEFAULT 0,
    qty        INTEGER DEFAULT 1,
    side       VARCHAR(10) DEFAULT 'buy',
    mode       VARCHAR(10) DEFAULT 'trade',
    entry_date DATE,
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market clocks visibility
CREATE TABLE market_clocks (
    id         SERIAL PRIMARY KEY,
    label      VARCHAR(30) NOT NULL UNIQUE,
    visible    BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nifty index historical data
CREATE TABLE nifty_index (
    "Date"           DATE,
    "Open"           NUMERIC(10,2),
    "High"           NUMERIC(10,2),
    "Low"            NUMERIC(10,2),
    "Close"          NUMERIC(10,2),
    "Shares Traded"  BIGINT,
    "Turnover (₹ Cr)" NUMERIC(12,2),
    "Ticker"         VARCHAR(50)
);
```

---

## 📊 Market Data Sources

| Data              | Source                  | Notes                        |
|-------------------|-------------------------|------------------------------|
| Stock prices      | Yahoo Finance           | Unofficial, ~15 sec delay    |
| Index prices      | Yahoo Finance           | Free, no auth required       |
| Historical data   | Yahoo Finance           | Up to 5 years                |
| Option chain      | Dhan API                | Requires trading account     |
| Index OHLCV       | PostgreSQL (nifty_index)| Imported from NSE website    |

---

## 🌍 Supported Markets

| Exchange | Suffix | Currency |
|----------|--------|----------|
| NSE      | .NS    | ₹ INR    |
| BSE      | .BO    | ₹ INR    |
| NASDAQ   | —      | $ USD    |
| NYSE     | —      | $ USD    |
| Tokyo    | .T     | ¥ JPY    |
| London   | .L     | £ GBP    |
| Hong Kong| .HK    | HK$      |
| Shanghai | .SS    | ¥ CNY    |
| Singapore| .SI    | S$ SGD   |
| Australia| .AX    | A$ AUD   |
| Korea    | .KS    | ₩ KRW    |
| Canada   | .TO    | C$ CAD   |

---

## ⚠️ Limitations

- Yahoo Finance is unofficial — may break without notice
- NSE option chain API blocks server-side requests
- Dhan API market data requires subscription
- Historical data for Indian indices limited to what is stored in PostgreSQL
- Not suitable for production trading — use official broker APIs

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

- [Yahoo Finance](https://finance.yahoo.com) — market data
- [Dhan](https://dhanhq.co) — option chain data
- [Next.js](https://nextjs.org) — framework
- [Tailwind CSS](https://tailwindcss.com) — styling
- [NSE India](https://nseindia.com) — index historical data
