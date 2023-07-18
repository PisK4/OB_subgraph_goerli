import { log } from '@graphprotocol/graph-ts'
import { MDCCreated as MDCCreatedEvent } from "../types/MDCFactory/MDCFactory"
import { MDCCreated, MDC , EBC} from "../types/schema"
import { MDC as MDCTemplate} from "../types/templates"
import {
  ONE_ADDRESS,
  ONE_NUM,
  getONEBytes
} from './helpers'

export function handleMDCCreated(event: MDCCreatedEvent): void {
  let entity = new MDCCreated(
    event.transaction.hash
  )
  entity.maker = event.params.maker
  entity.mdc = event.params.mdc

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp

  let mdcNew = new MDC(event.params.mdc.toHexString()) as MDC
  mdcNew.owner = event.params.maker
  // mdcNew.columnArrayHash = getONEBytes()
  // mdcNew.rootWithVersion = getONEBytes()
  mdcNew.ebc = []
  mdcNew.createblockNumber = event.block.number
  mdcNew.createblockTimestamp = event.block.timestamp
  mdcNew.lastestUpdatetransactionHash = mdcNew.createtransactionHash = event.transaction.hash
  // mdcNew.root = getONEBytes()
  // mdcNew.version = ONE_NUM
  MDCTemplate.create(event.params.mdc)

  mdcNew.save()
  entity.save()

  log.info('create MDC, maker: {}, mdc: {}', [event.params.maker.toHexString(), event.params.mdc.toHexString()])

}
