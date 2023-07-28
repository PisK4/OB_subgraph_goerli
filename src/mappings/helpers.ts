import { 
    BigInt, 
    BigDecimal, 
    Bytes, 
    log, 
    EthereumUtils, 
    ethereum, 
    Address, 
    ByteArray, 
    crypto 
} from '@graphprotocol/graph-ts'
import { 
    ChainInfoUpdated,
    ChainTokenEBCManager,
    ChainTokenUpdated,
    ColumnArrayUpdated,
    EBC, 
    EBCManager, 
    MDC, 
    MDCBindEBC,
    MDCBindSPV,
    rule,
    ruleTypes
} from '../types/schema'
import { 
    MDC as mdcContract
} from "../types/templates/MDC/MDC"

export const isProduction = false
export const debugLog = false

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)
export const ONE_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
export const ONE_NUM = 0xffffffff
export const tupleprefix = "0x0000000000000000000000000000000000000000000000000000000000000020"
export const ONE_BYTES = new Bytes(32);
// function selectors
export const func_updateRulesRoot =  "0x0abba903"//"0x5266dbda"
export const func_updateRulesRootERC20 = "0x0e9601ae"//"0x16d38f5d"
export const func_registerChains ="0xba6051a5"
export const func_updateChainSpvs = "0xf0373f91"
// function selectors for decode
export const func_updateRulesRootSelector = "(address,bytes,(bytes32,uint32),uint64[],uint256[])"//"(address,bytes,(bytes32,uint32),uint16[],uint256[])"
export const func_updateRulesRootERC20Selector = "(address,bytes,(bytes32,uint32),uint64[],uint256[],address)"//"(address,bytes,(bytes32,uint32),uint16[],uint256[],address)"
export const func_updateChainSpvsSelector = "(uint64,address[],uint[])"
export const RSCDataFmt ="(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint128,uint128,uint16,uint16,uint32,uint32,uint32,uint32)[]"

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
// define the ManagersIDs
export const EBCManagerID = "EBCManagerID_101" as string
export const superMangerID = "superMangerID_101" as string

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

export function getBindEbcId(mcdAddress: Address, ebcAddress: Address): string{
    // id = "mcdAddress - ebcAddress "
    // log.debug('id: {}', [mcdAddress.toHexString() + "-" + ebcAddress.toHexString()])
    return mcdAddress.toHexString() + "-" + ebcAddress.toHexString()
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
    let ebc = EBC.load(ebcId)
    if (ebc == null) {
        log.info('create new EBC, ebc: {}, status: {}', [ebcId, status.toString()])
        ebc = new EBC(ebcId)
        ebc.mdcList = []
    }    
    ebc.statuses = status
    ebc.lastestUpdatetransactionHash = event.transaction.hash
    
    let _EBCManager = EBCManager.load(EBCManagerID)
    if(_EBCManager == null){
        _EBCManager = new EBCManager(EBCManagerID)
        _EBCManager.ebcCounts = BigInt.fromI32(0)
        _EBCManager.ebcs = []
        _EBCManager.lastestUpdateHash = event.transaction.hash
        _EBCManager.lastestUpdateBlockNumber = event.block.number
        _EBCManager.lastestUpdateTimestamp = event.block.timestamp  
        
        let superManager = ChainTokenEBCManager.load(superMangerID)
    }
    if(!_EBCManager.ebcs.includes(ebcId)){
        _EBCManager.ebcCounts = _EBCManager.ebcCounts.plus(ONE_BI)  
        if (_EBCManager.ebcs == null) {
            _EBCManager.ebcs = [ebcId];
        } else {
            _EBCManager.ebcs = _EBCManager.ebcs.concat([ebcId])
        }   
        _EBCManager.lastestUpdateHash = event.transaction.hash
        _EBCManager.lastestUpdateBlockNumber = event.block.number
        _EBCManager.lastestUpdateTimestamp = event.block.timestamp    
    }
    ebc.save()
    _EBCManager.save() 
}

export function ebcSave(
    MDCBindEBC: MDCBindEBC,
    mdc: MDC,
    event: ethereum.Event
): void {
    
    const ebcId = getEBCId(MDCBindEBC.id)
    let ebc = EBC.load(ebcId)
    if (ebc == null) {
        log.warning('create EBC in runtime, check if EBCManager is updated, ebc: {}', [ebcId])
        ebc = new EBC(ebcId)
        ebc.statuses = true
        ebc.mdcList = []
    }
    ebc.lastestUpdatetransactionHash = event.transaction.hash
    saveMDC2EBC(ebc, mdc)
    ebc.save()
    // ebcManagerUpdate(Address.fromString(ebcId), event)
    MDCBindEBC.save()
}

