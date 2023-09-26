import {
    Address,
    BigInt,
    ethereum
} from "@graphprotocol/graph-ts";
import { DealerMapping, FactoryManager } from "../types/schema";
import { log } from '@graphprotocol/graph-ts'
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { MDC as MDCTemplate } from "../types/templates"

import {
    ONE_ADDRESS,
    ONE_NUM,
    getFactoryEntity,
    getMDCEntity,
    getMDCMappingEntity,
} from './helpers'
import { entity } from "./utils";


export function factoryCreateMDC(
    event: ethereum.Event,
    maker: Address,
    mdc: Address
): void {
    const ID = event.address.toHexString()
    let factory = getFactoryEntity(ID, event)
    factory.mdcCounts = factory.mdcCounts.plus(BigInt.fromI32(1))
    let mdcNew = getMDCEntity(mdc, maker, event)
    factory.mdcs = entity.addRelation(factory.mdcs, mdcNew.id)
    factory.owners = entity.addRelation(factory.owners, maker.toHexString())
    let mdcMapping = getMDCMappingEntity(mdcNew, event)
    mdcNew.mapping = mdcMapping.id
    mdcMapping.save()
    mdcNew.save()
    factory.save()
    MDCTemplate.create(mdc)
}