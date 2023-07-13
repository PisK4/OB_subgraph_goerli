import {
  ColumnArrayUpdated as ColumnArrayUpdatedEvent,
  ResponseMakersUpdated as ResponseMakersUpdatedEvent,
  RulesRootUpdated as RulesRootUpdatedEvent,
  SpvUpdated as SpvUpdatedEvent
} from "../types/templates/MDC/MDC"
import {
  ColumnArrayUpdated,
  ResponseMakersUpdated,
  RulesRootUpdated,
  SpvUpdated
} from "../types/schema"
import { Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { 
  funcERC20, 
  funcETH, 
  getFunctionSelector, 
  parseTransactionInputData,
  updateRulesRoot } from "./helpers"

export function handleColumnArrayUpdated(event: ColumnArrayUpdatedEvent): void {
  let entity = new ColumnArrayUpdated(
    event.transaction.hash
  )
  entity.impl = event.params.impl
  entity.columnArrayHash = event.params.columnArrayHash
  // entity.dealers = event.params.dealers
  // entity.ebcs = event.params.ebcs
  
  entity.chainIds = event.params.chainIds

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResponseMakersUpdated(
  event: ResponseMakersUpdatedEvent
): void {
  let entity = new ResponseMakersUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.impl = event.params.impl
  // entity.responseMakers = event.params.responseMakers

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRulesRootUpdated(event: RulesRootUpdatedEvent): void {
  let entity = new RulesRootUpdated(
    event.transaction.hash
  )
  entity.impl = event.params.impl
  entity.ebc = event.params.ebc
  // mark for uint test
  entity.rootWithVersion_root = event.params.rootWithVersion.root
  entity.rootWithVersion_version = event.params.rootWithVersion.version
  entity.input = event.transaction.input
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  
  // # for test only
  // let debugInput = Bytes.fromHexString(funcERC20) as Bytes;
  // let updateRulesRootEntity = parseTransactionInputData(debugInput)

  // # for production
  let updateRulesRootEntity = parseTransactionInputData(event.transaction.input)

  // print all log
  log.debug('ebcaddress: {}, rsc: {}, root: {}, version: {}, sourceChainIds:{}, pledgeAmounts: {}, tokenAddress :{}',
  [
    updateRulesRootEntity.ebcAddress.toHexString(),
    updateRulesRootEntity.rsc.toHexString(),
    updateRulesRootEntity.root.toHexString(),
    updateRulesRootEntity.version.toString(),
    updateRulesRootEntity.sourceChainIds.toString(),
    updateRulesRootEntity.pledgeAmounts.toString(),
    updateRulesRootEntity.tokenAddr.toHexString()
  ])

  entity.save()
}

export function handleSpvUpdated(event: SpvUpdatedEvent): void {
  let entity = new SpvUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.impl = event.params.impl
  entity.chainId = event.params.chainId
  entity.spv = event.params.spv

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
