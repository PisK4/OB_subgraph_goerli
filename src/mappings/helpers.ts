import { 
    BigInt, 
    BigDecimal, 
    Bytes, 
    log, 
    EthereumUtils, 
    ethereum, 
    Address, 
    ByteArray, 
    crypto, 
    Value,
    ValueKind
} from '@graphprotocol/graph-ts'
import { 
    ChainInfoUpdated,
    ChainTokenUpdated,
    ColumnArrayUpdated,
    Dealer,
    DealerMapping,
    EbcsUpdated, 
    MDC, 
    MDCBindChainId, 
    dealerSnapshot, 
    MDCBindSPV,
    MDCMapping,
    ORManger,
    ResponseMakersSnapshot,
    chainIdMapping,
    ebcMapping,
    latestRule,
    rule,
    ruleTypes,
    ebcSnapshot,
    chainIdSnapshot,
    responseMaker,
    FactoryManger,
    ebcMappingSnapshot,
    DealerMappingSnapshot,
    chainIdMappingSnapshot
} from '../types/schema'
import { 
    MDC as mdcContract
} from "../types/templates/MDC/MDC"
import { createBindID, createEventID, createHashID, decodeInputData, decodeInputDataNoPrefix, entityConcatID, getFunctionSelector, inputdataPrefix, removeFunctionSelector } from './utils'

export const isProduction = true
export const debugLog = false
export const debugLogCreateRules = false
const debugLogMapping = true

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)
export const STRING_INVALID = 'invalid'
export const ONE_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
export const ONE_NUM = 0xffffffff
export const ONE_BYTES = new Bytes(32);
// function selectors
export const func_updateRulesRoot =  "0x0a8f5190"
export const func_updateRulesRootERC20 = "0x9a6781dc"
export const func_registerChains ="0xba6051a5"
export const func_updateChainSpvs = "0xf0373f91"
// export const func_updateColumnArray = "0x8f5520d9"

// function selectors for decode
export const RSCDataFmt ="(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint128,uint128,uint16,uint16,uint32,uint32,uint32,uint32)[]"
export const selectorSetting = `uint64,address,${RSCDataFmt},(bytes32,uint32),uint64[],uint256[]`
export const func_updateRulesRootSelector = `(${selectorSetting})`
export const func_updateRulesRootERC20Selector = `(${selectorSetting},address)`
export const func_updateChainSpvsSelector = "(uint64,address[],uint[])"
export const func_updateColumnArraySelector = "(uint64,address[],address[],uint64[])"


export enum updateRulesRootMode {
    ETH = 0,
    ERC20 = 1,
    INV = 2,
}

// export let RuleTypeCurrent  = updateRulesRootMode.INV

export enum ChainInfoUpdatedMode {
    registerChains = 0,
    updateChainSpvs = 1,
    INV = 2,
}
// define the ManagersIDs
export const EBCManagerID = "EBCManagerID_101" as string
export const ORMangerID = "ORMangerID_101" as string

export function getONEBytes(): Bytes {
    if(ONE_BYTES.length == 0) {
        for (let i = 0; i < 32; i++) {
            ONE_BYTES[i] = 0xff;
        }
    }
    return ONE_BYTES as Bytes;
}

export function getMDCFactory(mdcAddress : Address) : Address{
    const _mdcContract = mdcContract.bind(mdcAddress)
    let try_mdcFactory = _mdcContract.try_mdcFactory()
    let factoryAddress = Address.fromString(ONE_ADDRESS)
    if(!try_mdcFactory.reverted){
        let _factoryAddress = try_mdcFactory.value
        factoryAddress = _factoryAddress as Address
    }else{
        log.error('mdcFactory is null, mdcAddress: {}', [mdcAddress.toHexString()])
    }    
    return factoryAddress
}

export function getEBCId(BindEbcId: string): string{
    // get ebc id from "mcdAddress - ebcAddress "
    let ebcId = BindEbcId.split("-")[1]
    // log.debug('ebcId: {}', [ebcId])
    return ebcId
}

export function ebcManagerUpdate(
    ebcAddress: Address,
    status: boolean,
    event: ethereum.Event
) :void{
    let ebcId = ebcAddress.toHexString()
    let ebc = EbcsUpdated.load(ebcId)
    if (ebc == null) {
        log.info('create new EBC, ebc: {}, status: {}', [ebcId, status.toString()])
        ebc = new EbcsUpdated(ebcId)
        ebc.mdcList = []
        ebc.rulesList = []
        ebc.ruleLatest = []
        saveEBCMgr2ORMgr(ebc)
    }    
    ebc.statuses = status
    ebc.latestUpdateHash = event.transaction.hash.toHexString()
    
    ebc.save()
}

function saveEBCMgr2ORMgr(
    _EBCManager: EbcsUpdated
): void{
    let _ORManger = ORManger.load(ORMangerID)
    if(_ORManger == null){
        _ORManger = new ORManger(ORMangerID)
        _ORManger.chainInfoManager = []
        _ORManger.ebcManager = []
    }
    if(_ORManger.ebcManager == null){
        _ORManger.ebcManager = [_EBCManager.id]
    }else if(!_ORManger.ebcManager.includes(_EBCManager.id)){
        _ORManger.ebcManager = _ORManger.ebcManager.concat([_EBCManager.id])
    }
    _ORManger.save()
}

function saveChainInfoMgr2ORMgr(
    _ChainInfoMgr: ChainInfoUpdated
): void{
    let _ORManger = ORManger.load(ORMangerID)
    if(_ORManger == null){
        _ORManger = new ORManger(ORMangerID)
        _ORManger.chainInfoManager = []
        _ORManger.ebcManager = []
    }
    if(_ORManger.chainInfoManager == null){
        _ORManger.chainInfoManager = [_ChainInfoMgr.id]
    }else if(!_ORManger.chainInfoManager.includes(_ChainInfoMgr.id)){
        _ORManger.chainInfoManager = _ORManger.chainInfoManager.concat([_ChainInfoMgr.id])
    }
    _ORManger.save()
}


export function ebcSave(
    ebc: EbcsUpdated,
    mdc: MDC,
): void {
    saveMDC2EBC(ebc, mdc)
}

export function initRulesEntity(
    _rules: ruleTypes
): void {
    _rules.root = STRING_INVALID
    _rules.version = 0
    _rules.pledgeAmounts = []
    _rules.sourceChainIds = []
    _rules.token = STRING_INVALID
}

export function initRuleEntity(
    _rules: rule
): void {
    _rules.chain0 = ZERO_BI
    _rules.chain1 = ZERO_BI
    _rules.chain0Status = ZERO_BI.toI32()
    _rules.chain1Status = ZERO_BI.toI32()
    _rules.chain0Token = STRING_INVALID
    _rules.chain1Token = STRING_INVALID
    _rules.chain0minPrice = ZERO_BI
    _rules.chain0maxPrice = ZERO_BI
    _rules.chain1minPrice = ZERO_BI
    _rules.chain1maxPrice = ZERO_BI
    _rules.chain0WithholdingFee = ZERO_BI
    _rules.chain1WithholdingFee = ZERO_BI
    _rules.chain0TradeFee = ZERO_BI.toI32()
    _rules.chain1TradeFee = ZERO_BI.toI32()
    _rules.chain0ResponseTime = ZERO_BI.toI32()
    _rules.chain1ResponseTime = ZERO_BI.toI32()
    _rules.chain0CompensationRatio = ZERO_BI.toI32()
    _rules.chain1CompensationRatio = ZERO_BI.toI32()
    _rules.ruleValidation = false
}

export function getRuleEntity(
    ruleTypes: ruleTypes,
    i: i32,
    mdc: MDC,
    ebc: EbcsUpdated,
    event: ethereum.Event
):rule {
    const id =  createBindID([ruleTypes.id, i.toString()])
    let _rule = rule.load(id)
    if(_rule == null){
        _rule = new rule(id)
        initRuleEntity(_rule)
        _rule.owner = mdc.owner
        _rule.ebcAddr = ebc.id
        // saveRules2Rules(ruleTypes, _rule)
        // entityConcatID(ruleTypes.rules, _rule.id)
        ruleTypes.rules = entityConcatID(ruleTypes.rules, _rule.id)
        if(debugLogCreateRules){
            log.info('create new rule, rule: {}', [_rule.id])
        }
    }
    _rule.latestUpdatetransactionHash = event.transaction.hash.toHexString()
    _rule.latestUpdateBlockNumber = event.block.number
    _rule.latestUpdateTimestamp = event.block.timestamp
    
    return _rule as rule
}

export function getFactoryEntity(
    id: string,
    event: ethereum.Event
): FactoryManger {
    let factory = FactoryManger.load(id)
    if (factory == null) {
        log.info('create new FactoryManger, id: {}', [id])
        factory = new FactoryManger(id)
        factory.mdcCounts = BigInt.fromI32(0);
        factory.mdcs = []
        factory.owners = []
        factory.responseMakers = []
    }
    factory.latestUpdateHash  = event.transaction.hash.toHexString()
    factory.latestUpdateBlockNumber = event.block.number
    factory.latestUpdateTimestamp = event.block.timestamp
    return factory as FactoryManger
}
    

