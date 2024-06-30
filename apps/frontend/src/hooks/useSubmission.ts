import { create } from "zustand";
import { ResponseImages } from "../networking";

interface useSubmissionState {
  isLoading: boolean;
  response: ResponseImages | null;
  setIsLoading: (isLoading: boolean) => void;
  setResponse: (response: ResponseImages) => void;
  clearAll: () => void;
}

export const useSubmission = create<useSubmissionState>((set) => ({
  isLoading: false,
  response: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setResponse: (response) => set({ response }),
  clearAll: () => set({ isLoading: false, response: null }),
}));
