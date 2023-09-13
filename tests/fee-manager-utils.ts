import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  DealerUpdated,
  ETHDeposit,
  OwnershipTransferred,
  SubmissionUpdated,
  SubmitterRegistered,
  Withdraw
} from "../src/types/FeeManager/FeeManager"

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

export function createETHDepositEvent(
  sender: Address,
  amount: BigInt
): ETHDeposit {
  let ethDepositEvent = changetype<ETHDeposit>(newMockEvent())

  ethDepositEvent.parameters = new Array()

  ethDepositEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  ethDepositEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return ethDepositEvent
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
  stratBlock: BigInt,
  endBlock: BigInt,
  submitTimestamp: BigInt,
  profitRoot: Bytes,
  stateTransTreeRoot: Bytes
): SubmissionUpdated {
  let submissionUpdatedEvent = changetype<SubmissionUpdated>(newMockEvent())

  submissionUpdatedEvent.parameters = new Array()

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
      "submitTimestamp",
      ethereum.Value.fromUnsignedBigInt(submitTimestamp)
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

export function createWithdrawEvent(
  user: Address,
  chainId: BigInt,
  token: Address,
  debt: BigInt,
  amount: BigInt
): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam(
      "chainId",
      ethereum.Value.fromUnsignedBigInt(chainId)
    )
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("debt", ethereum.Value.fromUnsignedBigInt(debt))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawEvent
}
