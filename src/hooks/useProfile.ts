import { useCallback, useEffect, useState } from "react";
import {
  getUserProfile,
  PROFILE_CHANGED_EVENT,
  saveUserProfile,
  type UserProfile,
} from "@/services/profile";

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(() => getUserProfile());

  const refreshProfile = useCallback(() => {
    setProfileState(getUserProfile());
  }, []);

  useEffect(() => {
    refreshProfile();

    window.addEventListener(PROFILE_CHANGED_EVENT, refreshProfile);
    window.addEventListener("storage", refreshProfile);

    return () => {
      window.removeEventListener(PROFILE_CHANGED_EVENT, refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
  }, [refreshProfile]);

  const setProfile = useCallback((nextProfile: UserProfile) => {
    saveUserProfile(nextProfile);
    setProfileState(getUserProfile());
  }, []);

  return {
    profile,
    setProfile,
    refreshProfile,
  };
}
