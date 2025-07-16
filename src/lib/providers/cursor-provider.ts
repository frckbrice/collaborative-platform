import { create } from "zustand";

// type State = {
//     localCursors: any[]
//     setLocalCursors: (cursors: any[]) => void
// }

// export const useStore = create<State>((set) => ({
//     localCursors: [],
//     setLocalCursors: (cursors: any[]) => set(() => ({ localCursors: cursors })),
// }));


type State<T> = {
    localCursors: T
    setLocalCursors: (cursors: T) => void
}

export const useStore = create<State<any>>((set) => ({
    localCursors: {},
    setLocalCursors: (cursors: {}) => set(() => ({ localCursors: cursors })),
}));