export function getEBCEntityNew(
    ebcAddress: string,
    event: ethereum.Event
): EbcsUpdated {
    let ebc = EbcsUpdated.load(ebcAddress)
    if (ebc == null) {
        log.info('create new EBC, ebc: {}', [ebcAddress])
        ebc = new EbcsUpdated(ebcAddress)
        ebc.mdcList = []
        ebc.rulesList = []
        ebc.ruleLatest = []
        ebc.statuses = true
    }
    ebc.latestUpdateHash = event.transaction.hash.toHexString()
    return ebc as EbcsUpdated
}


export function getMDCEntity(
    mdcAddress: Address,
    maker: Address,
    event: ethereum.Event
): MDC {
    let mdc = MDC.load(mdcAddress.toHexString())
    if (mdc == null) {
        log.info('create new MDC, maker: {}, mdc: {}, factory: {}', [maker.toHexString(), mdcAddress.toHexString(), event.address.toHexString()])
        mdc = new MDC(mdcAddress.toHexString())
        mdc.owner = maker.toHexString()
        mdc.columnArrayUpdated = []
        mdc.responseMakerSnapshot = []
        mdc.bindSPVs = []
        mdc.dealerSnapshot = []
        mdc.ebcSnapshot = []
        mdc.chainIdSnapshot = []
        mdc.ruleSnapshot = []
        mdc.ruleLatest = []
        mdc.factoryAddr = event.address.toHexString()
        mdc.createblockNumber = event.block.number
        mdc.createblockTimestamp = event.block.timestamp
        mdc.createtransactionHash = event.transaction.hash.toHexString()        
    }
    mdc.latestUpdatetransactionHash = event.transaction.hash.toHexString()
    return mdc as MDC
}

export function getChainInfoEntity(
    event: ethereum.Event,
    _id: BigInt
): ChainInfoUpdated {
    let id = _id.toString()
    let _chainInfo = ChainInfoUpdated.load(id)
    if (_chainInfo == null) {
        log.info('create new ChainInfo, id: {}', [id])
        _chainInfo = new ChainInfoUpdated(id)
        _chainInfo.tokens = []
        _chainInfo.spvs = []
        saveChainInfoMgr2ORMgr(_chainInfo)
    }
    _chainInfo.latestUpdateHash = event.transaction.hash.toHexString()
    _chainInfo.latestUpdateBlockNumber = event.block.number
    _chainInfo.latestUpdateTimestamp = event.block.timestamp
    return _chainInfo as ChainInfoUpdated
}


export function getMDCMappingEntity(
    mdc: MDC,
    event: ethereum.Event
): MDCMapping {
    let _MDCMapping = MDCMapping.load(mdc.id)
    if(_MDCMapping == null){
        _MDCMapping = new MDCMapping(mdc.id)
        _MDCMapping.dealerMapping = []
        _MDCMapping.ebcMapping = []
        _MDCMapping.chainIdMapping = []
    }
    _MDCMapping.latestUpdateBlockNumber = event.block.number
    _MDCMapping.latestUpdateTimestamp = event.block.timestamp
    _MDCMapping.latestUpdateHash = event.transaction.hash.toHexString()
    return _MDCMapping as MDCMapping
}

function getTokenFromChainInfoUpdated(
    chainid: BigInt,
): Array<string> {
    let _chainInfo = ChainInfoUpdated.load(chainid.toString())
    let tokens = [] as Array<string>
    if(_chainInfo != null){
        for(let i = 0; i < _chainInfo.tokens.length; i++){
            const ChainTokenUpdatedID = _chainInfo.tokens[i].toString()
            let _ChainTokenUpdated = ChainTokenUpdated.load(ChainTokenUpdatedID)
            if(_ChainTokenUpdated != null){
                tokens = tokens.concat([_ChainTokenUpdated.token])
                // log.debug("token: {}", [_ChainTokenUpdated.token.toString()])
            }
        }
    }
    return tokens
}

export function getChainTokenUpdatedEntity(
    id: BigInt,
    token: BigInt,
    event: ethereum.Event
): ChainTokenUpdated {
    // let tokenId = id.toString() + "-" + token.toString()
    const tokenId = createBindID([id.toString(), token.toHexString()])
    let chainInfo = getChainInfoEntity(event, id)
    let tokenInfo = ChainTokenUpdated.load(tokenId)
    if (tokenInfo == null) {
        log.info('create new ChainTokenUpdated, id: {}', [tokenId])
        tokenInfo = new ChainTokenUpdated(tokenId)
        tokenInfo.token = token.toHexString()
        saveTokenInfo2ChainInfo(chainInfo, tokenId)
        chainInfo.save()
    }
    tokenInfo.latestUpdateBlockNumber = event.block.number
    tokenInfo.latestUpdateTimestamp = event.block.timestamp
    tokenInfo.latestUpdateHash = event.transaction.hash.toHexString()
    return tokenInfo as ChainTokenUpdated
}

export function getColumnArrayUpdatedEntity(
    event: ethereum.Event,
    mdc: MDC
): ColumnArrayUpdated {
    let _columnArrayUpdated = ColumnArrayUpdated.load(createEventID(event))
    if (_columnArrayUpdated == null) {
        log.info('create new ColumnArrayUpdated, id: {}', [createEventID(event)])
        _columnArrayUpdated = new ColumnArrayUpdated(createEventID(event))
        _columnArrayUpdated.dealers = []
        _columnArrayUpdated.ebcs = []
        _columnArrayUpdated.chainIds = []
        _columnArrayUpdated.blockNumber = event.block.number
        _columnArrayUpdated.blockTimestamp = event.block.timestamp
        _columnArrayUpdated.transactionHash = event.transaction.hash.toHexString()
        saveColumnArray2MDC(mdc, _columnArrayUpdated)
    }

    return _columnArrayUpdated as ColumnArrayUpdated
}

export function getMDCBindSPVEntity(
    mdc: MDC,
    chainId: BigInt,
): MDCBindSPV{
    const id = mdc.id + "-" + chainId.toString()
    let _MDCBindSPV = MDCBindSPV.load(id)
    if(_MDCBindSPV == null){
        _MDCBindSPV = new MDCBindSPV(id)
        _MDCBindSPV.chainId = chainId
        saveSPV2MDC(mdc, _MDCBindSPV)
    }

    return _MDCBindSPV as MDCBindSPV
}

export function getdealerSnapshotEntity(
    mdc: MDC,
    event: ethereum.Event
): dealerSnapshot{
    const id = createEventID(event)
    let dealer = dealerSnapshot.load(id)
    if(dealer == null){
        log.info('create new dealerSnapshot, id: {}', [id])
        dealer = new dealerSnapshot(id)
        dealer.dealerList = []
        dealer.dealerMappingSnapshot = []
        mdc.dealerSnapshot = mdc.dealerSnapshot.concat([dealer.id])
    }
    dealer.latestUpdateBlockNumber = event.block.number
    dealer.latestUpdateTimestamp = event.block.timestamp
    dealer.latestUpdateHash = event.transaction.hash.toHexString()
    return dealer as dealerSnapshot
}

export function getEBCSnapshotEntity(
    mdc: MDC,
    event: ethereum.Event
): ebcSnapshot{
    const id = createEventID(event)
    let ebc = ebcSnapshot.load(id)
    if(ebc == null){
        log.info('create new ebcSnapshot, id: {}', [id])
        ebc = new ebcSnapshot(id)
        ebc.ebcList = []
        ebc.ebcMappingSnapshot = []
        mdc.ebcSnapshot = mdc.ebcSnapshot.concat([ebc.id])
    }
    ebc.latestUpdateBlockNumber = event.block.number
    ebc.latestUpdateTimestamp = event.block.timestamp
    ebc.latestUpdateHash = event.transaction.hash.toHexString()    
    return ebc as ebcSnapshot
}

export function getChainIdSnapshotEntity(
    mdc: MDC,
    event: ethereum.Event
): chainIdSnapshot{
    const id = createEventID(event)
    let chainId = chainIdSnapshot.load(id)
    if(chainId == null){
        log.info('create new chainIdSnapshot, id: {}', [id])
        chainId = new chainIdSnapshot(id)
        chainId.chainIdList = []
        chainId.chainIdMappingSnapshot = []
        mdc.chainIdSnapshot = mdc.chainIdSnapshot.concat([chainId.id])
    }
    chainId.latestUpdateBlockNumber = event.block.number
    chainId.latestUpdateTimestamp = event.block.timestamp
    chainId.latestUpdateHash = event.transaction.hash.toHexString()
    return chainId as chainIdSnapshot
}


export function getMDCBindChainIdEntity(
    mdc: MDC,
    chainIds: BigInt[],
): MDCBindChainId{
    let chainIdEntity = MDCBindChainId.load(mdc.id)
    if(chainIdEntity == null){
        chainIdEntity = new MDCBindChainId(mdc.id)
        chainIdEntity.chainIdList = []
        chainIdEntity.chainIdMapping = []
        mdc.bindChainIds = chainIdEntity.id
    }
    chainIdEntity.chainIdList = chainIds

    return chainIdEntity as MDCBindChainId
}

