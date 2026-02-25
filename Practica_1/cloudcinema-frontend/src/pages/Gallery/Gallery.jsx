import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getMovies } from "../../services/api";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./Gallery.css";

export default function Gallery() {
  const { inPlaylist, addToPlaylist, showToast } = useApp();

  const [movies,  setMovies]  = useState([]);
  const [filter,  setFilter]  = useState("Todos");
  const [genres,  setGenres]  = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Cargar películas desde el backend al montar
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);

        // Generar lista de géneros dinámica desde los datos reales
        const uniqueGenres = ["Todos", ...new Set(data.map((m) => m.genero).filter(Boolean))];
        setGenres(uniqueGenres);
      } catch (err) {
        setError("No se pudieron cargar las películas. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const featured = movies[0] ?? null;

  const filtered =
    filter === "Todos"
      ? movies
      : movies.filter((m) => m.genero === filter);

  const handleHeroAdd = () => {
    if (!featured) return;
    if (inPlaylist(featured.id_pelicula)) {
      showToast("Ya está en tu lista 📋", "ℹ️");
      return;
    }
    addToPlaylist(featured);
    showToast(`"${featured.titulo}" añadida a tu lista ✓`);
  };

  const handleHeroPlay = () => {
    if (featured?.url_contenido) {
      window.open(featured.url_contenido, "_blank");
    }
  };

  // ── Estados de carga y error ──
  if (loading) {
    return (
      <main className="gallery-page">
        <div className="gallery-loading">
          <div className="spinner" />
          <p>Cargando catálogo...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="gallery-page">
        <div className="gallery-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn-outline" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="gallery-page">
      {/* ── HERO ── */}
      {featured && (
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-gradient" />

          <div className="hero-content">
            <span className="hero-eyebrow">⭐ Película Destacada</span>
            <h1 className="hero-title">{featured.titulo}</h1>

            <div className="hero-meta">
              <span>🎬 {featured.director}</span>
              <span>📅 {featured.anio_estreno}</span>
              <span>🎭 {featured.genero}</span>
            </div>

            {featured.descripcion && (
              <p className="hero-desc">{featured.descripcion}</p>
            )}

            <div className="hero-actions">
              <button className="btn-hero btn-hero-primary" onClick={handleHeroPlay}>
                ▶ &nbsp;Ver tráiler
              </button>
              <button className="btn-hero btn-hero-secondary" onClick={handleHeroAdd}>
                {inPlaylist(featured.id_pelicula) ? "✓ En mi lista" : "+ Mi lista"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── CATÁLOGO ── */}
      <section className="catalog container">
        <div className="catalog-header">
          <h2 className="catalog-title">Catálogo Completo</h2>
          <span className="catalog-count">{filtered.length} títulos</span>
        </div>

        {/* Filtros dinámicos */}
        <div className="filter-bar">
          {genres.map((g) => (
            <button
              key={g}
              className={`filter-chip ${filter === g ? "active" : ""}`}
              onClick={() => setFilter(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="gallery-empty">
            <p>No hay películas en esta categoría.</p>
          </div>
        ) : (
          <div className="movies-grid">
            {filtered.map((movie) => (
              <MovieCard key={movie.id_pelicula} movie={movie} mode="gallery" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}