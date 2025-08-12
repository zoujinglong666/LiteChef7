
type EventHandler = (...args: any[]) => void

class EventBus {
  private events: Map<string, Set<EventHandler>>

  constructor() {
    this.events = new Map()
  }

  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }

  once(event: string, handler: EventHandler) {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper)
      handler(...args)
    }
    this.on(event, wrapper)
  }

  off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.events.delete(event)
    } else {
      this.events.get(event)?.delete(handler)
      if (this.events.get(event)?.size === 0) {
        this.events.delete(event)
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        handler(...args)
      })
    }
  }

  clear() {
    this.events.clear()
  }
}

const eventBus = new EventBus()

export default eventBus
