import { API_BASE_URL } from './api';
import { NoteFormValues, NoteItem } from '../types/notesTypes';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let serverErrorMessage = '';

    try {
      const errorResponse = await response.json();
      serverErrorMessage =
        errorResponse?.message || errorResponse?.error || '';
    } catch (error) {
      serverErrorMessage = '';
    }

    throw new Error(
      serverErrorMessage || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export const notesApi = {
  async getNotes(): Promise<NoteItem[]> {
    const response = await fetch(`${API_BASE_URL}/notes`);
    const notesList = await parseJsonResponse<NoteItem[]>(response);
    return notesList;
  },

  async getNoteById(noteId: string): Promise<NoteItem> {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const noteItem = await parseJsonResponse<NoteItem>(response);
    return noteItem;
  },

  async addNote(noteFormValues: NoteFormValues): Promise<NoteItem> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: noteFormValues.title.trim(),
        description: noteFormValues.description.trim(),
        createdAt: new Date().toLocaleString(),
        imageUri: noteFormValues.imageUri || '',
        imageFileName: noteFormValues.imageFileName || '',
        imageType: noteFormValues.imageType || '',
      }),
    });

    const createdNote = await parseJsonResponse<NoteItem>(response);
    return createdNote;
  },

  async updateNote(
    noteId: string,
    noteFormValues: NoteFormValues,
  ): Promise<NoteItem> {
    const existingNote = await notesApi.getNoteById(noteId);

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...existingNote,
        title: noteFormValues.title.trim(),
        description: noteFormValues.description.trim(),
        imageUri: noteFormValues.imageUri || '',
        imageFileName: noteFormValues.imageFileName || '',
        imageType: noteFormValues.imageType || '',
      }),
    });

    const updatedNote = await parseJsonResponse<NoteItem>(response);
    return updatedNote;
  },

  async deleteNote(noteId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }
  },
};