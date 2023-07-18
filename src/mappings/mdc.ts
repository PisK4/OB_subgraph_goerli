import {
  ColumnArrayUpdated as ColumnArrayUpdatedEvent,
  ResponseMakersUpdated as ResponseMakersUpdatedEvent,
  RulesRootUpdated as RulesRootUpdatedEvent,
  SpvUpdated as SpvUpdatedEvent
} from "../types/templates/MDC/MDC"
import {
  ColumnArrayUpdated,
  EBC,
  MDC,
  ResponseMakersUpdated,
  RulesRootUpdated,
  SpvUpdated,
  ruleTypes
} from "../types/schema"
import { Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { 
  ONE_ADDRESS,
  ONE_BI,
  ONE_NUM,
  ZERO_BI,
  checkifRSCRuleTypeExist,
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
  entity.rootWithVersion_root = event.params.rootWithVersion.root
  entity.rootWithVersion_version = event.params.rootWithVersion.version
  entity.input = event.transaction.input
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  
  // # for test only
  let debugInput = Bytes.fromHexString(funcERC20) as Bytes;
  let updateRulesRootEntity = parseTransactionInputData(debugInput)

  // # for production
  // let updateRulesRootEntity = parseTransactionInputData(event.transaction.input)

  log.debug('ebcaddress: {}, rsc: {}, root: {}, version: {}, sourceChainIds:{}, pledgeAmounts: {}, tokenAddress :{}',
  [
    updateRulesRootEntity.ebcAddress.toHexString(),
    "default",
    updateRulesRootEntity.root.toHexString(),
    updateRulesRootEntity.version.toString(),
    updateRulesRootEntity.sourceChainIds.toString(),
    updateRulesRootEntity.pledgeAmounts.toString(),
    updateRulesRootEntity.tokenAddr.toHexString()
  ])

  if(updateRulesRootEntity.ebcAddress.toHexString() != null){
    let ebc = EBC.load(updateRulesRootEntity.ebcAddress.toHexString())
    if (ebc == null) {
      log.debug('create new EBC:{}', [updateRulesRootEntity.ebcAddress.toHexString()])
      ebc = new EBC(updateRulesRootEntity.ebcAddress.toHexString()) as EBC
      ebc.rule = "default"
    }
    ebc.root = updateRulesRootEntity.root
    ebc.version = updateRulesRootEntity.version
    ebc.sourceChainIds = updateRulesRootEntity.sourceChainIds
    ebc.pledgeAmounts = updateRulesRootEntity.pledgeAmounts

    // save ebcs ruletype
    if(updateRulesRootEntity.rscType != null){
      let _rules = ruleTypes.load(updateRulesRootEntity.ebcAddress.toHexString())
      if(_rules == null){
        log.debug('create new ruleTypes:{}', [updateRulesRootEntity.ebcAddress.toHexString()])
        _rules = new ruleTypes(updateRulesRootEntity.ebcAddress.toHexString())
        // init ruleTypes
        _rules.chain0 = ONE_BI
        _rules.chain1 = ONE_BI
        _rules.chain0Status = ONE_NUM
        _rules.chain1Status = ONE_NUM
        _rules.chain0Token = ONE_BI
        _rules.chain1Token = ONE_BI
        _rules.minPrice = ONE_BI
        _rules.maxPrice = ONE_BI
        _rules.chain0WithholdingFee = ONE_BI
        _rules.chain1WithholdingFee = ONE_BI
        _rules.chain0TradeFee = ONE_NUM
        _rules.chain1TradeFee = ONE_NUM
        _rules.chain0ResponseTime = ONE_NUM
        _rules.chain1ResponseTime = ONE_NUM
        _rules.chain0CompensationRatio = ONE_NUM
        _rules.chain1CompensationRatio = ONE_NUM
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0)){
        _rules.chain0 = updateRulesRootEntity.rscType.chain0
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1)){
        _rules.chain1 = updateRulesRootEntity.rscType.chain1
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0Status)){
        _rules.chain0Status = updateRulesRootEntity.rscType.chain0Status.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1Status)){
        _rules.chain1Status = updateRulesRootEntity.rscType.chain1Status.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0Token)){
        _rules.chain0Token = updateRulesRootEntity.rscType.chain0Token
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1Token)){
        _rules.chain1Token = updateRulesRootEntity.rscType.chain1Token
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.minPrice)){
        _rules.minPrice = updateRulesRootEntity.rscType.minPrice
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.maxPrice)){
        _rules.maxPrice = updateRulesRootEntity.rscType.maxPrice
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0WithholdingFee)){
        _rules.chain0WithholdingFee = updateRulesRootEntity.rscType.chain0WithholdingFee
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1WithholdingFee)){
        _rules.chain1WithholdingFee = updateRulesRootEntity.rscType.chain1WithholdingFee
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0TradeFee)){
        _rules.chain0TradeFee = updateRulesRootEntity.rscType.chain0TradeFee.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1TradeFee)){
        _rules.chain1TradeFee = updateRulesRootEntity.rscType.chain1TradeFee.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0ResponseTime)){
        _rules.chain0ResponseTime = updateRulesRootEntity.rscType.chain0ResponseTime.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1ResponseTime)){
        _rules.chain1ResponseTime = updateRulesRootEntity.rscType.chain1ResponseTime.toI32()
      }
      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0CompensationRatio)){
        _rules.chain0CompensationRatio = updateRulesRootEntity.rscType.chain0CompensationRatio.toI32()
      }

      if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1CompensationRatio)){
        _rules.chain1CompensationRatio = updateRulesRootEntity.rscType.chain1CompensationRatio.toI32()
      }

      log.debug('_rscRule[0]:{}, [1]:{}, [2]:{}, [3]:{}, [4]:{}, [5]:{}, [6]:{}, [7]:{}, [8]:{}, [9]:{}, [10]:{}, [11]:{}, [12]:{}, [13]:{}, [14]:{}, [15]:{}', [
        _rules.chain0.toString(),
        _rules.chain1.toString(),
        _rules.chain0Status.toString(),
        _rules.chain1Status.toString(),
        _rules.chain0Token.toString(),
        _rules.chain1Token.toString(),
        _rules.minPrice.toString(),
        _rules.maxPrice.toString(),
        _rules.chain0WithholdingFee.toString(),
        _rules.chain1WithholdingFee.toString(),
        _rules.chain0TradeFee.toString(),
        _rules.chain1TradeFee.toString(),
        _rules.chain0ResponseTime.toString(),
        _rules.chain1ResponseTime.toString(),
        _rules.chain0CompensationRatio.toString(),
        _rules.chain1CompensationRatio.toString()
      ])

      _rules.save()
    }
    ebc.save()
  }
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
