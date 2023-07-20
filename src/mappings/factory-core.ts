import { 
    Address,
    BigInt, 
    ethereum 
} from "@graphprotocol/graph-ts";
import { MDCCreated, MDC , EBC, FactoryManger } from "../types/schema";
import { log } from '@graphprotocol/graph-ts'
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { MDC as MDCTemplate} from "../types/templates"
import {
  ONE_ADDRESS,
  ONE_NUM,
  getMDCEntity,
  getONEBytes
} from './helpers'


export function factoryCreateMDC(
    event: ethereum.Event,
    maker: Address,
    mdc: Address
    ): void {
        if(!(event.transaction.to)){
            log.error('event.transaction.to is null, transactionHash: {}', [event.transaction.hash.toHexString()])
        }else{
            let to = event.transaction.to as Address
            let factory = FactoryManger.load(to)

            if(!factory){
                factory = new FactoryManger(
                    to
                  )
                factory.mdcCounts = BigInt.fromI32(0);
                factory.mdcs = []
            }
            
            factory.lastestUpdateHash  = event.transaction.hash
            factory.lastestUpdateBlockNumber = event.block.number
            factory.lastestUpdateTimestamp = event.block.timestamp
            factory.mdcCounts = factory.mdcCounts.plus(BigInt.fromI32(1))

            let mdcNew = getMDCEntity(mdc, maker, event)
            MDCTemplate.create(mdc)

            // factory.mdcs = [mdcNew.id]
            if (factory.mdcs == null) {
                factory.mdcs = [mdcNew.id]
            } else {
                factory.mdcs = factory.mdcs.concat([mdcNew.id]);
            }
            
            mdcNew.save()
            factory.save()
        }


}