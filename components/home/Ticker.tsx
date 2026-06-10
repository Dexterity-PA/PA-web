"use client";

import { useEffect, useRef, useState } from "react";
import { fallbackTicks, type Tick } from "./tickerFallback";

const WS_URL = "wss://data-stream.binance.vision/ws/btcusdt@miniTicker";
const FLUSH_MS = 2000;
const STALE_MS = 6000;

const fmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Props = { active?: boolean; className?: string };

export default function Ticker({ active = true, className = "" }: Props) {
  const [tick, setTick] = useState<Tick>(fallbackTicks[0]);
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const last = useRef<Tick | null>(null);
  const lastAt = useRef(0);
  const onScreen = useRef(true);

  useEffect(() => {
    if (!active) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          const p = parseFloat(d.c);
          const o = parseFloat(d.o);
          if (!Number.isFinite(p) || !Number.isFinite(o) || o === 0) return;
          last.current = { p, c: ((p - o) / o) * 100 };
          lastAt.current = performance.now();
        } catch {}
      };
    } catch {
      ws = null;
    }
    const io = new IntersectionObserver(([entry]) => {
      onScreen.current = entry.isIntersecting;
    });
    if (root.current) io.observe(root.current);
    let i = 0;
    const id = window.setInterval(() => {
      if (!onScreen.current || document.hidden) return;
      const fresh =
        last.current && performance.now() - lastAt.current < STALE_MS;
      if (fresh && last.current) {
        setTick(last.current);
        setLive(true);
      } else {
        i = (i + 1) % fallbackTicks.length;
        setTick(fallbackTicks[i]);
        setLive(false);
      }
    }, FLUSH_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
      const sock = ws;
      if (sock) {
        sock.onmessage = null;
        // Closing a still-CONNECTING socket logs a browser warning; let it open,
        // then close cleanly (or let the failed connect tear itself down).
        if (sock.readyState === WebSocket.CONNECTING) sock.onopen = () => sock.close();
        else sock.close();
      }
    };
  }, [active]);

  const up = tick.c >= 0;
  return (
    <div
      ref={root}
      className={`flex items-center justify-center gap-4 font-mono text-12 uppercase tracking-label ${className}`}
    >
      <span className="text-text-3">BTC-USDT</span>
      <span className="tabular-nums text-text-2">{fmt.format(tick.p)}</span>
      <span className={`tabular-nums ${up ? "text-accent" : "text-sell"}`}>
        {up ? "+" : ""}
        {tick.c.toFixed(2)}%
      </span>
      <span className="flex items-center gap-1.5 text-text-3">
        <span
          aria-hidden
          className={`h-1 w-1 rounded-full ${live ? "bg-accent" : "bg-text-3"}`}
        />
        {live ? "live" : "sim"}
      </span>
    </div>
  );
}
