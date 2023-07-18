import { 
    Address, 
    ethereum 
} from "@graphprotocol/graph-ts";
import { MDCCreated, MDC , EBC } from "../types/schema";
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
        let entity = new MDCCreated(
            event.transaction.hash
          )
          entity.maker = maker
          entity.mdc = mdc
        
          entity.blockNumber = event.block.number
          entity.blockTimestamp = event.block.timestamp
        
          let mdcNew = new MDC(mdc.toHexString()) as MDC
          mdcNew.owner = maker
          // mdcNew.columnArrayHash = getONEBytes()
          // mdcNew.rootWithVersion = getONEBytes()
          mdcNew.ebc = []
          mdcNew.createblockNumber = event.block.number
          mdcNew.createblockTimestamp = event.block.timestamp
          mdcNew.lastestUpdatetransactionHash = mdcNew.createtransactionHash = event.transaction.hash
          // mdcNew.root = getONEBytes()
          // mdcNew.version = ONE_NUM
          MDCTemplate.create(mdc)
        
          mdcNew.save()
          entity.save()
        
          log.info('create MDC, maker: {}, mdc: {}', [maker.toHexString(), mdc.toHexString()])
        
}