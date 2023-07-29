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

describe("Describe event RulesRootUpdated", () => {
  const ebcAddress = "0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929"
  // must exctly match the root and version in the mock data
  const root = "0x7ebe77ed7c81615de84605e86617f45dfc2330be20892b1a6b2679068a40352a"
  const version = "2"
  beforeAll(() => {
    let maker = Address.fromString("0xF2BE509057855b055f0515CCD0223BEf84D19ad4")
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

  test("EBC created and stored", () => {
    assert.entityCount("EBC", 1)
    
  })

  test("MDC created and stored", () => {
    assert.entityCount("MDC", 1)

    assert.fieldEquals(
      "MDC",
      mockMdcAddr.toLowerCase(),
      "id",
      mockMdcAddr.toLowerCase()
    )
    
  })

  test("ruleTypes created and stored", () => {
    assert.entityCount("ruleTypes", 1)

    // assert.fieldEquals(
    //   "ruleTypes",
    //   mockMdcAddr.toLowerCase(),
    //   "id",
    //   mockMdcAddr
    // )
    
  })

  test("latestRule created and stored", () => {
    // assert.entityCount("latestRule", 1)

    assert.fieldEquals(
      "latestRule",
      "1-2",
      "id",
      "1-2"
    )

    assert.fieldEquals(
      "latestRule",
      "1-2",
      "mdc",
      mockMdcAddr.toLowerCase()
    )

    assert.fieldEquals(
      "latestRule",
      "324-1",
      "id",
      "324-1"
    )

    assert.fieldEquals(
      "latestRule",
      "324-1",
      "mdc",
      mockMdcAddr.toLowerCase()
    )    
  })

})
