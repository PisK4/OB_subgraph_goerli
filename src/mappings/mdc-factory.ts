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
  mdcNew.owner = getONEBytes()
  mdcNew.columnArrayHash = getONEBytes()
  // for(let i = 0; i < mdcNew.responseMakers.length; i++) {
  //   mdcNew.responseMakers.push(getONEBytes())
  // }
  mdcNew.rootWithVersion = getONEBytes()
  // for(let i = 0; i < mdcNew.spvs.length; i++) {
  //   mdcNew.spvs.push(getONEBytes())
  // }
  // for(let i = 0; i < mdcNew.chainIds.length; i++) {
  //   mdcNew.chainIds[i] = ONE_NUM
  // }
  // for(let i = 0; i < mdcNew.dealers.length; i++) {
  //   mdcNew.dealers.push(getONEBytes())
  // }
  mdcNew.ebc = ONE_ADDRESS
  mdcNew.createblockNumber = event.block.number
  mdcNew.createblockTimestamp = event.block.timestamp
  mdcNew.createtransactionHash = event.transaction.hash
  MDCTemplate.create(event.params.mdc)

  mdcNew.save()
  entity.save()

  log.debug('create MDC, maker: {}, mdc: {}', [event.params.maker.toHexString(), event.params.mdc.toHexString()])

}
