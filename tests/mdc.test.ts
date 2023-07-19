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

describe("Describe event RulesRootUpdated", () => {
  const ebcAddress = "0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929"
  const root = "0x5876b545fe8e236605e28a4aba0c7ae1922d8e66e7bc5f317d482107e2883637"
  const version = "666"
  const mdcAddress = "0x28c2a37ff5f74fe17d9c30c15a1234ad48dd9929"
  beforeAll(() => {
    let maker = Address.fromString("0xF2BE509057855b055f0515CCD0223BEf84D19ad4")
    let mdc = Address.fromString(mdcAddress)
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
      Bytes.fromHexString(funcERC20)
    )
    handleRulesRootUpdated(newRulesRootUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // test("RulesRootUpdated created and stored", () => {
  //   assert.entityCount("RulesRootUpdated", 1)

  //   assert.fieldEquals(
  //     "RulesRootUpdated",
  //     "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
  //     "impl",
  //     "0x5f9204bc7402d77d8c9baa97d8f225e85347961e"
  //   )

  //   assert.fieldEquals(
  //     "RulesRootUpdated",
  //     "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
  //     "ebc",
  //     ebcAddress
  //   )

  //   assert.fieldEquals(
  //     "RulesRootUpdated",
  //     "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
  //     "rootWithVersion_root",
  //     root
  //   )

  //   assert.fieldEquals(
  //     "RulesRootUpdated",
  //     "0xa16081f360e3847006dfb660bae1c6d1b2e17ec2a",
  //     "rootWithVersion_version",
  //     version
  //   )
  // })

  test("EBC created and stored", () => {
    assert.entityCount("EBC", 1)

    // assert.fieldEquals(
    //   "EBC",
    //   ebcAddress,
    //   "id",
    //   ebcAddress
    // )

    // assert.fieldEquals(
    //   "EBC",
    //   ebcAddress,
    //   "root",
    //   root
    // )

    //// uint test may mock some data
    // assert.fieldEquals(
    //   "EBC",
    //   ebcAddress,
    //   "version",
    //   version
    // )

  })

  test("MDC created and stored", () => {
    assert.entityCount("MDC", 1)

    assert.fieldEquals(
      "MDC",
      mdcAddress,
      "id",
      mdcAddress
    )

    
  })

})
