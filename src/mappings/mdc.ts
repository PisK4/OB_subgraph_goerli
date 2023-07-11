import {
  ColumnArrayUpdated as ColumnArrayUpdatedEvent,
  ResponseMakersUpdated as ResponseMakersUpdatedEvent,
  RulesRootUpdated as RulesRootUpdatedEvent,
  SpvUpdated as SpvUpdatedEvent
} from "../types/templates/MDC/MDC"
import {
  // ColumnArrayUpdated,
  // ResponseMakersUpdated,
  RulesRootUpdated
  // SpvUpdated
} from "../types/schema"

// export function handleColumnArrayUpdated(event: ColumnArrayUpdatedEvent): void {
//   let entity = new ColumnArrayUpdated(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.impl = event.params.impl
//   entity.columnArrayHash = event.params.columnArrayHash
//   // entity.dealers = event.params.dealers
//   // entity.ebcs = event.params.ebcs
//   for(let i = 0; i < event.params.dealers.length; i++) {
//     entity.dealers.push(event.params.dealers[i])
//   }

//   for(let i = 0; i < event.params.ebcs.length; i++) {
//     entity.ebcs.push(event.params.ebcs[i])
//   }
  
//   entity.chainIds = event.params.chainIds

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

// export function handleResponseMakersUpdated(
//   event: ResponseMakersUpdatedEvent
// ): void {
//   let entity = new ResponseMakersUpdated(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.impl = event.params.impl
//   // entity.responseMakers = event.params.responseMakers
//   for(let i = 0; i < event.params.responseMakers.length; i++) {
//     entity.responseMakers.push(event.params.responseMakers[i])
//   }

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }

export function handleRulesRootUpdated(event: RulesRootUpdatedEvent): void {
  let entity = new RulesRootUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.impl = event.params.impl
  entity.ebc = event.params.ebc
  entity.rootWithVersion_root = event.params.rootWithVersion.root
  entity.rootWithVersion_version = event.params.rootWithVersion.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

// export function handleSpvUpdated(event: SpvUpdatedEvent): void {
//   let entity = new SpvUpdated(
//     event.transaction.hash.concatI32(event.logIndex.toI32())
//   )
//   entity.impl = event.params.impl
//   entity.chainId = event.params.chainId
//   entity.spv = event.params.spv

//   entity.blockNumber = event.block.number
//   entity.blockTimestamp = event.block.timestamp
//   entity.transactionHash = event.transaction.hash

//   entity.save()
// }
