// // src/test/setup.ts
// // Configuración inicial para pruebas con Vitest

// import { expect, afterEach } from 'vitest';
// import { cleanup } from '@testing-library/react';
// import * as matchers from '@testing-library/jest-dom/matchers';

// // Extender matchers de jest-dom para Vitest
// expect.extend(matchers);

// // Limpiar después de cada prueba
// afterEach(() => {
//   cleanup();
// });

// // Mock de window.matchMedia
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: (query: string) => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: () => {}, // Deprecated
//     removeListener: () => {}, // Deprecated
//     addEventListener: () => {},
//     removeEventListener: () => {},
//     dispatchEvent: () => true,
//   }),
// });

// // Mock de localStorage
// const localStorageMock = {
//   getItem: (key: string) => null,
//   setItem: (key: string, value: string) => {},
//   removeItem: (key: string) => {},
//   clear: () => {},
// };
// global.localStorage = localStorageMock as Storage;

// // Mock de console para tests más limpios
// global.console = {
//   ...console,
//   error: (...args: any[]) => {},
//   warn: (...args: any[]) => {},
//   log: (...args: any[]) => {},
// };

// // Mock de IntersectionObserver
// global.IntersectionObserver = class IntersectionObserver {
//   constructor() {}
//   disconnect() {}
//   observe() {}
//   takeRecords() {
//     return [];
//   }
//   unobserve() {}
// } as any;

// // Mock de ResizeObserver
// global.ResizeObserver = class ResizeObserver {
//   constructor() {}
//   disconnect() {}
//   observe() {}
//   unobserve() {}
// } as any;


// Mock de localStorage MEJORADO
const storage: { [key: string]: string } = {};

const localStorageMock = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
};

global.localStorage = localStorageMock as Storage;