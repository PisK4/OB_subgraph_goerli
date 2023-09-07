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
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import { handleMDCCreated } from "../src/mappings/mdc-factory"
import { funcERC20RootMockInput, mockMdcAddr } from "./mock-data"
import { ORManagerID, EBCManagerID } from "../src/mappings/helpers"

// describe("Describe event RulesRootUpdated", () => {
//   const ebcAddress = "0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929"
//   // must exctly match the root and version in the mock data
//   const root = "0xb3f19effe9df83a268c66c65808ee2828b0ec6c43cb400b31126f2682cf7c5c7"
//   const version = "2"
//   beforeAll(() => {
//     let maker = Address.fromString("0xF2BE509057855b055f0515CCD0223BEf84D19ad4")
//     let mdc = Address.fromString(mockMdcAddr)
//     let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
//     handleMDCCreated(newMDCCreatedEvent)

//     let impl = Address.fromString("0x5f9204bc7402d77d8c9baa97d8f225e85347961e")
//     let ebc = Address.fromString(ebcAddress)
//     let rootWithVersion_root = Bytes.fromHexString(root)
//     let rootWithVersion_version = BigInt.fromString(version)

//     const tupleArray: Array<ethereum.Value> = [
//       ethereum.Value.fromBytes(rootWithVersion_root),
//       ethereum.Value.fromSignedBigInt(rootWithVersion_version)
//     ]
//     const rootWithVersion = changetype<ethereum.Tuple>(tupleArray);   

//     let newRulesRootUpdatedEvent = createRulesRootUpdatedEvent(
//       impl,
//       ebc,
//       rootWithVersion,
//       Bytes.fromHexString(funcERC20RootMockInput)
//     )
//     handleRulesRootUpdated(newRulesRootUpdatedEvent)
//   })

//   afterAll(() => {
//     clearStore()
//   })

//   // test("EbcsUpdated created and stored", () => {
//   //   assert.entityCount("EbcsUpdated", 1)

//   // })

//   test("MDC created and stored", () => {
//     assert.entityCount("MDC", 1)

//     assert.fieldEquals(
//       "MDC",
//       mockMdcAddr.toLowerCase(),
//       "id",
//       mockMdcAddr.toLowerCase()
//     )

//   })

//   // test("ruleTypes created and stored", () => {
//   //   assert.entityCount("ruleTypes", 1)

//   // })

//   test("latestRule created and stored", () => {
//     // id: mdc + ebc + chain0 + chain1
//     assert.fieldEquals(
//       "latestRule",
//       "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb3d1b704dd7f7acf9fddcee2868388838f859e0f-324-10",
//       "id",
//       mockMdcAddr.toLowerCase() + "-" + "0xb3d1b704dd7f7acf9fddcee2868388838f859e0f" + "-324-10"
//     )

//     assert.fieldEquals(
//       "latestRule",
//       "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb3d1b704dd7f7acf9fddcee2868388838f859e0f-324-10",
//       "mdc",
//       mockMdcAddr.toLowerCase()
//     )

//     assert.fieldEquals(
//       "latestRule",
//       "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb3d1b704dd7f7acf9fddcee2868388838f859e0f-1-42161",
//       "id",
//       mockMdcAddr.toLowerCase() + "-" + "0xb3d1b704dd7f7acf9fddcee2868388838f859e0f" + "-1-42161"
//     )

//     assert.fieldEquals(
//       "latestRule",
//       "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb3d1b704dd7f7acf9fddcee2868388838f859e0f-1-42161",
//       "mdc",
//       mockMdcAddr.toLowerCase()
//     )    
//   })
// })


describe("Describe check MDC rule snaptShot", () => {
  // referenced from schema.graphql type ruleTypes @entity -id
  const ruleSnapshotId = "0x2f4bc33ff3ec2534bfb44762c76c7a1be7fa4789b2d866043e7066f48b7acd5a" as string
  const ebcAddress = "0x9e6d2b0b3adb391ab62146c1b14a94e8d840ff82" as string
  const inputMDC = "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb" as string

  // must exctly match the root and version in the mock data
  const root = "0x08a92c999eb741eeb3f0c1193a98e68863f8108b309fe9952907d11aac4cadf3"
  const version = "2"
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"
  beforeAll(() => {
    let maker = Address.fromString(makerAddress)
    let mdc = Address.fromString(mockMdcAddr)
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)

    let impl = Address.fromString("0x5f9204bc7402d77d8c9baa97d8f225e85347961e")
    let ebc = Address.fromString(ebcAddress)
    let rootWithVersion_root = Bytes.fromHexString(root)
    let rootWithVersion_version = BigInt.fromString(version)

    const tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromBytes(rootWithVersion_root),
      ethereum.Value.fromSignedBigInt(rootWithVersion_version)
    ]
    const rootWithVersion = changetype<ethereum.Tuple>(tupleArray);

    let newRulesRootUpdatedEvent = createRulesRootUpdatedEvent(
      impl,
      ebc,
      rootWithVersion,
      Bytes.fromHexString(funcERC20RootMockInput)
    )
    handleRulesRootUpdated(newRulesRootUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })


  test("MDC And EBC relation created and stored", () => {
    // assert.fieldEquals(
    //   "MDC",
    //   mockMdcAddr.toLowerCase(),
    //   "ebc",
    //   `[${ebcAddress}]`
    // )

    assert.fieldEquals(
      "ebcRel",
      ebcAddress.toLowerCase(),
      "mdcList",
      `[${mockMdcAddr.toLowerCase()}]`
    )

  })

  test("mdc rule snaptShot created and stored", () => {

    // check new create snapshot relation
    assert.fieldEquals(
      "ruleRel",
      ruleSnapshotId,
      "mdc",
      `[${inputMDC.toLowerCase()}]`
    )

    // check new create snapshot relation
    assert.fieldEquals(
      "ruleRel",
      ruleSnapshotId,
      "ebc",
      `[${ebcAddress.toLowerCase()}]`
    )

    // check MDC relation
    assert.fieldEquals(
      "MDC",
      mockMdcAddr.toLowerCase(),
      "ruleSnapshot",
      `[${ruleSnapshotId}]`
    )

    // check EBC relation
    assert.fieldEquals(
      "ebcRel",
      ebcAddress.toLowerCase(), // this id depends on the transaction input EBC data field
      "rulesList",
      `[${ruleSnapshotId}]`
    );

  })

  test("rules in ruleSnapshot created and stored", () => {
    // check rule relation
    assert.fieldEquals(
      "rule",
      `${ruleSnapshotId}-1`,
      "ruleRel",
      `[${ruleSnapshotId}]`
    )

    assert.fieldEquals(
      "rule",
      `${ruleSnapshotId}-1`,
      "owner",
      makerAddress.toLowerCase()
    )

    // let rules = new Array<string>();
    // for (let i = 0; i < 20; i++) {
    //   if (i === 0) {
    //     rules.push(`${ruleSnapshotId}-${i}`);
    //   } else {
    //     rules.push(` ${ruleSnapshotId}-${i}`);
    //   }
    // }
    // // check rule relation
    // // could be insert many rules in one transaction, hard to coding, so we mark this code...
    // assert.fieldEquals(
    //   "ruleRel",
    //   ruleSnapshotId,
    //   "rules",
    //   `[${rules}\]`
    // )
  })

  // test("latestRule created and stored", () => {
  //   assert 
  // })

})
