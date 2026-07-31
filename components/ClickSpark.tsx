"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const sparksRef = useRef<Spark[]>([]);
  const animationRef = useRef<number | null>(null);

  // =========================
  // Resize canvas
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctxRef.current = ctx;
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(parent);

    window.addEventListener("resize", resizeCanvas);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // =========================
  // easing
  // =========================
  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;

        case "ease-in":
          return t * t;

        case "ease-in-out":
          return t < 0.5
            ? 2 * t * t
            : -1 + (4 - 2 * t) * t;

        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  // =========================
  // animation
  // =========================
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      if (!canvas || !ctx) {
        animationRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;

        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 =
          spark.x +
          distance * Math.cos(spark.angle);

        const y1 =
          spark.y +
          distance * Math.sin(spark.angle);

        const x2 =
          spark.x +
          (distance + lineLength) *
            Math.cos(spark.angle);

        const y2 =
          spark.y +
          (distance + lineLength) *
            Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (sparksRef.current.length > 0) {
        animationRef.current =
          requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    },
    [
      duration,
      easeFunc,
      sparkRadius,
      sparkSize,
      sparkColor,
      extraScale,
    ]
  );

  // =========================
  // cleanup
  // =========================
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // =========================
  // click
  // =========================
  const handleClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();

    for (let i = 0; i < sparkCount; i++) {
      sparksRef.current.push({
        x,
        y,
        angle: (Math.PI * 2 * i) / sparkCount,
        startTime: now,
      });
    }

    if (animationRef.current === null) {
      animationRef.current =
        requestAnimationFrame(animate);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {children}
    </div>
  );
};

export default ClickSpark;