export function initRulesEntity(
    _rules: ruleTypes
): void {
    _rules.root = getONEBytes()
    _rules.version = 0
    _rules.pledgeAmounts = []
    _rules.sourceChainIds = []
    _rules.token = Address.fromHexString(ONE_ADDRESS)
}

export function initRuleEntity(
    _rules: rule
): void {
    _rules.chain0 = ZERO_BI
    _rules.chain1 = ZERO_BI
    _rules.chain0Status = ZERO_BI.toI32()
    _rules.chain1Status = ZERO_BI.toI32()
    _rules.chain0Token = Address.fromHexString(ONE_ADDRESS)
    _rules.chain1Token = Address.fromHexString(ONE_ADDRESS)
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
}

export function getRulesEntity(
    ebc: MDCBindEBC,
    version: BigInt
): ruleTypes {
    let id = ebc.id + "-" + version.toString()
    let rule = ruleTypes.load(id)
    if (rule == null) {
        rule = new ruleTypes(id)
        rule.rules = []
        initRulesEntity(rule)
        saveRule2EBC(ebc, rule)
        log.info('create new rules, rules: {}', [rule.id])
    }
    return rule as ruleTypes
}

export function getRuleEntity(
    _rules: ruleTypes,
    i: i32
):rule {
    let _rule = rule.load(_rules.id + "-" + i.toString())
    if(_rule == null){
        _rule = new rule(_rules.id + "-" + i.toString())
        initRuleEntity(_rule)
        saveRules2Rules(_rules, _rule)
        log.info('create new rule, rule: {}', [_rule.id])
    }
    
    return _rule as rule
}

export function getMDCEntity(
    mdcAddress: Address,
    maker: Address,
    event: ethereum.Event
): MDC {
    let mdc = MDC.load(mdcAddress.toHexString())
    if (mdc == null) {
        log.info('create new MDC, maker: {}, mdc: {}', [maker.toHexString(), mdcAddress.toHexString()])
        mdc = new MDC(mdcAddress.toHexString())
        mdc.owner = maker
        mdc.columnArrayUpdated = []
        mdc.bindEBCs = []
        mdc.bindSPVs = []
        mdc.createblockNumber = event.block.number
        mdc.createblockTimestamp = event.block.timestamp
        mdc.lastestUpdatetransactionHash = mdc.createtransactionHash = event.transaction.hash        
    }
    mdc.lastestUpdatetransactionHash = event.transaction.hash
    return mdc as MDC
}

export function getEBCEntity(
    // mdcAddress: Address,
    mdc: MDC,
    ebcAddress: Address,
    event: ethereum.Event
): MDCBindEBC {
    const mdcAddress = Address.fromString(mdc.id)
    const bindID = getBindEbcId(mdcAddress, ebcAddress)
    let _MDCBindEBC = MDCBindEBC.load(bindID)
    if(_MDCBindEBC == null){
        _MDCBindEBC = new MDCBindEBC(bindID)
        _MDCBindEBC.ebc = ebcAddress
        _MDCBindEBC.rulesWithRootVersion = []
        log.info('create new MDCBindEBC, mdc: {}, ebcid: {}', 
            [mdcAddress.toHexString(),
            _MDCBindEBC.ebc.toHexString()]
        )
    }
    _MDCBindEBC.lastestUpdateHash = event.transaction.hash
    _MDCBindEBC.lastestUpdateBlockNumber = event.block.number
    _MDCBindEBC.lastestUpdateTimestamp = event.block.timestamp
    saveBindEBC2MDC(mdc, bindID)    
    return _MDCBindEBC as MDCBindEBC
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
        _chainInfo.spv = []
    }
    _chainInfo.lastestUpdateHash = event.transaction.hash
    _chainInfo.lastestUpdateBlockNumber = event.block.number
    _chainInfo.lastestUpdateTimestamp = event.block.timestamp
    return _chainInfo as ChainInfoUpdated
}

export function encode(values: Array<ethereum.Value>): Bytes {
    return ethereum.encode(
        // forcefully cast Value[] -> Tuple
        ethereum.Value.fromTuple(changetype<ethereum.Tuple>(values))
    )!;
}

