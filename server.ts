import express from "express";
import { RSI, BollingerBands } from "technicalindicators";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API Routes
app.get("/api/market", async (req, res) => {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Market data fetch error:", error);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

app.get("/api/indicators", async (req, res) => {
  try {
    const response = await fetch("https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1w&limit=100");
    const data = await response.json();
    const closes = data.map((d) => parseFloat(d[4]));

    const rsiInput = { values: closes, period: 14 };
    const rsiResult = RSI.calculate(rsiInput);
    const currentRsi = rsiResult[rsiResult.length - 1];

    const bbInput = { period: 20, values: closes, stdDev: 2 };
    const bbResult = BollingerBands.calculate(bbInput);
    const currentBb = bbResult[bbResult.length - 1];
    const currentPrice = closes[closes.length - 1];

    let signalType = 'hold';
    let signalText = '⏳ 持仓观望 (WAIT)';
    let signalClass = 'bg-warn/10 border-warn text-warn';

    if (currentRsi > 70 && currentPrice > currentBb.upper) {
      signalType = 'sell';
      signalText = '🔥 强逃顶共振 (EXIT)';
      signalClass = 'bg-down/10 border-down text-down';
    } else if (currentRsi < 35 && currentPrice < currentBb.lower) {
      signalType = 'buy';
      signalText = '💰 强抄底共振 (BUY)';
      signalClass = 'bg-up/10 border-up text-up';
    }

    res.json({
      rsi: currentRsi,
      bb: currentBb,
      price: currentPrice,
      signalType,
      signalText,
      signalClass
    });
  } catch (error) {
    console.error("Indicators fetch error:", error);
    res.status(500).json({ error: "Failed to fetch indicators" });
  }
});

// Serve static files from dist
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
