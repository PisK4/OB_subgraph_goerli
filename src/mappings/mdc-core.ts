import { 
    Bytes,
    BigInt,
    ethereum,
    log,
    ByteArray,
    Address
} from "@graphprotocol/graph-ts";
import { MDC as mdcContract} from "../types/templates/MDC/MDC"
import {
  ONE_ADDRESS,
    ONE_BI,
    ONE_NUM,
    ZERO_BI,
    func_updateRulesRoot,
    func_updateRulesRootERC20,
    func_updateRulesRootERC20Selector,
    func_updateRulesRootSelector,
    getEBCEntity,
    getMDCFactory,
    getMDCEntity,
    getONEBytes,
    tupleprefix,
    updateRulesRootMode,
    saveBindEBC2MDC,
    isProduction,
    ebcSave,
    debugLog,
    parseTransactionInputData,
    calculateRscRootAndCompare,
    checkifRSCRuleTypeExist,
    removeDuplicates,
    getRuleEntity,
    updateRuleTypesThenSave,
    getRulesEntity,
    ebcManagerUpdate,
    AddressFmtPadZero,
    getChainInfoEntity,
    getFunctionSelector,
    ChainInfoUpdatedMode,
    compareChainInfoUpdatedSelector
} from "./helpers"
import { 
    EBC, 
    FactoryManger, 
    MDC, 
    RulesRootUpdated, 
    ruleTypes 
} from "../types/schema";
import { 
  funcETHRootMockInput,
  funcERC20RootMockInput, 
  mockMdcAddr, 
  funcETHRootMockInput2,
  functionUpdateChainSpvsMockinput
} from "./mock-data";
import { ChainInfoUpdatedChainInfoStruct } from "../types/ORManager/ORManager";



export function handleupdateRulesRootEvent(
    event: ethereum.Event,
    impl: Bytes,
    ebc : Bytes,
    root : Bytes,
    version : BigInt
): void{
      let updateRulesRootEntity = isProduction ? 
      parseTransactionInputData(event.transaction.input) :
      parseTransactionInputData(Bytes.fromHexString(funcETHRootMockInput2) as Bytes)
      
      const ebcAddress = updateRulesRootEntity.ebcAddress.toHexString()
      const _mdcAddress = event.transaction.to
      ? ((event.transaction.to as Address).toHex()) as string
      : null;
      
      const mdcAddress = isProduction ? _mdcAddress as string : mockMdcAddr
      log.info('ready to update, mdcAddress: {}, ebcAddress: {}', [mdcAddress, ebcAddress])

      let mdc = getMDCEntity(Address.fromString(mdcAddress), Address.fromString(ONE_ADDRESS), event) // # for production

      if (mdc) {
        let factoryAddress = Bytes.fromHexString(mdc.factory._id)
        log.info('mdcAddress: {}, ebcAddress: {}, factoryAddress{}', [mdcAddress, ebcAddress, factoryAddress.toHexString()])
        let factory = FactoryManger.load(factoryAddress)

        log.debug('inputdata decode: ebcaddress: {}, rsc: {}, root: {}, version: {}, sourceChainIds:{}, pledgeAmounts: {}, tokenAddress :{}',
        [
          ebcAddress,
          "default",
          updateRulesRootEntity.root.toHexString(),
          updateRulesRootEntity.version.toString(),
          updateRulesRootEntity.sourceChainIds.toString(),
          updateRulesRootEntity.pledgeAmounts.toString(),
          updateRulesRootEntity.tokenAddr.toHexString()
        ])
        
        if(ebcAddress != null){
          let ebc = getEBCEntity(mdc, Address.fromString(ebcAddress), event)
      
          // save ebcs ruletype
          if(updateRulesRootEntity.rscType != null){
            if(version.equals(BigInt.fromI32(updateRulesRootEntity.version))){
              let _rules = getRulesEntity(ebc, version)
              updateRuleTypesThenSave(updateRulesRootEntity, _rules, root, version)
              _rules.save()
            }else{
              log.error('version not equal {} != {}', [version.toString(), updateRulesRootEntity.version.toString()])
            }
          }
          // ebc.sourceChainIds = updateRulesRootEntity.sourceChainIds
          // ebc.pledgeAmounts = updateRulesRootEntity.pledgeAmounts    
          ebc.lastestUpdateHash = event.transaction.hash
          ebcSave(ebc, mdc, event)
        }        
        mdc.lastestUpdatetransactionHash = event.transaction.hash
        mdc.save()
        if(factory){
          factory.save()
        }
    }else{
        log.error('MDC not exist', ['error'])
    }

}


