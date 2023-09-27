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

  // test("rules in ruleSnapshot created and stored", () => {
  // check rule relation
  // assert.fieldEquals(
  //   "rule",
  //   `${ruleSnapshotId}-1`,
  //   "ruleRel",
  //   `[${ruleSnapshotId}]`
  // )

  // assert.fieldEquals(
  //   "rule",
  //   `${ruleSnapshotId}-1`,
  //   "owner",
  //   makerAddress.toLowerCase()
  // )

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
  // })

  test("ruleUpdateVersion created and stored", () => {
    const mockDataId: string = "0xd3ebc07a2c141680c385db42a78988e801f3b9308387460148b2f7d807efc438"
    const mockHashId: string = "0x239b7ef2adaabfc2e4e13c143349a3d2f3d3ddc5b389dcd246cb3d728103b609"
    const latestRuleId: string = "0x239b7ef2adaabfc2e4e13c143349a3d2f3d3ddc5b389dcd246cb3d728103b609"
    assert.fieldEquals(
      "ruleUpdateVersion",
      mockDataId,
      "id",
      mockDataId
    )

    assert.fieldEquals(
      "latestRule",
      latestRuleId,
      "id",
      latestRuleId
    )

    assert.fieldEquals(
      "latestRule",
      latestRuleId,
      "root",
      root
    )

  })

  test("chainPairManager created and stored", () => {
    const mockPairID: string = "5-420"
    const mockPair: string = "0x239b7ef2adaabfc2e4e13c143349a3d2f3d3ddc5b389dcd246cb3d728103b609"

    assert.entityCount("chainPairManager", 3)

    assert.fieldEquals(
      "chainPairManager",
      mockPairID,
      "id",
      mockPairID
    )

    // assert.fieldEquals(
    //   "crossChainPairManager",
    //   mockPairID,
    //   "ruleUpdateRel",
    //   mockPair
    // )

  })

})
