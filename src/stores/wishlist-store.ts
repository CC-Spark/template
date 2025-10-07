import { create } from 'zustand';

interface WishlistStore {
    items: Set<string>;
    addItem: (productId: string) => void;
    removeItem: (productId: string) => void;
    toggleItem: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
    items: new Set(),

    addItem: (productId: string) => {
        set((state) => {
            const newItems = new Set([...state.items, productId]);
            return { items: newItems };
        });
    },

    removeItem: (productId: string) => {
        set((state) => {
            const newItems = new Set([...state.items].filter((id) => id !== productId));
            return { items: newItems };
        });
    },

    toggleItem: (productId: string) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(productId)) {
            removeItem(productId);
        } else {
            addItem(productId);
        }
    },

    isInWishlist: (productId: string) => {
        return get().items.has(productId);
    },

    clearWishlist: () => {
        set({ items: new Set() });
    },
}));
