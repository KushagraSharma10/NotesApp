import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import { notesApi } from '../services/notesApi';
import { notesStorage } from '../services/notesStorage';
import { NoteFormValues, NoteItem } from '../types/notesTypes';
import { getReadableErrorMessage, logError } from '../utils/errorUtils';

type NotesState = {
  notesList: NoteItem[];
  isLoadingNotes: boolean;
  notesErrorMessage: string;
  successMessageText: string;
};

type NotesContextValue = NotesState & {
  fetchNotes: () => Promise<void>;
  addNote: (noteFormValues: NoteFormValues) => Promise<void>;
  updateNote: (
    noteId: string,
    noteFormValues: NoteFormValues,
  ) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  clearSuccessMessage: () => void;
};

const initialState: NotesState = {
  notesList: [],
  isLoadingNotes: false,
  notesErrorMessage: '',
  successMessageText: '',
};

type NotesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTES'; payload: NoteItem[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUCCESS'; payload: string };

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoadingNotes: action.payload,
      };

    case 'SET_NOTES':
      return {
        ...state,
        notesList: action.payload,
        notesErrorMessage: '',
      };

    case 'SET_ERROR':
      return {
        ...state,
        notesErrorMessage: action.payload,
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        successMessageText: action.payload,
      };

    default:
      return state;
  }
}

export const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  const clearSuccessMessage = useCallback(() => {
    dispatch({ type: 'SET_SUCCESS', payload: '' });
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: '' });

      const notesList = await notesApi.getNotes();

      dispatch({ type: 'SET_NOTES', payload: notesList });
      await notesStorage.saveCachedNotes(notesList);
    } catch (error) {
      logError(error, 'NotesContext.fetchNotes');

      dispatch({
        type: 'SET_ERROR',
        payload: getReadableErrorMessage(
          error,
          'Unable to load notes. Please try again.',
        ),
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const bootstrapNotes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });

    let hasCachedNotes = false;

    try {
      const cachedNotes = await notesStorage.getCachedNotes();

      if (cachedNotes.length > 0) {
        hasCachedNotes = true;
        dispatch({ type: 'SET_NOTES', payload: cachedNotes });
      }

      const latestNotes = await notesApi.getNotes();

      dispatch({ type: 'SET_NOTES', payload: latestNotes });
      await notesStorage.saveCachedNotes(latestNotes);
    } catch (error) {
      logError(error, 'NotesContext.bootstrapNotes');

      if (!hasCachedNotes) {
        dispatch({
          type: 'SET_ERROR',
          payload: getReadableErrorMessage(
            error,
            'Unable to load notes. Please try again.',
          ),
        });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addNote = useCallback(
    async (noteFormValues: NoteFormValues) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: '' });

        await notesApi.addNote(noteFormValues);
        await fetchNotes();

        dispatch({
          type: 'SET_SUCCESS',
          payload: 'Note added successfully.',
        });
      } catch (error) {
        logError(error, 'NotesContext.addNote');

        dispatch({
          type: 'SET_ERROR',
          payload: getReadableErrorMessage(
            error,
            'Unable to add note. Please try again.',
          ),
        });

        throw error;
      }
    },
    [fetchNotes],
  );

  const updateNote = useCallback(
    async (noteId: string, noteFormValues: NoteFormValues) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: '' });

        await notesApi.updateNote(noteId, noteFormValues);
        await fetchNotes();

        dispatch({
          type: 'SET_SUCCESS',
          payload: 'Note updated successfully.',
        });
      } catch (error) {
        logError(error, 'NotesContext.updateNote');

        dispatch({
          type: 'SET_ERROR',
          payload: getReadableErrorMessage(
            error,
            'Unable to update note. Please try again.',
          ),
        });

        throw error;
      }
    },
    [fetchNotes],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        dispatch({ type: 'SET_ERROR', payload: '' });

        await notesApi.deleteNote(noteId);
        await fetchNotes();

        dispatch({
          type: 'SET_SUCCESS',
          payload: 'Note deleted successfully.',
        });
      } catch (error) {
        logError(error, 'NotesContext.deleteNote');

        dispatch({
          type: 'SET_ERROR',
          payload: getReadableErrorMessage(
            error,
            'Unable to delete note. Please try again.',
          ),
        });

        throw error;
      }
    },
    [fetchNotes],
  );

  useEffect(() => {
    bootstrapNotes();
  }, [bootstrapNotes]);

  useEffect(() => {
    if (!state.successMessageText) {
      return;
    }

    const successMessageTimer = setTimeout(() => {
      clearSuccessMessage();
    }, 2500);

    return () => {
      clearTimeout(successMessageTimer);
    };
  }, [state.successMessageText, clearSuccessMessage]);

  const contextValue: NotesContextValue = {
    ...state,
    fetchNotes,
    addNote,
    updateNote,
    deleteNote,
    clearSuccessMessage,
  };

  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
}