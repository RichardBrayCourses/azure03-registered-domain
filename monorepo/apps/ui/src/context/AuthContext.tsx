import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";

/////////////
// USER TYPE
/////////////

export type AuthenticatedUser = {
  isLoggedIn: boolean;
  authenticatableUserId: string | null;
  name: string | null;
  email: string | null;
  role: UserRole;
  authorityId: string | null;
  accountContextId: string | null;
  accountContextType: AccountContextType | null;
  accountContextEntityId: string | null;
  accountContextName: string | null;
  participantId: string | null;
  stakeholderId: string | null;
};

export type UserRole = "authority-admin" | "participant" | "stakeholder" | "agent";
export type AccountContextType = "authority" | "participant" | "stakeholder" | "agent";
type StoredUserRole = UserRole | "authority-admin" | "helper";
type StoredUser = Partial<Omit<AuthenticatedUser, "role">> & {
  role?: StoredUserRole;
  authorityId?: string | null;
};

export const USER_ROLES: Array<{ id: UserRole; label: string; description: string }> = [
  {
    id: "authority-admin",
    label: "Authority",
    description: "Configure case templates, participant membership, and authority settings",
  },
  {
    id: "participant",
    label: "Participant",
    description: "Complete cases and manage evidence",
  },
  {
    id: "stakeholder",
    label: "Stakeholder",
    description: "Review granted participant cases and request information",
  },
  {
    id: "agent",
    label: "Agent",
    description: "Assist participants where delegated access has been granted",
  },
];

export function getUserRoleLabel(role: UserRole) {
  return USER_ROLES.find((item) => item.id === role)?.label ?? "Authority";
}

////////////////////////////////////
// LOGGED IN / LOGGED OUT CONSTANTS
////////////////////////////////////

const LOGGED_IN_USER = {
  isLoggedIn: true,
  authenticatableUserId: null,
  name: null,
  email: null,
  role: "authority-admin" as UserRole,
  authorityId: null,
  accountContextId: null,
  accountContextType: null,
  accountContextEntityId: null,
  accountContextName: null,
  participantId: null,
  stakeholderId: null,
};

const LOGGED_OUT_USER = {
  isLoggedIn: false,
  authenticatableUserId: null,
  name: null,
  email: null,
  role: "authority-admin" as UserRole,
  authorityId: null,
  accountContextId: null,
  accountContextType: null,
  accountContextEntityId: null,
  accountContextName: null,
  participantId: null,
  stakeholderId: null,
};

/////////////
// CONTEXT
/////////////

interface AuthContextData {
  user: AuthenticatedUser;
}
export type SignInSelection = {
  authenticatableUserId: string;
  name: string;
  email: string;
  authorityId: string;
  role: UserRole;
  accountContextId: string;
  accountContextType: AccountContextType;
  accountContextEntityId: string;
  accountContextName: string;
  participantId: string | null;
  stakeholderId: string | null;
};

interface AuthContextValue extends AuthContextData {
  login: (selection: SignInSelection) => void;
  switchAccountContext: (selection: SignInSelection) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/////////////
// AGENT
/////////////

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}

function normalizeRole(role: StoredUserRole | undefined): UserRole {
  if (role === "authority-admin") return "authority-admin";
  if (role === "helper") return "agent";
  return role ?? "authority-admin";
}

function normalizeContextType(value: unknown): AccountContextType | null {
  return value === "helper"
    ? "agent"
    : value === "authority" || value === "participant" || value === "stakeholder" || value === "agent"
      ? value
    : null;
}

////////////////////////
// LOAD / SAVE CONTEXT
////////////////////////

function saveContext(contextData: AuthContextData) {
  localStorage.setItem("user", JSON.stringify(contextData.user));
}

function loadContext(): AuthContextData {
  const storedData = localStorage.getItem("user");

  if (storedData === null) {
    return { user: LOGGED_OUT_USER };
  } else {
    const storedUser = JSON.parse(storedData) as StoredUser;
    const authorityId = storedUser.authorityId ?? storedUser.authorityId ?? null;
    const isLoggedIn = Boolean(storedUser.isLoggedIn && authorityId && storedUser.authenticatableUserId);
    return {
      user: {
        isLoggedIn,
        authenticatableUserId: isLoggedIn ? storedUser.authenticatableUserId ?? null : null,
        name: isLoggedIn ? storedUser.name ?? null : null,
        email: isLoggedIn ? storedUser.email ?? null : null,
        role: normalizeRole(storedUser.role),
        authorityId: isLoggedIn ? authorityId : null,
        accountContextId: isLoggedIn ? storedUser.accountContextId ?? null : null,
        accountContextType: isLoggedIn ? normalizeContextType(storedUser.accountContextType) : null,
        accountContextEntityId: isLoggedIn ? storedUser.accountContextEntityId ?? null : null,
        accountContextName: isLoggedIn ? storedUser.accountContextName ?? null : null,
        participantId: isLoggedIn ? storedUser.participantId ?? null : null,
        stakeholderId: isLoggedIn ? storedUser.stakeholderId ?? null : null,
      },
    };
  }
}

/////////////
// PROVIDER
/////////////

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(loadContext().user);

  useEffect(() => {
    saveContext({ user });
  }, [user]);

  const login = (selection: SignInSelection) =>
    setUser({
      ...LOGGED_IN_USER,
      authenticatableUserId: selection.authenticatableUserId,
      name: selection.name,
      email: selection.email,
      role: selection.role,
      authorityId: selection.authorityId,
      accountContextId: selection.accountContextId,
      accountContextType: selection.accountContextType,
      accountContextEntityId: selection.accountContextEntityId,
      accountContextName: selection.accountContextName,
      participantId:
        selection.role === "authority-admin" ? null : selection.participantId,
      stakeholderId: selection.stakeholderId,
    });

  const switchAccountContext = (selection: SignInSelection) => login(selection);

  const logout = () => setUser(LOGGED_OUT_USER);

  const sharedData = { user, login, switchAccountContext, logout };

  return (
    <AuthContext.Provider value={sharedData}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
