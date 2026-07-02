import { ref, computed } from 'vue';

const STORAGE_KEY = 'altoque_auth_session';

const loadSession = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Error loading auth session', e);
    }
    return null;
};

// Global reactive state
const session = ref(loadSession());

export function useAuthStore() {
    
    const user = computed(() => session.value);
    const isLoggedIn = computed(() => !!session.value);
    
    // role: 'client' | 'bank'
    const login = (role, extraData = {}) => {
        const newSession = {
            role,
            ...extraData
        };
        session.value = newSession;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    };

    const loginAsBank = (bankId) => {
        login('bank', { bankId });
    };

    const loginAsClient = (name, email) => {
        login('client', { name, email });
    };

    const loginAsAdmin = () => {
        login('admin');
    };

    const logout = () => {
        session.value = null;
        localStorage.removeItem(STORAGE_KEY);
    };

    const loginWithBackend = ({ token, user }) => {
        const newSession = {
            role: user.rol,
            id_user: user.id_user,
            username: user.username,
            token
        };
        
        session.value = newSession;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    };

    const updateCurrentUser = (updatedData) => {
        if (!session.value) return;
        
        const updatedSession = {
            ...session.value,
            ...updatedData
        };
        
        session.value = updatedSession;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    };

    return {
        user,
        isLoggedIn,
        loginWithBackend,
        loginAsBank,
        loginAsClient,
        loginAsAdmin,
        updateCurrentUser,
        logout
    };
}

const loginWithBackend = ({ token, user }) => {
    const newSession = {
        role: user.rol,
        id_user: user.id_user,
        username: user.username,
        token
    };

    session.value = newSession;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
};