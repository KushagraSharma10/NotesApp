import { API_BASE_URL } from './api';
import { NoteFormValues, NoteItem } from '../types/notesTypes';

async function parseJsonResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export const notesApi = {
  async getNotes(): Promise<NoteItem[]> {
    const response = await fetch(`${API_BASE_URL}/notes`);
    const notesList = await parseJsonResponse(response);
    return notesList;
  },

  async getNoteById(noteId: string): Promise<NoteItem> {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`);
    const noteItem = await parseJsonResponse(response);
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

    const createdNote = await parseJsonResponse(response);
    return createdNote;
  },

  async updateNote(noteId: string, noteFormValues: NoteFormValues): Promise<NoteItem> {
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
  
    const updatedNote = await parseJsonResponse(response);
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