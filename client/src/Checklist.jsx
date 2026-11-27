import { useEffect, useState } from 'react'
import { api } from './api'
import ProgressRing from './ProgressRing'

// Order of the counters in the Progress panel
const TYPE_ORDER = [
  'Heart Piece', 'Heart Container', 'Bottle', 'Song',
  'Quest Item', 'Inventory Item', 'Equipment', 'Upgrade',
]
const typeRank = (type) => (TYPE_ORDER.includes(type) ? TYPE_ORDER.indexOf(type) : TYPE_ORDER.length)
// "Heart Piece" -> "heart-piece", used for the color of each type
const typeClass = (type) => 'type-' + type.toLowerCase().replace(/[^a-z]+/g, '-')

function Checklist({ gameId, onBack, onAuthError }) {
  const [data, setData] = useState(null) // { game, locations: [{ locationNo, name, items: [...] }] }
  const [error, setError] = useState(null)

  useEffect(() => {
    api(`/games/${gameId}/items`)
      .then(setData)
      .catch((err) => (err.status === 401 ? onAuthError() : setError(err.message)))
  }, [gameId, onAuthError])

  // Flip one item's collected flag in our local copy of the data.
  function setCollected(itemNo, collected) {
    setData((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) => ({
        ...loc,
        items: loc.items.map((item) => (item.itemNo === itemNo ? { ...item, collected } : item)),
      })),
    }))
  }

  async function toggle(item) {
    const next = !item.collected
    setCollected(item.itemNo, next) // update the screen right away ("optimistic update")
    setError(null)
    try {
      await api(`/games/${gameId}/items/${item.itemNo}/collect`, { method: next ? 'POST' : 'DELETE' })
    } catch (err) {
      setCollected(item.itemNo, !next) // saving failed → put the checkbox back
      if (err.status === 401) onAuthError()
      else setError(`Couldn't save "${item.name}": ${err.message}`)
    }
  }

  if (!data) {
    return (
      <section>
        <button className="link back" onClick={onBack}>← All games</button>
        {error ? <p className="error">{error}</p> : <p className="muted">Loading checklist…</p>}
      </section>
    )
  }

  // Counters per item type, e.g. Heart Piece 12 / 36 (calculated, never stored)
  const allItems = data.locations.flatMap((loc) => loc.items)
  const counts = {}
  for (const item of allItems) {
    counts[item.type] ??= { collected: 0, total: 0 }
    counts[item.type].total += 1
    if (item.collected) counts[item.type].collected += 1
  }
  const collectedTotal = allItems.filter((i) => i.collected).length

  return (
    <section>
      <button className="link back" onClick={onBack}>← All games</button>
      <div className="game-header">
        <div>
          <p className="eyebrow">{data.game.console} · {data.game.release_year}</p>
          <h1 className="page-title">{data.game.title}</h1>
        </div>
        <ProgressRing value={collectedTotal} total={allItems.length} size={80} stroke={7} />
      </div>
      {error && <p className="error">{error}</p>}

      <div className="checklist-layout">
        <div className="locations">
          {data.locations.map((loc) => {
            const done = loc.items.filter((i) => i.collected).length
            const complete = done === loc.items.length
            return (
              // <details> is a built-in collapsible "dropdown" section
              <details key={loc.locationNo} className={complete ? 'panel location complete' : 'panel location'}>
                <summary>
                  <span className="chevron" aria-hidden="true">›</span>
                  <span className="location-name">{loc.name}</span>
                  <span className="mini-bar" aria-hidden="true">
                    <span style={{ width: `${(done / loc.items.length) * 100}%` }} />
                  </span>
                  <span className="count">{done} / {loc.items.length}</span>
                </summary>
                <ul>
                  {loc.items.map((item) => (
                    <li key={item.itemNo}>
                      <label className={item.collected ? 'item collected' : 'item'}>
                        <input type="checkbox" checked={item.collected} onChange={() => toggle(item)} />
                        <span className="box" aria-hidden="true" />
                        <span className="item-text">
                          <span className="item-name">{item.name}</span>
                          {item.hint && <span className="hint">{item.hint}</span>}
                        </span>
                        <span className={`type-tag ${typeClass(item.type)}`}>{item.type}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </details>
            )
          })}
        </div>

        <aside className="panel progress">
          <h2>Progress</h2>
          {Object.entries(counts)
            .sort(([a], [b]) => typeRank(a) - typeRank(b))
            .map(([type, c]) => (
              <div key={type} className={`progress-row ${typeClass(type)}`}>
                <div className="progress-label">
                  <span><span className="dot" aria-hidden="true" />{type}</span>
                  <span className="num">{c.collected} / {c.total}</span>
                </div>
                <span className="bar"><span style={{ width: `${(c.collected / c.total) * 100}%` }} /></span>
              </div>
            ))}
          <div className="progress-row overall">
            <div className="progress-label">
              <span>Overall</span>
              <span className="num">{collectedTotal} / {allItems.length}</span>
            </div>
            <span className="bar"><span style={{ width: `${(collectedTotal / allItems.length) * 100}%` }} /></span>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Checklist
