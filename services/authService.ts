// A mock auth service to simulate a backend using localStorage.
// In a real app, this would make API calls to a secure server.
// WARNING: Passwords are stored in plaintext. This is NOT secure and is for demonstration purposes only.
import { mediaDBService } from './mediaDBService';

export interface User {
  email: string;
  password?: string; // Optional because we don't return it on getCurrentUser
  media: MediaData[];
}

export type MediaType = 'video' | 'audio' | 'image';

export interface MediaData {
  id: string;
  name: string;
  type: string; // The full MIME type
  mediaType: MediaType;
  duration?: number; // in seconds
}

const USERS_KEY = 'NVNELtdUsers';
const CURRENT_USER_KEY = 'NVNELtdCurrentUser';
const REMEMBERED_USER_KEY = 'NVNELtdRememberedUser';

const getUsers = (): Record<string, User> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (e) {
    return {};
  }
};

const saveUsers = (users: Record<string, User>) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage. This might be due to storage limits if media data is being saved here.", error);
    // In a real app, you would have better error handling here.
    alert("Error: Could not save user data. The browser's local storage might be full.");
  }
};

export const authService = {
  signup: (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        if (users[email]) {
          resolve({ success: false, message: 'User with this email already exists.' });
          return;
        }
        users[email] = { email, password, media: [] };
        saveUsers(users);
        resolve({ success: true, message: 'Signup successful. Please log in.' });
      }, 500);
    });
  },

  resendVerificationCode: (email: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Simulating resending verification code to: ${email}`);
        // In a real app, this would trigger an email service.
        // For this demo, we just confirm the action was initiated.
        resolve({ success: true, message: 'A new verification code has been sent.' });
      }, 500);
    });
  },

  login: (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string; user?: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        const user = users[email];
        if (user && user.password === password) {
          localStorage.setItem(CURRENT_USER_KEY, email);
          if (rememberMe) {
            localStorage.setItem(REMEMBERED_USER_KEY, email);
          } else {
            localStorage.removeItem(REMEMBERED_USER_KEY);
          }
          const { password, ...userWithoutPassword } = user;
          resolve({ success: true, message: 'Login successful!', user: userWithoutPassword });
        } else {
          resolve({ success: false, message: 'Invalid email or password.' });
        }
      }, 500);
    });
  },

  getRememberedUser: (): string | null => {
    return localStorage.getItem(REMEMBERED_USER_KEY);
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userEmail = localStorage.getItem(CURRENT_USER_KEY);
    if (!userEmail) return null;

    const users = getUsers();
    const user = users[userEmail];
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
  
  addMediaForCurrentUser: (mediaFile: File): Promise<User> => {
    return new Promise(async (resolve, reject) => {
      const userEmail = localStorage.getItem(CURRENT_USER_KEY);
      if (!userEmail) return reject(new Error("No user logged in"));

      const users = getUsers();
      const user = users[userEmail];
      if (user) {
         let mediaType: MediaType;
         if (mediaFile.type.startsWith('video/')) {
            mediaType = 'video';
         } else if (mediaFile.type.startsWith('audio/')) {
            mediaType = 'audio';
         } else if (mediaFile.type.startsWith('image/')) {
            mediaType = 'image';
         } else {
            return reject(new Error('Unsupported file type'));
         }

         const getDuration = (file: File): Promise<number | undefined> => {
          return new Promise((resolve) => {
            if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
              const url = URL.createObjectURL(file);
              const mediaElement = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
              mediaElement.preload = 'metadata';
              mediaElement.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                resolve(mediaElement.duration);
              };
              mediaElement.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(undefined);
              };
              mediaElement.src = url;
            } else {
              resolve(undefined);
            }
          });
        };

        const duration = await getDuration(mediaFile);
        
         const mediaData: MediaData = {
          id: Date.now().toString(),
          name: mediaFile.name,
          type: mediaFile.type,
          mediaType: mediaType,
          duration: duration,
        };

        try {
          await mediaDBService.saveMedia(mediaData.id, mediaFile);
          user.media.push(mediaData);
          saveUsers(users);
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } catch (error) {
           console.error("Failed to save media:", error);
           reject(new Error("Could not save media file."));
        }
      } else {
        reject(new Error("Current user not found"));
      }
    });
  },

  deleteMediaForCurrentUser: (mediaId: string): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        const userEmail = localStorage.getItem(CURRENT_USER_KEY);
        if (!userEmail) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userEmail];
        if (user) {
            const mediaIndex = user.media.findIndex(v => v.id === mediaId);
            if (mediaIndex === -1) {
                return reject(new Error("Media not found for this user."));
            }
            
            try {
                // First remove from DB
                await mediaDBService.deleteMedia(mediaId);
                
                // Then remove from user's media list in localStorage
                user.media.splice(mediaIndex, 1);
                saveUsers(users);
                
                const { password, ...userWithoutPassword } = user;
                resolve(userWithoutPassword);
            } catch (error) {
                console.error("Failed to delete media:", error);
                reject(new Error("Could not delete media file."));
            }
        } else {
            reject(new Error("Current user not found"));
        }
    });
  },
  
  clearAllMediaForCurrentUser: (): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        const userEmail = localStorage.getItem(CURRENT_USER_KEY);
        if (!userEmail) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userEmail];
        if (user) {
            try {
                await mediaDBService.clearAllMedia();
                user.media = [];
                saveUsers(users);
                const { password, ...userWithoutPassword } = user;
                resolve(userWithoutPassword);
            } catch (error) {
                console.error("Failed to clear media:", error);
                reject(new Error("Could not clear all media files."));
            }
        } else {
            reject(new Error("Current user not found"));
        }
    });
  }
};