function getMDCLatestDealers(
    mdc: MDC
): string[]{
    let dealer = new Array<string>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if(mdcMapping != null){
        log.info("MDC: {} mapping dealerCnt: {}", [mdc.id, mdcMapping.dealerMapping.length.toString()])
        for(let i = 0; i < mdcMapping.dealerMapping.length; i++){
            let _dealerMapping = DealerMapping.load(mdcMapping.dealerMapping[i])
            if (_dealerMapping != null) {
                if (_dealerMapping.dealerAddr.length > 0){
                    dealer = dealer.concat([_dealerMapping.dealerAddr])
                }
            }
        }
    }
    return dealer
}

function getMDCLatestEBCs(
    mdc: MDC
): string[]{
    let ebc = new Array<string>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if(mdcMapping != null){
        log.info("MDC: {} mapping ebcCnt: {}", [mdc.id, mdcMapping.ebcMapping.length.toString()])
        for(let i = 0; i < mdcMapping.ebcMapping.length; i++){
            let _ebcMapping = ebcMapping.load(mdcMapping.ebcMapping[i])
            if (_ebcMapping != null) {
                if (_ebcMapping.ebcAddr.length > 0){
                    ebc = ebc.concat([_ebcMapping.ebcAddr])
                }
            }
        }
    }
    return ebc
}

function getMDCLatestChainIds(
    mdc: MDC
): BigInt[]{
    let chainIds = new Array<BigInt>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if(mdcMapping != null){
        log.info("MDC: {} mapping chainIdCnt: {}", [mdc.id, mdcMapping.chainIdMapping.length.toString()])
        for(let i = 0; i < mdcMapping.chainIdMapping.length; i++){
            let _chainIdMapping = chainIdMapping.load(mdcMapping.chainIdMapping[i])
            if (_chainIdMapping != null) {
                if (_chainIdMapping.chainId.length > 0){
                    chainIds = chainIds.concat([_chainIdMapping.chainId])
                }
            }
        }
    }
    return chainIds
}

function removeMDCFromDealer(
    mdc: MDC,
    // dealer: Bytes[],
    event: ethereum.Event
): void{
    const dealer = getMDCLatestDealers(mdc)

    if (dealer.length == 0){
        return
    }

    for(let i = 0; i < dealer.length; i++){
        let _dealer = Dealer.load(dealer[i])
        if(_dealer != null){
            log.info("remove mdc from dealer {}/{}, dealer: {}, mdc: {}", [(i+1).toString(), dealer.length.toString(), dealer[i], mdc.id])
            let _mdcs = _dealer.mdcs
            let index = _mdcs.indexOf(mdc.id)
            if (index > -1) {
                _mdcs.splice(index, 1);
            }
            _dealer.mdcs = _mdcs
            _dealer.save()
        }
        // const mappingId = mdc.id + "-" + dealer[i].toHexString()
        const mappingId = createBindID([mdc.id, dealer[i]])
        let _dealerMapping = DealerMapping.load(mappingId)
        if(_dealerMapping != null){
            _dealerMapping.latestUpdateBlockNumber = event.block.number
            _dealerMapping.latestUpdateTimestamp = event.block.timestamp
            _dealerMapping.latestUpdateHash = event.transaction.hash.toHexString()
            _dealerMapping.save()
        }
    }   
    mdc.save()
}

export function mdcStoreDealerNewMapping(
    mdc: MDC,
    _MDCBindDealer: dealerSnapshot,
    newDealers: string[],
    event: ethereum.Event,
    enableTimestamp: BigInt
): void{
    let mdcMapping = getMDCMappingEntity(mdc, event)
    let latesMappingTmp = [] as string[]
    let snapshotMappingTmp = [] as string[]
    removeMDCFromDealer(mdc, event)
    mdcMapping.dealerMapping = []
    _MDCBindDealer.dealerList = newDealers
    _MDCBindDealer.dealerMappingSnapshot = []
    for(let mappingIndex = 0 ; mappingIndex < newDealers.length; mappingIndex++){
        // const latestMappingId = mdc.id + "-" + newDealers[mappingIndex].toHexString()
        const latestMappingId = createBindID([mdc.id, newDealers[mappingIndex]])
        let _dealerMapping = DealerMapping.load(latestMappingId)
        if(_dealerMapping == null){
            _dealerMapping = new DealerMapping(latestMappingId)
            _dealerMapping.owner = mdc.owner
            _dealerMapping.dealerAddr = STRING_INVALID
        }
        const snapshotId = createBindID([_MDCBindDealer.id, newDealers[mappingIndex]])
        let _MDCBindDealerSnapshot = DealerMappingSnapshot.load(snapshotId)
        if(_MDCBindDealerSnapshot == null){
            _MDCBindDealerSnapshot = new DealerMappingSnapshot(snapshotId)
            _MDCBindDealerSnapshot.owner = mdc.owner
        }

        log.info('update dealerMapping, id: {}', [latestMappingId])
        log.info('update dealerMappingSnapshot, id: {}', [snapshotId])
        _MDCBindDealerSnapshot.dealerAddr = _dealerMapping.dealerAddr = newDealers[mappingIndex]
        _MDCBindDealerSnapshot.dealerIndex = _dealerMapping.dealerIndex = BigInt.fromI32(mappingIndex+1)
        _MDCBindDealerSnapshot.latestUpdateBlockNumber = _dealerMapping.latestUpdateBlockNumber = event.block.number
        _MDCBindDealerSnapshot.latestUpdateTimestamp =  _dealerMapping.latestUpdateTimestamp = event.block.timestamp
        _MDCBindDealerSnapshot.latestUpdateHash = _dealerMapping.latestUpdateHash = event.transaction.hash.toHexString()
        _MDCBindDealerSnapshot.enableTimestamp = _dealerMapping.enableTimestamp = enableTimestamp
        snapshotMappingTmp = snapshotMappingTmp.concat([snapshotId])
        latesMappingTmp = latesMappingTmp.concat([latestMappingId])
        
        _dealerMapping.save()
        _MDCBindDealerSnapshot.save()
        let _dealer = getDealerEntity(newDealers[mappingIndex], event)
        _dealer.mdcs = entityConcatID(_dealer.mdcs, mdc.id)
        _dealer.save()
    }
    mdcMapping.dealerMapping = latesMappingTmp
    _MDCBindDealer.dealerMappingSnapshot = snapshotMappingTmp
    mdcMapping.save()
}

function removeMDCFromEBC(
    mdc: MDC,
    // ebc: Bytes[],
    event: ethereum.Event
): void{
    const ebc = getMDCLatestEBCs(mdc)

    for(let i = 0; i < ebc.length; i++){
        let _ebc = EbcsUpdated.load(ebc[i])
        if(_ebc != null){
            log.info("remove mdc from ebc {}/{}, ebc: {}, mdc: {}", [(i+1).toString(), ebc.length.toString(), ebc[i], mdc.id])
            let _mdcs = _ebc.mdcList
            let index = _mdcs.indexOf(mdc.id)
            if (index > -1) {
                _mdcs.splice(index, 1);
            }
            _ebc.mdcList = _mdcs
            _ebc.save()
        }
        const mappingId = mdc.id + "-" + ebc[i]
        let _ebcMapping = ebcMapping.load(mappingId)
        if(_ebcMapping != null){
            _ebcMapping.latestUpdateBlockNumber = event.block.number
            _ebcMapping.latestUpdateTimestamp = event.block.timestamp
            _ebcMapping.latestUpdateHash = event.transaction.hash.toHexString()
            _ebcMapping.save()
        }
    }
}

function getEBCMappingEntity(
    id: string,
    mdc: MDC,
    event: ethereum.Event
): ebcMapping{
    let _ebcMapping = ebcMapping.load(id)
    if(_ebcMapping == null){
        _ebcMapping = new ebcMapping(id)
        _ebcMapping.ebcAddr = STRING_INVALID
        _ebcMapping.owner = mdc.owner
    }
    _ebcMapping.latestUpdateBlockNumber = event.block.number
    _ebcMapping.latestUpdateTimestamp = event.block.timestamp
    _ebcMapping.latestUpdateHash = event.transaction.hash.toHexString()    
    return _ebcMapping as ebcMapping
}

function getebcMappingSnapshotEntity(
    id: string,
    mdc: MDC,
    event: ethereum.Event,
): ebcMappingSnapshot {
    let _ebcMapping = ebcMappingSnapshot.load(id)
    if(_ebcMapping == null){
        _ebcMapping = new ebcMappingSnapshot(id)
        _ebcMapping.ebcAddr = STRING_INVALID
        _ebcMapping.owner = mdc.owner
    }
    return _ebcMapping as ebcMappingSnapshot
}

