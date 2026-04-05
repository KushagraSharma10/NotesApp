import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';

type NoteItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export default function App() {
  const [notesList, setNotesList] = useState<NoteItem[]>([]);
  const [isAddNoteModalVisible, setIsAddNoteModalVisible] = useState(false);
  const [noteTitleInputValue, setNoteTitleInputValue] = useState('');
  const [noteDescriptionInputValue, setNoteDescriptionInputValue] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');
  const [errorMessageText, setErrorMessageText] = useState('');

  const isSaveButtonDisabled = useMemo(() => {
    return !noteTitleInputValue.trim();
  }, [noteTitleInputValue]);

  useEffect(() => {
    if (!successMessageText) {
      return;
    }
  
    const successMessageTimer = setTimeout(() => {
      setSuccessMessageText('');
    }, 2500);
  
    return () => {
      clearTimeout(successMessageTimer);
    };
  }, [successMessageText]);

  const resetFormValues = () => {
    setNoteTitleInputValue('');
    setNoteDescriptionInputValue('');
    setErrorMessageText('');
  };

  const handleOpenAddNoteModal = () => {
    resetFormValues();
    setSuccessMessageText('');
    setIsAddNoteModalVisible(true);
  };

  const handleCloseAddNoteModal = () => {
    setIsAddNoteModalVisible(false);
    resetFormValues();
  };

  const handleSaveNote = () => {
    const trimmedNoteTitle = noteTitleInputValue.trim();
    const trimmedNoteDescription = noteDescriptionInputValue.trim();

    if (!trimmedNoteTitle) {
      setErrorMessageText('Note title is required.');
      return;
    }

    setErrorMessageText('');
    setIsSavingNote(true);

    setTimeout(() => {
      const newNoteItem: NoteItem = {
        id: Date.now().toString(),
        title: trimmedNoteTitle,
        description: trimmedNoteDescription,
        createdAt: new Date().toLocaleString(),
      };

      setNotesList((previousNotesList) => [newNoteItem, ...previousNotesList]);
      setIsSavingNote(false);
      setIsAddNoteModalVisible(false);
      setSuccessMessageText('Note added successfully.');
      resetFormValues();
    }, 800);
  };

  const handleDeleteNote = (noteIdToDelete: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setNotesList((previousNotesList) =>
              previousNotesList.filter(
                (singleNoteItem) => singleNoteItem.id !== noteIdToDelete,
              ),
            );
            setSuccessMessageText('Note deleted successfully.');
          },
        },
      ],
    );
  };

  const renderSingleNoteCard = ({ item }: { item: NoteItem }) => {
    return (
      <View style={styles.noteCard}>
        <View style={styles.noteCardHeaderRow}>
          <Text style={styles.noteCardTitle}>{item.title}</Text>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteNote(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>

        {item.description ? (
          <Text style={styles.noteCardDescription}>{item.description}</Text>
        ) : (
          <Text style={styles.noteCardEmptyDescription}>
            No description added
          </Text>
        )}

        <Text style={styles.noteCardDateText}>{item.createdAt}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.appHeaderRow}>
        <View>
          <Text style={styles.appTitle}>My Notes</Text>
          <Text style={styles.appSubtitle}>Notes App</Text>
        </View>

        <Pressable
          style={styles.openModalButton}
          onPress={handleOpenAddNoteModal}
        >
          <Text style={styles.openModalButtonText}>Add Note</Text>
        </Pressable>
      </View>

      {successMessageText ? (
        <View style={styles.successMessageBox}>
          <Text style={styles.successMessageText}>{successMessageText}</Text>
        </View>
      ) : null}

      <FlatList
        data={notesList}
        renderItem={renderSingleNoteCard}
        keyExtractor={(singleNoteItem) => singleNoteItem.id}
        contentContainerStyle={styles.notesListContainer}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>No notes yet</Text>
            <Text style={styles.emptyStateDescription}>
              Tap on "Add Note" to create your first note.
            </Text>
          </View>
        }
      />

      <Modal
        visible={isAddNoteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseAddNoteModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingWrapper}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Note</Text>

              <TextInput
                placeholder="Enter note title"
                value={noteTitleInputValue}
                onChangeText={(updatedTitleValue) => {
                  setNoteTitleInputValue(updatedTitleValue);
                  if (errorMessageText) {
                    setErrorMessageText('');
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

              {errorMessageText ? (
                <Text style={styles.errorMessageText}>{errorMessageText}</Text>
              ) : null}

              {isSavingNote ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingText}>Saving note...</Text>
                </View>
              ) : null}

              <View style={styles.modalButtonRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={handleCloseAddNoteModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveButton,
                    isSaveButtonDisabled && styles.disabledSaveButton,
                  ]}
                  onPress={handleSaveNote}
                  disabled={isSaveButtonDisabled || isSavingNote}
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
  appHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  openModalButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  openModalButtonText: {
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
  notesListContainer: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    minHeight: 400,
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
  emptyStateDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noteCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  noteCardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  deleteButton: {
    backgroundColor: '#fdecea',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 13,
  },
  noteCardDescription: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteCardEmptyDescription: {
    fontSize: 15,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  noteCardDateText: {
    fontSize: 12,
    color: '#888888',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#555555',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eceff1',
    paddingVertical: 14,
    borderRadius: 12,
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