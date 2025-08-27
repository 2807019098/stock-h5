declare module '@/components/*' {
    const component: any
    export default component
}

declare module '@/views/*' {
    const component: any
    export default component
}

declare module '@/utils/*' {
    const util: any
    export default util
}

declare module '@/store/*' {
    const store: any
    export default store
}

declare module '@/api/*' {
    const api: any
    export default api
}

declare module '@/router/*' {
    const router: any
    export default router
}

declare module '@/types/*' {
    const types: any
    export default types
}

declare module '@/hooks/*' {
    const hook: any
    export default hook
}

declare module '@/common/*' {
    const common: any
    export default common
}

declare module '@/common/app/index' {
    export const palettes: any[]
    export const theme: any
    export const darkTheme: any
}

declare module '@/store/app' {
    export function useBaseStore(): any
    export function useAppStoreWithOut(): any
}

declare module '@/utils' {
    export function getAssetsUrl(name: string): string
    export function getClientInfo(): any
    export function getQueryString(key: string, url?: string): string | null
    export function getURLParameters(url?: string): Record<string, string>
    export function smoothScrollTo(element: HTMLElement, target: number, duration?: number): Promise<void>
}

declare module '@/components/*' {
    const component: any
    export default component
}

