import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UploadThingStore {
	hydrated: boolean;
	UPLOADTHING_TOKEN: string;
	updateUT_token: (token: string) => void;
	deleteUT_token: () => void;
	setHydrated(): void;
}

export const useUploadThingStore = create<UploadThingStore>()(
	persist(
		immer((set) => ({
			UPLOADTHING_TOKEN: "",

			updateUT_token: (token: string) => {
				set((state) => {
					state.UPLOADTHING_TOKEN = token;
				});
			},
			deleteUT_token: () => {
				set((state) => {
					state.UPLOADTHING_TOKEN = "";
				});
			},

			hydrated: false,
			setHydrated() {
				set({ hydrated: true });
			},
		})),
		{
			name: "uploadthing",
			onRehydrateStorage() {
				return (state, error) => {
					if (!error) state?.setHydrated();
				};
			},
		},
	),
);
