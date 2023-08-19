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
    updateRulesRootMode,
    isProduction,
    ebcSave,
    debugLog,
    parseTransactionInputData,
    removeDuplicates,
    ebcManagerUpdate,
    AddressFmtPadZero,
    getChainInfoEntity,
    ChainInfoUpdatedMode,
    compareChainInfoUpdatedSelector,
    parseChainInfoUpdatedInputData,
    getTokenEntity,
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
    getChainIdSnapshotEntity,
    decodeEnabletime,
    func_updateColumnArraySelector,
    STRING_INVALID
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
  functionRegisterChainMockinput,
  functionupdateColumnArrayMockinput
} from "../../tests/mock-data";
import { ChainInfoUpdatedChainInfoStruct, ChainTokenUpdatedTokenInfoStruct } from "../types/ORManager/ORManager";
import { getFunctionSelector } from "./utils";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from "./ERC20utils";



export function handleupdateRulesRootEvent(
    event: ethereum.Event,
    impl: Bytes,
    ebc : Bytes,
    root : Bytes,
    version : BigInt
): void{
      const _mdcAddress = event.address.toHexString()
      const mdcAddress = isProduction ? _mdcAddress as string : mockMdcAddr
      const inputData = isProduction ? event.transaction.input : Bytes.fromHexString(funcERC20RootMockInput) as Bytes
      const updateRulesRootEntity = parseTransactionInputData(inputData, mdcAddress)      
      const ebcAddress = updateRulesRootEntity.ebcAddress
      let mdc = getMDCEntity(Address.fromString(mdcAddress), Address.fromString(ONE_ADDRESS), event)
      let factoryAddress = Bytes.fromHexString(mdc.factory._id)
      let factory = FactoryManger.load(factoryAddress.toHexString())

      log.info('inputdata decode: ebc: {}, enableTime: {}, root: {}, version: {}, sourceChainIds:{}, pledgeAmounts: {}, tokenAddress :{}',
      [
        ebcAddress,
        updateRulesRootEntity.enableTimestamp.toString(),
        updateRulesRootEntity.root,
        updateRulesRootEntity.version.toString(),
        updateRulesRootEntity.sourceChainIds.toString(),
        updateRulesRootEntity.pledgeAmounts.toString(),
        updateRulesRootEntity.tokenAddr
      ])
      
      if(ebcAddress != null){
        const ebcEntity = getEBCEntityNew(ebcAddress, event)
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
    const inputData = isProduction ? event.transaction.input : Bytes.fromHexString(functionupdateColumnArrayMockinput) as Bytes
    const enableTimestamp = decodeEnabletime(inputData, func_updateColumnArraySelector)
    
    // process dealers
    let uniqueDealers = removeDuplicates(dealers)
    let dealerArray = new Array<string>()
    for(let i = 0; i < uniqueDealers.length; i++){
      dealerArray.push(uniqueDealers[i].toHexString())
    }
    const dealerSnapshot = getdealerSnapshotEntity(mdc, event)
    mdcStoreDealerNewMapping(mdc, dealerSnapshot, dealerArray, event, enableTimestamp)
    dealerSnapshot.save()

    // process chainIds
    let uniqueChainIds = removeDuplicatesBigInt(chainIds)
    const chainIdSnapshot = getChainIdSnapshotEntity(mdc, event)
    mdcStoreChainIdNewMapping(mdc, chainIdSnapshot, uniqueChainIds, event, enableTimestamp)
    chainIdSnapshot.save()

    // process ebcs
    let uniqueEbcs = removeDuplicates(ebcs)
    let ebcsArray = new Array<string>()
    for(let i = 0; i < uniqueEbcs.length; i++){
      ebcsArray.push(uniqueEbcs[i].toHexString())
    }
    const ebcSnapshot = getEBCSnapshotEntity(mdc, event)
    mdcStoreEBCNewMapping(mdc, ebcSnapshot, ebcsArray, event, enableTimestamp)
    ebcSnapshot.save()

    // process ColumnArray
    let columnArrayUpdated = getColumnArrayUpdatedEntity(event,mdc)
    columnArrayUpdated.impl = impl.toHexString()
    columnArrayUpdated.columnArrayHash = columnArrayHash.toHexString()
    if(dealerArray.length > 0){
      columnArrayUpdated.dealers = dealerArray
    }
    if(ebcsArray.length > 0){
      columnArrayUpdated.ebcs = dealerArray
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
  // log.debug("handleChainInfoUpdated id:{}", [chainInfoId.toString()])
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
          _chainInfo.spvs = _chainInfo.spvs.concat([AddressFmtPadZero(spvs[i].toHexString())]);
          
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
  const token = tokenInfo.token.toHexString()
  const decimals = tokenInfo.decimals
  const mainnetToken = tokenInfo.mainnetToken
  const ERC20Token = mainnetToken.toHexString() != "0x0000000000000000000000000000000000000000" ? mainnetToken.toHexString() : token
  let Token = getTokenEntity(chainId, token, event)
  Token.mainnetToken = mainnetToken.toHexString()
  Token.name = fetchTokenName(Address.fromString(ERC20Token))
  Token.symbol = fetchTokenSymbol(Address.fromString(ERC20Token))
  const fetchTokenDecimal = fetchTokenDecimals(Address.fromString(ERC20Token)).toI32()
  Token.decimals = fetchTokenDecimal != 0 ? fetchTokenDecimal : decimals
  Token.save()  
}

export function handleResponseMakersUpdatedEvent(
  event: ethereum.Event,
  impl: Bytes,
  responseMakers: Array<BigInt>
): void {
  const mdcAddress = isProduction ? event.address : Address.fromString(mockMdcAddr);
  let mdc = getMDCEntity(mdcAddress, Address.fromString(ONE_ADDRESS), event)
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
  _spv.spv = spv.toHexString()
  _spv.save()
  mdc.save()
  log.info('mdc {} update:  _spv[{}] = {}', [mdc.id, chainId.toString(), spv.toHexString()])
}