export function mdcStoreEBCNewMapping(
    mdc: MDC,
    ebcSnapshot: ebcSnapshot,
    newEBCs: string[],
    event: ethereum.Event,
    enableTimestamp: BigInt
): void {
    let mdcMapping = getMDCMappingEntity(mdc, event)
    let latesMappingTmp = [] as string[]
    let snapshotMappingTmp = [] as string[]
    removeMDCFromEBC(mdc, event)
    mdcMapping.ebcMapping = []
    ebcSnapshot.ebcList = newEBCs
    ebcSnapshot.ebcMappingSnapshot = []
    for(let mappingIndex = 0 ; mappingIndex < newEBCs.length; mappingIndex++){
        const latestMappingId = createBindID([mdc.id, newEBCs[mappingIndex]])
        let _ebcMapping = getEBCMappingEntity(latestMappingId, mdc, event)

        const snapshotId = createHashID([ebcSnapshot.id, newEBCs[mappingIndex]])
        let _ebcSnapshot = getebcMappingSnapshotEntity(snapshotId, mdc, event)

        log.info('update ebcMapping, id: {}', [latestMappingId])
        _ebcSnapshot.ebcAddr = _ebcMapping.ebcAddr = newEBCs[mappingIndex]
        _ebcSnapshot.ebcIndex = _ebcMapping.ebcIndex = BigInt.fromI32(mappingIndex+1)
        _ebcSnapshot.enableTimestamp = _ebcMapping.enableTimestamp = enableTimestamp
        snapshotMappingTmp = snapshotMappingTmp.concat([snapshotId])
        latesMappingTmp = latesMappingTmp.concat([latestMappingId])
        
        _ebcMapping.save()
        _ebcSnapshot.save()
        let _ebc = getEBCEntityNew(newEBCs[mappingIndex], event)
        _ebc.mdcList = entityConcatID(_ebc.mdcList, mdc.id)
        _ebc.save()
        mdc.save()
    }
    mdcMapping.ebcMapping = latesMappingTmp
    ebcSnapshot.ebcMappingSnapshot = snapshotMappingTmp
    mdcMapping.save()
}

function getchainIdMappingEntity(
    id: string,
    mdc: MDC,
    event: ethereum.Event
): chainIdMapping{
    let _chainIdMapping = chainIdMapping.load(id)
    if(_chainIdMapping == null){
        _chainIdMapping = new chainIdMapping(id)
        _chainIdMapping.chainId = new BigInt(0)
        _chainIdMapping.owner = mdc.owner
    }
    _chainIdMapping.latestUpdateBlockNumber = event.block.number
    _chainIdMapping.latestUpdateTimestamp = event.block.timestamp
    _chainIdMapping.latestUpdateHash = event.transaction.hash.toHexString()    
    return _chainIdMapping as chainIdMapping
}

function getchainIdMappingSnapshotEntity(
    id: string,
    mdc: MDC,
    event: ethereum.Event
): chainIdMappingSnapshot{
    let _chainIdMapping = chainIdMappingSnapshot.load(id)
    if(_chainIdMapping == null){
        _chainIdMapping = new chainIdMappingSnapshot(id)
        _chainIdMapping.chainId = new BigInt(0)
        _chainIdMapping.owner = mdc.owner
    }
    _chainIdMapping.latestUpdateBlockNumber = event.block.number
    _chainIdMapping.latestUpdateTimestamp = event.block.timestamp
    _chainIdMapping.latestUpdateHash = event.transaction.hash.toHexString()    
    return _chainIdMapping as chainIdMappingSnapshot
}

export function mdcStoreChainIdNewMapping(
    mdc: MDC,
    chainIdSnapshot: chainIdSnapshot,
    newChainIds: BigInt[],
    event: ethereum.Event,
    enableTimestamp: BigInt
): void {
    let mdcMapping = getMDCMappingEntity(mdc, event);
    let latestMappingIds: string[] = [];
    let snapshotMappingIds: string[] = [];
    mdcMapping.chainIdMapping = [];
    chainIdSnapshot.chainIdList = newChainIds;
    chainIdSnapshot.chainIdMappingSnapshot = [];

    for (let i = 0; i < newChainIds.length; i++) {
        const chainId = newChainIds[i];
        const latestMappingId = createBindID([mdc.id, chainId.toString()])
        const snapshotMappingId = createBindID([chainIdSnapshot.id, chainId.toString()])
        let latestMapping = getchainIdMappingEntity(latestMappingId, mdc, event)
        let snapshotMapping = getchainIdMappingSnapshotEntity(snapshotMappingId, mdc, event)

        latestMapping.chainId = snapshotMapping.chainId = chainId;
        latestMapping.chainIdIndex = snapshotMapping.chainIdIndex = BigInt.fromI32(i + 1);
        latestMapping.latestUpdateBlockNumber = snapshotMapping.latestUpdateBlockNumber = event.block.number;
        latestMapping.latestUpdateTimestamp = snapshotMapping.latestUpdateTimestamp = event.block.timestamp;
        latestMapping.latestUpdateHash = snapshotMapping.latestUpdateHash = event.transaction.hash.toHexString();
        latestMapping.enableTimestamp = snapshotMapping.enableTimestamp = enableTimestamp;
        latestMapping.save();
        snapshotMapping.save();

        latestMappingIds.push(latestMappingId);
        snapshotMappingIds.push(snapshotMappingId);
    }

    mdcMapping.chainIdMapping = latestMappingIds;
    chainIdSnapshot.chainIdMappingSnapshot = snapshotMappingIds;

    mdcMapping.save();
}


export function getDealerEntity(
    dealer: string,
    event: ethereum.Event
): Dealer{
    let id = dealer
    let _dealer = Dealer.load(id)
    if (_dealer == null) {
        _dealer = new Dealer(id)
        _dealer.mdcs = []
        _dealer.rules = []
        _dealer.register = false
        _dealer.latestUpdateHash = event.transaction.hash.toHexString()
        _dealer.latestUpdateBlockNumber = event.block.number
        _dealer.latestUpdateTimestamp = event.block.timestamp
        log.info('create new Dealer, id: {}', [id])
    }
    return _dealer as Dealer
}

function getResponseMakerEntity(
    responseMakerID: string,
    mdc: MDC,
    event: ethereum.Event
): responseMaker{
    let id = responseMakerID
    let _responseMaker = responseMaker.load(id)
    if (_responseMaker == null) {
        _responseMaker = new responseMaker(id)
        _responseMaker.mdcs = []
        _responseMaker.mdcs = entityConcatID(_responseMaker.mdcs, mdc.id)
        log.info('create new responseMaker, id: {}', [id])
        let factory = getFactoryEntity(mdc.factoryAddr, event)
        factory.responseMakers = entityConcatID(factory.responseMakers, id)
        factory.save()
    }
    _responseMaker.latestUpdateBlockNumber = event.block.number
    _responseMaker.latestUpdateTimestamp = event.block.timestamp
    _responseMaker.latestUpdateHash = event.transaction.hash.toHexString()
    return _responseMaker as responseMaker
}

export function mdcStoreResponseMaker(
    mdc: MDC,
    responseMakersArray: string[],
    event: ethereum.Event
): void{
    const id = createEventID(event)
    let responseMakers = ResponseMakersSnapshot.load(id)
    if(responseMakers == null){
        responseMakers = new ResponseMakersSnapshot(id)
        responseMakers.responseMakerList = []
        mdc.responseMakerSnapshot = mdc.responseMakerSnapshot.concat([responseMakers.id])
    }
    responseMakers.responseMakerList = responseMakersArray
    responseMakers.latestUpdateBlockNumber = event.block.number
    responseMakers.latestUpdateTimestamp = event.block.timestamp
    responseMakers.latestUpdateHash = event.transaction.hash
    responseMakers.save()

    for(let i = 0; i < responseMakersArray.length; i++){
        let _responseMaker = getResponseMakerEntity(responseMakersArray[i], mdc, event)
        _responseMaker.save()
    }

}    

function saveColumnArray2MDC(
    mdc: MDC,
    columnArray: ColumnArrayUpdated
): void {
    if (mdc.columnArrayUpdated == null) {
        mdc.columnArrayUpdated = [columnArray.id];
    } else if (!mdc.columnArrayUpdated.includes(columnArray.id)) {
        mdc.columnArrayUpdated = mdc.columnArrayUpdated.concat([columnArray.id])
    }
}

function saveTokenInfo2ChainInfo(
    chainInfo: ChainInfoUpdated,
    tokenId: string
): void {
    if (chainInfo.tokens == null) {
        chainInfo.tokens = [tokenId];
    } else if (!chainInfo.tokens.includes(tokenId)) {
        chainInfo.tokens = chainInfo.tokens.concat([tokenId])
    }
}

function saveRules2Rules(
    _rules: ruleTypes,
    rule: rule
): void{
    if (_rules.rules == null) {
        _rules.rules = [rule.id];
    } else if (!_rules.rules.includes(rule.id)) {
        _rules.rules = _rules.rules.concat([rule.id])
    }
}

function saveMDC2Dealer(
    dealer: Dealer,
    mdcId: string,
): void {
    if (dealer.mdcs == null) {
        dealer.mdcs = [mdcId];
    }else if (!dealer.mdcs.includes(mdcId)) {
        dealer.mdcs = dealer.mdcs.concat([mdcId])
    }
}

// export function saveBindEBC2All(
//     ebcAll: MDCBindEBCAll,
//     ebc_id : string,
// ) : void{
//     if (ebcAll.ebcs == null) {
//         ebcAll.ebcs = [ebc_id];
//     } else if (!ebcAll.ebcs.includes(ebc_id)) {
//         ebcAll.ebcs = ebcAll.ebcs.concat([ebc_id])
//     }
// }

