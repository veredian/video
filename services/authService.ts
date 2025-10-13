// A mock auth service to simulate a backend using localStorage.
// In a real app, this would make API calls to a secure server.
// WARNING: Passwords are stored in plaintext. This is NOT secure and is for demonstration purposes only.

export interface User {
  email: string;
  password?: string; // Optional because we don't return it on getCurrentUser
  videos: VideoData[];
}

export interface VideoData {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 encoded video data
}

const USERS_KEY = 'videoHubUsers';
const CURRENT_USER_KEY = 'videoHubCurrentUser';

const getUsers = (): Record<string, User> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (e) {
    return {};
  }
};

const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

  login: (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        const user = users[email];
        if (user && user.password === password) {
          localStorage.setItem(CURRENT_USER_KEY, email);
          const { password, ...userWithoutPassword } = user;
          resolve({ success: true, message: 'Login successful!', user: userWithoutPassword });
        } else {
          resolve({ success: false, message: 'Invalid email or password.' });
        }
      }, 500);
    });
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
  
  addVideoForCurrentUser: (videoData: VideoData): Promise<User> => {
    return new Promise((resolve, reject) => {
      const userEmail = localStorage.getItem(CURRENT_USER_KEY);
      if (!userEmail) return reject(new Error("No user logged in"));

      const users = getUsers();
      const user = users[userEmail];
      if (user) {
        user.videos.push(videoData);
        saveUsers(users);
        const { password, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error("Current user not found"));
      }
    });
  }
};
