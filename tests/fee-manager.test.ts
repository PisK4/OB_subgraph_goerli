import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { DealerUpdated } from "../src/types/schema"
import { DealerUpdated as DealerUpdatedEvent } from "../src/types/FeeManager/FeeManager"
import { handleDealerUpdated, handleWithdraw } from "../src/mappings/fee-manager"
import { createDealerUpdatedEvent, createWithdrawEvent } from "./fee-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("test WithdrawEvent Entity", () => {
  const defaultId = "0x350af8ee24211f1b30630eade4c770f45976a9a15c6d2b429358d77f10628f1a" as string
  beforeAll(() => {
    let user = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let chainId = BigInt.fromI32(5)
    let token = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    )
    let debt = BigInt.fromI32(123)
    let amount = BigInt.fromI32(456)
    let newWithdrawEvent = createWithdrawEvent(
      user,
      chainId,
      token,
      debt,
      amount
    )
    handleWithdraw(newWithdrawEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Withdraw created and stored", () => {
    assert.entityCount("Withdraw", 1)

    assert.fieldEquals(
      "Withdraw",
      defaultId,
      "user",
      "0x0000000000000000000000000000000000000001"
    )

    assert.fieldEquals(
      "Withdraw",
      defaultId,
      "chainId",
      "5"
    )
  })
})
