// A circular progress indicator: a track circle plus an arc for the filled part.
function ProgressRing({ value, total, size = 64, stroke = 6, label }) {
  const percent = total ? Math.round((value / total) * 100) : 0
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `${percent}% complete`}>
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="ring-label">{percent}%</span>
    </div>
  )
}

export default ProgressRing
