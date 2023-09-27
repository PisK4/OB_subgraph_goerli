import {
  ChallengeInfoUpdated as ChallengeInfoUpdatedEvent,
  ColumnArrayUpdated as ColumnArrayUpdatedEvent,
  ResponseMakersUpdated as ResponseMakersUpdatedEvent,
  RulesRootUpdated as RulesRootUpdatedEvent,
  SpvUpdated as SpvUpdatedEvent
} from "../types/templates/MDC/MDC"
import {
  ChallengeInfoUpdated
} from "../types/schema"
import {
  handleColumnArrayUpdatedEvent,
  handleResponseMakersUpdatedEvent,
  handleSpvUpdatedEvent,
  handleupdateRulesRootEvent
} from "./mdc-core"

export function handleChallengeInfoUpdated(
  event: ChallengeInfoUpdatedEvent
): void {
  let entity = new ChallengeInfoUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.challengeInfo_sourceTxFrom = event.params.challengeInfo.sourceTxFrom
  entity.challengeInfo_sourceTxTime = event.params.challengeInfo.sourceTxTime
  entity.challengeInfo_challenger = event.params.challengeInfo.challenger
  entity.challengeInfo_freezeToken = event.params.challengeInfo.freezeToken
  entity.challengeInfo_challengeUserRatio =
    event.params.challengeInfo.challengeUserRatio
  entity.challengeInfo_freezeAmount0 = event.params.challengeInfo.freezeAmount0
  entity.challengeInfo_freezeAmount1 = event.params.challengeInfo.freezeAmount1
  entity.challengeInfo_challengeTime = event.params.challengeInfo.challengeTime
  entity.challengeInfo_abortTime = event.params.challengeInfo.abortTime
  entity.challengeInfo_verifiedTime0 = event.params.challengeInfo.verifiedTime0
  entity.challengeInfo_verifiedTime1 = event.params.challengeInfo.verifiedTime1
  entity.challengeInfo_verifiedDataHash0 =
    event.params.challengeInfo.verifiedDataHash0

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleColumnArrayUpdated(event: ColumnArrayUpdatedEvent): void {
  handleColumnArrayUpdatedEvent(
    event,
    event.params.impl,
    event.params.columnArrayHash,
    event.params.dealers,
    event.params.ebcs,
    event.params.chainIds
  )
}

export function handleResponseMakersUpdated(
  event: ResponseMakersUpdatedEvent
): void {
  handleResponseMakersUpdatedEvent(
    event,
    event.params.impl,
    event.params.responseMakers
  )
}

export function handleRulesRootUpdated(event: RulesRootUpdatedEvent): void {
  handleupdateRulesRootEvent(
    event,
    event.params.impl,
    event.params.ebc,
    event.params.rootWithVersion.root,
    event.params.rootWithVersion.version
  )
}

export function handleSpvUpdated(event: SpvUpdatedEvent): void {
  handleSpvUpdatedEvent(
    event,
    event.params.impl,
    event.params.chainId,
    event.params.spv
  )
}
