import { useContext } from 'react';
import { NotesContext } from '../context/NotesContext';

export default function useNotesContext() {
  const notesContextValue = useContext(NotesContext);

  if (!notesContextValue) {
    throw new Error('useNotesContext must be used inside NotesProvider');
  }

  return notesContextValue;
}