
import { Address } from "@graphprotocol/graph-ts";
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { factoryCreate, factoryCreateMDC } from './factory-core'

export function handleMDCCreated(event: MDCCreatedEvent): void {
  factoryCreateMDC(
    event,
    event.params.maker,
    event.params.mdc
  )

  factoryCreate();
}
