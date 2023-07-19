import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { 
  ChallengeInfoUpdated,
  ColumnArrayUpdated, 
} from "../src/types/schema"
import { 
  ChallengeInfoUpdated as ChallengeInfoUpdatedEvent,
  ColumnArrayUpdated as ColumnArrayUpdatedEvent, 
} from "../src/types/templates/MDC/MDC"
import { 
  handleChallengeInfoUpdated,
  handleColumnArrayUpdated, 
} from "../src/mappings/mdc"
import { 
  createChallengeInfoUpdatedEvent,
  createColumnArrayUpdatedEvent, 
} from "./mdc-utils"
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import { handleMDCCreated } from "../src/mappings/mdc-factory"
import { 
  getEbcId 
} from "../src/mappings/helpers"

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

    let dealersAddr = Address.fromString(dealers) 
    let chainIds = [123, 456, 789]
    let ebcs = [Address.fromString(ebc0), Address.fromString(ebc1), Address.fromString(ebc2)]
    const newColumnArrayUpdatedEvent = createColumnArrayUpdatedEvent(
      Address.fromString(impl),
      Bytes.fromHexString(columnArrayHash) as Bytes,
      [dealersAddr],
      ebcs,
      chainIds
    )
    handleColumnArrayUpdated(newColumnArrayUpdatedEvent)
  })
  

  afterAll(() => {
    clearStore()
  })

  test("MDC created and stored", () => {
    assert.entityCount("MDC", 1)

    assert.fieldEquals(
      "MDC",
      mdcAddress.toLowerCase(),
      "id",
      mdcAddress.toLowerCase()
    )

    assert.fieldEquals(
      "MDC",
      mdcAddress.toLowerCase(),
      "owner",
      makerAddress.toLowerCase()
    )

  })

  test("EBCs created and stored", () => {
    assert.entityCount("EBC", 2)

    assert.fieldEquals(
      "EBC",
      getEbcId(Address.fromString(mdcAddress), Address.fromString(ebc0)),
      "id",
      getEbcId(Address.fromString(mdcAddress), Address.fromString(ebc0))
    )

    assert.fieldEquals(
      "EBC",
      getEbcId(Address.fromString(mdcAddress), Address.fromString(ebc1)),
      "id",
      getEbcId(Address.fromString(mdcAddress), Address.fromString(ebc1))
    )
    
  })

})
