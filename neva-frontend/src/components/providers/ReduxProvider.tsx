'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { hydrateCart } from '../../store/cartSlice';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.removeItem('neva-saved-user-cart');
            const savedCart = localStorage.getItem('neva-cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                store.dispatch(hydrateCart(parsedCart.items || []));
            }
        } catch (error) {
            console.error('Failed to hydrate cart from localStorage:', error);
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
