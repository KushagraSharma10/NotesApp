export type NoteItem = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
  };
  
  export type NoteFormValues = {
    title: string;
    description: string;
  };
  
  export type NotesStackParamList = {
    NotesList: undefined;
    NoteDetails: { noteId: string };
    AddEditNote: { noteId?: string };
  };
  
  export type RootTabParamList = {
    NotesTab: undefined;
    Settings: undefined;
  };