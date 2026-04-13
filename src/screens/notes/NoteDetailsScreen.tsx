import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useNotesContext from '../../hooks/useNotesContext';
import { NotesStackParamList } from '../../types/navigationTypes';

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteDetails'>;

export default function NoteDetailsScreen({ route, navigation }: Props) {
  const { noteId } = route.params;

  const {
    notesList,
    isLoadingNotes,
    notesErrorMessage,
    deleteNote,
  } = useNotesContext();

  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState('');

  const selectedNoteItem = useMemo(() => {
    return notesList.find((singleNoteItem) => singleNoteItem.id === noteId) ?? null;
  }, [notesList, noteId]);

  const handleDeleteNote = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeletingNote(true);
            setActionErrorMessage('');
            await deleteNote(noteId);
            navigation.navigate('NotesList');
          } catch (error) {
            setActionErrorMessage('Unable to delete note.');
          } finally {
            setIsDeletingNote(false);
          }
        },
      },
    ]);
  };

  if (isLoadingNotes) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading note details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (notesErrorMessage || !selectedNoteItem) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <Text style={styles.errorText}>
            {notesErrorMessage || 'Note not found.'}
          </Text>

          <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>{selectedNoteItem.title}</Text>

        <Text style={styles.noteDescription}>
          {selectedNoteItem.description || 'No description added'}
        </Text>

        <Text style={styles.noteDate}>{selectedNoteItem.createdAt}</Text>
      </View>

      {actionErrorMessage ? (
        <Text style={styles.inlineErrorText}>{actionErrorMessage}</Text>
      ) : null}

      {isDeletingNote ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate('AddEditNote', { noteId })}
        >
          <Text style={styles.buttonText}>Edit Note</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDeleteNote}
          disabled={isDeletingNote}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  noteDescription: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 16,
  },
  noteDate: {
    fontSize: 13,
    color: '#888888',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e53935',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
  centerStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inlineErrorText: {
    color: '#d32f2f',
    fontWeight: '600',
    marginBottom: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 10,
    color: '#555555',
  },
});