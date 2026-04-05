import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notesService } from '../services/notesService';
import { NoteItem } from '../types/navigationTypes';

export default function useNotesList() {
  const [notesList, setNotesList] = useState<NoteItem[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notesErrorMessage, setNotesErrorMessage] = useState('');
  const [successMessageText, setSuccessMessageText] = useState('');
  const hasLoadedOnceReference = useRef(false);

  const fetchNotes = useCallback(async (shouldShowLoader: boolean) => {
    try {
      if (shouldShowLoader) {
        setIsLoadingNotes(true);
      }

      setNotesErrorMessage('');

      const notesResponse = await notesService.getNotes();
      setNotesList(notesResponse);

      const latestSuccessMessageText = notesService.consumeSuccessMessage();
      if (latestSuccessMessageText) {
        setSuccessMessageText(latestSuccessMessageText);
      }
    } catch (error) {
      setNotesErrorMessage('Unable to load notes right now.');
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!hasLoadedOnceReference.current) {
        hasLoadedOnceReference.current = true;
        fetchNotes(true);
      } else {
        fetchNotes(false);
      }
    }, [fetchNotes]),
  );

  useEffect(() => {
    if (!successMessageText) {
      return;
    }

    const successMessageTimer = setTimeout(() => {
      setSuccessMessageText('');
    }, 2500);

    return () => {
      clearTimeout(successMessageTimer);
    };
  }, [successMessageText]);

  return {
    notesList,
    isLoadingNotes,
    notesErrorMessage,
    successMessageText,
    refetchNotes: () => fetchNotes(true),
    refreshNotesWithoutLoader: () => fetchNotes(false),
  };
}