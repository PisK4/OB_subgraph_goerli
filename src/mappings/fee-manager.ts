import {
  DealerUpdated as DealerUpdatedEvent,
  ETHDeposit as ETHDepositEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  SubmissionUpdated as SubmissionUpdatedEvent,
  SubmitterRegistered as SubmitterRegisteredEvent,
  Withdraw as WithdrawEvent
} from "../types/FeeManager/FeeManager"
import {
  DealerUpdated,
  ETHDeposit,
  OwnershipTransferred,
  SubmissionUpdated,
  SubmitterRegistered,
  Withdraw
} from "../types/schema"
import { handleWithdrawEvent } from "./helpers"

export function handleDealerUpdated(event: DealerUpdatedEvent): void {
  let entity = new DealerUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.dealer = event.params.dealer
  entity.feeRatio = event.params.feeRatio
  entity.extraInfo = event.params.extraInfo

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleETHDeposit(event: ETHDepositEvent): void {
  let entity = new ETHDeposit(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
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
  entity.stratBlock = event.params.stratBlock
  entity.endBlock = event.params.endBlock
  entity.submitTimestamp = event.params.submitTimestamp
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

export function handleWithdraw(event: WithdrawEvent): void {
  handleWithdrawEvent(
    event.params.user,
    event.params.chainId,
    event.params.token,
    event.params.debt,
    event.params.amount,
    event
  )
}
