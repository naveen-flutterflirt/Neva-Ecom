export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    image: string;
    badge?: string;
    isIoT: boolean;
    description: string;
    specs: Record<string, string>;
}
