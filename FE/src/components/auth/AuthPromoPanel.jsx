export function AuthPromoPanel() {
  return (
    <div className="relative hidden h-full min-h-[420px] overflow-hidden rounded-2xl bg-indigo-400 p-8 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-indigo-600/30" />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6">
        <svg
          className="max-h-[140px] w-full max-w-[220px] text-white/95"
          viewBox="0 0 220 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M40 120c8-20 28-32 48-28 12 24 40 36 68 32"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <rect
            x="95"
            y="28"
            width="72"
            height="96"
            rx="6"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="rgba(255,255,255,0.12)"
          />
          <path
            d="M105 48h48M105 62h36M105 76h42M105 90h30"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M118 104l8 8 16-20"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="52" cy="52" r="6" fill="currentColor" opacity="0.35" />
          <circle cx="188" cy="44" r="5" fill="currentColor" opacity="0.35" />
          <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="38" cy="108" r="14" fill="rgba(255,255,255,0.15)" />
            <path d="M38 94v10M38 118v6M28 108h10M46 108h10" />
          </g>
          <text
            x="110"
            y="22"
            fill="currentColor"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
          >
            TODO LIST
          </text>
        </svg>

        <svg
          className="max-h-[100px] w-full max-w-[200px] text-white/90"
          viewBox="0 0 200 100"
          fill="none"
          aria-hidden
        >
          <ellipse cx="100" cy="88" rx="40" ry="6" fill="rgba(0,0,0,0.08)" />
          <rect
            x="118"
            y="22"
            width="56"
            height="72"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="rgba(255,255,255,0.1)"
          />
          <path
            d="M128 36h36M128 48h28M128 60h32M128 72h24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="70" cy="48" r="16" fill="rgba(255,255,255,0.2)" />
          <path
            d="M70 32v32M54 48h32"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative text-center">
        <p className="text-sm leading-relaxed text-white/95">
          Manage your tasks in an easy and more efficient way with TaskGenie.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  )
}
