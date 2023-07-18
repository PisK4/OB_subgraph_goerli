import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { MDCCreated } from "../src/types/schema"
import { MDCCreated as MDCCreatedEvent } from "../src/types/MDCFactory/MDCFactory"
import { handleMDCCreated } from "../src/mappings/mdc-factory"
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import {
  ONE_ADDRESS,
  ONE_NUM,
  getONEBytes
} from '../src/mappings/helpers'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"
  const mdcAddress = "0x7A0B33bDcBD07f10FfAa8251fC843ed293495fEb"
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

  test("FactoryManger created and stored", () => {
    assert.entityCount("FactoryManger", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FactoryManger",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "id",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
    )

    assert.fieldEquals(
      "FactoryManger",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "mdcCounts",
      "1"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  test("MDCreated created and stored with MDCCreatedEvent", () => {
    assert.entityCount("MDC", 1)
  })

})