function saveMDC2EBC(
    ebc: EbcsUpdated, 
    mdc: MDC
): void {
    if (ebc.mdcList == null) {
        ebc.mdcList = [mdc.id];
    } else if (!ebc.mdcList.includes(mdc.id)) {
        ebc.mdcList = ebc.mdcList.concat([mdc.id])
    }
}

// function saveRule2EBC(
//     ebc: MDCBindEBC,
//     rule: ruleTypes
// ): void{
//     if (ebc.rulesWithRootVersion == null) {
//         ebc.rulesWithRootVersion = [rule.id];
//     } else if (!ebc.rulesWithRootVersion.includes(rule.id)) {
//         ebc.rulesWithRootVersion = ebc.rulesWithRootVersion.concat([rule.id])
//     }
// }

function saveLatestRule2RuleSnapshot(
    ruleSnapshot: ruleTypes,
    releLatestId: string
): void{
    if (ruleSnapshot.ruleLatest == null) {
        ruleSnapshot.ruleLatest = [releLatestId];
    } else if (!ruleSnapshot.ruleLatest.includes(releLatestId)) {
        ruleSnapshot.ruleLatest = ruleSnapshot.ruleLatest.concat([releLatestId])
    }
}

function saveLatestRule2MDCEBC(
    mdc: MDC,
    ebc: EbcsUpdated,
    ruleLatestId: string
): void{
    if (mdc.ruleLatest == null) {
        mdc.ruleLatest = [ruleLatestId];
    } else if (!mdc.ruleLatest.includes(ruleLatestId)) {
        mdc.ruleLatest = mdc.ruleLatest.concat([ruleLatestId])
    }

    if (ebc.ruleLatest == null) {
        ebc.ruleLatest = [ruleLatestId];
    } else if (!ebc.ruleLatest.includes(ruleLatestId)) {
        ebc.ruleLatest = ebc.ruleLatest.concat([ruleLatestId])
    }
}

function saveSPV2MDC(
    mdc: MDC,
    spv: MDCBindSPV
): void{
    if (mdc.bindSPVs == null) {
        mdc.bindSPVs = [spv.id];
    } else if (!mdc.bindSPVs.includes(spv.id)) {
        mdc.bindSPVs = mdc.bindSPVs.concat([spv.id])
    }
}

export class rscRules {
    enableTimestamp: BigInt;
    ebcAddress: string;
    rsc: Array<ethereum.Value>;
    rscType : rscRuleType[];
    root: string;
    version: i32;
    sourceChainIds: Array<BigInt>;
    pledgeAmounts: Array<BigInt>;
    tokenAddr: string;
    selector: updateRulesRootMode;
    constructor(
        enableTimestamp: BigInt,
        mdcAddress: string,
        ebcAddress: string,
        rsc: Array<ethereum.Value>,
        root: string,
        version: i32,
        sourceChainIds: Array<BigInt>,
        pledgeAmounts: Array<BigInt>,
        tokenAddress: string,
        selector: updateRulesRootMode 
    ) {
        this.enableTimestamp = enableTimestamp;
        this.ebcAddress = ebcAddress;
        this.rsc = rsc;
        this.rscType = parseRSC(rsc, mdcAddress, ebcAddress, version, selector);
        this.root = root;
        this.version = version;
        this.sourceChainIds = sourceChainIds;
        this.pledgeAmounts = pledgeAmounts;
        this.tokenAddr = tokenAddress
        this.selector = selector
    }
}

export class rscRuleType {
    chain0: BigInt;
    chain1: BigInt;
    chain0Status: BigInt;
    chain1Status: BigInt;
    chain0Token: BigInt;
    chain1Token: BigInt;
    chain0minPrice: BigInt;
    chain0maxPrice: BigInt;
    chain1minPrice: BigInt;
    chain1maxPrice: BigInt;
    chain0WithholdingFee: BigInt;
    chain1WithholdingFee: BigInt;
    chain0TradeFee: BigInt;
    chain1TradeFee: BigInt;
    chain0ResponseTime: BigInt;
    chain1ResponseTime: BigInt;
    chain0CompensationRatio: BigInt;
    chain1CompensationRatio: BigInt;
    verifyPass: boolean;
    enableTimestamp: BigInt;
    selector: updateRulesRootMode;
    constructor(
        chain0: BigInt,
        chain1: BigInt,
        chain0Status: BigInt,
        chain1Status: BigInt,
        chain0Token: BigInt,
        chain1Token: BigInt,
        chain0minPrice: BigInt,
        chain0maxPrice: BigInt,
        chain1minPrice: BigInt,
        chain1maxPrice: BigInt,
        chain0WithholdingFee: BigInt,
        chain1WithholdingFee: BigInt,
        chain0TradeFee: BigInt,
        chain1TradeFee: BigInt,
        chain0ResponseTime: BigInt,
        chain1ResponseTime: BigInt,
        chain0CompensationRatio: BigInt,
        chain1CompensationRatio: BigInt,
        enableTimestamp: BigInt,
        selector: updateRulesRootMode
    ) {
        this.chain0 = chain0;
        this.chain1 = chain1;
        this.chain0Status = chain0Status;
        this.chain1Status = chain1Status;
        this.chain0Token = chain0Token;
        this.chain1Token = chain1Token;
        this.chain0minPrice = chain0minPrice;
        this.chain0maxPrice = chain0maxPrice;
        this.chain1minPrice = chain1minPrice;
        this.chain1maxPrice = chain1maxPrice;
        this.chain0WithholdingFee = chain0WithholdingFee;
        this.chain1WithholdingFee = chain1WithholdingFee;
        this.chain0TradeFee = chain0TradeFee;
        this.chain1TradeFee = chain1TradeFee;
        this.chain0ResponseTime = chain0ResponseTime;
        this.chain1ResponseTime = chain1ResponseTime;
        this.chain0CompensationRatio = chain0CompensationRatio;
        this.chain1CompensationRatio = chain1CompensationRatio;
        this.enableTimestamp = enableTimestamp;
        this.verifyPass = false;
        this.selector = selector
    }
}

export function calculateRscRootAndCompare(rules: rscRuleType, inputRoot: Bytes): boolean {
    // TODO : finish root calculation
    let pass = true
    return (pass&&rules.verifyPass)
}


export function checkifRSCRuleTypeExist(rule: BigInt): boolean {
    if (rule.equals(ZERO_BI)) {
        return false
    }
    return true

}

export function checkRulesFormat(rscTuple: ethereum.Tuple): boolean {
    if((rscTuple[2].toBigInt() == BigInt.fromI32(0) || rscTuple[2].toBigInt() == BigInt.fromI32(1)) &&
    (rscTuple[3].toBigInt() == BigInt.fromI32(0) || rscTuple[3].toBigInt() == BigInt.fromI32(1))){
      return true
    }else{
      log.info("rules format not match [1]:{} [2]:{}", [rscTuple[2].toBigInt().toString(), rscTuple[3].toBigInt().toString()])
      return false
    }
}

function setInitRuleType(): rscRuleType {
    let _rscRuleType = new rscRuleType(
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,updateRulesRootMode.INV
      );
    return _rscRuleType
}

function getLastRules(
    mdcAddress: string,
    ebcAddress: Bytes,
    version: i32,
    loop: i32
): rscRuleType {
    let _version = version > 0 ? version - 1 : 0
    if(_version){
        let id = mdcAddress + "-" + ebcAddress.toHexString() + "-" + _version.toString() + "-" + loop.toString()
        let lastVersionRule = rule.load(id)
        if(lastVersionRule == null){
            return setInitRuleType()
        }else{
            log.info("update rule from last version id: {}", [id])
            return (
                new rscRuleType(
                    lastVersionRule.chain0,
                    lastVersionRule.chain1,
                    BigInt.fromI32(lastVersionRule.chain0Status),
                    BigInt.fromI32(lastVersionRule.chain1Status),
                    BigInt.fromString(lastVersionRule.chain0Token),
                    BigInt.fromString(lastVersionRule.chain1Token),
                    lastVersionRule.chain0minPrice,
                    lastVersionRule.chain0maxPrice,
                    lastVersionRule.chain1minPrice,
                    lastVersionRule.chain1maxPrice,
                    lastVersionRule.chain0WithholdingFee,
                    lastVersionRule.chain1WithholdingFee,
                    BigInt.fromI32(lastVersionRule.chain0TradeFee),
                    BigInt.fromI32(lastVersionRule.chain1TradeFee),
                    BigInt.fromI32(lastVersionRule.chain0ResponseTime),
                    BigInt.fromI32(lastVersionRule.chain1ResponseTime),
                    BigInt.fromI32(lastVersionRule.chain0CompensationRatio),
                    BigInt.fromI32(lastVersionRule.chain1CompensationRatio),
                    lastVersionRule.enableTimestamp,
                    updateRulesRootMode.INV
                )
            )
        }
    }else{
        return setInitRuleType()
    }
    
}

function isRscTupleUint(rscTuple: ethereum.Value): boolean {
    return rscTuple.kind == ethereum.ValueKind.UINT?true:false
}

