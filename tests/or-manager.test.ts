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
import { handleChainInfoUpdated, handleEbcsUpdated } from "../src/mappings/or-manager"
import { createChainInfoUpdatedEvent, createEbcsUpdatedEvent } from "./or-manager-utils"
import { EBCManagerID } from "../src/mappings/helpers"
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import { handleMDCCreated } from "../src/mappings/mdc-factory"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  const impl = "0x5F9204BC7402D77d8C9bAA97d8F225e85347961e"
  const columnArrayHash = "0xaaaE843d71Ef6843137F70d6E93c5d143C1843E4"
  const dealers = 
    "0xA1AE843d71Ef6843137F70d6E93c5d143C1843E4"
  const ebc0 = "0xB6fF6F7b0CD1633348877043Ae92302139796686"
  const ebc1 = "0xD8D4F170F601Fe7487fcCc0E15C5a42d1C090E75"
  const ebc2 = "0xD8D4F170F601Fe7487fcCc0E15C5a42d1C090E75"
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"
  const mdcAddress = "0x7A0B33bDcBD07f10FfAa8251fC843ed293495fEb"

  beforeAll(() => {
    let maker = Address.fromString(makerAddress)
    let mdc = Address.fromString(mdcAddress)
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)
    let ebcs = [Address.fromString(ebc0), Address.fromString(ebc1), Address.fromString(ebc2)]
    let ebcsAddr = new Array<Address>(ebcs.length);
    for (let i = 0; i < ebcs.length; i++) {
      ebcsAddr[i] = changetype<Address>(ebcs[i]);
    }
    let statuses = [true, false, true]
    const newEbcsUpdatedEvent = createEbcsUpdatedEvent(
      ebcsAddr,
      statuses
    )
    handleEbcsUpdated(newEbcsUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("EBC manager created and stored", () => {
    assert.entityCount("EBCManager", 1)

    assert.fieldEquals(
      "EBCManager",
      EBCManagerID,
      "ebcCounts",
      "2"
    )

    assert.fieldEquals(
      "EBCManager",
      EBCManagerID,
      "ebcs",
      "[0xb6ff6f7b0cd1633348877043ae92302139796686, 0xd8d4f170f601fe7487fccc0e15c5a42d1c090e75\]"
    )
  })
})
