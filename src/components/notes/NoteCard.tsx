import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NoteItem } from '../../types/notesTypes';

type NoteCardProps = {
  noteItem: NoteItem;
  onOpenNote: (noteId: string) => void;
  onEditNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
};

function NoteCard({
  noteItem,
  onOpenNote,
  onEditNote,
  onDeleteNote,
}: NoteCardProps) {
  return (
    <View style={styles.noteCard}>
      <Pressable
        onPress={() => onOpenNote(noteItem.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open note ${noteItem.title}`}
      >
        {noteItem.imageUri ? (
          <Image
            source={{ uri: noteItem.imageUri }}
            style={styles.noteThumbnail}
            resizeMode="cover"
            accessibilityLabel={`Image attached to note ${noteItem.title}`}
          />
        ) : null}

        <Text style={styles.noteTitle}>{noteItem.title}</Text>

        <Text style={styles.noteDescription} numberOfLines={2}>
          {noteItem.description || 'No description added'}
        </Text>

        <Text style={styles.noteDate}>{noteItem.createdAt}</Text>
      </Pressable>

      <View style={styles.noteActionRow}>
        <Pressable
          style={styles.editButton}
          onPress={() => onEditNote(noteItem.id)}
          accessibilityRole="button"
          accessibilityLabel={`Edit note ${noteItem.title}`}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => onDeleteNote(noteItem.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete note ${noteItem.title}`}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default React.memo(NoteCard);

const styles = StyleSheet.create({
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteThumbnail: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  noteDescription: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    color: '#888888',
  },
  noteActionRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    textAlign: 'center',
    color: '#1565c0',
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fdecea',
    paddingVertical: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    textAlign: 'center',
    color: '#d32f2f',
    fontWeight: '600',
  },
});