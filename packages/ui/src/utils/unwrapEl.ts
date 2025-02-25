import { Component } from 'vue'

export const unwrapEl = <T extends HTMLElement | Component | undefined>(el: T) => {
  if (!el) { return }

  if ('$el' in (el as Component)) {
    return (el as any).$el as HTMLElement
  }

  return el as HTMLElement
}
