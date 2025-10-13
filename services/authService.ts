// A mock auth service to simulate a backend using localStorage.
// In a real app, this would make API calls to a secure server.
// WARNING: Passwords are stored in plaintext. This is NOT secure and is for demonstration purposes only.
import { videoDBService } from './videoDBService';

export interface User {
  email: string;
  password?: string; // Optional because we don't return it on getCurrentUser
  videos: VideoData[];
}

export interface VideoData {
  id: string;
  name: string;
  type: string;
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
    console.error("Failed to save users to localStorage. This might be due to storage limits if video data is being saved here.", error);
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
        users[email] = { email, password, videos: [] };
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
  
  addVideoForCurrentUser: (videoFile: File): Promise<User> => {
    return new Promise(async (resolve, reject) => {
      const userEmail = localStorage.getItem(CURRENT_USER_KEY);
      if (!userEmail) return reject(new Error("No user logged in"));

      const users = getUsers();
      const user = users[userEmail];
      if (user) {
         const videoData: VideoData = {
          id: Date.now().toString(),
          name: videoFile.name,
          type: videoFile.type,
        };
        try {
          await videoDBService.saveVideo(videoData.id, videoFile);
          user.videos.push(videoData);
          saveUsers(users);
          const { password, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } catch (error) {
           console.error("Failed to save video:", error);
           reject(new Error("Could not save video file."));
        }
      } else {
        reject(new Error("Current user not found"));
      }
    });
  },

  deleteVideoForCurrentUser: (videoId: string): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        const userEmail = localStorage.getItem(CURRENT_USER_KEY);
        if (!userEmail) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userEmail];
        if (user) {
            const videoIndex = user.videos.findIndex(v => v.id === videoId);
            if (videoIndex === -1) {
                return reject(new Error("Video not found for this user."));
            }
            
            try {
                // First remove from DB
                await videoDBService.deleteVideo(videoId);
                
                // Then remove from user's video list in localStorage
                user.videos.splice(videoIndex, 1);
                saveUsers(users);
                
                const { password, ...userWithoutPassword } = user;
                resolve(userWithoutPassword);
            } catch (error) {
                console.error("Failed to delete video:", error);
                reject(new Error("Could not delete video file."));
            }
        } else {
            reject(new Error("Current user not found"));
        }
    });
  }
};