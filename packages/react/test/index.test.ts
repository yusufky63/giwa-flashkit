import { describe, it, expect } from 'vitest'
import * as ReactFlashKit from '../src/index'

describe('@flashkit/react public exports', () => {
  it('exports all expected hooks and provider components', () => {
    expect(typeof ReactFlashKit.FlashKitProvider).toBe('function')
    expect(typeof ReactFlashKit.useFlashKitInstance).toBe('function')
    expect(typeof ReactFlashKit.useFlashTransaction).toBe('function')
    expect(typeof ReactFlashKit.useFlashSimulation).toBe('function')
    expect(typeof ReactFlashKit.useFlashStatus).toBe('function')
  })
})