function parseRSC(
    rsc: Array<ethereum.Value>,
    mdcAddress: string,
    ebcAddress: string,
    version: i32,
    selector: updateRulesRootMode
): rscRuleType[] {
    let rscRules: rscRuleType[] = [];
    for (let i = 0; i < rsc.length; i++) {
        let rscTuple = rsc[i].toTuple();
        // let _rscRuleType = getLastRules(mdcAddress, ebcAddress, version, i)
        let _rscRuleType = setInitRuleType()
        _rscRuleType.selector = selector
        if (isRscTupleUint(rscTuple[0])) {
            _rscRuleType.chain0 = rscTuple[0].toBigInt();
        }

        if (isRscTupleUint(rscTuple[1])) {
            _rscRuleType.chain1 = rscTuple[1].toBigInt();
        }

        if (isRscTupleUint(rscTuple[2])) {
            _rscRuleType.chain0Status = rscTuple[2].toBigInt();
        }

        if (isRscTupleUint(rscTuple[3])) {
            _rscRuleType.chain1Status = rscTuple[3].toBigInt();
        }

        if (isRscTupleUint(rscTuple[4])) {
            _rscRuleType.chain0Token = rscTuple[4].toBigInt();
        }

        if (isRscTupleUint(rscTuple[5])) {
            _rscRuleType.chain1Token = rscTuple[5].toBigInt();
        }

        if (isRscTupleUint(rscTuple[6])) {
            _rscRuleType.chain0minPrice = rscTuple[6].toBigInt();
        }

        if (isRscTupleUint(rscTuple[7])) {
            _rscRuleType.chain0maxPrice = rscTuple[7].toBigInt();
        }

        if (isRscTupleUint(rscTuple[8])) {
            _rscRuleType.chain1minPrice = rscTuple[8].toBigInt();
        }

        if (isRscTupleUint(rscTuple[9])) {
            _rscRuleType.chain1maxPrice = rscTuple[9].toBigInt();
        }

        if (isRscTupleUint(rscTuple[10])) {
            _rscRuleType.chain0WithholdingFee = rscTuple[10].toBigInt();
        }

        if (isRscTupleUint(rscTuple[11])) {
            _rscRuleType.chain1WithholdingFee = rscTuple[11].toBigInt();
        }

        if (isRscTupleUint(rscTuple[12])) {
            _rscRuleType.chain0TradeFee = rscTuple[12].toBigInt();
        }

        if (isRscTupleUint(rscTuple[13])) {
            _rscRuleType.chain1TradeFee = rscTuple[13].toBigInt();
        }

        if (isRscTupleUint(rscTuple[14])) {
            _rscRuleType.chain0ResponseTime = rscTuple[14].toBigInt();
        }

        if (isRscTupleUint(rscTuple[15])) {
            _rscRuleType.chain1ResponseTime = rscTuple[15].toBigInt();
        }

        if (isRscTupleUint(rscTuple[16])) {
            _rscRuleType.chain0CompensationRatio = rscTuple[16].toBigInt();
        }

        if (isRscTupleUint(rscTuple[17])) {
            _rscRuleType.chain1CompensationRatio = rscTuple[17].toBigInt();
        }

        // if (isRscTupleUint(rscTuple[18])) {
        //     _rscRuleType.enableTimestamp = rscTuple[18].toBigInt();
        // }

        _rscRuleType.verifyPass = true;
        rscRules.push(_rscRuleType);
    }
    return rscRules;
}


export function parseChainInfoUpdatedInputData(
    data: Bytes,
    _chainInfoUpdated: ChainInfoUpdated
): void {
    // let dataUnderPrefix = inputdataPrefix(data)
    // const decoded = ethereum.decode(
    //     func_updateChainSpvsSelector,
    //     dataUnderPrefix
    // ) as ethereum.Value;
    // if (!decoded) {
    //     log.error("Failed to decode transaction input data", ["error"])
    // }
    // let tuple = decoded.toTuple();
    let tuple = decodeInputData(data, func_updateChainSpvsSelector)

    if(debugLog){
        log.debug("chainInfoUpdated kind[0]:{}, kind[1]:{}, kind[2]:{}", [
            tuple[0].kind.toString(),
            tuple[1].kind.toString(),
            tuple[2].kind.toString()
        ])
    }

    let id = ZERO_BI
    let spvs = new Array<Address>()
    let indexs = new Array<BigInt>()
    if(tuple[0].kind == ethereum.ValueKind.UINT){
        id = tuple[0].toBigInt()
    }
    if(tuple[1].kind == ethereum.ValueKind.ARRAY){
        spvs = tuple[1].toAddressArray()
    }
    if(tuple[2].kind == ethereum.ValueKind.ARRAY){
        indexs = tuple[2].toBigIntArray()
    }

    if(debugLog){
        log.debug("chainInfoUpdated id:{}, spv.length:{}, indexs.length:{}", 
        [
            id.toString(),
            spvs.length.toString(),
            indexs.length.toString()
        ])        
        // print spvs array
        for(let i = 0; i < spvs.length; i++){
            log.debug("chainInfoUpdated spvs:[{}]{}", [
                i.toString(),
                spvs[i].toHexString(),
            ])
        }
        // print indexs array
        for(let i = 0; i < indexs.length; i++){
            log.debug("chainInfoUpdated indexs[{}]:{}", [
                i.toString(),
                indexs[i].toString(),
            ])
        }
    }
    
    for(let i = 0; i < spvs.length; i++){
        if(i < indexs.length){
            let _spv = _chainInfoUpdated.spvs;
            if (indexs.length > 0) {
                // let spvBytes: Bytes[] = [];
                // for (let i = 0; i < indexs.length; i++) {
                //     let index = indexs[i].toI32();
                //     if(_spv.length == 0){
                //         spvBytes.push(Bytes.fromHexString(spvs[i].toHexString()));
                //     }else{
                //         if (index < _spv.length) {
                //             spvBytes.push(Bytes.fromHexString(spvs[i].toHexString()));
                //         }
                //     }
                // }
                let spvArray = new Array<string>()
                for (let i = 0; i < indexs.length; i++) {
                    let index = indexs[i].toI32();
                    if(_spv.length == 0){
                        spvArray.push(spvs[i].toHexString());
                    }else{
                        if (index < _spv.length) {
                            spvArray.push(spvs[i].toHexString());
                        }
                    }
                }
                _chainInfoUpdated.spvs = _spv.slice(0, indexs[0].toI32()).concat(spvArray).concat(_spv.slice(indexs[indexs.length - 1].toI32() + 1));
            } else {
                // let spvBytes: Bytes[] = [];
                // for (let i = 0; i < spvs.length; i++) {
                //     spvBytes.push(Address.fromHexString(AddressFmtPadZero(spvs[i].toHexString())) as Bytes);
                // }
                // _chainInfoUpdated.spvs = _spv.concat(spvBytes);
                let spvArray = new Array<string>()
                for (let i = 0; i < spvs.length; i++) {
                    spvArray.push(spvs[i].toHexString());
                }
                _chainInfoUpdated.spvs = _spv.concat(spvArray);
            }
            _chainInfoUpdated.save();
        }else{
            // _chainInfoUpdated.spvs = _chainInfoUpdated.spvs.concat([Bytes.fromHexString(spvs[i].toHexString())])
            _chainInfoUpdated.spvs = _chainInfoUpdated.spvs.concat([spvs[i].toHexString()])
            _chainInfoUpdated.save()
        }
    }

    if(debugLog){
        for(let i = 0; i < _chainInfoUpdated.spvs.length; i++){
            log.debug("update new spv[{}/{}]:{}", [(i+1).toString(),_chainInfoUpdated.spvs.length.toString(), _chainInfoUpdated.spvs[i]])
        }
    }   
}

export function parseTransactionInputData(data: Bytes, mdcAddress: string): rscRules {
    let func = compareUpdateRulesRootSelector(getFunctionSelector(data))
    let selectorofFunc = "0x000000"
    if(func == updateRulesRootMode.ETH) {
        selectorofFunc = func_updateRulesRootSelector
    }else if(func == updateRulesRootMode.ERC20) {
        selectorofFunc = func_updateRulesRootERC20Selector
    }
    let tuple = decodeInputData(data, selectorofFunc)
    if (debugLog){
        for(let i = 0; i< tuple.length; i++){
            log.debug("tuple[{}].kind:{}", [i.toString(), tuple[i].kind.toString()])
        }
    }

    let rsc = new Array<ethereum.Value>()
    let enableTimestamp = BigInt.fromI32(0)
    let ebcAddress = STRING_INVALID
    let rootWithVersion = new ethereum.Tuple()
    let root = STRING_INVALID
    let version = 0
    let sourceChainIds = new Array<BigInt>()
    let pledgeAmounts = new Array<BigInt>()
    let tokenAddress = STRING_INVALID

    if(tuple[0].kind == ethereum.ValueKind.UINT) {
        enableTimestamp = tuple[0].toBigInt()
    }

    if(tuple[1].kind == ethereum.ValueKind.ADDRESS) {
        ebcAddress = tuple[1].toAddress().toHexString();
    }

    if(tuple[2].kind == ethereum.ValueKind.ARRAY) {
        rsc = tuple[2].toArray();
        if(debugLog){
            for(let i = 0; i < rsc.length; i++){
                log.debug("rsc[{}].kind:{}", [i.toString(), rsc[i].kind.toString()])
            }
        }
    }    

    if(tuple[3].kind == ethereum.ValueKind.TUPLE){
        rootWithVersion = tuple[3].toTuple();
        if(debugLog){
            log.debug("rootWithVersion[0].kind: {}, rootWithVersion[1].kind: {}", [
                rootWithVersion[0].kind.toString(),
                rootWithVersion[1].kind.toString()])
        }
        if(rootWithVersion[0].kind == ethereum.ValueKind.BYTES ||
            rootWithVersion[0].kind == ethereum.ValueKind.FIXED_BYTES) {
            root = rootWithVersion[0].toBytes().toHexString();
        }
        if(rootWithVersion[1].kind == ethereum.ValueKind.UINT){
            version = rootWithVersion[1].toI32();
        }
    }

    if(tuple[4].kind == ethereum.ValueKind.ARRAY) {
        sourceChainIds = tuple[4].toBigIntArray();
    }
    
    if(tuple[5].kind == ethereum.ValueKind.ARRAY){
        pledgeAmounts = tuple[5].toBigIntArray();   
    }

    if(selectorofFunc == func_updateRulesRootERC20Selector) {
        if(tuple[6].kind == ethereum.ValueKind.ADDRESS) {
            tokenAddress = tuple[6].toAddress().toHexString();
        }
    }

    let updateRulesRootEntity = new rscRules(
        enableTimestamp,
        mdcAddress,
        ebcAddress,
        rsc,
        root,
        version,
        sourceChainIds,
        pledgeAmounts,
        tokenAddress,
        func
    )

    return updateRulesRootEntity
}

