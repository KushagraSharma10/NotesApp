import { mockNotes } from '../data/mockNotes';
import { NoteFormValues, NoteItem } from '../types/navigationTypes';
import { formatNoteDate } from '../utils/dateUtils';

let notesStore: NoteItem[] = [...mockNotes];
let pendingSuccessMessageText = '';

function wait(delayInMilliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMilliseconds);
  });
}

export const notesService = {
  async getNotes(): Promise<NoteItem[]> {
    await wait(350);
    return [...notesStore];
  },

  async getNoteById(noteId: string): Promise<NoteItem | null> {
    await wait(150);
    return notesStore.find((singleNoteItem) => singleNoteItem.id === noteId) ?? null;
  },

  async addNote(noteFormValues: NoteFormValues): Promise<NoteItem> {
    await wait(700);

    const newNoteItem: NoteItem = {
      id: Date.now().toString(),
      title: noteFormValues.title.trim(),
      description: noteFormValues.description.trim(),
      createdAt: formatNoteDate(new Date()),
    };

    notesStore = [newNoteItem, ...notesStore];
    pendingSuccessMessageText = 'Note added successfully.';

    return newNoteItem;
  },

  async updateNote(noteId: string, noteFormValues: NoteFormValues): Promise<NoteItem> {
    await wait(650);

    let updatedNoteItem: NoteItem | null = null;

    notesStore = notesStore.map((singleNoteItem) => {
      if (singleNoteItem.id !== noteId) {
        return singleNoteItem;
      }

      updatedNoteItem = {
        ...singleNoteItem,
        title: noteFormValues.title.trim(),
        description: noteFormValues.description.trim(),
      };

      return updatedNoteItem;
    });

    if (!updatedNoteItem) {
      throw new Error('Note not found.');
    }

    pendingSuccessMessageText = 'Note updated successfully.';
    return updatedNoteItem;
  },

  async deleteNote(noteId: string): Promise<void> {
    await wait(300);

    const existingNotesCount = notesStore.length;

    notesStore = notesStore.filter((singleNoteItem) => singleNoteItem.id !== noteId);

    if (existingNotesCount === notesStore.length) {
      throw new Error('Note not found.');
    }

    pendingSuccessMessageText = 'Note deleted successfully.';
  },

  consumeSuccessMessage() {
    const currentSuccessMessageText = pendingSuccessMessageText;
    pendingSuccessMessageText = '';
    return currentSuccessMessageText;
  },
};