function calChainTokkenId(
    chainId: BigInt,
    token: BigInt
): string {
    const tupleValue: Array<ethereum.Value> = [
        ethereum.Value.fromUnsignedBigInt(chainId),
        ethereum.Value.fromUnsignedBigInt(token)
    ]
    const encodeData = encode(tupleValue)
    const key = crypto.keccak256(encodeData);
    return key.toHexString();
}

export function getChainTokenUpdatedEntity(
    id: BigInt,
    token: BigInt
): ChainTokenUpdated {
    const key = calChainTokkenId(id, token)
    let _chainTokenUpdated = ChainTokenUpdated.load(key)
    if (_chainTokenUpdated == null) {
        log.info('create new ChainTokenUpdated, id: {}', [key])
        _chainTokenUpdated = new ChainTokenUpdated(key)
    }

    return _chainTokenUpdated as ChainTokenUpdated
}

export function getColumnArrayUpdatedEntity(
    event: ethereum.Event,
    mdc: MDC
): ColumnArrayUpdated {
    let _columnArrayUpdated = ColumnArrayUpdated.load(createEventID(event))
    if (_columnArrayUpdated == null) {
        log.info('create new ColumnArrayUpdated, id: {}', [createEventID(event)])
        _columnArrayUpdated = new ColumnArrayUpdated(createEventID(event))
        _columnArrayUpdated.blockNumber = event.block.number
        _columnArrayUpdated.blockTimestamp = event.block.timestamp
        _columnArrayUpdated.transactionHash = event.transaction.hash
        saveColumnArray2MDC(mdc, _columnArrayUpdated)
    }

    return _columnArrayUpdated as ColumnArrayUpdated
}

export function getMDCBindEBCEntity(
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

function saveBindEBC2MDC(
    mdc : MDC,
    ebc_id : string,
) : void{
    if (mdc.bindEBCs == null) {
        mdc.bindEBCs = [ebc_id]
    } else if(!mdc.bindEBCs.includes(ebc_id)){
        mdc.bindEBCs = mdc.bindEBCs.concat([ebc_id])
    }  
}

function saveMDC2EBC(
    ebc: EBC, 
    mdc: MDC
): void {
    if (ebc.mdcList == null) {
        ebc.mdcList = [mdc.id];
    } else if (!ebc.mdcList.includes(mdc.id)) {
        ebc.mdcList = ebc.mdcList.concat([mdc.id])
    }
}

function saveRule2EBC(
    ebc: MDCBindEBC,
    rule: ruleTypes
): void{
    if (ebc.rulesWithRootVersion == null) {
        ebc.rulesWithRootVersion = [rule.id];
    } else if (!ebc.rulesWithRootVersion.includes(rule.id)) {
        ebc.rulesWithRootVersion = ebc.rulesWithRootVersion.concat([rule.id])
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
    ebcAddress: Bytes;
    rsc: Bytes;
    rscType : rscRuleType[];
    root: Bytes;
    version: i32;
    sourceChainIds: Array<BigInt>;
    pledgeAmounts: Array<BigInt>;
    tokenAddr: Bytes;
    constructor(
        mdcAddress: string,
        ebcAddress: Bytes,
        rsc: Bytes,
        root: Bytes,
        version: i32,
        sourceChainIds: Array<BigInt>,
        pledgeAmounts: Array<BigInt>,
        tokenAddress: Bytes
    ) {
        this.ebcAddress = ebcAddress;
        this.rsc = rsc;
        this.rscType = parseRSC(rsc, mdcAddress, ebcAddress, version);
        this.root = root;
        this.version = version;
        this.sourceChainIds = sourceChainIds;
        this.pledgeAmounts = pledgeAmounts;
        this.tokenAddr = tokenAddress
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
        chain1CompensationRatio: BigInt
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
        this.verifyPass = false;
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
        ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI
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
                    BigInt.fromUnsignedBytes(lastVersionRule.chain0Token),
                    BigInt.fromUnsignedBytes(lastVersionRule.chain1Token),
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
                    BigInt.fromI32(lastVersionRule.chain1CompensationRatio)
                )
            )
        }
    }else{
        return setInitRuleType()
    }
    
}

