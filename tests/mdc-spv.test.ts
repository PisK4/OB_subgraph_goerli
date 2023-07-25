import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts"
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
  handleResponseMakersUpdated, 
} from "../src/mappings/mdc"
import { 
  createChallengeInfoUpdatedEvent,
  createColumnArrayUpdatedEvent,
  createResponseMakersUpdatedEvent, 
} from "./mdc-utils"
import { createMDCCreatedEvent } from "./mdc-factory-utils"
import { handleMDCCreated } from "../src/mappings/mdc-factory"
import { 
  EBCManagerID,
  getBindEbcId 
} from "../src/mappings/helpers"
import { mockMdcAddr } from "../src/mappings/mock-data"

describe("Describe entity assertions", () => {
  const impl = "0x5F9204BC7402D77d8C9bAA97d8F225e85347961e"
  const makerAddress = "0xF2BE509057855b055f0515CCD0223BEf84D19ad4"

  beforeAll(() => {
    let maker = Address.fromString(makerAddress)
    let mdc = Address.fromString(mockMdcAddr)
    let newMDCCreatedEvent = createMDCCreatedEvent(maker, mdc)
    handleMDCCreated(newMDCCreatedEvent)
    // log.debug("responseMakers length: {}", [responseMakers.length.toString()])
    // define responseMakers BigInt array
    // let responseMakers = [
    //   186258217070866900924478871193601082399096503291,
    //   905852841822203005801390459791760958298983703480,
    //   449781803059879522349193333582462772062150444941,
    //   362986753757618236474576322825117773740168512436,
    //   231067284476683175502251502105254737333709668709,
    //   816754809057254022909877285384836673771122526517,
    //   642190962546455878025728139377836375878667140933,
    //   392875391668041462083741112711079771451814692728,
    //   599938358168272848459362921247238227921889336502,
    //   120665217511887316696823247667523366771488149006
    // ]

    // 0x20a01b78e7100a16ce9171730e1f2eb081a6fbfb
    // 0x9eabd8a598857fc4238899d6edd42d6158ab23b8
    // define responseMakers BigInt array
    // let responseMakers = [
    //   BigInt.fromString("186258217070866900924478871193601082399096503291"),
    //   BigInt.fromString("905852841822203005801390459791760958298983703480"),
    //   BigInt.fromString("449781803059879522349193333582462772062150444941"),
    //   BigInt.fromString("362986753757618236474576322825117773740168512436"),
    //   BigInt.fromString("231067284476683175502251502105254737333709668709"),
    //   BigInt.fromString("816754809057254022909877285384836673771122526517"),
    //   BigInt.fromString("642190962546455878025728139377836375878667140933"),
    //   BigInt.fromString("392875391668041462083741112711079771451814692728"),
    //   BigInt.fromString("599938358168272848459362921247238227921889336502"),
    //   BigInt.fromString("120665217511887316696823247667523366771488149006")
    // ]
    let responseMakers = [
      BigInt.fromString("186258217070866900924478871193601082399096503291"),
      BigInt.fromString("905852841822203005801390459791760958298983703480")
    ]

    const newResponseMakersUpdatedEvent = createResponseMakersUpdatedEvent(
      Address.fromString(impl),
      responseMakers
    )
    handleResponseMakersUpdated(newResponseMakersUpdatedEvent)

  })
  
  afterAll(() => {
    clearStore()
  })

  test("MDC responseMakers updated", () => {
    assert.entityCount("MDC", 1)

    assert.fieldEquals(
      "MDC",
      mockMdcAddr.toLowerCase(),
      "responseMakers",
      "[0x20a01b78e7100a16ce9171730e1f2eb081a6fbfb, 0x9eabd8a598857fc4238899d6edd42d6158ab23b8\]"
    )
  })

})
