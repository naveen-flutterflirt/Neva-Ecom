import { Product } from '../types/product';

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Neva Silk PLA Violet Spool',
        category: '3D Printing',
        price: 1299,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Seller',
        isIoT: false,
        description: 'Industrial-grade Silk PLA filament offering high gloss finish, low shrinkage, and excellent layer adhesion for high-end decorative prints.',
        specs: {
            "Material": "Silk PLA",
            "Diameter": "1.75mm",
            "Spool Weight": "1.0 kg",
            "Print Temp": "190-220°C",
            "Bed Temp": "50-60°C"
        }
    },
    {
        id: '2',
        name: 'Neva Node IoT Core v2',
        category: 'Smart IoT',
        price: 849,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        badge: 'New',
        isIoT: true,
        description: 'A high-performance IoT development board powered by ESP32, featuring integrated Wi-Fi + Bluetooth, 4MB flash, and 26 GPIO pins for smart hardware integration.',
        specs: {
            "Chipset": "ESP-WROOM-32",
            "Memory": "4MB Flash / 520KB SRAM",
            "Connectivity": "Wi-Fi 802.11 b/g/n & BLE 4.2",
            "Input Voltage": "5V USB / 3.3V-12V Vin",
            "Interfaces": "I2C, SPI, UART, PWM"
        }
    },
    {
        id: '3',
        name: 'Neva Matte PLA Emerald Spool',
        category: '3D Printing',
        price: 1199,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1563784462386-044fd95e9852?auto=format&fit=crop&w=800&q=80',
        isIoT: false,
        description: 'Stunning matte texture finish filament designed for architectural mockups, figurines, and low-visibility layer lines.',
        specs: {
            "Material": "Matte PLA",
            "Diameter": "1.75mm",
            "Spool Weight": "1.0 kg",
            "Print Temp": "195-215°C",
            "Bed Temp": "0-60°C"
        }
    },
    {
        id: '4',
        name: 'Neva IoT Motor Shield v1.2',
        category: 'Smart IoT',
        price: 499,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        badge: 'Popular',
        isIoT: true,
        description: 'Robust motor driver extension board for microcontrollers, supporting dual DC motors or stepper motors with thermal shutdown and overload protection.',
        specs: {
            "Driver Chip": "L293D / TB6612FNG",
            "Max Current": "1.2A per channel",
            "Input Range": "4.5V - 13.5V",
            "Outputs": "2x Stepper or 4x DC Motors",
            "Protection": "Over-temperature & ESD"
        }
    },
];
