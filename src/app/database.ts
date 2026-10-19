export type UserRole = "admin" | "doctor" | "patient";

export interface UserData {
  name: string;
  email: string;
  password: string;
  dob: string;
  age: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  occupation: string;
}

export interface PendingSignup {
  status: "pending";
  email: string;
  occupation: "doctor";
}

export interface StoredUser extends UserData {
  id: string;
  role: UserRole;
  specialization?: string;
  is_online?: number;
}

const API_BASE_URL = "http://localhost:4000";
const CURRENT_USER_STORAGE_KEY = "ayurveda-crm-current-user";

const getJson = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.error || text);
    } catch {
      throw new Error(text || "Server error");
    }
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const login = async (
  identifier: string,
  password: string,
): Promise<StoredUser> => {
  return getJson(`${API_BASE_URL}/api/login`, {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
};

export const signup = async (
  patient: UserData,
): Promise<StoredUser | PendingSignup> => {
  return getJson(`${API_BASE_URL}/api/signup`, {
    method: "POST",
    body: JSON.stringify(patient),
  });
};

export const getUsersByRole = async (
  role: UserRole,
): Promise<StoredUser[]> => {
  return getJson(`${API_BASE_URL}/api/users?role=${encodeURIComponent(role)}`);
};

export const getUserByEmail = async (
  email: string,
): Promise<StoredUser> => {
  return getJson(`${API_BASE_URL}/api/user?email=${encodeURIComponent(email)}`);
};

export const getAdminPermissions = async (): Promise<any[]> => {
  return getJson(`${API_BASE_URL}/api/admin/permissions`);
};

export const approveDoctor = async (permissionId: string): Promise<void> => {
  return getJson(`${API_BASE_URL}/api/admin/permissions/${permissionId}/approve`, {
    method: "POST",
  });
};

export const rejectDoctor = async (permissionId: string): Promise<void> => {
  return getJson(`${API_BASE_URL}/api/admin/permissions/${permissionId}/reject`, {
    method: "POST",
  });
};

export const setCurrentUser = (user: StoredUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify({ email: user.email }),
    );
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
};

export const restoreAuth = async (): Promise<StoredUser | null> => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as { email?: string };
    if (!stored?.email) return null;
    return await getUserByEmail(stored.email);
  } catch {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    return null;
  }
};
