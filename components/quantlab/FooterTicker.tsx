"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { spring } from "@/lib/motion";

type Trade = { id: number; price: number; qty: number; sell: boolean };

const fallback: Trade[] = [
  { id: 1, price: 97412.3, qty: 0.042, sell: false },
  { id: 2, price: 97411.8, qty: 0.105, sell: true },
  { id: 3, price: 97413.1, qty: 0.018, sell: false },
  { id: 4, price: 97413.6, qty: 0.33, sell: false },
  { id: 5, price: 97412.0, qty: 0.071, sell: true },
  { id: 6, price: 97410.4, qty: 0.255, sell: true },
  { id: 7, price: 97411.2, qty: 0.012, sell: false },
  { id: 8, price: 97414.9, qty: 0.148, sell: false },
  { id: 9, price: 97414.2, qty: 0.06, sell: true },
  { id: 10, price: 97415.5, qty: 0.021, sell: false },
  { id: 11, price: 97415.1, qty: 0.09, sell: true },
  { id: 12, price: 97416.0, qty: 0.187, sell: false },
];

const WS_URL = "wss://data-stream.binance.vision/ws/btcusdt@aggTrade";
const FLUSH_MS = 600;
const KEEP = 12;

// Size with 3–4 significant figures so small aggTrades read as their real size
// instead of collapsing to 0.000 under a fixed 3-decimal format.
const fmtQty = (q: number) => q.toLocaleString("en-US", { maximumSignificantDigits: 4 });

export default function FooterTicker() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const buf = useRef<Trade[]>([]);
  const [trades, setTrades] = useState<Trade[]>(fallback);

  useEffect(() => {
    if (reduce || typeof WebSocket === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let ws: WebSocket | null = null;
    let flush: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      ws?.close();
      ws = null;
      if (flush) clearInterval(flush);
      flush = null;
    };
    const start = () => {
      if (ws) return;
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        return;
      }
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(e.data as string);
          buf.current.push({ id: m.a, price: +m.p, qty: +m.q, sell: m.m });
        } catch {}
      };
      ws.onerror = stop;
      flush = setInterval(() => {
        if (!buf.current.length) return;
        const next = buf.current.splice(0).reverse().slice(0, KEEP);
        setTrades((t) => [...next, ...t].slice(0, KEEP));
      }, FLUSH_MS);
    };

    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [reduce]);

  // Trades render newest-first, so each trade's predecessor is the next entry.
  // Direction is the sign of its price change; equal prints carry the last move.
  const dirs = useMemo(() => {
    const out = new Array(trades.length).fill(1);
    for (let i = trades.length - 2; i >= 0; i--) {
      const d = trades[i].price - trades[i + 1].price;
      out[i] = d > 0 ? 1 : d < 0 ? -1 : out[i + 1];
    }
    return out;
  }, [trades]);

  return (
    <div
      ref={ref}
      className="flex items-center gap-8 overflow-hidden border-b border-border px-6 py-3 whitespace-nowrap [mask-image:linear-gradient(to_right,black_85%,transparent)]"
    >
      <span className="font-mono text-12 uppercase tracking-label text-text-3">
        BTC-USDT
      </span>
      {trades.map((t, i) => {
        const up = dirs[i] >= 0;
        return (
          <motion.span
            key={t.id}
            className="font-mono text-12"
            style={{ color: up ? "var(--accent)" : "var(--sell)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : spring}
          >
            {up ? "▲" : "▼"} {t.price.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{" "}
            · {fmtQty(t.qty)}
          </motion.span>
        );
      })}
    </div>
  );
}
