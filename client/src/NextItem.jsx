import { useState } from 'react'
import Triforce from './Triforce'

const typeClass = (type) => 'type-' + type.toLowerCase().replace(/[^a-z]+/g, '-')

// "Show next item" mode: one card with the first item you haven't collected,
// in playthrough order (locations come from the API already sorted by
// location_no, then sort_order).
function NextItem({ locations, onToggle }) {
  const [skipped, setSkipped] = useState([]) // itemNos skipped this session
  const [last, setLast] = useState(null) // the item just collected, for Undo

  const ordered = locations.flatMap((loc) => loc.items.map((item) => ({ ...item, locationName: loc.name })))
  const remaining = ordered.filter((item) => !item.collected)
  const available = remaining.filter((item) => !skipped.includes(item.itemNo))
  const next = available[0]
  const upcoming = available.slice(1, 4)

  function collect() {
    onToggle(next) // next.collected is false, so this checks it
    setLast(next)
  }

  function skip() {
    setSkipped((prev) => [...prev, next.itemNo])
    setLast(null)
  }

  function undo() {
    onToggle({ ...last, collected: true }) // collected is true, so this unchecks it
    setLast(null)
  }

  const undoBar = last && (
    <p className="undo">
      Collected <strong>{last.name}</strong>.{' '}
      <button className="link" onClick={undo}>Undo</button>
    </p>
  )

  // Everything collected
  if (remaining.length === 0) {
    return (
      <div className="panel next-card done">
        <Triforce size={64} className="auth-emblem" />
        <h2>Every item collected!</h2>
        <p className="muted">You’ve found all {ordered.length} items in this game.</p>
        {undoBar}
      </div>
    )
  }

  // Only skipped items are left
  if (!next) {
    return (
      <div className="panel next-card done">
        <h2>You skipped the rest</h2>
        <p className="muted">
          {remaining.length} {remaining.length === 1 ? 'item is' : 'items are'} still missing.
        </p>
        <button className="primary" onClick={() => setSkipped([])}>Go back to skipped items</button>
        {undoBar}
      </div>
    )
  }

  const position = ordered.findIndex((item) => item.itemNo === next.itemNo) + 1

  return (
    <div>
      <div className="panel next-card">
        <div className="next-meta">
          <span className="eyebrow">Next up · {next.locationName}</span>
          <span className="muted small">#{position} of {ordered.length}</span>
        </div>
        <h2 className="next-name">{next.name}</h2>
        <span className={`type-tag ${typeClass(next.type)}`}>{next.type}</span>
        {next.hint && <p className="next-hint">{next.hint}</p>}
        <div className="next-actions">
          <button className="primary" onClick={collect}>Got it</button>
          <button className="secondary" onClick={skip}>Skip for now</button>
        </div>
        {undoBar}
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming">
          <p className="eyebrow">Coming up</p>
          <ol>
            {upcoming.map((item) => (
              <li key={item.itemNo}>
                <span className="item-name">{item.name}</span>
                <span className="muted small"> · {item.locationName}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {skipped.length > 0 && (
        <button className="link" onClick={() => setSkipped([])}>
          Show the {skipped.length} skipped {skipped.length === 1 ? 'item' : 'items'} again
        </button>
      )}
    </div>
  )
}

export default NextItem
