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
    getMDCFactory,
    getMDCEntity,
    getONEBytes,
    tupleprefix,
    updateRulesRootMode,
    isProduction,
    ebcSave,
    debugLog,
    parseTransactionInputData,
    removeDuplicates,
    ebcManagerUpdate,
    AddressFmtPadZero,
    getChainInfoEntity,
    getFunctionSelector,
    ChainInfoUpdatedMode,
    compareChainInfoUpdatedSelector,
    parseChainInfoUpdatedInputData,
    getChainTokenUpdatedEntity,
    getColumnArrayUpdatedEntity,
    getMDCBindSPVEntity,
    getdealerSnapshotEntity,
    removeDuplicatesBigInt,
    mdcStoreEBCNewMapping,
    mdcStoreDealerNewMapping,
    mdcStoreChainIdNewMapping,
    mdcStoreResponseMaker,
    mdcStoreRuleSnapshot,
    getEBCEntityNew,
    getEBCSnapshotEntity,
    getChainIdSnapshotEntity
} from "./helpers"
import { 
    FactoryManger
} from "../types/schema";
import { 
  funcETHRootMockInput,
  funcERC20RootMockInput, 
  mockMdcAddr, 
  funcETHRootMockInput2,
  functionUpdateChainSpvsMockinput,
  functionRegisterChainMockinput
} from "../../tests/mock-data";
import { ChainInfoUpdatedChainInfoStruct, ChainTokenUpdatedTokenInfoStruct } from "../types/ORManager/ORManager";



