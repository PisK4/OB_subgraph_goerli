import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { MDCCreated } from "../src/types/MDCFactory/MDCFactory"

export function createMDCCreatedEvent(
  maker: Address,
  mdc: Address
): MDCCreated {
  let mdcCreatedEvent = changetype<MDCCreated>(newMockEvent())

  mdcCreatedEvent.parameters = new Array()

  mdcCreatedEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  mdcCreatedEvent.parameters.push(
    new ethereum.EventParam("mdc", ethereum.Value.fromAddress(mdc))
  )

  return mdcCreatedEvent
}
