import { useApp } from "../../context/AppContext";
import "./MovieCard.css";

export default function MovieCard({ movie, mode = "gallery" }) {
  // mode: "gallery" | "playlist"
  const { inPlaylist, addToPlaylist, removeFromPlaylist, showToast } = useApp();

  const isAvailable = movie.estado === "Disponible";
  const saved       = inPlaylist(movie.id_pelicula);

  const handlePlay = () => {
    if (movie.url_contenido) window.open(movie.url_contenido, "_blank");
  };

  const handleAdd = () => {
    if (!isAvailable) return;
    if (saved) {
      showToast("Ya está en tu lista 📋", "ℹ️");
      return;
    }
    addToPlaylist(movie);
    showToast(`"${movie.titulo}" añadida ✓`);
  };

  const handleRemove = () => {
    removeFromPlaylist(movie.id_pelicula);
    showToast(`"${movie.titulo}" eliminada`, "🗑️");
  };

  const fallback = `https://placehold.co/300x450/1a1a26/8b8ba0?text=${encodeURIComponent(
    movie.titulo
  )}`;

  return (
    <article className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.poster}
          alt={movie.titulo}
          className="movie-poster"
          onError={(e) => { e.target.src = fallback; }}
          loading="lazy"
        />

        {/* Badge estado */}
        <span
          className={`movie-badge ${
            isAvailable ? "badge-available" : "badge-upcoming"
          }`}
        >
          {isAvailable ? "● Disponible" : "⏳ Próximo"}
        </span>

        {/* Overlay con acciones */}
        <div className="movie-overlay">
          <div className="overlay-actions">
            {mode === "gallery" ? (
              <>
                {isAvailable && (
                  <button
                    className="btn-circle btn-play"
                    onClick={handlePlay}
                    title="Ver tráiler"
                  >
                    ▶
                  </button>
                )}
                {isAvailable ? (
                  <button
                    className={`btn-circle btn-add ${saved ? "saved" : ""}`}
                    onClick={handleAdd}
                    title={saved ? "Ya en tu lista" : "Agregar a mi lista"}
                  >
                    {saved ? "✓" : "+"}
                  </button>
                ) : (
                  <button className="btn-circle btn-locked" disabled title="Próximamente">
                    🔒
                  </button>
                )}
              </>
            ) : (
              /* mode === "playlist" */
              <>
                <button
                  className="btn-circle btn-play"
                  onClick={handlePlay}
                  title="Ver película"
                >
                  ▶
                </button>
                <button
                  className="btn-circle btn-remove"
                  onClick={handleRemove}
                  title="Eliminar de mi lista"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="movie-info">
        <p className="movie-title-card">{movie.titulo}</p>
        <div className="movie-meta-card">
          <span>{movie.anio_estreno}</span>
          <span className="movie-genre">{movie.genero}</span>
        </div>
      </div>
    </article>
  );
}