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
            }
            
            factory.lastestUpdateHash  = event.transaction.hash
            factory.lastestUpdateBlockNumber = event.block.number
            factory.lastestUpdateTimestamp = event.block.timestamp
            factory.mdcCounts = factory.mdcCounts.plus(BigInt.fromI32(1))

            let mdcNew = new MDC(mdc.toHexString()) as MDC
            mdcNew.owner = maker
            mdcNew.ebc = []
            mdcNew.createblockNumber = event.block.number
            mdcNew.createblockTimestamp = event.block.timestamp
            mdcNew.lastestUpdatetransactionHash = mdcNew.createtransactionHash = event.transaction.hash
            MDCTemplate.create(mdc)

            mdcNew.save()
            factory.save()

            log.info('Factory create MDC, maker: {}, mdc: {}', [maker.toHexString(), mdc.toHexString()])
        }


}