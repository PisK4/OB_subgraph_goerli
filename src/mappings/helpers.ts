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
    chainRel,
    tokenRel,
    ColumnArrayUpdated,
    Dealer,
    DealerMapping,
    ebcRel,
    MDC,
    MDCBindChainId,
    dealerSnapshot,
    MDCBindSPV,
    MDCMapping,
    responseMakersMapping,
    chainIdMapping,
    ebcMapping,
    latestRule,
    rule,
    ruleRel,
    ebcSnapshot,
    chainIdSnapshot,
    responseMaker,
    FactoryManager,
    ebcMappingSnapshot,
    DealerMappingSnapshot,
    chainIdMappingSnapshot,
    latestRuleSnapshot,
    Withdraw,
    ruleUpdateRel,
    ruleUpdateVersion,
    chainPairManager,
    tokenPairManager
} from '../types/schema'
import {
    entity,
    findDifferentData,
    calldata,
    padZeroToUint,
} from './utils'
import {
    functionrResponseMakerMockinput
} from '../../tests/mock-data'
import {
    isProduction,
    debugLog,
    debugLogCreateRules,
    debugLogMapping
} from './config'

export const ZERO_BI: BigInt = BigInt.fromI32(0)
export const ONE_BI: BigInt = BigInt.fromI32(1)
export const ZERO_UINT: u32 = 0
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)
export const STRING_INVALID = 'invalid'
export const STRING_EMPTY = 'empty'
export const RULEVALIDA_NOERROR = 'no error'
export const RULEVALIDA_EBCNOTFOUND = 'ebc not found'
export const RULEVALIDA_CHAINIDNOTFOUND = 'chainId not found'
export const RULEVALIDA_TOKENNOTFOUND = 'token not found'
export const RULEVALIDA_CHAINIDMISSMATCH = 'chainId miss match'
export const RULEVALIDA_SERVICECLOSED = 'service closed'
export const ONE_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
export const ETH_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as string
export const ONE_NUM = 0xffffffff
export const ONE_BYTES = new Bytes(32);

/**** function selectors ****/
export const func_updateRulesRoot = "0x6d9437b1"
export const func_updateRulesRootERC20 = "0x34bc98de"
export const func_registerChains = "0x2e96565f"
export const func_updateChainSpvs = "0x434417cf"
/**** function selectors ****/

/**** decode function format ****/
export const RSCDataFmt = "(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint128,uint128,uint32,uint32,uint32,uint32,uint32,uint32)[]"
export const selectorSetting = `uint64,address,${RSCDataFmt},(bytes32,uint32),uint64[],uint256[]`
export const func_updateRulesRootName = `(${selectorSetting})`
export const func_updateRulesRootERC20Name = `(${selectorSetting},address)`
export const func_registerChainsName = "(uint64,(uint64,uint192,uint64,uint64,uint64,uint64,uint,address[])[])"
export const func_updateChainSpvsName = "(uint64,uint64,address[],uint[])"
export const func_updateColumnArrayName = "(uint64,address[],address[],uint64[])"
export const func_updateResponseMakersName = "(uint64,bytes[])"
/**** decode function format ****/

export enum updateRulesRootMode {
    ETH = 0,
    ERC20 = 1,
    INV = 2,
}

export enum ChainInfoUpdatedMode {
    registerChains = 0,
    updateChainSpvs = 1,
    INV = 2,
}

export function ebcSave(
    ebc: ebcRel,
    mdc: MDC,
): void {
    saveMDC2EBC(ebc, mdc)
}

export function initRulesEntity(
    _rules: ruleRel
): void {
    _rules.root = STRING_EMPTY
    _rules.version = 0
    _rules.pledgeAmounts = []
    _rules.sourceChainIds = []
    _rules.token = STRING_EMPTY
}

export function initRuleEntity(
    _rules: rule
): void {
    _rules.chain0 = ZERO_BI
    _rules.chain1 = ZERO_BI
    _rules.chain0Status = ZERO_UINT
    _rules.chain1Status = ZERO_UINT
    _rules.chain0Token = STRING_EMPTY
    _rules.chain1Token = STRING_EMPTY
    _rules.chain0minPrice = ZERO_BI
    _rules.chain0maxPrice = ZERO_BI
    _rules.chain1minPrice = ZERO_BI
    _rules.chain1maxPrice = ZERO_BI
    _rules.chain0WithholdingFee = ZERO_BI
    _rules.chain1WithholdingFee = ZERO_BI
    _rules.chain0TradeFee = ZERO_UINT
    _rules.chain1TradeFee = ZERO_UINT
    _rules.chain0ResponseTime = ZERO_UINT
    _rules.chain1ResponseTime = ZERO_UINT
    _rules.chain0CompensationRatio = ZERO_UINT
    _rules.chain1CompensationRatio = ZERO_UINT
    _rules.latestVersion = ZERO_BI
    _rules.transactionRuleIndex = ZERO_UINT
    _rules.ruleValidation = true
    _rules.ruleValidationErrorstatus = RULEVALIDA_NOERROR
}

