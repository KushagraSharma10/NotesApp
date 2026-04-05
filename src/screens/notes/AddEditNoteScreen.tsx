import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useNoteActions from '../../hooks/useNoteActions';
import { notesService } from '../../services/notesService';
import { NotesStackParamList } from '../../types/navigationTypes';

type Props = NativeStackScreenProps<NotesStackParamList, 'AddEditNote'>;

export default function AddEditNoteScreen({ route, navigation }: Props) {
  const noteId = route.params?.noteId;
  const isEditMode = useMemo(() => !!noteId, [noteId]);

  const [noteTitleInputValue, setNoteTitleInputValue] = useState('');
  const [noteDescriptionInputValue, setNoteDescriptionInputValue] = useState('');
  const [isLoadingInitialNoteData, setIsLoadingInitialNoteData] = useState(isEditMode);
  const [formValidationErrorMessage, setFormValidationErrorMessage] = useState('');

  const {
    addNote,
    updateNote,
    isProcessingNoteAction,
    noteActionErrorMessage,
    resetNoteActionErrorMessage,
  } = useNoteActions();

  useEffect(() => {
    const loadEditNoteData = async () => {
      if (!noteId) {
        setIsLoadingInitialNoteData(false);
        return;
      }

      try {
        const noteResponse = await notesService.getNoteById(noteId);

        if (!noteResponse) {
          setFormValidationErrorMessage('Note not found.');
          return;
        }

        setNoteTitleInputValue(noteResponse.title);
        setNoteDescriptionInputValue(noteResponse.description);
      } catch (error) {
        setFormValidationErrorMessage('Unable to load note data.');
      } finally {
        setIsLoadingInitialNoteData(false);
      }
    };

    loadEditNoteData();
  }, [noteId]);

  const handleSaveNote = async () => {
    if (!noteTitleInputValue.trim()) {
      setFormValidationErrorMessage('Note title is required.');
      return;
    }

    try {
      setFormValidationErrorMessage('');
      resetNoteActionErrorMessage();

      if (isEditMode && noteId) {
        await updateNote(noteId, {
          title: noteTitleInputValue,
          description: noteDescriptionInputValue,
        });
      } else {
        await addNote({
          title: noteTitleInputValue,
          description: noteDescriptionInputValue,
        });
      }

      navigation.goBack();
    } catch (error) {
    }
  };

  if (isLoadingInitialNoteData) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <KeyboardAvoidingView
        style={styles.screenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formCard}>
          <Text style={styles.screenTitle}>
            {isEditMode ? 'Edit Note' : 'Add Note'}
          </Text>

          <TextInput
            placeholder="Enter note title"
            value={noteTitleInputValue}
            onChangeText={(updatedTitleValue) => {
              setNoteTitleInputValue(updatedTitleValue);
              if (formValidationErrorMessage) {
                setFormValidationErrorMessage('');
              }
              if (noteActionErrorMessage) {
                resetNoteActionErrorMessage();
              }
            }}
            style={styles.textInputField}
          />

          <TextInput
            placeholder="Enter note description"
            value={noteDescriptionInputValue}
            onChangeText={setNoteDescriptionInputValue}
            style={[styles.textInputField, styles.descriptionInputField]}
            multiline={true}
            textAlignVertical="top"
          />

          {formValidationErrorMessage ? (
            <Text style={styles.errorText}>{formValidationErrorMessage}</Text>
          ) : null}

          {noteActionErrorMessage ? (
            <Text style={styles.errorText}>{noteActionErrorMessage}</Text>
          ) : null}

          {isProcessingNoteAction ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>
                {isEditMode ? 'Updating note...' : 'Saving note...'}
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isProcessingNoteAction}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={styles.saveButton}
              onPress={handleSaveNote}
              disabled={isProcessingNoteAction}
            >
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Update' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },
  centerStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  textInputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    marginBottom: 14,
    fontSize: 15,
    color: '#111111',
  },
  descriptionInputField: {
    minHeight: 120,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  loadingText: {
    marginLeft: 10,
    color: '#555555',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eceff1',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#37474f',
    fontWeight: '700',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
});