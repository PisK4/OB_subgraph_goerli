import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../src/types/ORManager/ORManager"

export function createChainInfoUpdatedEvent(
  id: BigInt,
  chainInfo: ethereum.Tuple
): ChainInfoUpdated {
  let chainInfoUpdatedEvent = changetype<ChainInfoUpdated>(newMockEvent())

  chainInfoUpdatedEvent.parameters = new Array()

  chainInfoUpdatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  chainInfoUpdatedEvent.parameters.push(
    new ethereum.EventParam("chainInfo", ethereum.Value.fromTuple(chainInfo))
  )

  return chainInfoUpdatedEvent
}

export function createChainTokenUpdatedEvent(
  id: BigInt,
  tokenInfo: ethereum.Tuple
): ChainTokenUpdated {
  let chainTokenUpdatedEvent = changetype<ChainTokenUpdated>(newMockEvent())

  chainTokenUpdatedEvent.parameters = new Array()

  chainTokenUpdatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  chainTokenUpdatedEvent.parameters.push(
    new ethereum.EventParam("tokenInfo", ethereum.Value.fromTuple(tokenInfo))
  )

  return chainTokenUpdatedEvent
}

export function createChallengeUserRatioUpdatedEvent(
  challengeUserRatio: BigInt
): ChallengeUserRatioUpdated {
  let challengeUserRatioUpdatedEvent = changetype<ChallengeUserRatioUpdated>(
    newMockEvent()
  )

  challengeUserRatioUpdatedEvent.parameters = new Array()

  challengeUserRatioUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeUserRatio",
      ethereum.Value.fromUnsignedBigInt(challengeUserRatio)
    )
  )

  return challengeUserRatioUpdatedEvent
}

export function createEbcsUpdatedEvent(
  ebcs: Array<Address>,
  statuses: Array<boolean>
): EbcsUpdated {
  let ebcsUpdatedEvent = changetype<EbcsUpdated>(newMockEvent())

  ebcsUpdatedEvent.parameters = new Array()

  ebcsUpdatedEvent.parameters.push(
    new ethereum.EventParam("ebcs", ethereum.Value.fromAddressArray(ebcs))
  )
  ebcsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "statuses",
      ethereum.Value.fromBooleanArray(statuses)
    )
  )

  return ebcsUpdatedEvent
}

export function createFeeChallengeSecondUpdatedEvent(
  feeChallengeSecond: BigInt
): FeeChallengeSecondUpdated {
  let feeChallengeSecondUpdatedEvent = changetype<FeeChallengeSecondUpdated>(
    newMockEvent()
  )

  feeChallengeSecondUpdatedEvent.parameters = new Array()

  feeChallengeSecondUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "feeChallengeSecond",
      ethereum.Value.fromUnsignedBigInt(feeChallengeSecond)
    )
  )

  return feeChallengeSecondUpdatedEvent
}

export function createFeeTakeOnChallengeSecondUpdatedEvent(
  feeTakeOnChallengeSecond: BigInt
): FeeTakeOnChallengeSecondUpdated {
  let feeTakeOnChallengeSecondUpdatedEvent = changetype<
    FeeTakeOnChallengeSecondUpdated
  >(newMockEvent())

  feeTakeOnChallengeSecondUpdatedEvent.parameters = new Array()

  feeTakeOnChallengeSecondUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "feeTakeOnChallengeSecond",
      ethereum.Value.fromUnsignedBigInt(feeTakeOnChallengeSecond)
    )
  )

  return feeTakeOnChallengeSecondUpdatedEvent
}

export function createMaxMDCLimitUpdatedEvent(
  maxMDCLimit: BigInt
): MaxMDCLimitUpdated {
  let maxMdcLimitUpdatedEvent = changetype<MaxMDCLimitUpdated>(newMockEvent())

  maxMdcLimitUpdatedEvent.parameters = new Array()

  maxMdcLimitUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxMDCLimit",
      ethereum.Value.fromUnsignedBigInt(maxMDCLimit)
    )
  )

  return maxMdcLimitUpdatedEvent
}

export function createMinChallengeRatioUpdatedEvent(
  minChallengeRatio: BigInt
): MinChallengeRatioUpdated {
  let minChallengeRatioUpdatedEvent = changetype<MinChallengeRatioUpdated>(
    newMockEvent()
  )

  minChallengeRatioUpdatedEvent.parameters = new Array()

  minChallengeRatioUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "minChallengeRatio",
      ethereum.Value.fromUnsignedBigInt(minChallengeRatio)
    )
  )

  return minChallengeRatioUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createProtocolFeeUpdatedEvent(
  protocolFee: BigInt
): ProtocolFeeUpdated {
  let protocolFeeUpdatedEvent = changetype<ProtocolFeeUpdated>(newMockEvent())

  protocolFeeUpdatedEvent.parameters = new Array()

  protocolFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "protocolFee",
      ethereum.Value.fromUnsignedBigInt(protocolFee)
    )
  )

  return protocolFeeUpdatedEvent
}

export function createSubmitterFeeUpdatedEvent(
  submitter: Address
): SubmitterFeeUpdated {
  let submitterFeeUpdatedEvent = changetype<SubmitterFeeUpdated>(newMockEvent())

  submitterFeeUpdatedEvent.parameters = new Array()

  submitterFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("submitter", ethereum.Value.fromAddress(submitter))
  )

  return submitterFeeUpdatedEvent
}
