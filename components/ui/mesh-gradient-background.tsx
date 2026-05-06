"use client"

import { cn } from "@/lib/utils"

export interface MeshGradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  colors?: string[]
  speed?: number
  backgroundColor?: string
}

export function MeshGradientBackground({
  className,
  children,
  colors = ["#7c3aed", "#2563eb", "#06b6d4", "#8b5cf6"],
  speed = 1,
  backgroundColor = "#030014",
}: MeshGradientBackgroundProps) {
  const duration1 = 60 / speed
  const duration2 = 80 / speed
  const duration3 = 90 / speed
  const duration4 = 70 / speed

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} style={{ backgroundColor }}>
      <div className="absolute inset-0">
        <div
          className="absolute h-[80%] w-[80%] rounded-full"
          style={{
            left: "-20%",
            top: "-20%",
            background: `radial-gradient(circle, ${colors[0]}cc 0%, transparent 70%)`,
            filter: "blur(40px)",
            animation: `meshMove1 ${duration1}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute h-[70%] w-[70%] rounded-full"
          style={{
            right: "-15%",
            top: "5%",
            background: `radial-gradient(circle, ${colors[1]}b0 0%, transparent 70%)`,
            filter: "blur(50px)",
            animation: `meshMove2 ${duration2}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute h-[75%] w-[90%] rounded-full"
          style={{
            left: "10%",
            bottom: "-25%",
            background: `radial-gradient(circle, ${colors[2]}a0 0%, transparent 70%)`,
            filter: "blur(45px)",
            animation: `meshMove3 ${duration3}s ease-in-out infinite`,
          }}
        />

        <div
          className="absolute h-[60%] w-[60%] rounded-full"
          style={{
            left: "30%",
            top: "20%",
            background: `radial-gradient(circle, ${colors[3] || colors[0]}90 0%, transparent 70%)`,
            filter: "blur(35px)",
            animation: `meshMove4 ${duration4}s ease-in-out infinite`,
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {children && <div className="relative z-10 h-full w-full">{children}</div>}

      <style jsx>{`
        @keyframes meshMove1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(5%, 10%) scale(1.05); }
          50% { transform: translate(10%, 5%) scale(0.95); }
          75% { transform: translate(5%, -5%) scale(1.02); }
        }
        @keyframes meshMove2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-10%, 8%) scale(1.08); }
          66% { transform: translate(-5%, -5%) scale(0.95); }
        }
        @keyframes meshMove3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50% { transform: translate(-8%, -10%) scale(1.1); }
        }
        @keyframes meshMove4 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(15%, -10%) scale(0.9); }
          50% { transform: translate(-10%, 15%) scale(1.1); }
          75% { transform: translate(-15%, -5%) scale(0.95); }
        }
      `}</style>
    </div>
  )
}
