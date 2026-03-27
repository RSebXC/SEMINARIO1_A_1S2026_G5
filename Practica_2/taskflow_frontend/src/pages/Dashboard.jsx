import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { API_URL } from '../utils/config';
import Navbar from '../components/layout/Navbar';
import { Trash2, Edit2, Circle, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState({ title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  const { data, loading, execute: fetchTasks } = useFetch(`${API_URL}/tasks`, { requiresAuth: true });
  const { execute: mutateTask } = useFetch('', { manual: true, requiresAuth: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (data) setTasks(data);
  }, [data]);

  const handleToggleComplete = async (task) => {
    try {
      await mutateTask({ is_completed: !task.is_completed }, {
        url: `${API_URL}/tasks/${task.id}`,
        method: 'PATCH'
      });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !task.is_completed } : t));
    } catch (err) {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminarla?")) return;
    try {
      await mutateTask(null, { url: `${API_URL}/tasks/${id}`, method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Tarea eliminada con éxito');
    } catch (err) {
      toast.error('Error eliminando la tarea');
    }
  };

  const openNewTaskModal = () => {
    setIsEditing(false);
    setActiveTask({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setIsEditing(true);
    setActiveTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!activeTask.title) {
      toast.error("El título es obligatorio");
      return;
    }

    try {
      if (isEditing) {
        const res = await mutateTask(
          { title: activeTask.title, description: activeTask.description },
          { url: `${API_URL}/tasks/${activeTask.id}`, method: 'PUT' }
        );
        setTasks(tasks.map(t => t.id === activeTask.id ? res : t));
        toast.success('Tarea actualizada');
      } else {
        const res = await mutateTask(
          { title: activeTask.title, description: activeTask.description },
          { url: `${API_URL}/tasks`, method: 'POST' }
        );
        setTasks([...tasks, res]);
        toast.success('Nueva tarea agregada');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Error guardando la tarea");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Mis Tareas</h1>
          <button
            onClick={openNewTaskModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
          >
            <Plus size={20} />
            Nueva Tarea
          </button>
        </div>

        {loading && !tasks.length ? (
          <div className="flex justify-center mt-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-16 mt-8">
            <p className="text-gray-500 font-medium text-lg">No hay tareas creadas todavía.</p>
            <p className="text-gray-400 text-sm mt-2">Creá una nueva usando el botón superior para empezar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl shadow-sm border ${task.is_completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100 hover:shadow-md'} p-6 transition-all relative overflow-hidden flex flex-col`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
                    title={task.is_completed ? "Marcar incompleta" : "Completar"}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={26} className="text-green-500" />
                    ) : (
                      <Circle size={26} />
                    )}
                  </button>
                  <h3 className={`flex-1 text-xl font-semibold leading-tight ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                </div>

                <p className={`text-sm mb-6 whitespace-pre-wrap flex-1 ${task.is_completed ? 'text-gray-400' : 'text-gray-500'}`}>
                  {task.description || <span className="italic opacity-50">Sin descripción...</span>}
                </p>

                <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-gray-100">
                  <button onClick={() => openEditModal(task)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors title='Editar'">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors title='Eliminar'">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reusable Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 transform transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Modificar Tarea' : 'Crear Tarea'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  value={activeTask.title}
                  onChange={(e) => setActiveTask({ ...activeTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
                  value={activeTask.description || ''}
                  onChange={(e) => setActiveTask({ ...activeTask, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
