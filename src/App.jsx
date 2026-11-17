import { useEffect, useState } from 'react'
import { fetchShows, searchShows, fetchShow } from './api'

export default function App() {
  const [shows, setShows] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  // Boshlanishida mashhur seriallar ro'yxati
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const data = query.trim()
          ? await searchShows(query.trim())
          : await fetchShows(0)

        const list = query.trim()
          ? data.map((item) => item.show)
          : data

        if (active) setShows(list.slice(0, 24))
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    const timer = setTimeout(run, query ? 400 : 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  // Tanlangan serialni to'liq yuklash
  const openShow = async (id) => {
    setSelected({ loading: true })
    try {
      const data = await fetchShow(id)
      setSelected(data)
    } catch (err) {
      setSelected({ error: err.message })
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TVMaze</h1>
        <p className="subtitle">api.tvmaze.com dan seriallar</p>
        <input
          className="search"
          type="search"
          placeholder="Serial qidirish... (masalan: Breaking Bad)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {loading && <p className="status">Yuklanmoqda...</p>}
      {error && <p className="status error">Xato: {error}</p>}

      {!loading && !error && shows.length === 0 && (
        <p className="status">Hech narsa topilmadi.</p>
      )}

      <div className="grid">
        {!loading &&
          !error &&
          shows.map((show) => (
            <button
              key={show.id}
              className="card"
              onClick={() => openShow(show.id)}
            >
              <img
                src={
                  show.image?.medium ||
                  'https://via.placeholder.com/210x295?text=Poster'
                }
                alt={show.name}
                loading="lazy"
              />
              <div className="card-body">
                <strong>{show.name}</strong>
                <span className="muted">
                  {show.premiered?.slice(0, 4) || '—'} ·{' '}
                  {show.rating?.average ?? 'N/A'} ⭐
                </span>
                <span className="muted">
                  {(show.genres ?? []).join(', ') || 'Janr yo\u2019q'}
                </span>
              </div>
            </button>
          ))}
      </div>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>
              ✕
            </button>
            {selected.loading && <p className="status">Yuklanmoqda...</p>}
            {selected.error && <p className="status error">{selected.error}</p>}
            {selected.name && (
              <>
                <div className="modal-head">
                  {selected.image?.medium && (
                    <img src={selected.image.medium} alt={selected.name} />
                  )}
                  <div>
                    <h2>{selected.name}</h2>
                    <p className="muted">
                      {selected.premiered || '—'} ·{' '}
                      {selected.status === 'Running' ? 'Davom etmoqda' : 'Tugagan'}
                      {' · '}
                      {selected.rating?.average ?? 'N/A'} ⭐
                    </p>
                    <p className="muted">
                      {(selected.genres ?? []).join(', ')}
                    </p>
                    <p className="muted">
                      Qismlar: {selected._embedded?.episodes?.length ?? 0}
                    </p>
                  </div>
                </div>
                <div
                  className="summary"
                  dangerouslySetInnerHTML={{ __html: selected.summary || 'Ta\u2019rif yo\u2019q.' }}
                />
                {selected._embedded?.episodes?.length > 0 && (
                  <ul className="episodes">
                    {selected._embedded.episodes.slice(0, 12).map((ep) => (
                      <li key={ep.id}>
                        <span>
                          S{String(ep.season).padStart(2, '0')}E
                          {String(ep.number).padStart(2, '0')}
                        </span>{' '}
                        {ep.name}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
