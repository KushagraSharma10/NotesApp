import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useNotesContext from '../../hooks/useNotesContext';
import { NotesStackParamList } from '../../types/navigationTypes';
import { getReadableErrorMessage, logError } from '../../utils/errorUtils';

type Props = NativeStackScreenProps<NotesStackParamList, 'AddEditNote'>;

export default function AddEditNoteScreen({ route, navigation }: Props) {
  const noteId = route.params?.noteId;
  const isEditMode = useMemo(() => !!noteId, [noteId]);

  const { notesList, isLoadingNotes, addNote, updateNote } = useNotesContext();

  const selectedNoteItem = useMemo(() => {
    if (!noteId) {
      return null;
    }

    return notesList.find((singleNoteItem) => singleNoteItem.id === noteId) ?? null;
  }, [notesList, noteId]);

  const [noteTitleInputValue, setNoteTitleInputValue] = useState('');
  const [noteDescriptionInputValue, setNoteDescriptionInputValue] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [selectedImageFileName, setSelectedImageFileName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [formValidationErrorMessage, setFormValidationErrorMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [isProcessingNoteAction, setIsProcessingNoteAction] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (!selectedNoteItem) {
      return;
    }

    setNoteTitleInputValue(selectedNoteItem.title);
    setNoteDescriptionInputValue(selectedNoteItem.description);
    setSelectedImageUri(selectedNoteItem.imageUri || '');
    setSelectedImageFileName(selectedNoteItem.imageFileName || '');
    setSelectedImageType(selectedNoteItem.imageType || '');
  }, [isEditMode, selectedNoteItem]);

  const handlePickImage = async () => {
    try {
      setActionErrorMessage('');

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        setActionErrorMessage(
          result.errorMessage || 'Unable to open image picker. Please try again.',
        );
        return;
      }

      const selectedAsset = result.assets?.[0];

      if (!selectedAsset?.uri) {
        setActionErrorMessage('Selected image could not be used.');
        return;
      }

      setSelectedImageUri(selectedAsset.uri);
      setSelectedImageFileName(selectedAsset.fileName || '');
      setSelectedImageType(selectedAsset.type || '');
    } catch (error) {
      logError(error, 'AddEditNoteScreen.handlePickImage');

      setActionErrorMessage(
        getReadableErrorMessage(
          error,
          'Unable to open image picker. Please try again.',
        ),
      );
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri('');
    setSelectedImageFileName('');
    setSelectedImageType('');
  };

  const handleSaveNote = async () => {
    if (!noteTitleInputValue.trim()) {
      setFormValidationErrorMessage('Note title is required.');
      return;
    }

    try {
      setIsProcessingNoteAction(true);
      setFormValidationErrorMessage('');
      setActionErrorMessage('');

      const notePayload = {
        title: noteTitleInputValue,
        description: noteDescriptionInputValue,
        imageUri: selectedImageUri,
        imageFileName: selectedImageFileName,
        imageType: selectedImageType,
      };

      if (isEditMode && noteId) {
        await updateNote(noteId, notePayload);
      } else {
        await addNote(notePayload);
      }

      navigation.goBack();
    } catch (error) {
      logError(error, 'AddEditNoteScreen.handleSaveNote');

      setActionErrorMessage(
        getReadableErrorMessage(
          error,
          isEditMode
            ? 'Unable to update note. Please try again.'
            : 'Unable to save note. Please try again.',
        ),
      );
    } finally {
      setIsProcessingNoteAction(false);
    }
  };

  if (isLoadingNotes && isEditMode) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && !selectedNoteItem) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.centerStateContainer}>
          <Text style={styles.errorText}>Note not found.</Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
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

                if (actionErrorMessage) {
                  setActionErrorMessage('');
                }
              }}
              style={styles.textInputField}
              accessibilityLabel="Note title input"
            />

            <TextInput
              placeholder="Enter note description"
              value={noteDescriptionInputValue}
              onChangeText={setNoteDescriptionInputValue}
              style={[styles.textInputField, styles.descriptionInputField]}
              multiline={true}
              textAlignVertical="top"
              accessibilityLabel="Note description input"
            />

            <Pressable
              style={styles.imagePickerButton}
              onPress={handlePickImage}
              disabled={isProcessingNoteAction}
              accessibilityRole="button"
              accessibilityLabel={
                selectedImageUri ? 'Change selected note image' : 'Pick image for note'
              }
            >
              <Text style={styles.imagePickerButtonText}>
                {selectedImageUri ? 'Change Image' : 'Pick Image'}
              </Text>
            </Pressable>

            {selectedImageUri ? (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.selectedImagePreview}
                  resizeMode="cover"
                  accessibilityLabel="Selected note image preview"
                />

                <Pressable
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                  disabled={isProcessingNoteAction}
                  accessibilityRole="button"
                  accessibilityLabel="Remove selected image"
                >
                  <Text style={styles.removeImageButtonText}>Remove Image</Text>
                </Pressable>
              </View>
            ) : null}

            {formValidationErrorMessage ? (
              <Text style={styles.errorText}>{formValidationErrorMessage}</Text>
            ) : null}

            {actionErrorMessage ? (
              <Text style={styles.errorText}>{actionErrorMessage}</Text>
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
                accessibilityRole="button"
                accessibilityLabel="Cancel note changes"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSaveNote}
                disabled={isProcessingNoteAction}
                accessibilityRole="button"
                accessibilityLabel={isEditMode ? 'Update note' : 'Save note'}
              >
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Update' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
  scrollContentContainer: {
    paddingBottom: 24,
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
  imagePickerButton: {
    backgroundColor: '#6a1b9a',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  imagePickerButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
  selectedImageContainer: {
    marginBottom: 14,
  },
  selectedImagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#fdecea',
    paddingVertical: 10,
    borderRadius: 10,
  },
  removeImageButtonText: {
    textAlign: 'center',
    color: '#d32f2f',
    fontWeight: '600',
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