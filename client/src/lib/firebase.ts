// Simple auth state management for demo purposes
interface User {
  id: string;
  email: string;
  name: string;
}

let currentUser: User | null = null;
const authListeners: ((user: User | null) => void)[] = [];

// Demo user for development
const DEMO_USER: User = {
  id: "demo-user-1",
  email: "demo@example.com",
  name: "Demo User"
};

export const signInDemo = async (email: string = "demo@example.com"): Promise<User> => {
  const user = { ...DEMO_USER, email };
  currentUser = user;
  authListeners.forEach(callback => callback(user));
  return user;
};

export const signOut = async (): Promise<void> => {
  currentUser = null;
  authListeners.forEach(callback => callback(null));
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  authListeners.push(callback);
  // Immediately call with current state
  callback(currentUser);
  
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
};
