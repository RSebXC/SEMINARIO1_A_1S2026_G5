import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import MovieCard from "../../components/MovieCard/MovieCard";
import "./Playlist.css";

export default function Playlist() {
  const { playlist } = useApp();
  const navigate      = useNavigate();

  return (
    <main className="playlist-page">
      <div className="container">
        {/* Header */}
        <div className="playlist-header">
          <h1 className="playlist-title">Mi Lista</h1>
          <p className="playlist-subtitle">
            {playlist.length === 0
              ? "Todavía no has guardado ninguna película"
              : `${playlist.length} ${
                  playlist.length === 1 ? "película guardada" : "películas guardadas"
                }`}
          </p>
        </div>

        {playlist.length === 0 ? (
          /* Estado vacío */
          <div className="empty-state">
            <span className="empty-icon">🎬</span>
            <h2>Tu lista está vacía</h2>
            <p>
              Explora el catálogo y agrega las películas que quieras ver más
              tarde
            </p>
            <button
              className="btn-outline"
              onClick={() => navigate("/gallery")}
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="movies-grid">
            {playlist.map((movie) => (
              <MovieCard
                key={movie.id_pelicula}
                movie={movie}
                mode="playlist"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}