import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  ChallengeInfoUpdated,
  ColumnArrayUpdated,
  ResponseMakersUpdated,
  RulesRootUpdated,
  SpvUpdated
} from "../src/types/templates/MDC/MDC"

export function createChallengeInfoUpdatedEvent(
  challengeId: Bytes,
  challengeInfo: ethereum.Tuple
): ChallengeInfoUpdated {
  let challengeInfoUpdatedEvent = changetype<ChallengeInfoUpdated>(
    newMockEvent()
  )

  challengeInfoUpdatedEvent.parameters = new Array()

  challengeInfoUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromFixedBytes(challengeId)
    )
  )
  challengeInfoUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeInfo",
      ethereum.Value.fromTuple(challengeInfo)
    )
  )

  return challengeInfoUpdatedEvent
}

export function createColumnArrayUpdatedEvent(
  impl: Address,
  columnArrayHash: Bytes,
  dealers: Array<Address>,
  ebcs: Array<Address>,
  chainIds: Array<i32>
): ColumnArrayUpdated {
  let columnArrayUpdatedEvent = changetype<ColumnArrayUpdated>(newMockEvent())

  columnArrayUpdatedEvent.parameters = new Array()

  columnArrayUpdatedEvent.parameters.push(
    new ethereum.EventParam("impl", ethereum.Value.fromAddress(impl))
  )
  columnArrayUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "columnArrayHash",
      ethereum.Value.fromFixedBytes(columnArrayHash)
    )
  )
  columnArrayUpdatedEvent.parameters.push(
    new ethereum.EventParam("dealers", ethereum.Value.fromAddressArray(dealers))
  )
  columnArrayUpdatedEvent.parameters.push(
    new ethereum.EventParam("ebcs", ethereum.Value.fromAddressArray(ebcs))
  )
  columnArrayUpdatedEvent.parameters.push(
    new ethereum.EventParam("chainIds", ethereum.Value.fromI32Array(chainIds))
  )

  return columnArrayUpdatedEvent
}

export function createResponseMakersUpdatedEvent(
  impl: Address,
  responseMakers: Array<Address>
): ResponseMakersUpdated {
  let responseMakersUpdatedEvent = changetype<ResponseMakersUpdated>(
    newMockEvent()
  )

  responseMakersUpdatedEvent.parameters = new Array()

  responseMakersUpdatedEvent.parameters.push(
    new ethereum.EventParam("impl", ethereum.Value.fromAddress(impl))
  )
  responseMakersUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "responseMakers",
      ethereum.Value.fromAddressArray(responseMakers)
    )
  )

  return responseMakersUpdatedEvent
}

export function createRulesRootUpdatedEvent(
  impl: Address,
  ebc: Address,
  rootWithVersion: ethereum.Tuple,
  input: Bytes
): RulesRootUpdated {
  let rulesRootUpdatedEvent = changetype<RulesRootUpdated>(newMockEvent())

  rulesRootUpdatedEvent.parameters = new Array()

  rulesRootUpdatedEvent.parameters.push(
    new ethereum.EventParam("impl", ethereum.Value.fromAddress(impl))
  )
  rulesRootUpdatedEvent.parameters.push(
    new ethereum.EventParam("ebc", ethereum.Value.fromAddress(ebc))
  )
  rulesRootUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "rootWithVersion",
      ethereum.Value.fromTuple(rootWithVersion)
    )
  )
  rulesRootUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "input",
      ethereum.Value.fromFixedBytes(input)
     )
  )

  return rulesRootUpdatedEvent
}

export function createSpvUpdatedEvent(
  impl: Address,
  chainId: i32,
  spv: Address
): SpvUpdated {
  let spvUpdatedEvent = changetype<SpvUpdated>(newMockEvent())

  spvUpdatedEvent.parameters = new Array()

  spvUpdatedEvent.parameters.push(
    new ethereum.EventParam("impl", ethereum.Value.fromAddress(impl))
  )
  spvUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "chainId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(chainId))
    )
  )
  spvUpdatedEvent.parameters.push(
    new ethereum.EventParam("spv", ethereum.Value.fromAddress(spv))
  )

  return spvUpdatedEvent
}
