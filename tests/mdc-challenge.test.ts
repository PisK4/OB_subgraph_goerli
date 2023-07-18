import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { ChallengeInfoUpdated } from "../src/types/schema"
import { ChallengeInfoUpdated as ChallengeInfoUpdatedEvent } from "../src/types/templates/MDC/MDC"
import { handleChallengeInfoUpdated } from "../src/mappings/mdc"
import { createChallengeInfoUpdatedEvent } from "./mdc-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let challengeId = Bytes.fromI32(1234567890)
    // let challengeInfo = "ethereum.Tuple Not implemented"
    let challengeTuple : Array<ethereum.Value> = [
      ethereum.Value.fromBytes(Bytes.fromI32(1234567890)),
      ethereum.Value.fromBytes(Bytes.fromI32(1234567890)),
      ethereum.Value.fromBytes(Bytes.fromI32(1234567890)),
    ]
    // let challengeInfo = changetype<ethereum.Tuple>(challengeTuple)
    // let newChallengeInfoUpdatedEvent = createChallengeInfoUpdatedEvent(
    //   challengeId,
    //   challengeInfo
    // )
    // handleChallengeInfoUpdated(newChallengeInfoUpdatedEvent)
  })

  // afterAll(() => {
  //   clearStore()
  // })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  // test("ChallengeInfoUpdated created and stored", () => {
    // assert.entityCount("ChallengeInfoUpdated", 1)

    // // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    // assert.fieldEquals(
    //   "ChallengeInfoUpdated",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
    //   "challengeId",
    //   "1234567890"
    // )
    // assert.fieldEquals(
    //   "ChallengeInfoUpdated",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
    //   "challengeInfo",
    //   "ethereum.Tuple Not implemented"
    // )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  // })
})
