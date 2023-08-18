import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  DealerUpdated,
  OwnershipTransferred,
  SubmissionUpdated,
  SubmitterRegistered
} from "../src/types/ORFeeManager/ORFeeManager"

export function createDealerUpdatedEvent(
  dealer: Address,
  feeRatio: BigInt,
  extraInfo: Bytes
): DealerUpdated {
  let dealerUpdatedEvent = changetype<DealerUpdated>(newMockEvent())

  dealerUpdatedEvent.parameters = new Array()

  dealerUpdatedEvent.parameters.push(
    new ethereum.EventParam("dealer", ethereum.Value.fromAddress(dealer))
  )
  dealerUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "feeRatio",
      ethereum.Value.fromUnsignedBigInt(feeRatio)
    )
  )
  dealerUpdatedEvent.parameters.push(
    new ethereum.EventParam("extraInfo", ethereum.Value.fromBytes(extraInfo))
  )

  return dealerUpdatedEvent
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

export function createSubmissionUpdatedEvent(
  submissionHash: Bytes,
  stratBlock: BigInt,
  endBlock: BigInt,
  profitRoot: Bytes,
  stateTransTreeRoot: Bytes
): SubmissionUpdated {
  let submissionUpdatedEvent = changetype<SubmissionUpdated>(newMockEvent())

  submissionUpdatedEvent.parameters = new Array()

  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "submissionHash",
      ethereum.Value.fromFixedBytes(submissionHash)
    )
  )
  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "stratBlock",
      ethereum.Value.fromUnsignedBigInt(stratBlock)
    )
  )
  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "endBlock",
      ethereum.Value.fromUnsignedBigInt(endBlock)
    )
  )
  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "profitRoot",
      ethereum.Value.fromFixedBytes(profitRoot)
    )
  )
  submissionUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "stateTransTreeRoot",
      ethereum.Value.fromFixedBytes(stateTransTreeRoot)
    )
  )

  return submissionUpdatedEvent
}

export function createSubmitterRegisteredEvent(
  submiter: Address,
  marginAmount: BigInt
): SubmitterRegistered {
  let submitterRegisteredEvent = changetype<SubmitterRegistered>(newMockEvent())

  submitterRegisteredEvent.parameters = new Array()

  submitterRegisteredEvent.parameters.push(
    new ethereum.EventParam("submiter", ethereum.Value.fromAddress(submiter))
  )
  submitterRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "marginAmount",
      ethereum.Value.fromUnsignedBigInt(marginAmount)
    )
  )

  return submitterRegisteredEvent
}