export function AddressFmtPadZero(address: string): string {
    if (address.length % 2 != 0) {
        address = "0" + address;
    }    
    return address
}

function ruleVerification(
    rsc: rscRuleType,
    rule: latestRule
): void {
    rule.ruleValidation = true
}

function getLastRulesEntity(
    id: string
): latestRule {
    let lastRule = latestRule.load(id)
    if(lastRule == null){
        lastRule = new latestRule(id)
        lastRule.ruleValidation = false
    }

    // if (id.startsWith('0xERC20')) {
    //     lastRule.type = 'ERC20'
    //     log.info('create LatestERC20 rule: {}', [id]);
    // } else if (id.startsWith('0xETH')) {
    //     lastRule.type = 'ETH'
    //     log.info('create LatestETH rule: {}', [id]);
    // }        

    // if(rsc.selector === updateRulesRootMode.ERC20){
    //     _snapshotLatestRule.type = _rule.type = 'ERC20'
    // }else if(rsc.selector === updateRulesRootMode.ETH){
    //     _snapshotLatestRule.type = _rule.type = 'ETH'
    // } 

    return lastRule
}

function getAllLatestRules(
    mdc: MDC,
    ebc: EbcsUpdated
): string[] {
    let ruleIDs: string[] = [];
    if (mdc.ruleLatest != null) {
        for (let i = 0; i < mdc.ruleLatest.length; i++) {
            let rule = latestRule.load(mdc.ruleLatest[i]);
            if (rule != null && rule.ebc._id == ebc.id) {
                ruleIDs.push(rule.id);
            }
        }
    }
    return ruleIDs;
}

function getRulePaddingID(
    id: string,
    selector:updateRulesRootMode
): string{
    if(selector === updateRulesRootMode.ERC20){
        id = '0xERC20' + id.slice(2, id.length);
    }else if(selector === updateRulesRootMode.ETH){
        id = '0xETH' + id.slice(2, id.length);
    }else{
        log.error("Failed to updateLatestRules, RuleTypeCurrent:{}", [selector.toString()])
    }    
    return id;
}

function updateLatestRules( 
    rsc: rscRuleType,
    event: ethereum.Event,
    rscRules: rscRules,
    mdc: MDC,
    ebc: EbcsUpdated,
    validateResult: boolean,
    ebcValidateResult: boolean,
    snapshot:ruleTypes
):void{
    const version = rscRules.version;
    const enableTimestamp = rscRules.enableTimestamp;
    let token0 = rsc.chain0Token;
    let token1 = rsc.chain1Token;
    if(rsc.selector === updateRulesRootMode.ETH){
        token0 = token1 = BigInt.fromI32(0);
    }

    let id = createHashID([
        mdc.id, 
        ebc.id, 
        rsc.chain0.toString(), 
        rsc.chain1.toString(),
        token0.toString(),
        token1.toString(),
    ]);

    const _rule = getLastRulesEntity(id);
    const _snapshotLatestRule = getLastRulesEntity(snapshot.id);

    for (let i = 0; i < 2; i++) {
        const _rscRuleType = i === 0 ? _rule : _snapshotLatestRule;
        _rscRuleType.owner = mdc.owner;
        _rscRuleType.mdcAddr = mdc.id;
        _rscRuleType.ebcAddr = ebc.id;
        _rscRuleType.chain0 = rsc.chain0;
        _rscRuleType.chain1 = rsc.chain1;
        _rscRuleType.chain0Status = rsc.chain0Status.toI32();
        _rscRuleType.chain1Status = rsc.chain1Status.toI32();
        _rscRuleType.chain0Token = AddressFmtPadZero(rsc.chain0Token.toHexString());
        _rscRuleType.chain1Token = AddressFmtPadZero(rsc.chain1Token.toHexString());
        _rscRuleType.chain0minPrice = rsc.chain0minPrice;
        _rscRuleType.chain0maxPrice = rsc.chain0maxPrice;
        _rscRuleType.chain1minPrice = rsc.chain1minPrice;
        _rscRuleType.chain1maxPrice = rsc.chain1maxPrice;
        _rscRuleType.chain0WithholdingFee = rsc.chain0WithholdingFee;
        _rscRuleType.chain1WithholdingFee = rsc.chain1WithholdingFee;
        _rscRuleType.chain0TradeFee = rsc.chain0TradeFee.toI32();
        _rscRuleType.chain1TradeFee = rsc.chain1TradeFee.toI32();
        _rscRuleType.chain0ResponseTime = rsc.chain0ResponseTime.toI32();
        _rscRuleType.chain1ResponseTime = rsc.chain1ResponseTime.toI32();
        _rscRuleType.chain0CompensationRatio = rsc.chain0CompensationRatio.toI32();
        _rscRuleType.chain1CompensationRatio = rsc.chain1CompensationRatio.toI32();
        _rscRuleType.enableTimestamp = enableTimestamp;
        _rscRuleType.ruleValidation = validateResult && ebcValidateResult;
        _rscRuleType.latestUpdateTimestamp = event.block.timestamp;
        _rscRuleType.latestUpdateBlockNumber = event.block.number;
        _rscRuleType.latestUpdateHash = event.transaction.hash.toHexString();
        _rscRuleType.latestUpdateVersion = version as i32;
        if(rsc.selector === updateRulesRootMode.ETH){
            _rscRuleType.type = 'ETH'
        }else if(rsc.selector === updateRulesRootMode.ERC20){
            _rscRuleType.type = 'ERC20'
        }
    }
    saveLatestRule2MDCEBC(mdc, ebc, _rule.id);
    saveLatestRule2RuleSnapshot(snapshot, _snapshotLatestRule.id);
    _rule.save()
    _snapshotLatestRule.save()
    if(debugLogCreateRules){
        log.info("update latest rule id: {}", [id])
    }
}

function saveRuleSnapshotRelation(
    event: ethereum.Event,
    ruleSnapshot: ruleTypes,
    mdc: MDC,
    ebc: EbcsUpdated
): void{
    // let ebc = getEBCEntityNew(mdc.ebc._id, event)
    // let dealer = getDealerEntity(Bytes.fromHexString(mdc.dealer._id), event)
    if (mdc.ruleSnapshot == null) {
        mdc.ruleSnapshot = [ruleSnapshot.id];
    } else if (!mdc.ruleSnapshot.includes(ruleSnapshot.id)) {
        mdc.ruleSnapshot = mdc.ruleSnapshot.concat([ruleSnapshot.id])
    }
    //TODO: double check if dealer.rules is needed
    // if (dealer.rules == null) {
    //     dealer.rules = [ruleSnapshot.id];
    // } else if (!dealer.rules.includes(ruleSnapshot.id)) {
    //     dealer.rules = dealer.rules.concat([ruleSnapshot.id])
    // }
    if (ebc.rulesList == null) {
        ebc.rulesList = [ruleSnapshot.id];
    } else if (!ebc.rulesList.includes(ruleSnapshot.id)) {
        ebc.rulesList = ebc.rulesList.concat([ruleSnapshot.id])
    }
    // TODO: save ruleSnapshot to mdc later??
    mdc.save()
    // dealer.save()
    ebc.save()
    log.info("save ruleSnapshot {} relation mdc: {}, ebc: {}", [
        ruleSnapshot.id,
        mdc.id,
        ebc.id
    ])
}