export function parseRSC(
    rsc: Bytes,
    mdcAddress: string,
    ebcAddress: Bytes,
    version: i32
): rscRuleType[] {
  let rscDecode = ethereum.decode(RSCDataFmt, rsc) as ethereum.Value;
  if (!rscDecode) {
    log.error("Failed to decode transaction input data", ["error"])
  }
  let rscArray = rscDecode.toArray();
//   log.debug("rscArray length: {}", [rscArray.length.toString()])

  let rscRules: rscRuleType[] = [];

  for (let i = 0; i < rscArray.length; i++) {
    let rscTuple = rscArray[i].toTuple();
    let _rscRuleType = getLastRules(mdcAddress, ebcAddress, version, i)

    if (checkRulesFormat(rscTuple)) {
        if (checkifRSCRuleTypeExist(rscTuple[0].toBigInt())) {
            _rscRuleType.chain0 = rscTuple[0].toBigInt();
        }
        if (checkifRSCRuleTypeExist(rscTuple[1].toBigInt())) {
            _rscRuleType.chain1 = rscTuple[1].toBigInt();
        }
        // if (checkifRSCRuleTypeExist(rscTuple[2].toBigInt())) {
            _rscRuleType.chain0Status = rscTuple[2].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[3].toBigInt())) {
            _rscRuleType.chain1Status = rscTuple[3].toBigInt();
        // }
        if (checkifRSCRuleTypeExist(rscTuple[4].toBigInt())) {
            _rscRuleType.chain0Token = rscTuple[4].toBigInt();
        }
        if (checkifRSCRuleTypeExist(rscTuple[5].toBigInt())) {
            _rscRuleType.chain1Token = rscTuple[5].toBigInt();
        }
        // if (checkifRSCRuleTypeExist(rscTuple[6].toBigInt())) {
            _rscRuleType.chain0minPrice = rscTuple[6].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[7].toBigInt())) {
            _rscRuleType.chain0maxPrice = rscTuple[7].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[8].toBigInt())) {
            _rscRuleType.chain1minPrice = rscTuple[8].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[9].toBigInt())) {
            _rscRuleType.chain1maxPrice = rscTuple[9].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[10].toBigInt())) {
            _rscRuleType.chain0WithholdingFee = rscTuple[10].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[11].toBigInt())) {
            _rscRuleType.chain1WithholdingFee = rscTuple[11].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[12].toBigInt())) {
            _rscRuleType.chain0TradeFee = rscTuple[12].toBigInt();
        // }
        // if (checkifRSCRuleTypeExist(rscTuple[13].toBigInt())) {
            _rscRuleType.chain1TradeFee = rscTuple[13].toBigInt();
        // }
        if (checkifRSCRuleTypeExist(rscTuple[14].toBigInt())) {
            _rscRuleType.chain0ResponseTime = rscTuple[14].toBigInt();
        }
        if (checkifRSCRuleTypeExist(rscTuple[15].toBigInt())) {
            _rscRuleType.chain1ResponseTime = rscTuple[15].toBigInt();
        }
        if (checkifRSCRuleTypeExist(rscTuple[16].toBigInt())) {
            _rscRuleType.chain0CompensationRatio = rscTuple[16].toBigInt();
        }
        if (checkifRSCRuleTypeExist(rscTuple[17].toBigInt())) {
            _rscRuleType.chain1CompensationRatio = rscTuple[17].toBigInt();
        }
        _rscRuleType.verifyPass = true;
    }
    rscRules.push(_rscRuleType);
  }

  return rscRules;
}

export function inputdataPrefix(data: Bytes): Bytes {
    const dataWithoutSelector = Bytes.fromUint8Array(data.slice(4,data.length))
    const Prefix = ByteArray.fromHexString(tupleprefix);
    const functionInputAsTuple = new Uint8Array(
        Prefix.length + dataWithoutSelector.length
    );
    functionInputAsTuple.set(Prefix, 0);
    functionInputAsTuple.set(dataWithoutSelector, Prefix.length);
    if (functionInputAsTuple.length < 32) {
        log.error("Failed to decode transaction input data", ["error"])
    }
    const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
    return tupleInputBytes
}


