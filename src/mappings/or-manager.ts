import {
  ChainInfoUpdated as ChainInfoUpdatedEvent,
  ChainTokenUpdated as ChainTokenUpdatedEvent,
  ChallengeUserRatioUpdated as ChallengeUserRatioUpdatedEvent,
  EbcsUpdated as EbcsUpdatedEvent,
  FeeChallengeSecondUpdated as FeeChallengeSecondUpdatedEvent,
  FeeTakeOnChallengeSecondUpdated as FeeTakeOnChallengeSecondUpdatedEvent,
  MaxMDCLimitUpdated as MaxMDCLimitUpdatedEvent,
  MinChallengeRatioUpdated as MinChallengeRatioUpdatedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  ProtocolFeeUpdated as ProtocolFeeUpdatedEvent,
  SubmitterFeeUpdated as SubmitterFeeUpdatedEvent
} from "../types/ORManager/ORManager"
import {
  ChainInfoUpdated,
  ChainTokenUpdated,
  ChallengeUserRatioUpdated,
  EbcsUpdated,
  FeeChallengeSecondUpdated,
  FeeTakeOnChallengeSecondUpdated,
  MaxMDCLimitUpdated,
  MinChallengeRatioUpdated,
  OwnershipTransferred,
  ProtocolFeeUpdated,
  SubmitterFeeUpdated
} from "../types/schema"

export function handleChainInfoUpdated(event: ChainInfoUpdatedEvent): void {
  let entity = new ChainInfoUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ORManager_id = event.params.id
  entity.chainInfo_id = event.params.chainInfo.id
  entity.chainInfo_batchLimit = event.params.chainInfo.batchLimit
  entity.chainInfo_minVerifyChallengeSourceTxSecond =
    event.params.chainInfo.minVerifyChallengeSourceTxSecond
  entity.chainInfo_maxVerifyChallengeSourceTxSecond =
    event.params.chainInfo.maxVerifyChallengeSourceTxSecond
  entity.chainInfo_minVerifyChallengeDestTxSecond =
    event.params.chainInfo.minVerifyChallengeDestTxSecond
  entity.chainInfo_maxVerifyChallengeDestTxSecond =
    event.params.chainInfo.maxVerifyChallengeDestTxSecond
  // entity.chainInfo_spvs = event.params.chainInfo.spvs

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleChainTokenUpdated(event: ChainTokenUpdatedEvent): void {
  let entity = new ChainTokenUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.ORManager_id = event.params.id
  entity.tokenInfo_token = event.params.tokenInfo.token
  entity.tokenInfo_mainnetToken = event.params.tokenInfo.mainnetToken
  entity.tokenInfo_decimals = event.params.tokenInfo.decimals

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleChallengeUserRatioUpdated(
  event: ChallengeUserRatioUpdatedEvent
): void {
  let entity = new ChallengeUserRatioUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeUserRatio = event.params.challengeUserRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEbcsUpdated(event: EbcsUpdatedEvent): void {
  let entity = new EbcsUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  // entity.ebcs = event.params.ebcs
  entity.statuses = event.params.statuses

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeChallengeSecondUpdated(
  event: FeeChallengeSecondUpdatedEvent
): void {
  let entity = new FeeChallengeSecondUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.feeChallengeSecond = event.params.feeChallengeSecond

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFeeTakeOnChallengeSecondUpdated(
  event: FeeTakeOnChallengeSecondUpdatedEvent
): void {
  let entity = new FeeTakeOnChallengeSecondUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.feeTakeOnChallengeSecond = event.params.feeTakeOnChallengeSecond

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxMDCLimitUpdated(event: MaxMDCLimitUpdatedEvent): void {
  let entity = new MaxMDCLimitUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.maxMDCLimit = event.params.maxMDCLimit

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMinChallengeRatioUpdated(
  event: MinChallengeRatioUpdatedEvent
): void {
  let entity = new MinChallengeRatioUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.minChallengeRatio = event.params.minChallengeRatio

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

export function handleProtocolFeeUpdated(event: ProtocolFeeUpdatedEvent): void {
  let entity = new ProtocolFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.protocolFee = event.params.protocolFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSubmitterFeeUpdated(
  event: SubmitterFeeUpdatedEvent
): void {
  let entity = new SubmitterFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.submitter = event.params.submitter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
