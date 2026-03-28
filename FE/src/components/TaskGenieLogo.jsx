export function TaskGenieLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className="h-9 w-9 shrink-0 text-indigo-600"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="6"
          y="8"
          width="20"
          height="26"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M10 14h12M10 19h8M10 24h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M26 22l6 4-6 4v-3h-4v-2h4v-3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-indigo-600">
        TaskGenie
      </span>
    </div>
  )
}
