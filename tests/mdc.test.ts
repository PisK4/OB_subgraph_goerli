// import {  } from "ethers"
import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts"
import { ColumnArrayUpdated } from "../src/types/schema"
import { ColumnArrayUpdated as ColumnArrayUpdatedEvent } from "../src/types/templates/MDC/MDC"
import { handleColumnArrayUpdated, handleRulesRootUpdated } from "../src/mappings/mdc"
import { createColumnArrayUpdatedEvent, createRulesRootUpdatedEvent } from "./mdc-utils"
import { funcERC20, funcETH } from "../src/mappings/helpers"
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import { handleMDCCreated } from "../src/mappings/mdc-factory"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

// describe("Describe entity assertions", () => {  
//   beforeAll(() => {
//     let impl = Address.fromString("0x0000000000000000000000000000000000000001")
//     let columnArrayHash = Bytes.fromI32(1234567890)
//     let dealers = [
//       Address.fromString("0x0000000000000000000000000000000000000001")
//     ]
//     let ebcs = [
//       Address.fromString("0x0000000000000000000000000000000000000001")
//     ]
//     let chainIds = [123]
//     let newColumnArrayUpdatedEvent = createColumnArrayUpdatedEvent(
//       impl,
//       columnArrayHash,
//       dealers,
//       ebcs,
//       chainIds
//     )
//     handleColumnArrayUpdated(newColumnArrayUpdatedEvent)
//   })

//   afterAll(() => {
//     clearStore()
//   })

//   // For more test scenarios, see:
//   // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

//   test("ColumnArrayUpdated created and stored", () => {
//     assert.entityCount("ColumnArrayUpdated", 1)

//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     assert.fieldEquals(
//       "ColumnArrayUpdated",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "impl",
//       "0x0000000000000000000000000000000000000001"
//     )
//     assert.fieldEquals(
//       "ColumnArrayUpdated",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "columnArrayHash",
//       "1234567890"
//     )
//     assert.fieldEquals(
//       "ColumnArrayUpdated",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "dealers",
//       "[0x0000000000000000000000000000000000000001]"
//     )
//     assert.fieldEquals(
//       "ColumnArrayUpdated",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "ebcs",
//       "[0x0000000000000000000000000000000000000001]"
//     )
//     assert.fieldEquals(
//       "ColumnArrayUpdated",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "chainIds",
//       "[123]"
//     )

//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   })
// })

describe("Describe event RulesRootUpdated", () => {
  beforeAll(() => {
    let maker = Address.fromString("0xF2BE509057855b055f0515CCD0223BEf84D19ad4")
    let mdc = Address.fromString("0x7A0B33bDcBD07f10FfAa8251fC843ed293495fEb")
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)

    let impl = Address.fromString("0x5f9204bc7402d77d8c9baa97d8f225e85347961e")
    let ebc = Address.fromString("0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929")
    let rootWithVersion_root = Bytes.fromHexString("0x123456")
    let rootWithVersion_version = BigInt.fromI32(1)

    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromBytes(rootWithVersion_root),
      ethereum.Value.fromSignedBigInt(rootWithVersion_version)
    ]
    const rootWithVersion = changetype<ethereum.Tuple>(tupleArray);   

    let newRulesRootUpdatedEvent = createRulesRootUpdatedEvent(
      impl,
      ebc,
      rootWithVersion,
      Bytes.fromHexString(funcETH)
    )
    handleRulesRootUpdated(newRulesRootUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("RulesRootUpdated created and stored", () => {
    assert.entityCount("RulesRootUpdated", 1)

    assert.fieldEquals(
      "RulesRootUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "impl",
      "0x5f9204bc7402d77d8c9baa97d8f225e85347961e"
    )

    assert.fieldEquals(
      "RulesRootUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "ebc",
      "0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929"
    )

    assert.fieldEquals(
      "RulesRootUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "rootWithVersion_root",
      "0x123456"
    )

    assert.fieldEquals(
      "RulesRootUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "rootWithVersion_version",
      "1"
    )
  })

})
