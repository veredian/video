// A mock auth service to simulate a backend using localStorage.
// In a real app, this would make API calls to a secure server.
// WARNING: Passwords are stored in plaintext. This is NOT secure and is for demonstration purposes only.
import { mediaDBService } from './videoDBService';
import { GoogleGenAI, Type } from '@google/genai';

export interface User {
  email?: string;
  phone?: string;
  password?: string; // Optional because we don't return it on getCurrentUser
  media: MediaData[];
}

export type MediaType = 'video' | 'audio' | 'image';
export type TranscriptionStatus = 'pending' | 'completed' | 'failed';

export interface MediaData {
  id: string;
  name: string;
  type: string; // The full MIME type
  mediaType: MediaType;
  duration?: number; // in seconds
  size: number; // in bytes
  resolution?: {
    width: number;
    height: number;
  };
  likes: number;
  liked: boolean;
  tags?: string[];
  transcriptionStatus?: TranscriptionStatus;
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

const isEmail = (identifier: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier);
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        // Return only the base64 part, without the data URI scheme
        resolve(result.split(',')[1]); 
      };
      reader.onerror = error => reject(error);
    });
};

const generateTags = async (mediaFile: File, mediaType: MediaType): Promise<string[] | undefined> => {
    if (!process.env.API_KEY) {
        console.warn("AI features disabled. API key is missing.");
        return undefined;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = await blobToBase64(mediaFile);
        const mediaPart = {
            inlineData: {
                mimeType: mediaFile.type,
                data: base64Data,
            },
        };
        
        let promptText = "Analyze this media and generate up to 5 relevant tags. Tags should be concise, single words or short 2-3 word phrases that describe the main subjects, style, or mood.";

        if (mediaType === 'audio') {
            promptText = "Analyze this audio file. Generate up to 5 relevant tags describing its content. If it is music, focus on identifying genre (e.g., 'Christian music', 'Gospel', 'Marching band'), instrumentation (e.g., 'Instrumental', 'Brass band'), mood (e.g., 'Uplifting', 'Patriotic'), and any group affiliation if discernible (e.g., 'Youth group', 'Pathfinders'). If the audio contains speech, identify the main topic.";
        }
        
        const textPart = { text: promptText };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [mediaPart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tags: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A relevant tag for the media, such as genre, mood, instrumentation, or topic."
                            }
                        }
                    },
                    required: ["tags"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);
        if (jsonResponse.tags && Array.isArray(jsonResponse.tags)) {
            // Take up to 5 tags and ensure they are strings.
            return jsonResponse.tags.slice(0, 5).map(String);
        }
    } catch (e) {
        console.error("Failed to generate AI tags:", e);
    }
    return undefined;
};


export const authService = {
  signup: (identifier: string, password: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        if (users[identifier]) {
          const message = isEmail(identifier) ? 'auth.errorUserExists' : 'auth.errorPhoneExists';
          resolve({ success: false, message });
          return;
        }
        
        const newUser: User = { password, media: [] };
        if (isEmail(identifier)) {
            newUser.email = identifier;
        } else {
            newUser.phone = identifier;
        }

        users[identifier] = newUser;
        saveUsers(users);
        const message = isEmail(identifier) ? 'auth.successSignup' : 'auth.successSignupPhone';
        resolve({ success: true, message });
      }, 500);
    });
  },

  login: (identifier: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string; user?: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers();
        const user = users[identifier];
        if (user && user.password === password) {
          localStorage.setItem(CURRENT_USER_KEY, identifier);
          if (rememberMe) {
            localStorage.setItem(REMEMBERED_USER_KEY, identifier);
          } else {
            localStorage.removeItem(REMEMBERED_USER_KEY);
          }
          const { password, ...userWithoutPassword } = user;
          resolve({ success: true, message: 'Login successful!', user: userWithoutPassword });
        } else {
          resolve({ success: false, message: 'auth.errorInvalidCredentials' });
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
    const userIdentifier = localStorage.getItem(CURRENT_USER_KEY);
    if (!userIdentifier) return null;

    const users = getUsers();
    const user = users[userIdentifier];
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
  
  addMediaForCurrentUser: (mediaFile: File): Promise<User> => {
    return new Promise(async (resolve, reject) => {
      const userIdentifier = localStorage.getItem(CURRENT_USER_KEY);
      if (!userIdentifier) return reject(new Error("No user logged in"));

      const users = getUsers();
      const user = users[userIdentifier];
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

        const getMediaDimensions = (file: File): Promise<{ width: number; height: number } | undefined> => {
            return new Promise((resolve) => {
                const url = URL.createObjectURL(file);
                if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadedmetadata = () => {
                        URL.revokeObjectURL(url);
                        resolve({ width: video.videoWidth, height: video.videoHeight });
                    };
                    video.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
                    video.src = url;
                } else if (mediaFile.type.startsWith('image/')) {
                    const img = new Image();
                    img.onload = () => {
                        URL.revokeObjectURL(url);
                        resolve({ width: img.width, height: img.height });
                    };
                    img.onerror = () => { URL.revokeObjectURL(url); resolve(undefined); };
                    img.src = url;
                } else {
                    URL.revokeObjectURL(url);
                    resolve(undefined);
                }
            });
        };

        const [duration, resolution, tags] = await Promise.all([
            getDuration(mediaFile),
            getMediaDimensions(mediaFile),
            generateTags(mediaFile, mediaType)
        ]);
        
        const statuses: TranscriptionStatus[] = ['pending', 'completed', 'failed'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

         const mediaData: MediaData = {
          id: Date.now().toString(),
          name: mediaFile.name,
          type: mediaFile.type,
          mediaType: mediaType,
          duration: duration,
          size: mediaFile.size,
          resolution: resolution,
          likes: Math.floor(Math.random() * 250),
          liked: false,
          tags: tags,
          transcriptionStatus: (mediaType === 'video' || mediaType === 'audio') ? randomStatus : undefined,
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
        const userIdentifier = localStorage.getItem(CURRENT_USER_KEY);
        if (!userIdentifier) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userIdentifier];
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
  
  toggleLikeStatus: (mediaId: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        const userIdentifier = localStorage.getItem(CURRENT_USER_KEY);
        if (!userIdentifier) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userIdentifier];
        if (user) {
            const mediaItem = user.media.find(v => v.id === mediaId);
            if (!mediaItem) {
                return reject(new Error("Media not found for this user."));
            }
            
            if (mediaItem.liked) {
                mediaItem.likes -= 1;
                mediaItem.liked = false;
            } else {
                mediaItem.likes += 1;
                mediaItem.liked = true;
            }

            saveUsers(users);
            const { password, ...userWithoutPassword } = user;
            resolve(userWithoutPassword);
        } else {
            reject(new Error("Current user not found"));
        }
    });
  },

  clearAllMediaForCurrentUser: (): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        const userIdentifier = localStorage.getItem(CURRENT_USER_KEY);
        if (!userIdentifier) return reject(new Error("No user logged in"));

        const users = getUsers();
        const user = users[userIdentifier];
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