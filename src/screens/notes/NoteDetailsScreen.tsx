import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useNoteActions from '../../hooks/useNoteActions';
import { notesService } from '../../services/notesService';
import { NoteItem, NotesStackParamList } from '../../types/navigationTypes';

type Props = NativeStackScreenProps<NotesStackParamList, 'NoteDetails'>;

export default function NoteDetailsScreen({ route, navigation }: Props) {
  const { noteId } = route.params;

  const [selectedNoteItem, setSelectedNoteItem] = useState<NoteItem | null>(null);
  const [isLoadingNoteDetails, setIsLoadingNoteDetails] = useState(true);
  const [noteDetailsErrorMessage, setNoteDetailsErrorMessage] = useState('');

  const {
    deleteNote,
    isProcessingNoteAction,
    noteActionErrorMessage,
    resetNoteActionErrorMessage,
  } = useNoteActions();

  const loadSelectedNote = useCallback(async () => {
    try {
      setIsLoadingNoteDetails(true);
      setNoteDetailsErrorMessage('');

      const noteResponse = await notesService.getNoteById(noteId);

      if (!noteResponse) {
        setNoteDetailsErrorMessage('Note not found.');
        setSelectedNoteItem(null);
        return;
      }

      setSelectedNoteItem(noteResponse);
    } catch (error) {
      setNoteDetailsErrorMessage('Unable to load note details.');
    } finally {
      setIsLoadingNoteDetails(false);
    }
  }, [noteId]);

  useFocusEffect(
    React.useCallback(() => {
      loadSelectedNote();
    }, [loadSelectedNote]),
  );

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
            resetNoteActionErrorMessage();
            await deleteNote(noteId);
            navigation.navigate('NotesList');
          } catch (error) {
          }
        },
      },
    ]);
  };

  if (isLoadingNoteDetails) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading note details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (noteDetailsErrorMessage || !selectedNoteItem) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <Text style={styles.errorText}>
            {noteDetailsErrorMessage || 'Note not found.'}
          </Text>

          <Pressable style={styles.retryButton} onPress={loadSelectedNote}>
            <Text style={styles.retryButtonText}>Retry</Text>
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

      {noteActionErrorMessage ? (
        <Text style={styles.inlineErrorText}>{noteActionErrorMessage}</Text>
      ) : null}

      {isProcessingNoteAction ? (
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

        <Pressable style={styles.deleteButton} onPress={handleDeleteNote}>
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