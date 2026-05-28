/// <reference types="vite/client" />

declare function route(
    name: string,
    params?: any,
    absolute?: boolean
): string;

interface Window {
    Echo: any;
    Pusher: any;
}
