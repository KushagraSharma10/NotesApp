import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesListScreen from '../screens/notes/NotesListScreen';
import NoteDetailsScreen from '../screens/notes/NoteDetailsScreen';
import AddEditNoteScreen from '../screens/notes/AddEditNoteScreen';
import { NotesStackParamList } from '../types/navigationTypes';

const Stack = createNativeStackNavigator<NotesStackParamList>();

export default function NotesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{ title: 'My Notes' }}
      />
      <Stack.Screen
        name="NoteDetails"
        component={NoteDetailsScreen}
        options={{ title: 'Note Details' }}
      />
      <Stack.Screen
        name="AddEditNote"
        component={AddEditNoteScreen}
        options={{ title: 'Edit Note' }}
      />
    </Stack.Navigator>
  );
}