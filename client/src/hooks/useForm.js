// A small helper that holds a form's values and error messages, so each form
// page does not repeat the same useState boilerplate.
import { useCallback, useState } from 'react';

export function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Sets one field and clears that field's error (the user is fixing it).
  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  // For plain inputs: <input name="email" onChange={handleChange} />
  const handleChange = useCallback((event) => setField(event.target.name, event.target.value), [setField]);

  // For checkbox groups: adds the item if missing, removes it if present.
  const toggleInList = useCallback((name, item) => {
    setValues((current) => {
      const list = current[name];
      const next = list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
      return { ...current, [name]: next };
    });
  }, []);

  return { values, errors, setValues, setErrors, setField, handleChange, toggleInList };
}
