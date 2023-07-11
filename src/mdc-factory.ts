import { MDCCreated as MDCCreatedEvent } from "./types/MDCFactory/MDCFactory"
import { MDCCreated } from "./types/schema"

export function handleMDCCreated(event: MDCCreatedEvent): void {
  let entity = new MDCCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.maker = event.params.maker
  entity.mdc = event.params.mdc

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
