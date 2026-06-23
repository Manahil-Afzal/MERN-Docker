import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Define a proper interface for your User object
interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    courses: unknown[];
}

interface AuthState {
    token: string;
    user: User | null;
}

const initialState: AuthState = {
    token: "",
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userRegistration: (state, action: PayloadAction<{ token: string }>) => {
            state.token = action.payload.token;
        },
        userLoggedIn: (state, action: PayloadAction<{ accessToken: string; user: User }>) => {
            state.token = action.payload.accessToken;
            state.user = action.payload.user;
        },
        userLoggedOut: (state) => {
            state.token = "";
            state.user = null;
        },
    },
});

export const { userRegistration, userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;