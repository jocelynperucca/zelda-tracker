import { useEffect, useState } from 'react'
import { api } from './api'

// Order of the counters in the Progress panel
const TYPE_ORDER = [
  'Heart Piece', 'Heart Container', 'Bottle', 'Song',
  'Quest Item', 'Inventory Item', 'Equipment', 'Upgrade',
]
const typeRank = (type) => (TYPE_ORDER.includes(type) ? TYPE_ORDER.indexOf(type) : TYPE_ORDER.length)

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
        <button className="link" onClick={onBack}>← All games</button>
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
      <button className="link" onClick={onBack}>← All games</button>
      <h1>{data.game.title}</h1>
      {error && <p className="error">{error}</p>}

      <div className="checklist-layout">
        <div className="locations">
          {data.locations.map((loc) => {
            const done = loc.items.filter((i) => i.collected).length
            return (
              // <details> is a built-in collapsible "dropdown" section
              <details key={loc.locationNo} className="location">
                <summary>
                  <span>{loc.name}</span>
                  <span className={done === loc.items.length ? 'count complete' : 'count'}>
                    {done} / {loc.items.length}
                  </span>
                </summary>
                <ul>
                  {loc.items.map((item) => (
                    <li key={item.itemNo}>
                      <label className={item.collected ? 'item collected' : 'item'}>
                        <input type="checkbox" checked={item.collected} onChange={() => toggle(item)} />
                        <span>
                          <span className="item-name">{item.name}</span>
                          <span className="item-type">{item.type}</span>
                          {item.hint && <span className="hint">{item.hint}</span>}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </details>
            )
          })}
        </div>

        <aside className="progress">
          <h2>Progress</h2>
          {Object.entries(counts)
            .sort(([a], [b]) => typeRank(a) - typeRank(b))
            .map(([type, c]) => (
            <div key={type} className="progress-row">
              <div className="progress-label">
                <span>{type}</span>
                <span>{c.collected} / {c.total}</span>
              </div>
              <span className="bar"><span style={{ width: `${(c.collected / c.total) * 100}%` }} /></span>
            </div>
          ))}
          <div className="progress-row overall">
            <div className="progress-label">
              <span>Overall</span>
              <span>{collectedTotal} / {allItems.length}</span>
            </div>
            <span className="bar"><span style={{ width: `${(collectedTotal / allItems.length) * 100}%` }} /></span>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Checklist
