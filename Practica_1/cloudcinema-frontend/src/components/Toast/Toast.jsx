import { useApp } from "../../context/AppContext";
import "./Toast.css";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="toast" key={toast.id}>
      <span className="toast-icon">{toast.icon}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  );
}