import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types/product';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
            const { product, quantity } = action.payload;
            const targetId = String(product.id || (product as any)._id || '');
            const existingItem = state.items.find(item => {
                const itemId = String(item.product.id || (item.product as any)._id || '');
                return itemId === targetId && targetId !== '';
            });
            if (!existingItem) {
                state.items.push({ product, quantity: quantity || 1 });
            } else {
                existingItem.quantity += (quantity || 1);
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            const targetId = String(action.payload);
            state.items = state.items.filter(item => {
                const itemId = String(item.product.id || (item.product as any)._id || '');
                return itemId !== targetId;
            });
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const targetId = String(id);
            if (quantity <= 0) {
                state.items = state.items.filter(item => {
                    const itemId = String(item.product.id || (item.product as any)._id || '');
                    return itemId !== targetId;
                });
            } else {
                const item = state.items.find(item => {
                    const itemId = String(item.product.id || (item.product as any)._id || '');
                    return itemId === targetId;
                });
                if (item) {
                    item.quantity = quantity;
                }
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { hydrateCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
