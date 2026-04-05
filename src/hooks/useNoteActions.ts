import { useState } from 'react';
import { notesService } from '../services/notesService';
import { NoteFormValues } from '../types/navigationTypes';

export default function useNoteActions() {
  const [isProcessingNoteAction, setIsProcessingNoteAction] = useState(false);
  const [noteActionErrorMessage, setNoteActionErrorMessage] = useState('');

  const runAction = async <T,>(actionCallback: () => Promise<T>) => {
    try {
      setIsProcessingNoteAction(true);
      setNoteActionErrorMessage('');

      return await actionCallback();
    } catch (error) {
      const readableErrorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      setNoteActionErrorMessage(readableErrorMessage);
      throw error;
    } finally {
      setIsProcessingNoteAction(false);
    }
  };

  const addNote = async (noteFormValues: NoteFormValues) => {
    return runAction(() => notesService.addNote(noteFormValues));
  };

  const updateNote = async (noteId: string, noteFormValues: NoteFormValues) => {
    return runAction(() => notesService.updateNote(noteId, noteFormValues));
  };

  const deleteNote = async (noteId: string) => {
    return runAction(() => notesService.deleteNote(noteId));
  };

  const resetNoteActionErrorMessage = () => {
    setNoteActionErrorMessage('');
  };

  return {
    addNote,
    updateNote,
    deleteNote,
    isProcessingNoteAction,
    noteActionErrorMessage,
    resetNoteActionErrorMessage,
  };
}