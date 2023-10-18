import {
  ChallengeInfoUpdated as ChallengeInfoUpdatedEvent,
  ColumnArrayUpdated as ColumnArrayUpdatedEvent,
  ResponseMakersUpdated as ResponseMakersUpdatedEvent,
  RulesRootUpdated as RulesRootUpdatedEvent,
  SpvUpdated as SpvUpdatedEvent
} from "../types/templates/MDC/MDC"
import {
  handleChallengeInfoUpdatedEvent,
  handleColumnArrayUpdatedEvent,
  handleResponseMakersUpdatedEvent,
  handleSpvUpdatedEvent,
  handleupdateRulesRootEvent
} from "./mdc-core"
import { padZeroToAddress } from "./utils"

export function handleChallengeInfoUpdated(
  event: ChallengeInfoUpdatedEvent
): void {
  handleChallengeInfoUpdatedEvent(
    event,
    event.params.challengeId.toHexString(),
    event.params.challengeInfo.sourceTxFrom,
    event.params.challengeInfo.sourceTxTime,
    event.params.challengeInfo.challenger.toHexString(),
    event.params.challengeInfo.freezeToken.toHexString(),
    event.params.challengeInfo.challengeUserRatio,
    event.params.challengeInfo.freezeAmount0,
    event.params.challengeInfo.freezeAmount1,
    event.params.challengeInfo.challengeTime,
    event.params.challengeInfo.abortTime,
    event.params.challengeInfo.verifiedTime0,
    event.params.challengeInfo.verifiedTime1,
    event.params.challengeInfo.verifiedDataHash0.toHexString()
  )
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