export function handleupdateRulesRootEvent(
    event: ethereum.Event,
    impl: Bytes,
    ebc : Bytes,
    root : Bytes,
    version : BigInt
): void{
      const _mdcAddress = event.address.toHexString()
      const mdcAddress = isProduction ? _mdcAddress as string : mockMdcAddr
      let updateRulesRootEntity = isProduction ? 
      parseTransactionInputData(event.transaction.input, mdcAddress) :
      parseTransactionInputData(Bytes.fromHexString(funcERC20RootMockInput) as Bytes, mdcAddress)
      
      const ebcAddress = updateRulesRootEntity.ebcAddress.toHexString()
      // log.info('ready to update, mdcAddress: {}, ebcAddress: {}', [mdcAddress, ebcAddress])
      let mdc = getMDCEntity(Address.fromString(mdcAddress), Address.fromString(ONE_ADDRESS), event) // # for production
      let factoryAddress = Bytes.fromHexString(mdc.factory._id)
      // log.info('mdcAddress: {}, ebcAddress: {}, factoryAddress{}', [mdcAddress, ebcAddress, factoryAddress.toHexString()])
      let factory = FactoryManger.load(factoryAddress.toHexString())

      log.info('inputdata decode: ebc: {}, root: {}, version: {}, sourceChainIds:{}, pledgeAmounts: {}, tokenAddress :{}',
      [
        ebcAddress,
        updateRulesRootEntity.root.toHexString(),
        updateRulesRootEntity.version.toString(),
        updateRulesRootEntity.sourceChainIds.toString(),
        updateRulesRootEntity.pledgeAmounts.toString(),
        updateRulesRootEntity.tokenAddr.toHexString()
      ])
      
      if(ebcAddress != null){
        // let ebc = getEBCEntity(mdc, Address.fromString(ebcAddress), event)
        const ebcEntity = getEBCEntityNew(ebcAddress, event)
    
        // save ebcs ruletype
        // if(updateRulesRootEntity.rscType != null){
        mdcStoreRuleSnapshot(event, updateRulesRootEntity, mdc, ebcEntity)
        ebcSave(ebcEntity, mdc)
        ebcEntity.save()
      }        
      mdc.save()
      if(factory){
        factory.save()
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
    
    // process dealers
    let uniqueDealers = removeDuplicates(dealers)
    let dealersBytes = new Array<Bytes>()
    for(let i = 0; i < uniqueDealers.length; i++){
        dealersBytes.push(Address.fromHexString(uniqueDealers[i].toHexString()) as Bytes)
    }
    const dealerSnapshot = getdealerSnapshotEntity(mdc, event)
    mdcStoreDealerNewMapping(mdc, dealerSnapshot, dealersBytes, event)
    dealerSnapshot.save()

    // process chainIds
    let uniqueChainIds = removeDuplicatesBigInt(chainIds)
    const chainIdSnapshot = getChainIdSnapshotEntity(mdc, event)
    mdcStoreChainIdNewMapping(mdc, chainIdSnapshot, uniqueChainIds, event)
    chainIdSnapshot.save()

    // process ebcs
    let uniqueEbcs = removeDuplicates(ebcs)
    let ebcsBytes = new Array<Bytes>()
    for(let i = 0; i < uniqueEbcs.length; i++){
        ebcsBytes.push(Address.fromHexString(uniqueEbcs[i].toHexString()) as Bytes)
    }
    const ebcSnapshot = getEBCSnapshotEntity(mdc, event)
    mdcStoreEBCNewMapping(mdc, ebcSnapshot, ebcsBytes, event)
    ebcSnapshot.save()

    // process ColumnArray
    let columnArrayUpdated = getColumnArrayUpdatedEntity(event,mdc)
    columnArrayUpdated.impl = impl
    columnArrayUpdated.columnArrayHash = columnArrayHash
    if(dealersBytes.length > 0){
      columnArrayUpdated.dealers = dealersBytes
    }
    if(ebcsBytes.length > 0){
      columnArrayUpdated.ebcs = ebcsBytes
    }
    if(uniqueChainIds.length > 0){
      columnArrayUpdated.chainIds = uniqueChainIds
    }
    columnArrayUpdated.save()

    mdc.save()
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
  log.debug("handleChainInfoUpdated id:{}", [chainInfoId.toString()])
    let _chainInfo = getChainInfoEntity(event, chainInfoId)
    let batchLimit = chainInfo.batchLimit
    let minVerifyChallengeSourceTxSecond = chainInfo.minVerifyChallengeSourceTxSecond
    let maxVerifyChallengeSourceTxSecond = chainInfo.maxVerifyChallengeSourceTxSecond
    let minVerifyChallengeDestTxSecond = chainInfo.minVerifyChallengeDestTxSecond
    let maxVerifyChallengeDestTxSecond = chainInfo.maxVerifyChallengeDestTxSecond
    let spvs = isProduction ? chainInfo.spvs : [Address.fromString(mockMdcAddr)]

    const inputdata = isProduction ? event.transaction.input : Bytes.fromHexString(functionUpdateChainSpvsMockinput) as Bytes
    const selector = compareChainInfoUpdatedSelector(getFunctionSelector(inputdata)) 
    if(selector == ChainInfoUpdatedMode.registerChains){
        log.info("registerChains", ["registerChains"])
        _chainInfo.batchLimit = batchLimit
        _chainInfo.minVerifyChallengeSourceTxSecond = minVerifyChallengeSourceTxSecond
        _chainInfo.maxVerifyChallengeSourceTxSecond = maxVerifyChallengeSourceTxSecond
        _chainInfo.minVerifyChallengeDestTxSecond = minVerifyChallengeDestTxSecond
        _chainInfo.maxVerifyChallengeDestTxSecond = maxVerifyChallengeDestTxSecond
        for (let i = 0; i < spvs.length; i++) {
          _chainInfo.spvs = _chainInfo.spvs.concat([Address.fromHexString(AddressFmtPadZero(spvs[i].toHexString()))]);
          
        }

    }else if(selector == ChainInfoUpdatedMode.updateChainSpvs){
      log.info("updateChainSpvs", ["updateChainSpvs"])
      parseChainInfoUpdatedInputData(inputdata, _chainInfo)

    }else{
      log.warning("chainInfoUpdated selector not match {}", [getFunctionSelector(inputdata).toHexString()])
    }
    _chainInfo.save()

}

export function handleChainTokenUpdatedEvent(
  event: ethereum.Event,
  chainId: BigInt,
  tokenInfo: ChainTokenUpdatedTokenInfoStruct
): void {
  let token = tokenInfo.token
  let mainnetToken = tokenInfo.mainnetToken
  let decimals = tokenInfo.decimals
  let chainToken = getChainTokenUpdatedEntity(chainId, token, event)
  chainToken.token = token
  chainToken.mainnetToken = mainnetToken
  chainToken.decimals = decimals
  chainToken.save()  

}

export function handleResponseMakersUpdatedEvent(
  event: ethereum.Event,
  impl: Bytes,
  responseMakers: Array<BigInt>
): void {
  const mdcAddress = isProduction ? event.address : Address.fromString(mockMdcAddr);
  let mdc = getMDCEntity(mdcAddress, Address.fromString(ONE_ADDRESS), event)
  // let responseMakersBytes = new Array<Bytes>()
  // for(let i = 0; i < responseMakers.length; i++){
  //   // log.info('mdc{} update responseMakers: {}', [mdcAddress.toHexString(), responseMakers[i].toString()])
  //   responseMakersBytes.push(Address.fromHexString(AddressFmtPadZero(responseMakers[i].toHexString())) as Bytes)
  // }
  // mdcStoreResponseMaker(mdc, responseMakersBytes, event)
  let responseMakersArray = new Array<string>()
  for(let i = 0; i < responseMakers.length; i++){
    responseMakersArray.push(AddressFmtPadZero(responseMakers[i].toHexString()))
  }
  mdcStoreResponseMaker(mdc, responseMakersArray, event)
  mdc.save()
}

export function handleSpvUpdatedEvent(
  event: ethereum.Event,
  impl: Bytes,
  chainId: BigInt,
  spv: Bytes
): void{
  let mdc = isProduction ? getMDCEntity(event.address, Address.fromString(ONE_ADDRESS), event) : getMDCEntity(Address.fromString(mockMdcAddr), Address.fromString(ONE_ADDRESS), event)
  let _spv = getMDCBindSPVEntity(mdc, chainId)
  _spv.spv = spv
  _spv.save()
  mdc.save()
  log.info('mdc {} update:  _spv[{}] = {}', [mdc.id, chainId.toString(), spv.toHexString()])
}