export function handleColumnArrayUpdatedEvent (
    event: ethereum.Event,
    impl : Bytes,
    columnArrayHash : Bytes,
    dealers : Array<Address>,
    ebcs : Array<Address>,
    chainIds : Array<BigInt>
): void{
    const mdcAddress = isProduction ? event.address : Address.fromString(mockMdcAddr);
    let mdc = getMDCEntity(mdcAddress, Address.fromString(ONE_ADDRESS), event)
    if(mdc){
        mdc.columnArrayHash = columnArrayHash

        // process dealers
        let dealersBytes = new Array<Bytes>()
        for(let i = 0; i < dealers.length; i++){
          dealersBytes.push(Address.fromHexString(dealers[i].toHexString()) as Bytes)
        }
        mdc.dealers = dealersBytes

        // process ebcs
        let uniqueEbcs = removeDuplicates(ebcs)
        if(uniqueEbcs.length > 0){
            for(let i = 0; i < uniqueEbcs.length; i++){
                let ebc = getEBCEntity(mdc, uniqueEbcs[i], event)
                ebcSave(ebc, mdc, event)
              }
        }

        mdc.lastestUpdatetransactionHash = event.transaction.hash
        mdc.save()
        
    }else{
        log.error('MDC not exist', ['error'])
    }
}

export function handleEbcsUpdatedEvent(
  event: ethereum.Event,
  ebcs: Array<Address>,
  statuses: Array<boolean>
): void {
  let _statuses = statuses;
  if (ebcs.length > statuses.length) {
    for (let i = statuses.length; i < ebcs.length; i++) {
      _statuses.push(true);
    }
  } else if (ebcs.length < statuses.length) {
    _statuses = statuses.slice(0, ebcs.length);
  }

  for (let i = 0; i < ebcs.length; i++) {
    ebcManagerUpdate(ebcs[i], _statuses[i], event);
  }
}

export function handleChainInfoUpdatedEvent(
    event: ethereum.Event,
    chainInfoId: BigInt,
    chainInfo: ChainInfoUpdatedChainInfoStruct
): void{
    let _chainInfo = getChainInfoEntity(chainInfoId)
    let batchLimit = chainInfo.batchLimit
    let minVerifyChallengeSourceTxSecond = chainInfo.minVerifyChallengeSourceTxSecond
    let maxVerifyChallengeSourceTxSecond = chainInfo.maxVerifyChallengeSourceTxSecond
    let minVerifyChallengeDestTxSecond = chainInfo.minVerifyChallengeDestTxSecond
    let maxVerifyChallengeDestTxSecond = chainInfo.maxVerifyChallengeDestTxSecond
    let spvs = chainInfo.spvs

    const inputdata = isProduction ? event.transaction.input : Bytes.fromHexString(functionUpdateChainSpvsMockinput) as Bytes
    const selector = compareChainInfoUpdatedSelector(getFunctionSelector(inputdata)) 
    if(selector == ChainInfoUpdatedMode.registerChains){
        log.info("{}", ["registerChains"])
        _chainInfo.batchLimit = batchLimit
        _chainInfo.minVerifyChallengeSourceTxSecond = minVerifyChallengeSourceTxSecond
        _chainInfo.maxVerifyChallengeSourceTxSecond = maxVerifyChallengeSourceTxSecond
        _chainInfo.minVerifyChallengeDestTxSecond = minVerifyChallengeDestTxSecond
        _chainInfo.maxVerifyChallengeDestTxSecond = maxVerifyChallengeDestTxSecond
        let spvsBytes = new Array<Bytes>()
        for(let i = 0; i < spvs.length; i++){
          spvsBytes.push(Address.fromHexString(AddressFmtPadZero(spvs[i].toHexString())) as Bytes)
        }
    }else if(selector == ChainInfoUpdatedMode.updateChainSpvs){
      log.info("{}", ["updateChainSpvs"])
    }else{
      log.warning("chainInfoUpdated selector not match {}", [getFunctionSelector(inputdata).toString()])
    }
    _chainInfo.save()

}

export function handleResponseMakersUpdatedEvent(
  event: ethereum.Event,
  impl: Bytes,
  responseMakers: Array<BigInt>
): void {
  const mdcAddress = isProduction ? event.address : Address.fromString(mockMdcAddr);
  let mdc = getMDCEntity(mdcAddress, Address.fromString(ONE_ADDRESS), event)
  let responseMakersBytes = new Array<Bytes>()
  for(let i = 0; i < responseMakers.length; i++){
    // log.info('responseMakers: {}', [responseMakers[i].toString()])
    responseMakersBytes.push(Address.fromHexString(AddressFmtPadZero(responseMakers[i].toHexString())) as Bytes)
  }
  mdc.responseMakers = responseMakersBytes
  mdc.save()
}