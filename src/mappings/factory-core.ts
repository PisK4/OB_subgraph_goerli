import { 
    Address,
    BigInt, 
    ethereum 
} from "@graphprotocol/graph-ts";
import { DealerMapping, FactoryManger } from "../types/schema";
import { log } from '@graphprotocol/graph-ts'
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { MDC as MDCTemplate} from "../types/templates"
import {
  ONE_ADDRESS,
  ONE_NUM,
  getFactoryEntity,
  getMDCEntity,
  getMDCMappingEntity,
  getONEBytes
} from './helpers'
import { entityConcatID } from "./utils";


export function factoryCreateMDC(
    event: ethereum.Event,
    maker: Address,
    mdc: Address
    ): void {
        // if(!(event.transaction.to)){
        //     log.error('event.transaction.to is null, transactionHash: {}', [event.transaction.hash.toHexString()])
        // }else{
            // let to = event.transaction.to.toHexString()
        const ID = event.address.toHexString()
        // let factory = FactoryManger.load(ID)

        // if(!factory){
        //     factory = new FactoryManger(ID)
        //     factory.mdcCounts = BigInt.fromI32(0);
        //     factory.mdcs = []
        //     factory.owners = []
        //     factory.responseMakers = []
        // }
        
        // factory.latestUpdateHash  = event.transaction.hash
        // factory.latestUpdateBlockNumber = event.block.number
        // factory.latestUpdateTimestamp = event.block.timestamp
        let factory = getFactoryEntity(ID, event)
        factory.mdcCounts = factory.mdcCounts.plus(BigInt.fromI32(1))
        let mdcNew = getMDCEntity(mdc, maker, event)
        // factory.mdcs = [mdcNew.id]
        // if (factory.mdcs == null) {
        //     factory.mdcs = [mdcNew.id]
        // } else {
        //     factory.mdcs = factory.mdcs.concat([mdcNew.id]);
        // }
        factory.mdcs = entityConcatID(factory.mdcs, mdcNew.id)
        factory.owners = entityConcatID(factory.owners, maker.toHexString())
        let mdcMapping = getMDCMappingEntity(mdcNew, event)
        mdcNew.mapping = mdcMapping.id

        mdcMapping.save()
        mdcNew.save()
        factory.save()
        MDCTemplate.create(mdc)
        // }


}