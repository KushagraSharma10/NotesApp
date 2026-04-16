import notifee from '@notifee/react-native';
import { NoteItem } from '../types/notesTypes';

const NOTES_NOTIFICATION_CHANNEL_ID = 'notes-reminders';

export const notificationsService = {
  async ensureNotificationsReady() {
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: NOTES_NOTIFICATION_CHANNEL_ID,
      name: 'Notes Reminders',
    });

    return channelId;
  },

  async showNoteNotification(noteItem: NoteItem) {
    const channelId = await this.ensureNotificationsReady();

    await notifee.displayNotification({
      title: noteItem.title,
      body: noteItem.description || 'You have a note reminder.',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    });
  },
};