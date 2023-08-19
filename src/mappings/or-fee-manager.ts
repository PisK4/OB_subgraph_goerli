import {
  DealerUpdated as DealerUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SubmissionUpdated as SubmissionUpdatedEvent,
  SubmitterRegistered as SubmitterRegisteredEvent
} from "../types/ORFeeManager/ORFeeManager"
import {
  OwnershipTransferred,
  SubmissionUpdated,
  SubmitterRegistered
} from "../types/schema"
import { handleDealerUpdatedEvent } from "./helpers"

export function handleDealerUpdated(event: DealerUpdatedEvent): void {
  handleDealerUpdatedEvent(
    event.params.dealer,
    event.params.feeRatio,
    event.params.extraInfo,
    event
    )
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmissionUpdated(event: SubmissionUpdatedEvent): void {
  let entity = new SubmissionUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.submissionHash = event.params.submissionHash
  entity.stratBlock = event.params.stratBlock
  entity.endBlock = event.params.endBlock
  entity.profitRoot = event.params.profitRoot
  entity.stateTransTreeRoot = event.params.stateTransTreeRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitterRegistered(
  event: SubmitterRegisteredEvent
): void {
  let entity = new SubmitterRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.submiter = event.params.submiter
  entity.marginAmount = event.params.marginAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
