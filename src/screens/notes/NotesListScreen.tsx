import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useNotesContext from '../../hooks/useNotesContext';
import { NoteItem } from '../../types/notesTypes';
import { NotesStackParamList } from '../../types/navigationTypes';

type Props = NativeStackScreenProps<NotesStackParamList, 'NotesList'>;

export default function NotesListScreen({ navigation }: Props) {
  const {
    notesList,
    isLoadingNotes,
    notesErrorMessage,
    successMessageText,
    fetchNotes,
    addNote,
    deleteNote,
  } = useNotesContext();

  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [noteTitleInputValue, setNoteTitleInputValue] = useState('');
  const [noteDescriptionInputValue, setNoteDescriptionInputValue] = useState('');
  const [formValidationErrorMessage, setFormValidationErrorMessage] = useState('');
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [isProcessingNoteAction, setIsProcessingNoteAction] = useState(false);

  const isSaveButtonDisabled = useMemo(() => {
    return !noteTitleInputValue.trim();
  }, [noteTitleInputValue]);

  const resetAddNoteForm = () => {
    setNoteTitleInputValue('');
    setNoteDescriptionInputValue('');
    setFormValidationErrorMessage('');
    setActionErrorMessage('');
  };

  const handleOpenAddNoteModal = () => {
    resetAddNoteForm();
    setIsAddNoteModalVisible(true);
  };

  const handleCloseAddNoteModal = () => {
    if (isProcessingNoteAction) {
      return;
    }

    setIsAddNoteModalVisible(false);
    resetAddNoteForm();
  };

  const handleSaveNewNote = async () => {
    if (!noteTitleInputValue.trim()) {
      setFormValidationErrorMessage('Note title is required.');
      return;
    }

    try {
      setIsProcessingNoteAction(true);
      setFormValidationErrorMessage('');
      setActionErrorMessage('');

      await addNote({
        title: noteTitleInputValue,
        description: noteDescriptionInputValue,
        imageUri: '',
        imageFileName: '',
        imageType: '',
      });

      setIsAddNoteModalVisible(false);
      resetAddNoteForm();
    } catch (error) {
      setActionErrorMessage('Unable to save note.');
    } finally {
      setIsProcessingNoteAction(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
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
            setActionErrorMessage('');
            await deleteNote(noteId);
          } catch (error) {
            setActionErrorMessage('Unable to delete note.');
          }
        },
      },
    ]);
  };

  const renderSingleNoteCard = ({ item }: { item: NoteItem }) => {
    return (
      <View style={styles.noteCard}>
        <Pressable
          onPress={() => navigation.navigate('NoteDetails', { noteId: item.id })}
        >
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.noteThumbnail} />
          ) : null}

          <Text style={styles.noteTitle}>{item.title}</Text>

          <Text style={styles.noteDescription} numberOfLines={2}>
            {item.description || 'No description added'}
          </Text>

          <Text style={styles.noteDate}>{item.createdAt}</Text>
        </Pressable>

        <View style={styles.noteActionRow}>
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate('AddEditNote', { noteId: item.id })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteNote(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.screenTitle}>My Notes</Text>
          <Text style={styles.screenSubtitle}>
            {notesList.length} note{notesList.length === 1 ? '' : 's'}
          </Text>
        </View>

        <Pressable style={styles.addButton} onPress={handleOpenAddNoteModal}>
          <Text style={styles.addButtonText}>Add Note</Text>
        </Pressable>
      </View>

      {successMessageText ? (
        <View style={styles.successMessageBox}>
          <Text style={styles.successMessageText}>{successMessageText}</Text>
        </View>
      ) : null}

      {actionErrorMessage && !isAddNoteModalVisible ? (
        <View style={styles.errorBannerBox}>
          <Text style={styles.errorBannerText}>{actionErrorMessage}</Text>
        </View>
      ) : null}

      {isLoadingNotes ? (
        <View style={styles.centerStateContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.stateText}>Loading notes...</Text>
        </View>
      ) : notesErrorMessage ? (
        <View style={styles.centerStateContainer}>
          <Text style={styles.errorText}>{notesErrorMessage}</Text>

          <Pressable style={styles.retryButton} onPress={fetchNotes}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notesList}
          keyExtractor={(singleNoteItem) => singleNoteItem.id}
          renderItem={renderSingleNoteCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerStateContainer}>
              <Text style={styles.emptyStateTitle}>No notes yet</Text>
              <Text style={styles.stateText}>
                Tap on "Add Note" to create your first note.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={isAddNoteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAddNoteModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingWrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Note</Text>

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
                placeholderTextColor="#888888"
                returnKeyType="next"
              />

              <TextInput
                placeholder="Enter note description"
                value={noteDescriptionInputValue}
                onChangeText={setNoteDescriptionInputValue}
                style={[styles.textInputField, styles.descriptionInputField]}
                placeholderTextColor="#888888"
                multiline={true}
                textAlignVertical="top"
              />

              {formValidationErrorMessage ? (
                <Text style={styles.errorMessageText}>
                  {formValidationErrorMessage}
                </Text>
              ) : null}

              {actionErrorMessage ? (
                <Text style={styles.errorMessageText}>{actionErrorMessage}</Text>
              ) : null}

              {isProcessingNoteAction ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingText}>Saving note...</Text>
                </View>
              ) : null}

              <View style={styles.modalButtonRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCloseAddNoteModal}
                  disabled={isProcessingNoteAction}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveButton,
                    isSaveButtonDisabled && styles.disabledSaveButton,
                  ]}
                  onPress={handleSaveNewNote}
                  disabled={isSaveButtonDisabled || isProcessingNoteAction}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  successMessageBox: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  successMessageText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  errorBannerBox: {
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#f5c2c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 24,
    flexGrow: 1,
  },
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
  centerStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },
  stateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingWrapper: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
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
    minHeight: 110,
  },
  errorMessageText: {
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
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
  },
  modalButtonRow: {
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
  cancelButtonText: {
    textAlign: 'center',
    color: '#37474f',
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    borderRadius: 12,
  },
  disabledSaveButton: {
    backgroundColor: '#b0bec5',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
});