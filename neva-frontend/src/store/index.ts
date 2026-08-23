import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './cartSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
    },
});

store.subscribe(() => {
    if (typeof window !== 'undefined') {
        try {
            const cartState = store.getState().cart;
            localStorage.setItem('neva-cart', JSON.stringify(cartState));
            const token = localStorage.getItem('neva-token');
            if (token) {
                localStorage.setItem('neva-saved-user-cart', JSON.stringify(cartState.items));
            }
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error);
        }
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for store queries and dispatch triggers
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
