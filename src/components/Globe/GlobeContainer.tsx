'use client'

import type { GlobeCoreProps } from './GlobeCore'

// Thin wrapper — enforces client-only via AppShell's dynamic import
export { default } from './GlobeCore'
export type { GlobeCoreProps }
