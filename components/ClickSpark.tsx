// Optimized ClickSpark.tsx
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

export default function ClickSpark({
  sparkColor="#fff",
  sparkSize=10,
  sparkRadius=15,
  sparkCount=8,
  duration=400,
  easing="ease-out",
  extraScale=1,
  children
}: ClickSparkProps){

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D|null>(null);

  const sparksRef = useRef<Spark[]>([]);
  const animationRef = useRef<number|null>(null);
  const lastFrameRef = useRef(0);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;

    const resize=()=>{
      const dpr = window.devicePixelRatio || 1;

      canvas.width = window.innerWidth*dpr;
      canvas.height = window.innerHeight*dpr;
      canvas.style.width="100vw";
      canvas.style.height="100vh";

      const ctx = canvas.getContext("2d");
      if(!ctx) return;

      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctxRef.current=ctx;
    };

    resize();
    window.addEventListener("resize",resize);

    return ()=>window.removeEventListener("resize",resize);
  },[]);

  const easeFunc = useCallback((t:number)=>{
    switch(easing){
      case "linear": return t;
      case "ease-in": return t*t;
      case "ease-in-out":
        return t<0.5 ? 2*t*t : -1+(4-2*t)*t;
      default:
        return t*(2-t);
    }
  },[easing]);

  const animate = useCallback((timestamp:number)=>{
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if(!canvas || !ctx){
      animationRef.current=null;
      return;
    }

    if(timestamp-lastFrameRef.current < 1000/30){
      animationRef.current=requestAnimationFrame(animate);
      return;
    }

    lastFrameRef.current=timestamp;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle=sparkColor;
    ctx.lineWidth=2;
    ctx.beginPath();

    sparksRef.current=sparksRef.current.filter(spark=>{
      const elapsed=timestamp-spark.startTime;
      if(elapsed>=duration) return false;
      const progress=elapsed/duration;
      const eased=easeFunc(progress);

      const distance=eased*sparkRadius*extraScale;
      const length=sparkSize*(1-eased);

      const cos=Math.cos(spark.angle);
      const sin=Math.sin(spark.angle);

      const x1=spark.x+distance*cos;
      const y1=spark.y+distance*sin;
      const x2=spark.x+(distance+length)*cos;
      const y2=spark.y+(distance+length)*sin;

      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);

      return true;
    });

    ctx.stroke();

    if(sparksRef.current.length){
      animationRef.current=requestAnimationFrame(animate);
    }else{
      animationRef.current=null;
    }
  },[duration,easeFunc,extraScale,sparkColor,sparkRadius,sparkSize]);

  useEffect(()=>{
    return ()=>{
      if(animationRef.current!==null){
        cancelAnimationFrame(animationRef.current);
      }
    };
  },[]);

  const handleClick=(e:React.MouseEvent<HTMLDivElement>)=>{
    const canvas=canvasRef.current;
    if(!canvas) return;

    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;
    const now=performance.now();

    for(let i=0;i<sparkCount;i++){
      sparksRef.current.push({
        x,
        y,
        angle:(Math.PI*2*i)/sparkCount,
        startTime:now
      });
    }

    if(animationRef.current===null){
      animationRef.current=requestAnimationFrame(animate);
    }
  };

  return (
    <div onClick={handleClick} style={{position:"relative",width:"100%",height:"100%"}}>
      <canvas
        ref={canvasRef}
        style={{
          position:"fixed",
          inset:0,
          width:"100vw",
          height:"100vh",
          pointerEvents:"none",
          zIndex:9999
        }}
      />
      {children}
    </div>
  );
}