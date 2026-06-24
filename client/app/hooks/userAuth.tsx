"use client";

import { useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

type RootState = {
  auth?: {
    user?: unknown;
  };
};

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook to determine if a user is logged in.
export default function useUserAuth(): boolean {
  const user = useTypedSelector((state) => state.auth?.user);
  return Boolean(user);
}

