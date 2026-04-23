import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import PostForm from '../components/posts/PostForm';
import PostCard from '../components/posts/PostCard';
import TagFilter from '../components/posts/TagFilter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(ENDPOINTS.TAGS, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => []);
      if (res.ok) {
        const tags = Array.isArray(data) ? data.filter((t) => t !== 'Todos') : [];
        setAllTags(tags);
      }
    } catch {
    }
  }, []);

  const fetchPosts = useCallback(async (tag = '') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const url = tag
        ? `${ENDPOINTS.POSTS}?etiqueta=${encodeURIComponent(tag)}`
        : ENDPOINTS.POSTS;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken') || localStorage.getItem('token')}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error al cargar publicaciones');

      const lista = Array.isArray(data) ? data : (data.publicaciones || []);
      setPosts(lista);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [fetchPosts, fetchTags]);

  const handleTagChange = (tag) => {
    setActiveTag(tag);
    fetchPosts(tag);
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PostForm onCreated={() => fetchPosts(activeTag)} />

      <TagFilter tags={allTags} active={activeTag} onChange={handleTagChange} />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#e4e6eb]">
          {activeTag ? `#${activeTag}` : 'Tu Feed'}
        </h2>
        <button
          onClick={() => { fetchPosts(activeTag); fetchTags(); }}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-[#8a8d91] hover:text-[#1877f2] transition-colors disabled:opacity-40"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Cargando publicaciones..." />
        </div>
      )}

      {errorMsg && !loading && (
        <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      )}

      {!loading && !errorMsg && posts.length === 0 && (
        <div className="text-center py-16">
          <i className="text-4xl mb-3 bi bi-inbox"></i>
          <p className="text-[#b0b3b8] font-medium">No hay publicaciones aún</p>
          <p className="text-sm text-[#8a8d91] mt-1">
            {activeTag
              ? `Ninguna publicación con la etiqueta "${activeTag}"`
              : 'Sé el primero en publicar algo'}
          </p>
        </div>
      )}

      {!loading && posts.map((post, i) => (
        <PostCard key={post.id || i} post={post} />
      ))}
    </div>
  );
}
