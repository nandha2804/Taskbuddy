export interface UserSettings {
  defaultView: 'list' | 'board';
  emailNotifications: boolean;
  desktopNotifications: boolean;
  defaultTaskCategory: 'work' | 'personal' | 'shopping' | 'others';
  theme: 'light' | 'dark' | 'system';
}

export type UserSettingsUpdate = Partial<UserSettings>;

export const defaultSettings: UserSettings = {
  defaultView: 'list',
  emailNotifications: true,
  desktopNotifications: true,
  defaultTaskCategory: 'work',
  theme: 'system',
};