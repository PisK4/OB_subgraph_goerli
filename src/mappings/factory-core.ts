import {
    Address,
    BigInt,
    ethereum
} from "@graphprotocol/graph-ts";
import { DealerMapping, FactoryManager, SubgraphManager } from "../types/schema";
import { log } from '@graphprotocol/graph-ts'
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import {
    MDC as MDCTemplate,
    MDCFactory as FactoryTemplate
} from "../types/templates"

import {
    ONE_ADDRESS,
    ONE_NUM,
    getFactoryEntity,
    getMDCEntity,
    getMDCMappingEntity,
} from './helpers'
import { entity } from "./utils";
import { ContractDeployment, subgraphManagerID } from "./contractAddressConfig";

export function getSubgraphManager(): SubgraphManager {
    let subgraphManager = SubgraphManager.load(subgraphManagerID)
    if (subgraphManager == null) {
        const factoryList: Address[] = ContractDeployment.getFactoryList()
        const totalFactory = factoryList.length;
        subgraphManager = new SubgraphManager(subgraphManagerID)
        subgraphManager.factory = []
        subgraphManager.totalFactory = totalFactory
        subgraphManager.currentFactoryTemplate = 0;
        log.info('create SubgraphManager, id: {}, factory count:{}', [subgraphManagerID, totalFactory.toString()])
    }
    return subgraphManager as SubgraphManager
}


export function factoryCreateMDC(
    event: ethereum.Event,
    maker: Address,
    mdc: Address
): void {
    const factoryId = event.address.toHexString().toLowerCase()

    let factory = getFactoryEntity(factoryId)
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

export function factoryCreate(): void {
    let subgraphManager = getSubgraphManager();
    if (subgraphManager.currentFactoryTemplate < subgraphManager.totalFactory) {
        for (let i = 0; i < subgraphManager.totalFactory; i++) {
            const factoryList: Address[] = ContractDeployment.getFactoryList()
            const factoryId = factoryList[i].toHexString();
            let factory = FactoryManager.load(factoryId)
            if (factory == null) {
                let factory = getFactoryEntity(factoryId)
                factory.save()
                FactoryTemplate.create(factoryList[i])
            }
        }
    }
}