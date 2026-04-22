export type NoteItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  imageUri?: string;
  imageFileName?: string;
  imageType?: string;
};

export type NoteFormValues = {
  title: string;
  description: string;
  imageUri?: string;
  imageFileName?: string;
  imageType?: string;
};
