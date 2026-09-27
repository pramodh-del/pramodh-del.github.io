import { motionValue } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { SCATTER } from './events'
import { clamp, pointerX, pointerY, startPointerTracking } from './pointer'

/**
 * One "scene tilt" signal, -1..1 on each axis, that 3D effects read from.
 * Desktop: where the cursor is relative to the centre of the window.
 * Phones: how the phone is tilted (DeviceOrientation), relative to how it's being held.
 */
export const sceneX = motionValue(0)
export const sceneY = motionValue(0)

export type GyroState = 'unsupported' | 'needs-permission' | 'on' | 'denied'

let gyro: GyroState = 'unsupported'
const subscribers = new Set<() => void>()
const setGyro = (s: GyroState) => {
  gyro = s
  subscribers.forEach((fn) => fn())
}

let pointerStarted = false
export function startPointerScene() {
  if (pointerStarted) return
  pointerStarted = true
  startPointerTracking()
  const update = () => {
    sceneX.set(clamp((pointerX.get() / window.innerWidth) * 2 - 1, -1, 1))
    sceneY.set(clamp((pointerY.get() / window.innerHeight) * 2 - 1, -1, 1))
  }
  pointerX.on('change', update)
  pointerY.on('change', update)
}

let base: { beta: number; gamma: number } | null = null
function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta === null || e.gamma === null) return
  if (!base) base = { beta: e.beta, gamma: e.gamma }
  // Let "neutral" drift slowly toward however the phone is being held.
  base.beta += (e.beta - base.beta) * 0.02
  base.gamma += (e.gamma - base.gamma) * 0.02
  sceneX.set(clamp((e.gamma - base.gamma) / 18, -1, 1))
  sceneY.set(clamp((e.beta - base.beta) / 18, -1, 1))
}

let lastShake = 0
function onMotion(e: DeviceMotionEvent) {
  const a = e.acceleration
  if (!a || a.x === null || a.y === null || a.z === null) return
  const force = Math.hypot(a.x, a.y, a.z)
  const now = Date.now()
  if (force > 22 && now - lastShake > 1500) {
    lastShake = now
    window.dispatchEvent(new Event(SCATTER))
  }
}

function listen() {
  window.addEventListener('deviceorientation', onOrientation)
  window.addEventListener('devicemotion', onMotion)
  setGyro('on')
}

type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Call once on touch devices. Android starts straight away; iOS needs a tap first. */
export function initGyro() {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window) || gyro !== 'unsupported') return
  const api = window.DeviceOrientationEvent as unknown as PermissionApi
  if (typeof api.requestPermission === 'function') setGyro('needs-permission')
  else listen()
}

/** iOS: must run inside a tap handler. */
export async function requestGyro() {
  const orient = window.DeviceOrientationEvent as unknown as PermissionApi
  const motion = window.DeviceMotionEvent as unknown as PermissionApi | undefined
  try {
    const res = await orient.requestPermission?.()
    // Shake-to-scatter is a bonus; carry on without it if motion is refused.
    await motion?.requestPermission?.().catch(() => 'denied')
    if (res === 'granted') listen()
    else setGyro('denied')
  } catch {
    setGyro('denied')
  }
}

export const useGyro = () =>
  useSyncExternalStore(
    (cb) => {
      subscribers.add(cb)
      return () => subscribers.delete(cb)
    },
    () => gyro,
    () => 'unsupported' as GyroState,
  )
