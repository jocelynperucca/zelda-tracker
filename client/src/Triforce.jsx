// The Triforce logo, drawn as three triangles.
function Triforce({ size = 28, className = '' }) {
  return (
    <svg
      className={`triforce ${className}`}
      width={size}
      height={size * 0.875}
      viewBox="0 0 64 56"
      aria-hidden="true"
    >
      <polygon points="32,2 47,28 17,28" />
      <polygon points="17,28 32,54 2,54" />
      <polygon points="47,28 62,54 32,54" />
    </svg>
  )
}

export default Triforce
