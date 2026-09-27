// Page-wide moments that any component can trigger or react to.
export const SCATTER = 'kp:scatter'
export const INCIDENT = 'kp:incident'
export const PALETTE = 'kp:palette'

export const emit = (name: string) => window.dispatchEvent(new Event(name))
