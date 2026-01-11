import {
    Terminal, Box, Binary, Keyboard, GitGraph, Repeat, List, FunctionSquare,
    Book, Package, FileText, LayoutTemplate, AlertTriangle, BoxSelect, Rocket
} from 'lucide-react';

// Path positions for the level map
export const pathPositions = [
    { x: 75, y: 90 }, { x: 55, y: 82 }, { x: 30, y: 78 }, { x: 20, y: 68 },
    { x: 35, y: 58 }, { x: 55, y: 52 }, { x: 70, y: 44 }, { x: 50, y: 36 },
    { x: 25, y: 30 }, { x: 40, y: 22 }, { x: 65, y: 18 }, { x: 80, y: 12 },
    { x: 55, y: 8 }, { x: 30, y: 5 }, { x: 50, y: 2 },
];

// Python Learning Path Levels
export const levels = [
    { id: 1, name: 'Hello Python', icon: <Terminal size={32} />, stars: 0, unlocked: true },
    { id: 2, name: 'Variables', icon: <Box size={32} />, stars: 0, unlocked: false },
    { id: 3, name: 'Data Types', icon: <Binary size={32} />, stars: 0, unlocked: false },
    { id: 4, name: 'Input', icon: <Keyboard size={32} />, stars: 0, unlocked: false },
    { id: 5, name: 'Conditionals', icon: <GitGraph size={32} />, stars: 0, unlocked: false },
    { id: 6, name: 'Loops', icon: <Repeat size={32} />, stars: 0, unlocked: false },
    { id: 7, name: 'Lists', icon: <List size={32} />, stars: 0, unlocked: false },
    { id: 8, name: 'Functions', icon: <FunctionSquare size={32} />, stars: 0, unlocked: false },
    { id: 9, name: 'Dictionaries', icon: <Book size={32} />, stars: 0, unlocked: false },
    { id: 10, name: 'Modules', icon: <Package size={32} />, stars: 0, unlocked: false },
    { id: 11, name: 'File I/O', icon: <FileText size={32} />, stars: 0, unlocked: false },
    { id: 12, name: 'Classes', icon: <LayoutTemplate size={32} />, stars: 0, unlocked: false },
    { id: 13, name: 'Error Handling', icon: <AlertTriangle size={32} />, stars: 0, unlocked: false },
    { id: 14, name: 'Virtual Env', icon: <BoxSelect size={32} />, stars: 0, unlocked: false },
    { id: 15, name: 'Final Project', icon: <Rocket size={32} />, stars: 0, unlocked: false, hasGift: true },
];

// Static decorations for the map
export const decorations = [
    // Left side forest
    { src: '/assets/oak-tree.png', x: 5, y: 5, size: '100px', zIndex: 'z-20' },
    { src: '/assets/bush.png', x: 12, y: 15, size: '45px', zIndex: 'z-10' },
    { src: '/assets/pine-tree.png', x: 8, y: 25, size: '110px', zIndex: 'z-20' },
    { src: '/assets/mushrooms.png', x: 15, y: 35, size: '30px', zIndex: 'z-10', pulse: true },
    { src: '/assets/rock-large.png', x: 5, y: 45, size: '40px', zIndex: 'z-0' },
    { src: '/assets/oak-tree.png', x: 10, y: 55, size: '95px', zIndex: 'z-20' },
    { src: '/assets/bush.png', x: 4, y: 65, size: '50px', zIndex: 'z-10' },
    { src: '/assets/pine-tree.png', x: 8, y: 75, size: '115px', zIndex: 'z-20' },
    { src: '/assets/rock-large.png', x: 14, y: 85, size: '35px', zIndex: 'z-0' },
    { src: '/assets/mushrooms.png', x: 6, y: 92, size: '28px', zIndex: 'z-10' },

    // Right side forest
    { src: '/assets/pine-tree.png', x: 85, y: 8, size: '105px', zIndex: 'z-20' },
    { src: '/assets/rock-large.png', x: 92, y: 18, size: '42px', zIndex: 'z-0' },
    { src: '/assets/oak-tree.png', x: 88, y: 28, size: '90px', zIndex: 'z-20' },
    { src: '/assets/bush.png', x: 82, y: 38, size: '48px', zIndex: 'z-10' },
    { src: '/assets/pine-tree.png', x: 90, y: 48, size: '120px', zIndex: 'z-20' },
    { src: '/assets/mushrooms.png', x: 84, y: 58, size: '32px', zIndex: 'z-10', pulse: true },
    { src: '/assets/oak-tree.png', x: 92, y: 68, size: '98px', zIndex: 'z-20' },
    { src: '/assets/rock-large.png', x: 86, y: 78, size: '38px', zIndex: 'z-0' },
    { src: '/assets/bush.png', x: 94, y: 88, size: '44px', zIndex: 'z-10' },

    // Scattered inner details
    { src: '/assets/bush.png', x: 25, y: 10, size: '40px', zIndex: 'z-10' },
    { src: '/assets/rock-large.png', x: 65, y: 22, size: '30px', zIndex: 'z-0' },
    { src: '/assets/mushrooms.png', x: 30, y: 40, size: '25px', zIndex: 'z-10' },
    { src: '/assets/bush.png', x: 70, y: 52, size: '42px', zIndex: 'z-10' },
    { src: '/assets/rock-large.png', x: 22, y: 70, size: '36px', zIndex: 'z-0' },
    { src: '/assets/mushrooms.png', x: 60, y: 82, size: '26px', zIndex: 'z-10', pulse: true },
    { src: '/assets/bush.png', x: 40, y: 95, size: '45px', zIndex: 'z-10' },
];

// Snowflake positions for frozen area
export const snowflakePositions = [
    { left: '15%', top: '10%' }, { left: '30%', top: '8%' }, { left: '50%', top: '12%' },
    { left: '70%', top: '6%' }, { left: '85%', top: '15%' }, { left: '25%', top: '22%' },
    { left: '60%', top: '20%' }, { left: '45%', top: '30%' }, { left: '80%', top: '28%' },
    { left: '20%', top: '38%' }, { left: '65%', top: '35%' },
];
