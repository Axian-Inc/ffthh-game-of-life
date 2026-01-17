import { useCallback, useEffect, useRef, useState } from 'react';
import { generateId } from '../utils/idGenerator.js';

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timers.current.has(id)) {
      clearTimeout(timers.current.get(id));
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateId();
    const nextToast = { id, message, type };
    setToasts((prev) => [nextToast, ...prev]);
    if (duration > 0) {
      const timer = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [removeToast]);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  return { toasts, addToast, removeToast };
};

export default useToast;
