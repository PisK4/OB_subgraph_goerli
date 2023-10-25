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
describe("Describe ColumnArrayUpdated assertions", () => {
  const impl = "0x5F9204BC7402D77d8C9bAA97d8F225e85347961e"
  const columnArrayHash = "0xaaaE843d71Ef6843137F70d6E93c5d143C1843E4"
  const dealerRemoved1 = "0x12346F7b0CD1633348877043Ae92302139796686"
  const dealerRemoved2 = "0x56786F7b0CD1633348877043Ae92302139796686"
  const dealers = "0xA1AE843d71Ef6843137F70d6E93c5d143C1843E4"
  const dealer1 = "0x230B33bDcBD07f10FfAa8251fC843ed293495fEb"
  const ebcRemoved1 = "0xABCD6F7b0CD1633348877043Ae92302139796686"
  const ebcRemoved2 = "0xDCBAF170F601Fe7487fcCc0E15C5a42d1C090E75"
  const ebc0 = "0xB6fF6F7b0CD1633348877043Ae92302139796686"
  const ebc1 = "0xD8D4F170F601Fe7487fcCc0E15C5a42d1C090E75"
  const ebc2 = "0xD8D4F170F601Fe7487fcCc0E15C5a42d1C090E75"
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"
  const mdcAddress = "0x7A0B33bDcBD07f10FfAa8251fC843ed293495fEb"
  const MDCBindDealerId = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1" as string

  beforeAll(() => {
    let maker = Address.fromString(makerAddress)
    let mdc = Address.fromString(mdcAddress)
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)


    let dealersAddr = Address.fromString(dealers)
    let dealersAddr1 = Address.fromString(dealer1)
    let dealersAddrRemove1 = Address.fromString(dealerRemoved1)
    let dealersAddrRemove2 = Address.fromString(dealerRemoved2)
    let ebcsRemove = [Address.fromString(ebcRemoved1), Address.fromString(ebcRemoved2)]
    let chainIds = [123, 456, 789, 123, 123]
    let ebcs = [Address.fromString(ebc0), Address.fromString(ebc1), Address.fromString(ebc2)]

    const newColumnArrayUpdatedEvent0 = createColumnArrayUpdatedEvent(
      Address.fromString(impl),
      Bytes.fromHexString(columnArrayHash) as Bytes,
      [dealersAddrRemove1,
        dealersAddrRemove2,
        dealersAddrRemove1,
      ],
      ebcsRemove,
      []
    )
    handleColumnArrayUpdated(newColumnArrayUpdatedEvent0)


    const newColumnArrayUpdatedEvent = createColumnArrayUpdatedEvent(
      Address.fromString(impl),
      Bytes.fromHexString(columnArrayHash) as Bytes,
      [dealersAddr, dealersAddr1, dealersAddr1],
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

    // assert.fieldEquals(
    //   "MDC",
    //   mdcAddress.toLowerCase(),
    //   "bindEBCs",
    //   mdcAddress.toLowerCase()
    // )

    assert.fieldEquals(
      "MDC",
      mdcAddress.toLowerCase(),
      "dealerSnapshot",
      "[0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1\]",
    )
  })

  // test("MDCBindEBC created and stored", () => {
  //   assert.entityCount("MDCBindEBC", 2)

  //   assert.fieldEquals(
  //     "MDCBindEBC",
  //     getBindEbcId(Address.fromString(mdcAddress), Address.fromString(ebc0)),
  //     "id",
  //     getBindEbcId(Address.fromString(mdcAddress), Address.fromString(ebc0))
  //   )

  //   assert.fieldEquals(
  //     "MDCBindEBC",
  //     getBindEbcId(Address.fromString(mdcAddress), Address.fromString(ebc1)),
  //     "id",
  //     getBindEbcId(Address.fromString(mdcAddress), Address.fromString(ebc1))
  //   )

  //   assert.fieldEquals(
  //     "MDCBindEBC",
  //     getBindEbcId(Address.fromString(mdcAddress), Address.fromString(ebc0)),
  //     "ebc",
  //     ebc0.toLowerCase()
  //   )

  // })



  test("ColumnArrayUpdated created and stored", () => {
    assert.entityCount("ColumnArrayUpdated", 1)

  })

  test("dealerSnapshot created and stored", () => {
    assert.entityCount("dealerSnapshot", 1)

    assert.fieldEquals(
      "dealerSnapshot",
      MDCBindDealerId,
      "id",
      MDCBindDealerId
    )

    assert.fieldEquals(
      "dealerSnapshot",
      MDCBindDealerId,
      "dealerList",
      "[0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    assert.fieldEquals(
      "dealerSnapshot",
      MDCBindDealerId,
      "dealerMappingSnapshot",
      "[0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )
  })

  // test("MDCBindChainId created and stored", () => {
  //   assert.entityCount("MDCBindChainId", 1)

  //   assert.fieldEquals(
  //     "MDCBindChainId",
  //     mdcAddress.toLowerCase(),
  //     "id",
  //     mdcAddress.toLowerCase()
  //   )

  //   assert.fieldEquals(
  //     "MDCBindChainId",
  //     mdcAddress.toLowerCase(),
  //     "chainIdList",
  //     "[123, 456, 789\]"
  //   )

  // })

  // test("MDCBindEBCAll created and stored", () => {
  //   assert.entityCount("MDCBindEBCAll", 1)

  //   assert.fieldEquals(
  //     "MDCBindEBCAll",
  //     mdcAddress.toLowerCase(),
  //     "id",
  //     mdcAddress.toLowerCase()
  //   )

  //   assert.fieldEquals(
  //     "MDCBindEBCAll",
  //     mdcAddress.toLowerCase(),
  //     "ebcList",
  //     "[0xb6ff6f7b0cd1633348877043ae92302139796686, 0xd8d4f170f601fe7487fccc0e15c5a42d1c090e75\]"
  //   )

  //   assert.fieldEquals(
  //     "MDCBindEBCAll",
  //     mdcAddress.toLowerCase(),
  //     "ebcs",
  //     "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb6ff6f7b0cd1633348877043ae92302139796686, 0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xd8d4f170f601fe7487fccc0e15c5a42d1c090e75\]"
  //   )
  // })

  test("ebcMapping created and stored", () => {
    // assert.entityCount("ebcMapping", 2)

    // assert.fieldEquals(
    //   "ebcMapping",
    //   "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xb6ff6f7b0cd1633348877043ae92302139796686",
    //   "ebcAddr",
    //   "0xb6ff6f7b0cd1633348877043ae92302139796686"
    // )
    assert.fieldEquals(
      "ebcMapping",
      "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xd8d4f170f601fe7487fccc0e15c5a42d1c090e75",
      "owner",
      makerAddress.toLowerCase()
    )
  })

  test("MDCMapping created and stored", () => {
    assert.entityCount("MDCMapping", 1)

    assert.fieldEquals(
      "MDCMapping",
      mdcAddress.toLowerCase(),
      "dealerMapping",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )
  })

  test("DealerMapping created and stored", () => {
    assert.entityCount("DealerMapping", 4)
    assert.entityCount("DealerMappingSnapshot", 4)

    assert.fieldEquals(
      "DealerMapping",
      "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xa1ae843d71ef6843137f70d6e93c5d143c1843e4",
      "dealerAddr",
      "0xa1ae843d71ef6843137f70d6e93c5d143c1843e4"
    )


    assert.fieldEquals(
      "MDCMapping",
      "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb",
      "dealerMapping",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    assert.fieldEquals(
      "dealerSnapshot",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "dealerMappingSnapshot",
      "[0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    assert.fieldEquals(
      "DealerMappingSnapshot",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1-0x230b33bdcbd07f10ffaa8251fc843ed293495feb",
      "owner",
      makerAddress.toLowerCase()
    )
  })

  test("ChainIdMapping created and stored", () => {
    assert.entityCount("chainIdMapping", 3)

    assert.fieldEquals(
      "chainIdMapping",
      "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-123",
      "chainId",
      "123"
    )

    assert.fieldEquals(
      "chainIdMapping",
      "0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb-456",
      "owner",
      makerAddress.toLowerCase()
    )
  })


  test("Dealer created and stored", () => {
    assert.entityCount("Dealer", 4)

    assert.fieldEquals(
      "Dealer",
      dealerRemoved1.toLowerCase(),
      "mdcs",
      "[]"
    )

    assert.fieldEquals(
      "Dealer",
      dealerRemoved2.toLowerCase(),
      "mdcs",
      "[]"
    )


    assert.fieldEquals(
      "Dealer",
      dealer1.toLowerCase(),
      "id",
      dealer1.toLowerCase()
    )

    assert.fieldEquals(
      "Dealer",
      dealer1.toLowerCase(),
      "mdcs",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    // assert.fieldEquals(
    //   "MDC",
    //   mdcAddress.toLowerCase(),
    //   "dealer",
    //   "[0xa1ae843d71ef6843137f70d6e93c5d143c1843e4, 0x230b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    // )
  })

  test("ebcRel created and stored", () => {
    assert.entityCount("ebcRel", 4)

    assert.fieldEquals(
      "ebcRel",
      ebc0.toLowerCase(),
      "id",
      ebc0.toLowerCase()
    )

    assert.fieldEquals(
      "ebcRel",
      ebc1.toLowerCase(),
      "id",
      ebc1.toLowerCase()
    )

    assert.fieldEquals(
      "ebcRel",
      ebc1.toLowerCase(),
      "mdcList",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    assert.fieldEquals(
      "ebcRel",
      ebc0.toLowerCase(),
      "mdcList",
      "[0x7a0b33bdcbd07f10ffaa8251fc843ed293495feb\]"
    )

    // check remove ebc
    assert.fieldEquals(
      "ebcRel",
      ebcRemoved1.toLowerCase(),
      "mdcList",
      "[]"
    )

    assert.fieldEquals(
      "ebcRel",
      ebcRemoved2.toLowerCase(),
      "mdcList",
      "[]"
    )

    // assert.fieldEquals(
    //   "MDC",
    //   mdcAddress.toLowerCase(),
    //   "ebc",
    //   ebc0.toLowerCase() + "," + ebc1.toLowerCase()
    // )

  })


  test("ebcSnapshot created and stored", () => {
    assert.entityCount("ebcSnapshot", 1)

    assert.fieldEquals(
      "MDC",
      mdcAddress.toLowerCase(),
      "ebcSnapshot",
      "[0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1\]"
    )
  })

})
