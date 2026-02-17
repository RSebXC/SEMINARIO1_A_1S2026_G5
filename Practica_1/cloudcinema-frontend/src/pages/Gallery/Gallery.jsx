import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MOCK_MOVIES } from "../../data/mockData";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./Gallery.css";

const GENRES = ["Todos", "Acción", "Sci-Fi", "Drama", "Thriller"];
const FEATURED = MOCK_MOVIES[0]; // Dune II como destacada

export default function Gallery() {
  const { inPlaylist, addToPlaylist, showToast } = useApp();
  const [filter, setFilter] = useState("Todos");

  const filtered =
    filter === "Todos"
      ? MOCK_MOVIES
      : MOCK_MOVIES.filter((m) => m.genero === filter);

  const handleHeroAdd = () => {
    if (inPlaylist(FEATURED.id_pelicula)) {
      showToast("Ya está en tu lista 📋", "ℹ️");
      return;
    }
    addToPlaylist(FEATURED);
    showToast(`"${FEATURED.titulo}" añadida a tu lista ✓`);
  };

  const handleHeroPlay = () => {
    window.open(FEATURED.url_contenido, "_blank");
  };

  return (
    <main className="gallery-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-gradient" />

        <div className="hero-content">
          <span className="hero-eyebrow">⭐ Película Destacada</span>
          <h1 className="hero-title">{FEATURED.titulo}</h1>

          <div className="hero-meta">
            <span>🎬 {FEATURED.director}</span>
            <span>📅 {FEATURED.anio_estreno}</span>
            <span>🎭 {FEATURED.genero}</span>
          </div>

          <p className="hero-desc">
            La esperada segunda parte de la épica saga de Arrakis. Paul
            Atreides se une a los Fremen en una guerra de venganza que
            sacudirá el universo conocido.
          </p>

          <div className="hero-actions">
            <button className="btn-hero btn-hero-primary" onClick={handleHeroPlay}>
              ▶ &nbsp;Ver tráiler
            </button>
            <button className="btn-hero btn-hero-secondary" onClick={handleHeroAdd}>
              {inPlaylist(FEATURED.id_pelicula) ? "✓ En mi lista" : "+ Mi lista"}
            </button>
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO ── */}
      <section className="catalog container">
        <div className="catalog-header">
          <h2 className="catalog-title">Catálogo Completo</h2>
          <span className="catalog-count">{filtered.length} títulos</span>
        </div>

        {/* Filtros */}
        <div className="filter-bar">
          {GENRES.map((g) => (
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
        <div className="movies-grid">
          {filtered.map((movie) => (
            <MovieCard key={movie.id_pelicula} movie={movie} mode="gallery" />
          ))}
        </div>
      </section>
    </main>
  );
}