function getRuleSnapshotEntity(
    event: ethereum.Event,
    mdc: MDC,
    ebc: EbcsUpdated
): ruleTypes {
    // const snapshotId = createBindID([mdc.id, ebc.id, createEventID(event)])
    const snapshotId = createHashID([mdc.id, ebc.id, createEventID(event)])
    let ruleSnapshot = ruleTypes.load(snapshotId)
    if(ruleSnapshot == null){
        ruleSnapshot = new ruleTypes(snapshotId)
        ruleSnapshot.root = STRING_INVALID
        ruleSnapshot.version = 0
        ruleSnapshot.rules = []
        ruleSnapshot.sourceChainIds = []
        ruleSnapshot.pledgeAmounts = []
        ruleSnapshot.ruleLatest = []
        ruleSnapshot.token = STRING_INVALID
        // log.debug("create ruleSnapshot id: {}", [snapshotId])
    }
    ruleSnapshot.latestUpdateBlockNumber = event.block.number
    ruleSnapshot.latestUpdateHash = event.transaction.hash.toHexString()
    ruleSnapshot.latestUpdateTimestamp = event.block.timestamp
    return ruleSnapshot
}

// function storeMDCMapping2RuleSnapshot(
//     event: ethereum.Event,
//     ruleSnapshot: ruleTypes,
//     mdc: MDC
// ): void{
//     let  currentMDCMapping = getMDCMappingEntity(mdc, event)
//     const dealers = getMDCLatestDealers(mdc)
//     const ebc = getMDCLatestEBCs(mdc)
//     const chainId = getMDCLatestChainIds(mdc)
// }

function ruleValidationEBCSchema(
    ebcAddr: string,
    mdc: MDC
): boolean{
    const EBCArray = getMDCLatestEBCs(mdc)
    if(!EBCArray.includes(ebcAddr)){
        return false
    }
    return true
}

function ruleValidationSchema(
    rsc: rscRuleType,
    mdc: MDC,
): boolean{
    // chainID validation
    const chain0 = rsc.chain0
    const chain1 = rsc.chain1
    if(chain0 >= chain1){
        return false
    }
    const chainIds = getMDCLatestChainIds(mdc)
    if(!chainIds.includes(chain0) || !chainIds.includes(chain1)){
        return false
    }

    // token validation
    const chain0Token = rsc.chain0Token.toHexString()
    const chain1Token = rsc.chain1Token.toHexString()
    const chain0TokenArray = getTokenFromChainInfoUpdated(chain0)
    const chain1TokenArray = getTokenFromChainInfoUpdated(chain1)
    if(!chain0TokenArray.includes(chain0Token) || !chain1TokenArray.includes(chain1Token)){
        return false
    }

    return true
}

export function mdcStoreRuleSnapshot(
    event: ethereum.Event,
    updateRulesRootEntity: rscRules,
    mdc: MDC,
    ebc: EbcsUpdated
): void {
    let ruleSnapshot = getRuleSnapshotEntity(event, mdc, ebc)
    saveRuleSnapshotRelation(event, ruleSnapshot, mdc, ebc)
    ruleSnapshot.root = updateRulesRootEntity.root
    ruleSnapshot.version = updateRulesRootEntity.version
    ruleSnapshot.sourceChainIds = updateRulesRootEntity.sourceChainIds
    ruleSnapshot.pledgeAmounts = updateRulesRootEntity.pledgeAmounts
    ruleSnapshot.token = updateRulesRootEntity.tokenAddr
    const EBCValidation = ruleValidationEBCSchema(updateRulesRootEntity.ebcAddress, mdc)
    if(updateRulesRootEntity.rscType.length > 0){
        for(let i = 0; i < updateRulesRootEntity.rscType.length; i++){
            let _rule = getRuleEntity(ruleSnapshot, i, mdc, ebc, event)    
            const validateResult = ruleValidationSchema(updateRulesRootEntity.rscType[i], mdc)      
            _rule.chain0 = updateRulesRootEntity.rscType[i].chain0
            _rule.chain1 = updateRulesRootEntity.rscType[i].chain1
            _rule.chain0Status = updateRulesRootEntity.rscType[i].chain0Status.toI32()
            _rule.chain1Status = updateRulesRootEntity.rscType[i].chain1Status.toI32()    
            _rule.chain0Token = (AddressFmtPadZero(updateRulesRootEntity.rscType[i].chain0Token.toHexString()))
            _rule.chain1Token = (AddressFmtPadZero(updateRulesRootEntity.rscType[i].chain1Token.toHexString()))
            _rule.chain0minPrice = updateRulesRootEntity.rscType[i].chain0minPrice
            _rule.chain0maxPrice = updateRulesRootEntity.rscType[i].chain0maxPrice
            _rule.chain1minPrice = updateRulesRootEntity.rscType[i].chain1minPrice
            _rule.chain1maxPrice = updateRulesRootEntity.rscType[i].chain1maxPrice
            _rule.chain0WithholdingFee = updateRulesRootEntity.rscType[i].chain0WithholdingFee
            _rule.chain1WithholdingFee = updateRulesRootEntity.rscType[i].chain1WithholdingFee
            _rule.chain0TradeFee = updateRulesRootEntity.rscType[i].chain0TradeFee.toI32()
            _rule.chain1TradeFee = updateRulesRootEntity.rscType[i].chain1TradeFee.toI32()
            _rule.chain0ResponseTime = updateRulesRootEntity.rscType[i].chain0ResponseTime.toI32()
            _rule.chain1ResponseTime = updateRulesRootEntity.rscType[i].chain1ResponseTime.toI32()
            _rule.chain0CompensationRatio = updateRulesRootEntity.rscType[i].chain0CompensationRatio.toI32()
            _rule.chain1CompensationRatio = updateRulesRootEntity.rscType[i].chain1CompensationRatio.toI32()
            _rule.enableTimestamp = updateRulesRootEntity.enableTimestamp
            _rule.ruleValidation = validateResult && EBCValidation
            _rule.save()
            updateLatestRules(
                updateRulesRootEntity.rscType[i],
                event,
                updateRulesRootEntity,
                mdc,
                ebc,
                validateResult,
                EBCValidation,
                ruleSnapshot
            )
            if(debugLogCreateRules){
                log.info('Rule index{}, update[0]:{}, [1]:{}, [2]:{}, [3]:{}, [4]:{}, [5]:{}, [6]:{}, [7]:{}, [8]:{}, [9]:{}, [10]:{}, [11]:{}, [12]:{}, [13]:{}, [14]:{}, [15]:{}, [16]:{}, [17]:{}, [18]:{}', [
                    i.toString(),
                    _rule.chain0.toString(),
                    _rule.chain1.toString(),
                    _rule.chain0Status.toString(),
                    _rule.chain1Status.toString(),
                    _rule.chain0Token,
                    _rule.chain1Token,
                    _rule.chain0minPrice.toString(),
                    _rule.chain0maxPrice.toString(),
                    _rule.chain1minPrice.toString(),
                    _rule.chain1maxPrice.toString(),
                    _rule.chain0WithholdingFee.toString(),
                    _rule.chain1WithholdingFee.toString(),
                    _rule.chain0TradeFee.toString(),
                    _rule.chain1TradeFee.toString(),
                    _rule.chain0ResponseTime.toString(),
                    _rule.chain1ResponseTime.toString(),
                    _rule.chain0CompensationRatio.toString(),
                    _rule.chain1CompensationRatio.toString(),
                    _rule.enableTimestamp.toString()
                ])
            }
        }           
    }
    ruleSnapshot.save()
}

export function removeDuplicates(data: Array<Address>): Array<Address> {
    const uniques = new Array<Address>();
    for (let i = 0; i < data.length; i++) {
      let isDuplicate = false;
      for (let j = 0; j < uniques.length; j++) {
        if (data[i].equals(uniques[j])) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniques.push(data[i]);
      }
    }
    return uniques;
}

export function removeDuplicatesBigInt(data: Array<BigInt>): Array<BigInt> {
    const uniques = new Array<BigInt>();
    for (let i = 0; i < data.length; i++) {
      let isDuplicate = false;
      for (let j = 0; j < uniques.length; j++) {
        if (data[i].equals(uniques[j])) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniques.push(data[i]);
      }
    }
    return uniques;
}


export function compareUpdateRulesRootSelector(selector: Bytes): updateRulesRootMode {
    return selector == Bytes.fromHexString(func_updateRulesRoot) ? updateRulesRootMode.ETH : selector == Bytes.fromHexString(func_updateRulesRootERC20) ? updateRulesRootMode.ERC20 : updateRulesRootMode.INV
}

export function compareChainInfoUpdatedSelector(selector: Bytes): ChainInfoUpdatedMode {
    return selector == Bytes.fromHexString(func_registerChains) ? ChainInfoUpdatedMode.registerChains : selector == Bytes.fromHexString(func_updateChainSpvs) ? ChainInfoUpdatedMode.updateChainSpvs : ChainInfoUpdatedMode.INV
}

export function decodeEnabletime(inputData: Bytes, type: string): BigInt {
    let tuple = decodeInputData(inputData, type)
    if (debugLogMapping){
        for(let i = 0; i< tuple.length; i++){
            log.debug("tuple[{}].kind:{}", [i.toString(), tuple[i].kind.toString()])
        }
    }

    let enableTimestamp: BigInt = BigInt.fromI32(0)
    if(tuple[0].kind == ethereum.ValueKind.UINT){
        enableTimestamp = tuple[0].toBigInt()
    }
    return enableTimestamp
}