export function getRuleEntity(
    ruleTypes: ruleRel,
    i: i32,
    mdc: MDC,
    ebc: ebcRel,
    event: ethereum.Event
): rule {
    const id = entity.createBindID([ruleTypes.id, i.toString()])
    let _rule = rule.load(id)
    if (_rule == null) {
        _rule = new rule(id)
        initRuleEntity(_rule)
        _rule.owner = mdc.owner
        _rule.ebcAddr = ebc.id
        ruleTypes.rules = entity.addRelation(ruleTypes.rules, _rule.id)
        if (debugLogCreateRules) {
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
): FactoryManager {
    let factory = FactoryManager.load(id)
    if (factory == null) {
        log.info('create new FactoryManager, id: {}', [id])
        factory = new FactoryManager(id)
        factory.mdcCounts = BigInt.fromI32(0);
        factory.mdcs = []
        factory.owners = []
        factory.responseMakers = []
    }
    factory.latestUpdateHash = event.transaction.hash.toHexString()
    factory.latestUpdateBlockNumber = event.block.number
    factory.latestUpdateTimestamp = event.block.timestamp
    return factory as FactoryManager
}


export function getEBCEntityNew(
    ebcAddress: string,
    event: ethereum.Event
): ebcRel {
    let ebc = ebcRel.load(ebcAddress)
    if (ebc == null) {
        log.info('create new EBC, ebc: {}', [ebcAddress])
        ebc = new ebcRel(ebcAddress)
        ebc.mdcList = []
        ebc.rulesList = []
        ebc.ruleLatest = []
        ebc.ruleUpdateRel = []
        ebc.statuses = true
    }
    ebc.latestUpdateHash = event.transaction.hash.toHexString()
    return ebc as ebcRel
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
        mdc.ruleUpdateRel = []
        mdc.responseMakersSnapshot = []
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
): chainRel {
    let id = _id.toString()
    let _chainInfo = chainRel.load(id)
    if (_chainInfo == null) {
        log.info('create new ChainInfo, id: {}', [id])
        _chainInfo = new chainRel(id)
        _chainInfo.tokens = []
        _chainInfo.spvs = []
    }
    _chainInfo.latestUpdateHash = event.transaction.hash.toHexString()
    _chainInfo.latestUpdateBlockNumber = event.block.number
    _chainInfo.latestUpdateTimestamp = event.block.timestamp
    return _chainInfo as chainRel
}


export function getMDCMappingEntity(
    mdc: MDC,
    event: ethereum.Event
): MDCMapping {
    let _MDCMapping = MDCMapping.load(mdc.id)
    if (_MDCMapping == null) {
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
    let _chainInfo = chainRel.load(chainid.toString())
    let tokens = [] as Array<string>
    if (_chainInfo != null) {
        log.info('chainInfo.tokens.length: {}', [_chainInfo.tokens.length.toString()])
        for (let i = 0; i < _chainInfo.tokens.length; i++) {
            const tokenId = _chainInfo.tokens[i]
            log.info('load token: {}', [tokenId])
            const _ChainTokenUpdated = tokenRel.load(tokenId)
            if (_ChainTokenUpdated != null) {
                tokens = tokens.concat([_ChainTokenUpdated.tokenAddress])
            }
        }
    }
    return tokens
}

export function getTokenEntity(
    chainId: BigInt,
    token: string,
    event: ethereum.Event
): tokenRel {
    const tokenId = entity.createHashID([chainId.toString(), token])
    let chainInfo = getChainInfoEntity(event, chainId)
    let tokenInfo = tokenRel.load(tokenId)
    if (tokenInfo == null) {
        tokenInfo = new tokenRel(tokenId)
        tokenInfo.tokenAddress = padZeroToUint(token)
        tokenInfo.chainId = chainId.toString()
        // saveTokenInfo2ChainInfo(chainInfo, tokenId)
        chainInfo.tokens = entity.addRelation(chainInfo.tokens, tokenId)
        chainInfo.save()
        log.info('create new token: {}, chain: {}, id: {}', [tokenInfo.tokenAddress, chainId.toString(), tokenId])

    }
    tokenInfo.latestUpdateBlockNumber = event.block.number
    tokenInfo.latestUpdateTimestamp = event.block.timestamp
    tokenInfo.latestUpdateHash = event.transaction.hash.toHexString()
    return tokenInfo as tokenRel
}

export function getColumnArrayUpdatedEntity(
    event: ethereum.Event,
    mdc: MDC
): ColumnArrayUpdated {
    let _columnArrayUpdated = ColumnArrayUpdated.load(entity.createEventID(event))
    if (_columnArrayUpdated == null) {
        log.info('create new ColumnArrayUpdated, id: {}', [entity.createEventID(event)])
        _columnArrayUpdated = new ColumnArrayUpdated(entity.createEventID(event))
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
): MDCBindSPV {
    const id = mdc.id + "-" + chainId.toString()
    let _MDCBindSPV = MDCBindSPV.load(id)
    if (_MDCBindSPV == null) {
        _MDCBindSPV = new MDCBindSPV(id)
        _MDCBindSPV.chainId = chainId
        saveSPV2MDC(mdc, _MDCBindSPV)
    }

    return _MDCBindSPV as MDCBindSPV
}

export function getdealerSnapshotEntity(
    mdc: MDC,
    event: ethereum.Event
): dealerSnapshot {
    const id = entity.createEventID(event)
    let dealer = dealerSnapshot.load(id)
    if (dealer == null) {
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
): ebcSnapshot {
    const id = entity.createEventID(event)
    let ebc = ebcSnapshot.load(id)
    if (ebc == null) {
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
): chainIdSnapshot {
    const id = entity.createEventID(event)
    let chainId = chainIdSnapshot.load(id)
    if (chainId == null) {
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
): MDCBindChainId {
    let chainIdEntity = MDCBindChainId.load(mdc.id)
    if (chainIdEntity == null) {
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
): string[] {
    let dealer = new Array<string>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if (mdcMapping != null) {
        log.info("MDC: {} mapping dealerCnt: {}", [mdc.id, mdcMapping.dealerMapping.length.toString()])
        for (let i = 0; i < mdcMapping.dealerMapping.length; i++) {
            let _dealerMapping = DealerMapping.load(mdcMapping.dealerMapping[i])
            if (_dealerMapping != null) {
                if (_dealerMapping.dealerAddr.length > 0) {
                    dealer = dealer.concat([_dealerMapping.dealerAddr])
                }
            }
        }
    }
    return dealer
}

function getMDCLatestEBCs(
    mdc: MDC
): string[] {
    let ebc = new Array<string>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if (mdcMapping != null) {
        log.info("MDC: {} mapping ebcCnt: {}", [mdc.id, mdcMapping.ebcMapping.length.toString()])
        for (let i = 0; i < mdcMapping.ebcMapping.length; i++) {
            let _ebcMapping = ebcMapping.load(mdcMapping.ebcMapping[i])
            if (_ebcMapping != null) {
                if (_ebcMapping.ebcAddr.length > 0) {
                    ebc = ebc.concat([_ebcMapping.ebcAddr])
                }
            }
        }
    }
    return ebc
}

function getMDCLatestChainIds(
    mdc: MDC
): BigInt[] {
    let chainIds = new Array<BigInt>()
    let mdcMapping = MDCMapping.load(mdc.id)
    if (mdcMapping != null) {
        log.info("MDC: {} mapping chainIdCnt: {}", [mdc.id, mdcMapping.chainIdMapping.length.toString()])
        for (let i = 0; i < mdcMapping.chainIdMapping.length; i++) {
            const latestMappingId = mdcMapping.chainIdMapping[i]
            log.info("load MDC: {} mappingId: {}", [mdc.id, latestMappingId])
            let _chainIdMapping = chainIdMapping.load(latestMappingId)
            if (_chainIdMapping != null) {
                log.info("chainId: {}", [_chainIdMapping.chainId.toString()])
                if (_chainIdMapping.chainId.length > 0) {
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
): void {
    const dealer = getMDCLatestDealers(mdc)

    if (dealer.length == 0) {
        return
    }

    for (let i = 0; i < dealer.length; i++) {
        let _dealer = Dealer.load(dealer[i])
        if (_dealer != null) {
            log.info("remove mdc from dealer {}/{}, dealer: {}, mdc: {}", [(i + 1).toString(), dealer.length.toString(), dealer[i], mdc.id])
            let _mdcs = _dealer.mdcs
            let index = _mdcs.indexOf(mdc.id)
            if (index > -1) {
                _mdcs.splice(index, 1);
            }
            _dealer.mdcs = _mdcs
            _dealer.save()
        }
        // const mappingId = mdc.id + "-" + dealer[i].toHexString()
        const mappingId = entity.createBindID([mdc.id, dealer[i]])
        let _dealerMapping = DealerMapping.load(mappingId)
        if (_dealerMapping != null) {
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
): void {
    let mdcMapping = getMDCMappingEntity(mdc, event)
    let latesMappingTmp = [] as string[]
    let snapshotMappingTmp = [] as string[]
    removeMDCFromDealer(mdc, event)
    mdcMapping.dealerMapping = []
    _MDCBindDealer.dealerList = newDealers
    _MDCBindDealer.dealerMappingSnapshot = []
    for (let mappingIndex = 0; mappingIndex < newDealers.length; mappingIndex++) {
        // const latestMappingId = mdc.id + "-" + newDealers[mappingIndex].toHexString()
        const latestMappingId = entity.createBindID([mdc.id, newDealers[mappingIndex]])
        let _dealerMapping = DealerMapping.load(latestMappingId)
        if (_dealerMapping == null) {
            _dealerMapping = new DealerMapping(latestMappingId)
            _dealerMapping.owner = mdc.owner
            _dealerMapping.dealerAddr = STRING_EMPTY
        }
        const snapshotId = entity.createBindID([_MDCBindDealer.id, newDealers[mappingIndex]])
        let _MDCBindDealerSnapshot = DealerMappingSnapshot.load(snapshotId)
        if (_MDCBindDealerSnapshot == null) {
            _MDCBindDealerSnapshot = new DealerMappingSnapshot(snapshotId)
            _MDCBindDealerSnapshot.owner = mdc.owner
        }

        log.info('update dealerMapping, id: {}', [latestMappingId])
        log.info('update dealerMappingSnapshot, id: {}', [snapshotId])
        _MDCBindDealerSnapshot.dealerAddr = _dealerMapping.dealerAddr = newDealers[mappingIndex]
        _MDCBindDealerSnapshot.dealerIndex = _dealerMapping.dealerIndex = BigInt.fromI32(mappingIndex + 1)
        _MDCBindDealerSnapshot.latestUpdateBlockNumber = _dealerMapping.latestUpdateBlockNumber = event.block.number
        _MDCBindDealerSnapshot.latestUpdateTimestamp = _dealerMapping.latestUpdateTimestamp = event.block.timestamp
        _MDCBindDealerSnapshot.latestUpdateHash = _dealerMapping.latestUpdateHash = event.transaction.hash.toHexString()
        _MDCBindDealerSnapshot.enableTimestamp = _dealerMapping.enableTimestamp = enableTimestamp
        snapshotMappingTmp = snapshotMappingTmp.concat([snapshotId])
        latesMappingTmp = latesMappingTmp.concat([latestMappingId])

        _dealerMapping.save()
        _MDCBindDealerSnapshot.save()
        let _dealer = getDealerEntity(newDealers[mappingIndex], event)
        _dealer.mdcs = entity.addRelation(_dealer.mdcs, mdc.id)
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
): void {
    const ebc = getMDCLatestEBCs(mdc)

    for (let i = 0; i < ebc.length; i++) {
        let _ebc = ebcRel.load(ebc[i])
        if (_ebc != null) {
            log.info("remove mdc from ebc {}/{}, ebc: {}, mdc: {}", [(i + 1).toString(), ebc.length.toString(), ebc[i], mdc.id])
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
        if (_ebcMapping != null) {
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
): ebcMapping {
    let _ebcMapping = ebcMapping.load(id)
    if (_ebcMapping == null) {
        _ebcMapping = new ebcMapping(id)
        _ebcMapping.ebcAddr = STRING_EMPTY
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
    if (_ebcMapping == null) {
        _ebcMapping = new ebcMappingSnapshot(id)
        _ebcMapping.ebcAddr = STRING_EMPTY
        _ebcMapping.owner = mdc.owner
    }
    _ebcMapping.latestUpdateBlockNumber = event.block.number
    _ebcMapping.latestUpdateTimestamp = event.block.timestamp
    _ebcMapping.latestUpdateHash = event.transaction.hash.toHexString()
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
    for (let mappingIndex = 0; mappingIndex < newEBCs.length; mappingIndex++) {
        const latestMappingId = entity.createBindID([mdc.id, newEBCs[mappingIndex]])
        let _ebcMapping = getEBCMappingEntity(latestMappingId, mdc, event)

        const snapshotId = entity.createHashID([ebcSnapshot.id, newEBCs[mappingIndex]])
        let _ebcSnapshot = getebcMappingSnapshotEntity(snapshotId, mdc, event)

        log.info('update ebcMapping, id: {}', [latestMappingId])
        _ebcSnapshot.ebcAddr = _ebcMapping.ebcAddr = newEBCs[mappingIndex]
        _ebcSnapshot.ebcIndex = _ebcMapping.ebcIndex = BigInt.fromI32(mappingIndex + 1)
        _ebcSnapshot.enableTimestamp = _ebcMapping.enableTimestamp = enableTimestamp
        snapshotMappingTmp = snapshotMappingTmp.concat([snapshotId])
        latesMappingTmp = latesMappingTmp.concat([latestMappingId])

        _ebcMapping.save()
        _ebcSnapshot.save()
        let _ebc = getEBCEntityNew(newEBCs[mappingIndex], event)
        _ebc.mdcList = entity.addRelation(_ebc.mdcList, mdc.id)
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
): chainIdMapping {
    let _chainIdMapping = chainIdMapping.load(id)
    if (_chainIdMapping == null) {
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
): chainIdMappingSnapshot {
    let _chainIdMapping = chainIdMappingSnapshot.load(id)
    if (_chainIdMapping == null) {
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
        const latestMappingId = entity.createBindID([mdc.id, chainId.toString()])
        const snapshotMappingId = entity.createBindID([chainIdSnapshot.id, chainId.toString()])
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
): Dealer {
    let id = dealer
    let _dealer = Dealer.load(id)
    if (_dealer == null) {
        _dealer = new Dealer(id)
        _dealer.mdcs = []
        _dealer.rules = []
        _dealer.register = false
        _dealer.extraInfo = STRING_EMPTY
        _dealer.feeRatio = new BigInt(0)
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
): responseMaker {
    let id = responseMakerID
    let _responseMaker = responseMaker.load(id)
    if (_responseMaker == null) {
        _responseMaker = new responseMaker(id)
        _responseMaker.mdcs = []
        _responseMaker.mdcs = entity.addRelation(_responseMaker.mdcs, mdc.id)
        log.info('create new responseMaker, id: {}', [id])
        let factory = getFactoryEntity(mdc.factoryAddr, event)
        factory.responseMakers = entity.addRelation(factory.responseMakers, id)
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
): void {
    const id = entity.createHashID([mdc.id, entity.createEventID(event)])
    const inputdata = isProduction ? event.transaction.input : Bytes.fromHexString(functionrResponseMakerMockinput) as Bytes
    const enableTimestamp = decodeEnabletime(inputdata, func_updateResponseMakersName)
    let responseMakers = responseMakersMapping.load(id)
    if (responseMakers == null) {
        responseMakers = new responseMakersMapping(id)
        responseMakers.owner = mdc.owner
        responseMakers.responseMakerList = []
        mdc.responseMakersSnapshot = [responseMakers.id]
        responseMakers.enableTimestamp = enableTimestamp
        log.info('mdc: {} create new responseMakersMapping, id: {}', [mdc.id, id])
    }
    responseMakers.responseMakerList = responseMakersArray
    responseMakers.latestUpdateBlockNumber = event.block.number
    responseMakers.latestUpdateTimestamp = event.block.timestamp
    responseMakers.latestUpdateHash = event.transaction.hash.toHexString()
    responseMakers.save()

    for (let i = 0; i < responseMakersArray.length; i++) {
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
    chainInfo: chainRel,
    tokenId: string
): void {
    if (chainInfo.tokens == null) {
        chainInfo.tokens = [tokenId];
    } else if (!chainInfo.tokens.includes(tokenId)) {
        chainInfo.tokens = chainInfo.tokens.concat([tokenId])
    }
}

function saveRules2Rules(
    _rules: ruleRel,
    rule: rule
): void {
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
    } else if (!dealer.mdcs.includes(mdcId)) {
        dealer.mdcs = dealer.mdcs.concat([mdcId])
    }
}

function saveMDC2EBC(
    ebc: ebcRel,
    mdc: MDC
): void {
    if (ebc.mdcList == null) {
        ebc.mdcList = [mdc.id];
    } else if (!ebc.mdcList.includes(mdc.id)) {
        ebc.mdcList = ebc.mdcList.concat([mdc.id])
    }
}

function saveLatestRule2RuleSnapshot(
    ruleSnapshot: ruleRel,
    releLatestId: string
): void {
    if (ruleSnapshot.ruleLatest == null) {
        ruleSnapshot.ruleLatest = [releLatestId];
    } else if (!ruleSnapshot.ruleLatest.includes(releLatestId)) {
        ruleSnapshot.ruleLatest = ruleSnapshot.ruleLatest.concat([releLatestId])
    }
}

function saveLatestRule2MDCEBC(
    mdc: MDC,
    ebc: ebcRel,
    ruleLatestId: string
): void {
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
): void {
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
    rscType: rscRuleType[];
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
        this.rscType = rscRuleType.parse(rsc, mdcAddress, ebcAddress, version, selector);
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

    static validation(
        rsc: rscRuleType,
        mdc: MDC,
        ebcAddr: string
    ): string {
        // EBC validation
        const EBCArray = getMDCLatestEBCs(mdc)
        if (!EBCArray.includes(ebcAddr)) {
            log.warning("rule EBC not bind in mdc: {}, EBC: {}, length: {}", [mdc.id, ebcAddr, EBCArray.length.toString()])
            return RULEVALIDA_EBCNOTFOUND
        }

        // chainID validation
        const chain0 = rsc.chain0
        const chain1 = rsc.chain1
        if (chain0 >= chain1) {
            log.warning("chain0: {} >= chain1: {}", [chain0.toString(), chain1.toString()])
            return RULEVALIDA_CHAINIDMISSMATCH
        }
        const chainIds = getMDCLatestChainIds(mdc)
        if (!chainIds.includes(chain0) || !chainIds.includes(chain1)) {
            log.warning("chainId not bind in mdc: {}, chain0: {}, chain1: {}, length: {}", [mdc.id, chain0.toString(), chain1.toString(), chainIds.length.toString()])
            for (let i = 0; i < chainIds.length; i++) {
                log.warning("chainId bind in mdc: {}", [chainIds[i].toString()])
            }
            return RULEVALIDA_CHAINIDNOTFOUND
        }

        // token validation
        if (rsc.chain0Token != BigInt.fromI32(0)) {
            const chain0Token = padZeroToUint(rsc.chain0Token.toHexString())
            const chain0TokenArray = getTokenFromChainInfoUpdated(chain0)
            if (!chain0TokenArray.includes(chain0Token)) {
                log.warning("token not bind in chainInfoUpdated: {}, chain0: {}, length: {}", [mdc.id, chain0Token, chain0TokenArray.length.toString()])
                for (let i = 0; i < chain0TokenArray.length; i++) {
                    log.warning("token bind in chainInfoUpdated: {}", [chain0TokenArray[i]])
                }
                return RULEVALIDA_TOKENNOTFOUND
            }
        }

        if (rsc.chain1Token != BigInt.fromI32(0)) {
            const chain1Token = padZeroToUint(rsc.chain1Token.toHexString())
            const chain1TokenArray = getTokenFromChainInfoUpdated(chain1)
            if (!chain1TokenArray.includes(chain1Token)) {
                log.warning("token not bind in chainInfoUpdated: {}, chain1: {}, length: {}", [mdc.id, chain1Token, chain1TokenArray.length.toString()])
                for (let i = 0; i < chain1TokenArray.length; i++) {
                    log.warning("token bind in chainInfoUpdated: {}", [chain1TokenArray[i]])
                }
                return RULEVALIDA_TOKENNOTFOUND
            }
        }

        const chain0Status = rsc.chain0Status
        const chain1Status = rsc.chain1Status
        if (chain0Status == BigInt.fromI32(0) && chain1Status == BigInt.fromI32(0)) {
            log.info("maker {} shutdown service, chain: {} - {} ", [mdc.id, chain0.toString(), chain1.toString()])
            return RULEVALIDA_SERVICECLOSED
        }

        return RULEVALIDA_NOERROR
    }

    static init(): rscRuleType {
        let _rscRuleType = new rscRuleType(
            ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI,
            ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI,
            ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI,
            ZERO_BI, ZERO_BI, ZERO_BI, ZERO_BI,
            ZERO_BI, ZERO_BI, ZERO_BI, updateRulesRootMode.INV
        );
        return _rscRuleType
    }

    static isRscTupleUint(rscTuple: ethereum.Value): boolean {
        return rscTuple.kind == ethereum.ValueKind.UINT ? true : false
    }

    static parse(
        rsc: Array<ethereum.Value>,
        mdcAddress: string,
        ebcAddress: string,
        version: i32,
        selector: updateRulesRootMode
    ): rscRuleType[] {
        let rscRules: rscRuleType[] = [];
        for (let i = 0; i < rsc.length; i++) {
            let rscTuple = rsc[i].toTuple();
            let _rscRuleType = this.init()
            _rscRuleType.selector = selector
            if (this.isRscTupleUint(rscTuple[0])) {
                _rscRuleType.chain0 = rscTuple[0].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[1])) {
                _rscRuleType.chain1 = rscTuple[1].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[2])) {
                _rscRuleType.chain0Status = rscTuple[2].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[3])) {
                _rscRuleType.chain1Status = rscTuple[3].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[4])) {
                _rscRuleType.chain0Token = rscTuple[4].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[5])) {
                _rscRuleType.chain1Token = rscTuple[5].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[6])) {
                _rscRuleType.chain0minPrice = rscTuple[6].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[7])) {
                _rscRuleType.chain1minPrice = rscTuple[7].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[8])) {
                _rscRuleType.chain0maxPrice = rscTuple[8].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[9])) {
                _rscRuleType.chain1maxPrice = rscTuple[9].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[10])) {
                _rscRuleType.chain0WithholdingFee = rscTuple[10].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[11])) {
                _rscRuleType.chain1WithholdingFee = rscTuple[11].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[12])) {
                _rscRuleType.chain0TradeFee = rscTuple[12].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[13])) {
                _rscRuleType.chain1TradeFee = rscTuple[13].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[14])) {
                _rscRuleType.chain0ResponseTime = rscTuple[14].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[15])) {
                _rscRuleType.chain1ResponseTime = rscTuple[15].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[16])) {
                _rscRuleType.chain0CompensationRatio = rscTuple[16].toBigInt();
            }

            if (this.isRscTupleUint(rscTuple[17])) {
                _rscRuleType.chain1CompensationRatio = rscTuple[17].toBigInt();
            }

            // if (this.isRscTupleUint(rscTuple[18])) {
            //     _rscRuleType.enableTimestamp = rscTuple[18].toBigInt();
            // }

            _rscRuleType.verifyPass = true;
            rscRules.push(_rscRuleType);
        }
        return rscRules;
    }
}


export function parseChainInfoUpdatedInputData(
    data: Bytes,
    _chainInfoUpdated: chainRel
): void {
    let tuple = calldata.decode(data, func_updateChainSpvsName)

    if (debugLog) {
        for (let i = 0; i < tuple.length; i++) {
            log.debug("chainInfoUpdated kind[{}]:{}", [
                i.toString(),
                tuple[i].kind.toString()
            ])
        }
    }

    let id = ZERO_BI
    let spvs = new Array<Address>()
    let indexs = new Array<BigInt>()
    if (tuple[1].kind == ethereum.ValueKind.UINT) {
        id = tuple[1].toBigInt()
    }

    if (tuple[2].kind == ethereum.ValueKind.ARRAY) {
        spvs = tuple[2].toAddressArray()
    }
    if (tuple[3].kind == ethereum.ValueKind.ARRAY) {
        indexs = tuple[3].toBigIntArray()
    }

    if (debugLog) {
        log.debug("chainInfoUpdated id:{}, spv.length:{}, indexs.length:{}",
            [
                id.toString(),
                spvs.length.toString(),
                indexs.length.toString()
            ])
        // print spvs array
        for (let i = 0; i < spvs.length; i++) {
            log.debug("chainInfoUpdated spvs:[{}]{}", [
                i.toString(),
                spvs[i].toHexString(),
            ])
        }
        // print indexs array
        for (let i = 0; i < indexs.length; i++) {
            log.debug("chainInfoUpdated indexs[{}]:{}", [
                i.toString(),
                indexs[i].toString(),
            ])
        }
    }

    for (let i = 0; i < spvs.length; i++) {
        if (i < indexs.length) {
            let _spv = _chainInfoUpdated.spvs;
            if (indexs.length > 0) {
                let spvArray = new Array<string>()
                for (let i = 0; i < indexs.length; i++) {
                    let index = indexs[i].toI32();
                    if (_spv.length == 0) {
                        spvArray.push(spvs[i].toHexString());
                    } else {
                        if (index < _spv.length) {
                            spvArray.push(spvs[i].toHexString());
                        }
                    }
                }
                _chainInfoUpdated.spvs = _spv.slice(0, indexs[0].toI32()).concat(spvArray).concat(_spv.slice(indexs[indexs.length - 1].toI32() + 1));
            } else {
                let spvArray = new Array<string>()
                for (let i = 0; i < spvs.length; i++) {
                    spvArray.push(spvs[i].toHexString());
                }
                _chainInfoUpdated.spvs = _spv.concat(spvArray);
            }
            _chainInfoUpdated.save();
        } else {
            _chainInfoUpdated.spvs = _chainInfoUpdated.spvs.concat([spvs[i].toHexString()])
            _chainInfoUpdated.save()
        }
    }

    if (debugLog) {
        for (let i = 0; i < _chainInfoUpdated.spvs.length; i++) {
            log.debug("update new spv[{}/{}]:{}", [(i + 1).toString(), _chainInfoUpdated.spvs.length.toString(), _chainInfoUpdated.spvs[i]])
        }
    }
}

export function parseTransactionInputData(data: Bytes, mdcAddress: string): rscRules {
    let func = compareUpdateRulesRootSelector(calldata.getSelector(data))
    let selectorofFunc = "0x000000"
    if (func == updateRulesRootMode.ETH) {
        selectorofFunc = func_updateRulesRootName
    } else if (func == updateRulesRootMode.ERC20) {
        selectorofFunc = func_updateRulesRootERC20Name
    }
    let tuple = calldata.decode(data, selectorofFunc)
    if (debugLog) {
        for (let i = 0; i < tuple.length; i++) {
            log.debug("tuple[{}].kind:{}", [i.toString(), tuple[i].kind.toString()])
        }
    }

    let rsc = new Array<ethereum.Value>()
    let enableTimestamp = BigInt.fromI32(0)
    let ebcAddress = STRING_EMPTY
    let rootWithVersion = new ethereum.Tuple()
    let root = STRING_EMPTY
    let version = 0
    let sourceChainIds = new Array<BigInt>()
    let pledgeAmounts = new Array<BigInt>()
    let tokenAddress = STRING_EMPTY

    if (tuple[0].kind == ethereum.ValueKind.UINT) {
        enableTimestamp = tuple[0].toBigInt()
    }

    if (tuple[1].kind == ethereum.ValueKind.ADDRESS) {
        ebcAddress = tuple[1].toAddress().toHexString();
    }

    if (tuple[2].kind == ethereum.ValueKind.ARRAY) {
        rsc = tuple[2].toArray();
        if (debugLog) {
            for (let i = 0; i < rsc.length; i++) {
                log.debug("rsc[{}].kind:{}", [i.toString(), rsc[i].kind.toString()])
            }
        }
    }

    if (tuple[3].kind == ethereum.ValueKind.TUPLE) {
        rootWithVersion = tuple[3].toTuple();
        if (debugLog) {
            log.debug("rootWithVersion[0].kind: {}, rootWithVersion[1].kind: {}", [
                rootWithVersion[0].kind.toString(),
                rootWithVersion[1].kind.toString()])
        }
        if (rootWithVersion[0].kind == ethereum.ValueKind.BYTES ||
            rootWithVersion[0].kind == ethereum.ValueKind.FIXED_BYTES) {
            root = rootWithVersion[0].toBytes().toHexString();
        }
        if (rootWithVersion[1].kind == ethereum.ValueKind.UINT) {
            version = rootWithVersion[1].toI32();
        }
    }

    if (tuple[4].kind == ethereum.ValueKind.ARRAY) {
        sourceChainIds = tuple[4].toBigIntArray();
    }

    if (tuple[5].kind == ethereum.ValueKind.ARRAY) {
        pledgeAmounts = tuple[5].toBigIntArray();
    }

    if (selectorofFunc == func_updateRulesRootERC20Name) {
        if (tuple[6].kind == ethereum.ValueKind.ADDRESS) {
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

function getLastRulesEntity(
    id: string,
    root: string,
    _chainPairManager: chainPairManager,
    token0: tokenPairManager,
    token1: tokenPairManager
): latestRule {
    let lastRule = latestRule.load(id)
    if (lastRule == null) {
        lastRule = new latestRule(id)
        lastRule.owner = STRING_EMPTY
        lastRule.mdcAddr = STRING_EMPTY
        lastRule.ebcAddr = STRING_EMPTY
        lastRule.chain0 = BigInt.fromI32(0)
        lastRule.chain1 = BigInt.fromI32(0)
        lastRule.ruleValidation = true
        lastRule.ruleValidationErrorstatus = RULEVALIDA_NOERROR
        lastRule.ruleUpdateRel = []
        lastRule.root = root;
        _chainPairManager.latestRule = entity.addRelation(_chainPairManager.latestRule, id);
        _chainPairManager.save()
        token0.latestRule = entity.addRelation(token0.latestRule, id);
        token0.save()
        token1.latestRule = entity.addRelation(token1.latestRule, id);
        token1.save()
        log.info("create lastRule: {}", [id])
    }

    return lastRule
}


function getChainPairManager(
    id: string,
    event: ethereum.Event
): chainPairManager {
    let _chainPairManager = chainPairManager.load(id)
    if (_chainPairManager == null) {
        _chainPairManager = new chainPairManager(id)
        _chainPairManager.latestRule = []
        _chainPairManager.latestUpdateBlockNumber = event.block.number
        _chainPairManager.latestUpdateTimestamp = event.block.timestamp
        _chainPairManager.latestUpdateHash = event.transaction.hash.toHexString()
        log.info("create ChainPair: {}", [id])
    }
    return _chainPairManager as chainPairManager
}

function getTokenPairManager(
    id: string,
    event: ethereum.Event
): tokenPairManager {
    let _tokenPairManager = tokenPairManager.load(id)
    if (_tokenPairManager == null) {
        _tokenPairManager = new tokenPairManager(id)
        _tokenPairManager.latestRule = []
        _tokenPairManager.latestUpdateBlockNumber = event.block.number
        _tokenPairManager.latestUpdateTimestamp = event.block.timestamp
        _tokenPairManager.latestUpdateHash = event.transaction.hash.toHexString()
        log.info("create TokenPair: {}", [id])
    }
    return _tokenPairManager as tokenPairManager
}

function getruleUpdateVersionEntity(
    id: string,
    mdc: MDC,
    ebc: ebcRel,
    latestRule: latestRule,
    ruleRel: ruleRel,
    event: ethereum.Event
): ruleUpdateVersion {
    let rule = ruleUpdateRel.load(id)
    if (rule == null) {
        rule = new ruleUpdateRel(id)
        rule.latestVersion = BigInt.fromI32(0)
        rule.ruleUpdateVersion = []
        mdc.ruleUpdateRel = entity.addRelation(mdc.ruleUpdateRel, id)
        ebc.ruleUpdateRel = entity.addRelation(ebc.ruleUpdateRel, id)
        latestRule.ruleUpdateRel = entity.addRelation(latestRule.ruleUpdateRel, id)
    }
    rule.latestVersion = rule.latestVersion.plus(BigInt.fromI32(1))
    const _ruleUpdateVersion = getruleUpdateVersion(id, rule.latestVersion, event)
    rule.ruleUpdateVersion = entity.addRelation(rule.ruleUpdateVersion, _ruleUpdateVersion.id)
    ruleRel.ruleUpdateVersion = entity.addRelation(ruleRel.ruleUpdateVersion, _ruleUpdateVersion.id)
    rule.latestUpdateHash = event.transaction.hash.toHexString()
    rule.latestUpdateTimestamp = event.block.timestamp
    rule.latestUpdateBlockNumber = event.block.number
    rule.save()

    return _ruleUpdateVersion
}

function getruleUpdateVersion(
    _id: string,
    updateVersion: BigInt,
    event: ethereum.Event
): ruleUpdateVersion {
    const id = entity.createHashID([_id, updateVersion.toString()])
    let rule = ruleUpdateVersion.load(id)
    if (rule == null) {
        rule = new ruleUpdateVersion(id)
        rule.makerHash = _id
        rule.updateVersion = BigInt.fromI32(0)
        log.info("create ruleUpdateVersion: {}-{}, hash: {}", [id, updateVersion.toString(), _id])
    }
    rule.updateVersion = updateVersion
    rule.latestUpdateHash = event.transaction.hash.toHexString()
    rule.latestUpdateTimestamp = event.block.timestamp
    rule.latestUpdateBlockNumber = event.block.number
    return rule as ruleUpdateVersion
}

function getLastRulesSnapshotEntity(
    id: string
): latestRuleSnapshot {
    let lastRule = latestRuleSnapshot.load(id)
    if (lastRule == null) {
        lastRule = new latestRuleSnapshot(id)
        lastRule.owner = STRING_EMPTY
        lastRule.mdcAddr = STRING_EMPTY
        lastRule.ebcAddr = STRING_EMPTY
        lastRule.chain0 = BigInt.fromI32(0)
        lastRule.chain1 = BigInt.fromI32(0)
        lastRule.chain0Token = STRING_EMPTY
        lastRule.chain1Token = STRING_EMPTY
        lastRule.ruleValidation = true
        lastRule.ruleValidationErrorstatus = RULEVALIDA_NOERROR
        log.info("create new latestRuleSnapshot:{}", [id])
    }

    return lastRule
}

function getAllLatestRules(
    mdc: MDC,
    ebc: ebcRel
): string[] {
    let ruleIDs: string[] = [];
    if (mdc.ruleLatest != null) {
        for (let i = 0; i < mdc.ruleLatest.length; i++) {
            let rule = latestRule.load(mdc.ruleLatest[i]);
            if (rule != null) {
                ruleIDs.push(rule.id);
            }
        }
    }
    return ruleIDs;
}


function updateLatestRules(
    rsc: rscRuleType,
    event: ethereum.Event,
    rscRules: rscRules,
    mdc: MDC,
    ebc: ebcRel,
    validateResult: string,
    validateBool: boolean,
    snapshot: ruleRel
): string {
    const version = rscRules.version;
    const enableTimestamp = rscRules.enableTimestamp;
    let token0 = rsc.chain0Token;
    let token1 = rsc.chain1Token;

    let id = entity.createHashID([
        mdc.id,
        ebc.id,
        rsc.chain0.toString(),
        rsc.chain1.toString(),
        token0.toString(),
        token1.toString(),

    ]);

    const chain0TokenPad = padZeroToUint(rsc.chain0Token.toHexString());
    const chain1TokenPad = padZeroToUint(rsc.chain1Token.toHexString());

    let chainPairId = entity.createBindID([rsc.chain0.toString(), rsc.chain1.toString()]);
    const _ChainPairManager = getChainPairManager(chainPairId, event);
    const _TokenPairManager0 = getTokenPairManager(chain0TokenPad, event);
    const _TokenPairManager1 = getTokenPairManager(chain1TokenPad, event);
    const _rule = getLastRulesEntity(id, snapshot.root, _ChainPairManager, _TokenPairManager0, _TokenPairManager1);
    const _ruleUpdateVersion = getruleUpdateVersionEntity(id, mdc, ebc, _rule, snapshot, event);
    const latestRuleId = _rule.id;
    const _snapshotLatestRule = getLastRulesSnapshotEntity(entity.createHashID([snapshot.id, id]));
    _rule.latestSnapShotID = _snapshotLatestRule.id;
    const _rscRuleType = _rule;
    _rscRuleType.owner = mdc.owner;
    _rscRuleType.mdcAddr = mdc.id;
    _rscRuleType.ebcAddr = ebc.id;
    _rscRuleType.chain0 = rsc.chain0;
    _rscRuleType.chain1 = rsc.chain1;
    _rscRuleType.chain0Status = rsc.chain0Status.toI32();
    _rscRuleType.chain1Status = rsc.chain1Status.toI32();
    _rscRuleType.chain0Token = chain0TokenPad;
    _rscRuleType.chain1Token = chain1TokenPad;
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
    _rscRuleType.ruleValidation = validateBool;
    _rscRuleType.ruleValidationErrorstatus = validateResult;
    _rscRuleType.latestUpdateTimestamp = event.block.timestamp;
    _rscRuleType.latestUpdateBlockNumber = event.block.number;
    _rscRuleType.latestUpdateHash = event.transaction.hash.toHexString();
    _rscRuleType.latestUpdateVersion = version as i32;
    if (rsc.selector === updateRulesRootMode.ETH) {
        _rscRuleType.type = 'ETH';
        snapshot.type = 'ETH';
    } else if (rsc.selector === updateRulesRootMode.ERC20) {
        _rscRuleType.type = 'ERC20';
        snapshot.type = 'ERC20';
    }

    const _snapshotLatestRuleType = _snapshotLatestRule;
    _snapshotLatestRuleType.owner = mdc.owner;
    _snapshotLatestRuleType.mdcAddr = mdc.id;
    _snapshotLatestRuleType.ebcAddr = ebc.id;
    _snapshotLatestRuleType.chain0 = rsc.chain0;
    _snapshotLatestRuleType.chain1 = rsc.chain1;
    _snapshotLatestRuleType.chain0Status = rsc.chain0Status.toI32();
    _snapshotLatestRuleType.chain1Status = rsc.chain1Status.toI32();
    _snapshotLatestRuleType.chain0Token = chain0TokenPad;
    _snapshotLatestRuleType.chain1Token = chain1TokenPad;
    _snapshotLatestRuleType.chain0minPrice = rsc.chain0minPrice;
    _snapshotLatestRuleType.chain0maxPrice = rsc.chain0maxPrice;
    _snapshotLatestRuleType.chain1minPrice = rsc.chain1minPrice;
    _snapshotLatestRuleType.chain1maxPrice = rsc.chain1maxPrice;
    _snapshotLatestRuleType.chain0WithholdingFee = rsc.chain0WithholdingFee;
    _snapshotLatestRuleType.chain1WithholdingFee = rsc.chain1WithholdingFee;
    _snapshotLatestRuleType.chain0TradeFee = rsc.chain0TradeFee.toI32();
    _snapshotLatestRuleType.chain1TradeFee = rsc.chain1TradeFee.toI32();
    _snapshotLatestRuleType.chain0ResponseTime = rsc.chain0ResponseTime.toI32();
    _snapshotLatestRuleType.chain1ResponseTime = rsc.chain1ResponseTime.toI32();
    _snapshotLatestRuleType.chain0CompensationRatio = rsc.chain0CompensationRatio.toI32();
    _snapshotLatestRuleType.chain1CompensationRatio = rsc.chain1CompensationRatio.toI32();
    _snapshotLatestRuleType.enableTimestamp = enableTimestamp;
    _snapshotLatestRuleType.ruleValidation = validateBool;
    _snapshotLatestRuleType.ruleValidationErrorstatus = validateResult;
    _snapshotLatestRuleType.latestUpdateTimestamp = event.block.timestamp;
    _snapshotLatestRuleType.latestUpdateBlockNumber = event.block.number;
    _snapshotLatestRuleType.latestUpdateHash = event.transaction.hash.toHexString();
    _snapshotLatestRuleType.latestUpdateVersion = version as i32;
    if (rsc.selector === updateRulesRootMode.ETH) {
        _snapshotLatestRuleType.type = 'ETH';
    } else if (rsc.selector === updateRulesRootMode.ERC20) {
        _snapshotLatestRuleType.type = 'ERC20';
    }
    saveLatestRule2MDCEBC(mdc, ebc, _rule.id);
    saveLatestRule2RuleSnapshot(snapshot, _snapshotLatestRule.id);

    _rule.save()
    _snapshotLatestRule.save()
    if (debugLogCreateRules) {
        log.info("update latest rule id: {}", [id])
    }

    _ruleUpdateVersion.owner = mdc.owner;
    _ruleUpdateVersion.mdcAddr = mdc.id;
    _ruleUpdateVersion.ebcAddr = ebc.id;
    _ruleUpdateVersion.chain0 = rsc.chain0;
    _ruleUpdateVersion.chain1 = rsc.chain1;
    _ruleUpdateVersion.chain0Status = rsc.chain0Status.toI32();
    _ruleUpdateVersion.chain1Status = rsc.chain1Status.toI32();
    _ruleUpdateVersion.chain0Token = chain0TokenPad;
    _ruleUpdateVersion.chain1Token = chain1TokenPad;
    _ruleUpdateVersion.chain0minPrice = rsc.chain0minPrice;
    _ruleUpdateVersion.chain0maxPrice = rsc.chain0maxPrice;
    _ruleUpdateVersion.chain1minPrice = rsc.chain1minPrice;
    _ruleUpdateVersion.chain1maxPrice = rsc.chain1maxPrice;
    _ruleUpdateVersion.chain0WithholdingFee = rsc.chain0WithholdingFee;
    _ruleUpdateVersion.chain1WithholdingFee = rsc.chain1WithholdingFee;
    _ruleUpdateVersion.chain0TradeFee = rsc.chain0TradeFee.toI32();
    _ruleUpdateVersion.chain1TradeFee = rsc.chain1TradeFee.toI32();
    _ruleUpdateVersion.chain0ResponseTime = rsc.chain0ResponseTime.toI32();
    _ruleUpdateVersion.chain1ResponseTime = rsc.chain1ResponseTime.toI32();
    _ruleUpdateVersion.chain0CompensationRatio = rsc.chain0CompensationRatio.toI32();
    _ruleUpdateVersion.chain1CompensationRatio = rsc.chain1CompensationRatio.toI32();
    _ruleUpdateVersion.enableTimestamp = enableTimestamp;
    _ruleUpdateVersion.ruleValidation = validateBool;
    _ruleUpdateVersion.ruleValidationErrorstatus = validateResult;
    _ruleUpdateVersion.latestUpdateTimestamp = event.block.timestamp;
    _ruleUpdateVersion.latestUpdateBlockNumber = event.block.number;
    _ruleUpdateVersion.latestUpdateHash = event.transaction.hash.toHexString();
    _ruleUpdateVersion.latestUpdateVersion = version as i32;
    if (rsc.selector === updateRulesRootMode.ETH) {
        _ruleUpdateVersion.type = 'ETH';
    } else if (rsc.selector === updateRulesRootMode.ERC20) {
        _ruleUpdateVersion.type = 'ERC20';
    }
    _ruleUpdateVersion.save()

    return latestRuleId
}

function saveRuleSnapshotRelation(
    event: ethereum.Event,
    ruleSnapshot: ruleRel,
    mdc: MDC,
    ebc: ebcRel
): void {
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
    ebc: ebcRel
): ruleRel {
    const snapshotId = entity.createHashID([mdc.id, ebc.id, entity.createEventID(event)])
    let ruleSnapshot = ruleRel.load(snapshotId)
    if (ruleSnapshot == null) {
        ruleSnapshot = new ruleRel(snapshotId)
        ruleSnapshot.root = STRING_EMPTY
        ruleSnapshot.version = 0
        ruleSnapshot.rules = []
        ruleSnapshot.ruleUpdateVersion = []
        ruleSnapshot.sourceChainIds = []
        ruleSnapshot.pledgeAmounts = []
        ruleSnapshot.ruleLatest = []
        ruleSnapshot.token = STRING_EMPTY
        ruleSnapshot.type = STRING_EMPTY
        // log.debug("create ruleSnapshot id: {}", [snapshotId])
    }
    ruleSnapshot.latestUpdateBlockNumber = event.block.number
    ruleSnapshot.latestUpdateHash = event.transaction.hash.toHexString()
    ruleSnapshot.latestUpdateTimestamp = event.block.timestamp
    return ruleSnapshot
}



export function mdcStoreRuleSnapshot(
    event: ethereum.Event,
    updateRulesRootEntity: rscRules,
    mdc: MDC,
    ebc: ebcRel
): Array<string> {
    let lastestRuleIdArray = new Array<string>()
    let validateBool = true;
    let ruleSnapshot = getRuleSnapshotEntity(event, mdc, ebc)
    saveRuleSnapshotRelation(event, ruleSnapshot, mdc, ebc)
    ruleSnapshot.root = updateRulesRootEntity.root
    ruleSnapshot.version = updateRulesRootEntity.version
    ruleSnapshot.sourceChainIds = updateRulesRootEntity.sourceChainIds
    ruleSnapshot.pledgeAmounts = updateRulesRootEntity.pledgeAmounts
    ruleSnapshot.token = updateRulesRootEntity.tokenAddr
    // const EBCValidation = ruleValidationEBCSchema(updateRulesRootEntity.ebcAddress, mdc)
    if (updateRulesRootEntity.rscType.length > 0) {
        for (let i = 0; i < updateRulesRootEntity.rscType.length; i++) {
            let _rule = getRuleEntity(ruleSnapshot, i, mdc, ebc, event)
            const validateResult = rscRuleType.validation(updateRulesRootEntity.rscType[i], mdc, updateRulesRootEntity.ebcAddress)
            _rule.chain0 = updateRulesRootEntity.rscType[i].chain0
            _rule.chain1 = updateRulesRootEntity.rscType[i].chain1
            _rule.chain0Status = updateRulesRootEntity.rscType[i].chain0Status.toI32()
            _rule.chain1Status = updateRulesRootEntity.rscType[i].chain1Status.toI32()
            _rule.chain0Token = padZeroToUint(updateRulesRootEntity.rscType[i].chain0Token.toHexString())
            _rule.chain1Token = padZeroToUint(updateRulesRootEntity.rscType[i].chain1Token.toHexString())
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
            _rule.latestVersion = BigInt.fromI32(updateRulesRootEntity.version)
            _rule.transactionRuleIndex = i
            if (validateResult != RULEVALIDA_NOERROR) {
                _rule.ruleValidation = validateBool = false
                log.warning("rule validation failed, rule index: {}, error code: {}", [i.toString(), validateResult.toString()])
            } else {
                _rule.ruleValidation = validateBool = true
            }
            _rule.ruleValidationErrorstatus = validateResult
            _rule.save()
            lastestRuleIdArray = entity.addRelation(lastestRuleIdArray, updateLatestRules(
                updateRulesRootEntity.rscType[i],
                event,
                updateRulesRootEntity,
                mdc,
                ebc,
                validateResult,
                validateBool,
                ruleSnapshot
            ))
            if (debugLogCreateRules) {
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
    return lastestRuleIdArray
}

export function fullfillLatestRuleSnapshot(
    event: ethereum.Event,
    mdc: MDC,
    ebc: ebcRel,
    RuleThisRoundArray: string[]
): void {
    const currentRuleIdArray: Array<string> = getAllLatestRules(mdc, ebc)
    const misArray: string[] = findDifferentData(RuleThisRoundArray, currentRuleIdArray)
    let ruleSnapshot = getRuleSnapshotEntity(event, mdc, ebc)
    for (let i = 0; i < misArray.length; i++) {
        log.debug("misArray: {}", [misArray[i]])
        let lastRule = latestRule.load(misArray[i])
        if (lastRule != null) {
            saveLatestRule2RuleSnapshot(ruleSnapshot, lastRule.latestSnapShotID);
        }
    }
    if (misArray.length > 0) {
        ruleSnapshot.save()
    }
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
    let tuple = calldata.decode(inputData, type)
    if (debugLogMapping) {
        for (let i = 0; i < tuple.length; i++) {
            log.debug("tuple[{}].kind:{}", [i.toString(), tuple[i].kind.toString()])
        }
    }

    let enableTimestamp: BigInt = BigInt.fromI32(0)
    if (tuple[0].kind == ethereum.ValueKind.UINT) {
        enableTimestamp = tuple[0].toBigInt()
    }
    return enableTimestamp
}

export function handleDealerUpdatedEvent(
    dealer: Address,
    feeRatio: BigInt,
    extraInfo: Bytes,
    event: ethereum.Event
): void {
    let dealerEntity = getDealerEntity(dealer.toHexString(), event)
    dealerEntity.feeRatio = feeRatio
    dealerEntity.extraInfo = extraInfo.toHexString()
    dealerEntity.register = true
    dealerEntity.save()
}


function getWithdraw(
    event: ethereum.Event
): Withdraw {
    let id = entity.createHashID([event.transaction.hash.toString(), event.logIndex.toString()])
    let withdraw = Withdraw.load(id)
    if (withdraw == null) {
        withdraw = new Withdraw(id)
        log.info("create feeManager withdraw log: {}", [id])
        withdraw.blockTimestamp = event.block.timestamp
        withdraw.blockNumber = event.block.number
        withdraw.transactionHash = event.transaction.hash.toHexString()
    }
    return withdraw as Withdraw
}

export function handleWithdrawEvent(
    user: Address,
    chainId: BigInt,
    token: Address,
    debt: BigInt,
    amount: BigInt,
    event: ethereum.Event
): void {
    let withdraw = getWithdraw(event)
    withdraw.user = user
    withdraw.chainId = chainId
    withdraw.token = token
    withdraw.debt = debt
    withdraw.amount = amount
    withdraw.save()
}