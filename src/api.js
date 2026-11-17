const BASE_URL = 'https://api.tvmaze.com'

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`TVMaze xatosi: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// Sahifalab seriallar ro'yxatini oladi
export function fetchShows(page = 0) {
  return request(`/shows?page=${page}`)
}

// Nomi bo'yicha qidiradi
export function searchShows(query) {
  return request(`/search/shows?q=${encodeURIComponent(query)}`)
}

// Bitta serialning to'liq ma'lumoti (qismlar bilan)
export function fetchShow(id) {
  return request(`/shows/${id}?embed[]=episodes&embed[]=cast`)
}
