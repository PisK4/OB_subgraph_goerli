
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { factoryCreateMDC } from './factory-core'

export function handleMDCCreated(event: MDCCreatedEvent): void {
  factoryCreateMDC(
    event,
    event.params.maker,
    event.params.mdc
  )
}
