import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { handleMDCCreated } from "../src/mappings/mdc-factory"
import { createMDCCreatedEvent } from "./mdc-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"
  const mdcAddress = "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb"
  beforeAll(() => {
    let maker = Address.fromString(makerAddress)
    let mdc = Address.fromString(mdcAddress)
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FactoryManager created and stored", () => {
    assert.entityCount("FactoryManager", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FactoryManager",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "id",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
    )

    assert.fieldEquals(
      "FactoryManager",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "mdcCounts",
      "1"
    )

    assert.fieldEquals(
      "FactoryManager",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "mdcs",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  test("MDCreated created and stored with MDCCreatedEvent", () => {
    assert.entityCount("MDC", 1)
  })

})
