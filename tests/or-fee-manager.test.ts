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
import { DealerUpdated as DealerUpdatedEvent } from "../src/types/ORFeeManager/ORFeeManager"
import { handleDealerUpdated } from "../src/mappings/or-fee-manager"
import { createDealerUpdatedEvent } from "./or-fee-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let dealer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let feeRatio = BigInt.fromI32(234)
    let extraInfo = Bytes.fromI32(1234567890)
    let newDealerUpdatedEvent = createDealerUpdatedEvent(
      dealer,
      feeRatio,
      extraInfo
    )
    handleDealerUpdated(newDealerUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test


})