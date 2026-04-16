import AsyncStorage from '@react-native-async-storage/async-storage';
import { NoteItem } from '../types/notesTypes';

const NOTES_CACHE_STORAGE_KEY = '@notes_app/notes_cache';

export const notesStorage = {
  async getCachedNotes(): Promise<NoteItem[]> {
    try {
      const cachedNotesString = await AsyncStorage.getItem(
        NOTES_CACHE_STORAGE_KEY,
      );

      if (!cachedNotesString) {
        return [];
      }

      const parsedCachedNotes = JSON.parse(cachedNotesString);

      if (!Array.isArray(parsedCachedNotes)) {
        return [];
      }

      return parsedCachedNotes;
    } catch (error) {
      return [];
    }
  },

  async saveCachedNotes(notesList: NoteItem[]): Promise<void> {
    try {
      const notesListString = JSON.stringify(notesList);
      await AsyncStorage.setItem(NOTES_CACHE_STORAGE_KEY, notesListString);
    } catch (error) {
      throw error;
    }
  },

  async clearCachedNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTES_CACHE_STORAGE_KEY);
    } catch (error) {
      throw error;
    }
  },
};