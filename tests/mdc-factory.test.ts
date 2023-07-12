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
  beforeAll(() => {
    let maker = Address.fromString("0x0000000000000000000000000000000000000001")
    let mdc = Address.fromString("0x0000000000000000000000000000000000000001")
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MDCCreated created and stored", () => {
    assert.entityCount("MDCCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MDCCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "maker",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MDCCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "mdc",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })

  test("MDCreated created and stored with MDCCreatedEvent", () => {
    assert.entityCount("MDC", 1)

    assert.fieldEquals(
      "MDC",
      "0x0000000000000000000000000000000000000001",
      "ebc",
      "0xffffffffffffffffffffffffffffffffffffffff"
    )
  })

})
