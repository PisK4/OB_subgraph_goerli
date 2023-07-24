import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ChainInfoUpdated } from "../src/types/schema"
import { ChainInfoUpdated as ChainInfoUpdatedEvent } from "../src/types/ORManager/ORManager"
import { handleChainInfoUpdated } from "../src/mappings/or-manager"
import { createChainInfoUpdatedEvent } from "./or-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    // let id = BigInt.fromI32(234)
    // let chainInfo = "ethereum.Tuple Not implemented"
    // let newChainInfoUpdatedEvent = createChainInfoUpdatedEvent(id, chainInfo)
    // handleChainInfoUpdated(newChainInfoUpdatedEvent)
  })

  afterAll(() => {
    // clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ChainInfoUpdated created and stored", () => {
    // assert.entityCount("ChainInfoUpdated", 1)

    // // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    // assert.fieldEquals(
    //   "ChainInfoUpdated",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
    //   "chainInfo",
    //   "ethereum.Tuple Not implemented"
    // )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