export function parseChainInfoUpdatedInputData(
    data: Bytes,
    _chainInfoUpdated: ChainInfoUpdated
): void {
    let dataUnderPrefix = inputdataPrefix(data)
    const decoded = ethereum.decode(
        func_updateChainSpvsSelector,
        dataUnderPrefix
    ) as ethereum.Value;
    if (!decoded) {
        log.error("Failed to decode transaction input data", ["error"])
    }
    let tuple = decoded.toTuple();

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

    log.debug("chainInfoUpdated id:{}, spv.length:{}, indexs.length:{}", 
    [
        id.toString(),
        spvs.length.toString(),
        indexs.length.toString()
    ])
    if(debugLog){
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
            let _spv = _chainInfoUpdated.spv;
            if (indexs.length > 0) {
                let spvBytes: Bytes[] = [];
                for (let i = 0; i < indexs.length; i++) {
                    let index = indexs[i].toI32();
                    if(_spv.length == 0){
                        spvBytes.push(Bytes.fromHexString(spvs[i].toHexString()));
                    }else{
                        if (index < _spv.length) {
                            spvBytes.push(Bytes.fromHexString(spvs[i].toHexString()));
                        }
                    }
                }
                _chainInfoUpdated.spv = _spv.slice(0, indexs[0].toI32()).concat(spvBytes).concat(_spv.slice(indexs[indexs.length - 1].toI32() + 1));
            } else {
                let spvBytes: Bytes[] = [];
                for (let i = 0; i < spvs.length; i++) {
                    spvBytes.push(Address.fromHexString(AddressFmtPadZero(spvs[i].toHexString())) as Bytes);
                }
                _chainInfoUpdated.spv = _spv.concat(spvBytes);
            }
            _chainInfoUpdated.save();
        }else{
            _chainInfoUpdated.spv = _chainInfoUpdated.spv.concat([Bytes.fromHexString(spvs[i].toHexString())])
            _chainInfoUpdated.save()
        }
    }

    if(debugLog){
        for(let i = 0; i < _chainInfoUpdated.spv.length; i++){
            log.debug("update new spv[{}/{}]:{}", [(i+1).toString(),_chainInfoUpdated.spv.length.toString(), _chainInfoUpdated.spv[i].toHexString()])
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

    const tupleInputBytes = inputdataPrefix(data)

    if (tupleInputBytes.length < 32) {
        log.error("Failed to decode transaction input data", ["error"])
    }

    let decoded = ethereum.decode(
        selectorofFunc,
        tupleInputBytes
    ) as ethereum.Value;
    if (!decoded) {
        log.error("Failed to decode transaction input data", ["error"])
    }
    let tuple = decoded.toTuple();

    if (debugLog){
      if(func == updateRulesRootMode.ERC20) {
          log.debug("rules kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}, kind[5]:{}", [
              tuple[0].kind.toString(),
              tuple[1].kind.toString(),
              tuple[2].kind.toString(),
              tuple[3].kind.toString(),
              tuple[4].kind.toString(),
              tuple[5].kind.toString(),
          ])
      }else{
          log.debug("rules kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}", [
              tuple[0].kind.toString(),
              tuple[1].kind.toString(),
              tuple[2].kind.toString(),
              tuple[3].kind.toString(),
              tuple[4].kind.toString()
          ])
      }
    }

    let rsc = Bytes.fromI32(0)
    let ebcAddress = Address.fromI32(0);
    let rootWithVersion = new ethereum.Tuple()
    let root = getONEBytes()
    let version = 0
    let sourceChainIds = new Array<BigInt>()
    let pledgeAmounts = new Array<BigInt>()
    let tokenAddress = Address.fromI32(0)

    if(tuple[0].kind == ethereum.ValueKind.ADDRESS) {
        ebcAddress = tuple[0].toAddress();
    }

    if(tuple[1].kind == ethereum.ValueKind.BYTES) {
        rsc = tuple[1].toBytes();
    }    

    if(tuple[2].kind == ethereum.ValueKind.TUPLE){
        rootWithVersion = tuple[2].toTuple();
        if(debugLog){
            log.debug("rootWithVersion[0].kind: {}, rootWithVersion[1].kind: {}", [
                rootWithVersion[0].kind.toString(),
                rootWithVersion[1].kind.toString()])
        }
        if(rootWithVersion[0].kind == ethereum.ValueKind.BYTES ||
            rootWithVersion[0].kind == ethereum.ValueKind.FIXED_BYTES) {
            root = rootWithVersion[0].toBytes();
        }
        if(rootWithVersion[1].kind == ethereum.ValueKind.UINT){
            version = rootWithVersion[1].toI32();
        }
    }

    if(tuple[3].kind == ethereum.ValueKind.ARRAY) {
        sourceChainIds = tuple[3].toBigIntArray();
    }
    
    if(tuple[4].kind == ethereum.ValueKind.ARRAY){
        pledgeAmounts = tuple[4].toBigIntArray();   
    }

    if(selectorofFunc == func_updateRulesRootERC20Selector) {
        if(tuple[5].kind == ethereum.ValueKind.ADDRESS) {
            tokenAddress = tuple[5].toAddress();
        }
    }

    let updateRulesRootEntity = new rscRules(
        mdcAddress,
        ebcAddress,
        rsc,
        root,
        version,
        sourceChainIds,
        pledgeAmounts,
        tokenAddress
    )

    return updateRulesRootEntity
}

export function AddressFmtPadZero(address: string): string {
    if (address.length % 2 != 0) {
        address = "0" + address;
    }    
    return address
}

export function updateRuleTypesThenSave(
    updateRulesRootEntity: rscRules,
    _rules: ruleTypes,
    root: Bytes,
    version: BigInt,
): boolean {
    _rules.root = updateRulesRootEntity.root
    // check if version is same
    if(version.equals(BigInt.fromI32(updateRulesRootEntity.version))){
        _rules.version = updateRulesRootEntity.version
    }else{
        log.error('version not match, input version: {}, decoded version: {}', [version.toString(), updateRulesRootEntity.version.toString()])
        return false
    }

    if(root == updateRulesRootEntity.root){
        _rules.root = updateRulesRootEntity.root
    }else{
        log.error('root not match, input root: {}, decoded root: {}', [root.toHexString(), updateRulesRootEntity.root.toHexString()])
        return false
    }

    if(updateRulesRootEntity.rscType.length > 0){
        for(let i = 0; i < updateRulesRootEntity.rscType.length; i++){
            let _rule = getRuleEntity(_rules, i)          
            _rule.chain0 = updateRulesRootEntity.rscType[i].chain0
            _rule.chain1 = updateRulesRootEntity.rscType[i].chain1
            _rule.chain0Status = updateRulesRootEntity.rscType[i].chain0Status.toI32()
            _rule.chain1Status = updateRulesRootEntity.rscType[i].chain1Status.toI32()    
            _rule.chain0Token = Address.fromHexString(AddressFmtPadZero(updateRulesRootEntity.rscType[i].chain0Token.toHexString()))
            _rule.chain1Token = Address.fromHexString(AddressFmtPadZero(updateRulesRootEntity.rscType[i].chain1Token.toHexString()))
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
            _rule.save()

            if(debugLog){
                log.info('Rule index{}, update[0]:{}, [1]:{}, [2]:{}, [3]:{}, [4]:{}, [5]:{}, [6]:{}, [7]:{}, [8]:{}, [9]:{}, [10]:{}, [11]:{}, [12]:{}, [13]:{}, [14]:{}, [15]:{}, [16]:{}, [17]:{}', [
                    i.toString(),
                    _rule.chain0.toString(),
                    _rule.chain1.toString(),
                    _rule.chain0Status.toString(),
                    _rule.chain1Status.toString(),
                    _rule.chain0Token.toHexString(),
                    _rule.chain1Token.toHexString(),
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
                    _rule.chain1CompensationRatio.toString()
                ])
            }
        }           
    }
    return true
}

/**
 * @param {Array<Address>} ebcs
 * @returns {Array<Address>} uniqueEbcs
 */
export function removeDuplicates(ebcs: Array<Address>): Array<Address> {
    const uniqueEbcs = new Array<Address>();
    for (let i = 0; i < ebcs.length; i++) {
      let isDuplicate = false;
      for (let j = 0; j < uniqueEbcs.length; j++) {
        if (ebcs[i].equals(uniqueEbcs[j])) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueEbcs.push(ebcs[i]);
      }
    }
  
    // for(let i = 0; i < uniqueEbcs.length; i++){
    //   log.debug('ebcs: {}', [uniqueEbcs[i].toHexString()])
    // } 
  
    return uniqueEbcs;
  }

  
export function getFunctionSelector(data: Bytes): Bytes {
    let _data = data.toHexString().slice(2, 10);
    log.debug("selector: {}", [_data])
    return Bytes.fromHexString(_data);
}

export function compareUpdateRulesRootSelector(selector: Bytes): updateRulesRootMode {
    return selector == Bytes.fromHexString(func_updateRulesRoot) ? updateRulesRootMode.ETH : selector == Bytes.fromHexString(func_updateRulesRootERC20) ? updateRulesRootMode.ERC20 : updateRulesRootMode.INV
}

export function compareChainInfoUpdatedSelector(selector: Bytes): ChainInfoUpdatedMode {
    return selector == Bytes.fromHexString(func_registerChains) ? ChainInfoUpdatedMode.registerChains : selector == Bytes.fromHexString(func_updateChainSpvs) ? ChainInfoUpdatedMode.updateChainSpvs : ChainInfoUpdatedMode.INV
}

export function createEventID(
    event: ethereum.Event
): string {
    return (
        event.transaction.hash.toHexString() +
        "-" +
        event.logIndex.toString()
    );
}