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
        addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ product, quantity });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.product.id !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.product.id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
