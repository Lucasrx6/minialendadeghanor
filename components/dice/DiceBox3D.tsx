"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface DiceBox3DHandle {
  addDie: (sides: number) => void;
  clear: () => void;
  updateThemeColor: (color: string) => void;
}

export interface DiceResult {
  sides: number;
  value: number;
}

interface Props {
  onRollStart?: () => void;
  onRollComplete: (results: DiceResult[]) => void;
  themeColor?: string;
}

let _seq = 0;

export const DiceBox3D = forwardRef<DiceBox3DHandle, Props>(
  function DiceBox3D({ onRollStart, onRollComplete, themeColor = "#b45309" }, ref) {
    const containerId = useRef(`dice3d-${++_seq}`);
    const boxRef = useRef<any>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const pendingRef = useRef<number[]>([]);

    const onCompleteRef = useRef(onRollComplete);
    onCompleteRef.current = onRollComplete;
    const onStartRef = useRef(onRollStart);
    onStartRef.current = onRollStart;

    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const { default: DiceBox } = await import("@3d-dice/dice-box");
          if (cancelled) return;

          const box = new DiceBox(`#${containerId.current}`, {
            assetPath: "/dice-box/",
            startingHeight: 8,
            spinForce: 4,
            throwForce: 3,
            scale: 16,
            gravity: 1,
            friction: 0.8,
            restitution: 0,
            angularDamping: 0.4,
            linearDamping: 0.4,
            settleTimeout: 5000,
            offscreen: true,
            theme: "default",
            themeColor,
          });

          await box.init();
          if (cancelled) return;

          box.onRollComplete = (results: any[]) => {
            onCompleteRef.current(
              results.map((r: any) => ({ sides: r.sides, value: r.value }))
            );
          };

          boxRef.current = box;
          setStatus("ready");

          for (const sides of pendingRef.current.splice(0)) {
            if (cancelled) break;
            box.add(`1d${sides}`);
          }
        } catch (err) {
          console.error("[DiceBox3D]", err);
          if (!cancelled) setStatus("error");
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      addDie(sides: number) {
        onStartRef.current?.();
        if (!boxRef.current) {
          pendingRef.current.push(sides);
          return;
        }
        boxRef.current.add(`1d${sides}`);
      },
      clear() {
        pendingRef.current = [];
        boxRef.current?.clear();
      },
      updateThemeColor(color: string) {
        boxRef.current?.updateConfig({ themeColor: color });
      },
    }));

    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div id={containerId.current} style={{ position: "absolute", inset: 0 }} />
        {status === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#78716c", fontSize: 13 }}>Preparando dados 3D…</span>
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#f87171", fontSize: 13 }}>Erro ao carregar dados 3D</span>
          </div>
        )}
      </div>
    );
  }
);
