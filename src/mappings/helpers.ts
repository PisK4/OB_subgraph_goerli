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
    EBC, 
    EBCManager, 
    MDC, 
    MDCBindEBC,
    ruleTypes
} from '../types/schema'
import { 
    MDC as mdcContract
} from "../types/templates/MDC/MDC"

export const isProduction = false
export const debugLog = false

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)
export const ONE_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
export const ONE_NUM = 0xffffffff
export const tupleprefix = "0x0000000000000000000000000000000000000000000000000000000000000020"
export const ONE_BYTES = new Bytes(32);
export const func_updateRulesRoot =  "0x0abba903"//"0x5266dbda"
export const func_updateRulesRootERC20 = "0x0e9601ae"//"0x16d38f5d"
export const func_updateRulesRootSelector = "(address,bytes,(bytes32,uint32),uint64[],uint256[])"//"(address,bytes,(bytes32,uint32),uint16[],uint256[])"
export const func_updateRulesRootERC20Selector = "(address,bytes,(bytes32,uint32),uint64[],uint256[],address)"//"(address,bytes,(bytes32,uint32),uint16[],uint256[],address)"
// export const RSCDataFmt ="(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint128,uint128,uint16,uint16,uint32,uint32,uint32,uint32)"
export const RSCDataFmt ="(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint128,uint128,uint16,uint16,uint32,uint32,uint32,uint32)[]"
export enum updateRulesRootMode {
    ETH = 0,
    ERC20 = 1,
    INV = 2,
}
export const EBCManagerID = "EBCManagerID_101" as string

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

export function initRuleEntity(
    _rules: ruleTypes
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
    _rules.root = getONEBytes()
    _rules.version = 0
}

export function getRuleEntity(
    ebc: MDCBindEBC,
): ruleTypes {
    let rule = ruleTypes.load(ebc.id)
    if (rule == null) {
        rule = new ruleTypes(ebc.id)
        initRuleEntity(rule)
        saveRule2EBC(ebc, rule)
    }

    return rule as ruleTypes

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
        // mdc.ebc = []
        mdc.bindEBC = []
        mdc.createblockNumber = event.block.number
        mdc.createblockTimestamp = event.block.timestamp
        mdc.lastestUpdatetransactionHash = mdc.createtransactionHash = event.transaction.hash        
    }
    return mdc as MDC
}

export function ebcSave(
    MDCBindEBC: MDCBindEBC,
    mdc: MDC,
    event: ethereum.Event
): void {
    
    const ebcId = getEBCId(MDCBindEBC.id)
    let ebc = EBC.load(ebcId)
    if (ebc == null) {
        log.info('create new EBC, ebc: {}', [ebcId])
        ebc = new EBC(ebcId)
        ebc.mdcList = []
    }
    ebc.lastestUpdatetransactionHash = event.transaction.hash
    saveMDC2EBC(ebc, mdc)
    ebc.save()

    // const ebcAddress = Address.fromString(ebcId)
    let _EBCManager = EBCManager.load(EBCManagerID)
    if(_EBCManager == null){
        _EBCManager = new EBCManager(EBCManagerID)
        _EBCManager.ebcCounts = BigInt.fromI32(0)
        _EBCManager.ebcs = []
    }
    _EBCManager.ebcCounts = _EBCManager.ebcCounts.plus(ONE_BI)
    if (_EBCManager.ebcs == null) {
        _EBCManager.ebcs = [ebcId];
    } else if (!_EBCManager.ebcs.includes(ebcId)) {
        _EBCManager.ebcs = _EBCManager.ebcs.concat([ebcId])
    }      
    _EBCManager.lastestUpdateHash = event.transaction.hash
    _EBCManager.lastestUpdateBlockNumber = event.block.number
    _EBCManager.lastestUpdateTimestamp = event.block.timestamp    
    _EBCManager.save()    
    MDCBindEBC.save()
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
        _MDCBindEBC.rules = []
        // log.info('create new MDCBindEBC, mdc: {}, ebc: {}', [mdcAddress.toHexString(), bindID])
    }
    _MDCBindEBC.lastestUpdateHash = event.transaction.hash
    _MDCBindEBC.lastestUpdateBlockNumber = event.block.number
    _MDCBindEBC.lastestUpdateTimestamp = event.block.timestamp
    saveBindEBC2MDC(mdc, bindID)    
    return _MDCBindEBC as MDCBindEBC
}

export function saveBindEBC2MDC(
    mdc : MDC,
    ebc_id : string,
) : void{
    if (mdc.bindEBC == null) {
        mdc.bindEBC = [ebc_id]
    } else if(!mdc.bindEBC.includes(ebc_id)){
        mdc.bindEBC = mdc.bindEBC.concat([ebc_id])
    }  
}

export function saveMDC2EBC(
    ebc: EBC, 
    mdc: MDC
): void {
    if (ebc.mdcList == null) {
        ebc.mdcList = [mdc.id];
    } else if (!ebc.mdcList.includes(mdc.id)) {
        ebc.mdcList = ebc.mdcList.concat([mdc.id])
    }
}

export function saveRule2EBC(
    ebc: MDCBindEBC,
    rule: ruleTypes
): void{
    if (ebc.rules == null) {
        ebc.rules = [rule.id];
    } else if (!ebc.rules.includes(rule.id)) {
        ebc.rules = ebc.rules.concat([rule.id])
    }
}

export function getFunctionSelector(selector: Bytes): updateRulesRootMode {
    return selector == Bytes.fromHexString(func_updateRulesRoot) ? updateRulesRootMode.ETH : selector == Bytes.fromHexString(func_updateRulesRootERC20) ? updateRulesRootMode.ERC20 : updateRulesRootMode.INV
}

export class rscRules {
    ebcAddress: Bytes;
    rsc: Bytes;
    rscType : rscRuleType;
    root: Bytes;
    version: i32;
    sourceChainIds: Array<BigInt>;
    pledgeAmounts: Array<BigInt>;
    tokenAddr: Bytes;
    constructor(
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
        this.rscType = parseRSC(rsc);
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
    // TODO : check if rule exist
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

export function parseRSC(rsc: Bytes): rscRuleType {
    let _rscRuleType = new rscRuleType(
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,
        ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI)
    // TODO : gzip decompress
    // TODO : check if need tuple prefix?
    // const Prefix = ByteArray.fromHexString(tupleprefix);
    // const functionInputAsTuple = new Uint8Array(
    //     Prefix.length + rsc.length
    // );
    // functionInputAsTuple.set(Prefix, 0);
    // functionInputAsTuple.set(rsc, Prefix.length);
    // if (functionInputAsTuple.length < 32) {
    //     log.error("Failed to decode transaction input data", ["error"])
    // }
    // const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);


    let rscDecode = ethereum.decode(
        RSCDataFmt,
        rsc
    ) as ethereum.Value;
    if (!rscDecode) {
        log.error("Failed to decode transaction input data", ["error"])
    }
    let rscArray = rscDecode.toArray()
    let array0 = rscArray[0]

    let rscTuple = array0.toTuple();

    // log.debug("kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}, kind[5]:{}, kind[6]:{}, kind[7]:{}, kind[8]:{}, kind[9]:{}, kind[10]:{}, kind[11]:{}, kind[12]:{}, kind[13]:{}, kind[14]:{}, kind[15]:{}, kind[16]:{}, kind[17]:{}", 
    //     [
    //     rscTuple[0].kind.toString(),
    //     rscTuple[1].kind.toString(),
    //     rscTuple[2].kind.toString(),
    //     rscTuple[3].kind.toString(),
    //     rscTuple[4].kind.toString(),
    //     rscTuple[5].kind.toString(),
    //     rscTuple[6].kind.toString(),
    //     rscTuple[7].kind.toString(),
    //     rscTuple[8].kind.toString(),
    //     rscTuple[9].kind.toString(),
    //     rscTuple[10].kind.toString(),
    //     rscTuple[11].kind.toString(),
    //     rscTuple[12].kind.toString(),
    //     rscTuple[13].kind.toString(),
    //     rscTuple[14].kind.toString(),
    //     rscTuple[15].kind.toString(),
    //     rscTuple[16].kind.toString(),
    //     rscTuple[17].kind.toString()
    // ])

        // log.debug("chain0{}: ", [rscTuple[4].toBigInt().toHexString()])
        // log.debug("chain1{}: ", [rscTuple[5].toBigInt().toHexString()])
        // // covert to Bytes
        // let chain0Token = Bytes.fromHexString((rscTuple[4].toBigInt()).toString())
        // let chain1Token = Bytes.fromHexString((rscTuple[5].toBigInt()).toString())
        // log.debug("chain0{}: ", [chain0Token.toHexString()])
        // log.debug("chain1{}: ", [chain1Token.toHexString()])
        if(checkRulesFormat(rscTuple)){
          _rscRuleType.chain0 = rscTuple[0].toBigInt();
          _rscRuleType.chain1 = rscTuple[1].toBigInt();
          _rscRuleType.chain0Status = rscTuple[2].toBigInt();
          _rscRuleType.chain1Status = rscTuple[3].toBigInt();
          _rscRuleType.chain0Token = rscTuple[4].toBigInt();
          _rscRuleType.chain1Token = rscTuple[5].toBigInt();
          _rscRuleType.chain0minPrice = rscTuple[6].toBigInt();
          _rscRuleType.chain0maxPrice = rscTuple[7].toBigInt();
          _rscRuleType.chain1minPrice = rscTuple[8].toBigInt();
          _rscRuleType.chain1maxPrice = rscTuple[9].toBigInt();
          _rscRuleType.chain0WithholdingFee = rscTuple[10].toBigInt();
          _rscRuleType.chain1WithholdingFee = rscTuple[11].toBigInt();
          _rscRuleType.chain0TradeFee = rscTuple[12].toBigInt();
          _rscRuleType.chain1TradeFee = rscTuple[13].toBigInt();
          _rscRuleType.chain0ResponseTime = rscTuple[14].toBigInt();
          _rscRuleType.chain1ResponseTime = rscTuple[15].toBigInt();
          _rscRuleType.chain0CompensationRatio = rscTuple[16].toBigInt();
          _rscRuleType.chain1CompensationRatio = rscTuple[17].toBigInt();
          _rscRuleType.verifyPass = true;
        }
    
    // print 
    log.debug("[1]:{} [2]:{} [3]:{} [4]:{} [5]:{} [6]:{} [7]:{} [8]:{} [9]:{} [10]:{} [11]:{} [12]:{} [13]:{} [14]:{} [15]:{} [16]:{} [17]:{} [18]:{}", [
        _rscRuleType.chain0.toString(),
        _rscRuleType.chain1.toString(),
        _rscRuleType.chain0Status.toString(),
        _rscRuleType.chain1Status.toString(),
        _rscRuleType.chain0Token.toHexString(),
        _rscRuleType.chain1Token.toHexString(),
        _rscRuleType.chain0minPrice.toString(),
        _rscRuleType.chain0maxPrice.toString(),
        _rscRuleType.chain1minPrice.toString(),
        _rscRuleType.chain1maxPrice.toString(),
        _rscRuleType.chain0WithholdingFee.toString(),
        _rscRuleType.chain1WithholdingFee.toString(),
        _rscRuleType.chain0TradeFee.toString(),
        _rscRuleType.chain1TradeFee.toString(),
        _rscRuleType.chain0ResponseTime.toString(),
        _rscRuleType.chain1ResponseTime.toString(),
        _rscRuleType.chain0CompensationRatio.toString(),
        _rscRuleType.chain1CompensationRatio.toString(),
    ])


        return _rscRuleType

}


export function parseTransactionInputData(data: Bytes): rscRules {
    let selector = data.toHexString().slice(2, 10)
    let func = getFunctionSelector(Bytes.fromHexString(selector))
    // log.debug("selector: {}, func: {}", [selector, func.toString()])

    let selectorofFunc = "0x000000"
    if(func == updateRulesRootMode.ETH) {
        selectorofFunc = func_updateRulesRootSelector
    }else if(func == updateRulesRootMode.ERC20) {
        selectorofFunc = func_updateRulesRootERC20Selector
    }

    let dataWithoutSelector = Bytes.fromUint8Array(data.slice(4,data.length))
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
        // parseRSC(rsc)
    }    

    if(tuple[2].kind == ethereum.ValueKind.TUPLE){
        rootWithVersion = tuple[2].toTuple();
        // log.debug("rootWithVersion[0].kind: {}, rootWithVersion[1].kind: {}", [
        //     rootWithVersion[0].kind.toString(),
        //     rootWithVersion[1].kind.toString()
        // ])
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

export function updateRuleTypesThenSave(
    updateRulesRootEntity: rscRules,
    _rules: ruleTypes,
    root: Bytes,
    version: BigInt,
): void {
    _rules.root = updateRulesRootEntity.root
    // check if version is same
    if(version.equals(BigInt.fromI32(updateRulesRootEntity.version))){
        _rules.version = updateRulesRootEntity.version
    }

    if(root == updateRulesRootEntity.root){
        _rules.root = updateRulesRootEntity.root
    }

    if(calculateRscRootAndCompare(updateRulesRootEntity.rscType, updateRulesRootEntity.root) == true){
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
        // if(checkifRSCRuleTypeExist(BigInt.fromI32(updateRulesRootEntity.rscType.chain0Token.toI32()))){
          _rules.chain0Token = Bytes.fromHexString(updateRulesRootEntity.rscType.chain0Token.toHexString())
        // }
        // if(checkifRSCRuleTypeExist(BigInt.fromI32(updateRulesRootEntity.rscType.chain1Token.toI32()))){
          _rules.chain1Token = Bytes.fromHexString(updateRulesRootEntity.rscType.chain1Token.toHexString())
        // }
        if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0minPrice)){
          _rules.chain0minPrice = updateRulesRootEntity.rscType.chain0minPrice
        }
        if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain0maxPrice)){
          _rules.chain0maxPrice = updateRulesRootEntity.rscType.chain0maxPrice
        }
        if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1minPrice)){
            _rules.chain1minPrice = updateRulesRootEntity.rscType.chain1minPrice
        }
        if(checkifRSCRuleTypeExist(updateRulesRootEntity.rscType.chain1maxPrice)){
            _rules.chain1maxPrice = updateRulesRootEntity.rscType.chain1maxPrice
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
  
        if (_rules.chain0 !== null && _rules.chain1 !== null && _rules.chain0Token !== null && _rules.chain1Token !== null && _rules.chain0minPrice !== null && _rules.chain0maxPrice !== null && _rules.chain1minPrice !== null && _rules.chain1maxPrice !== null && _rules.chain0WithholdingFee !== null && _rules.chain1WithholdingFee !== null) {
            log.debug('rscRule2update[0]:{}, [1]:{}, [2]:{}, [3]:{}, [4]:{}, [5]:{}, [6]:{}, [7]:{}, [8]:{}, [9]:{}, [10]:{}, [11]:{}, [12]:{}, [13]:{}, [14]:{}, [15]:{}, [16]:{}, [17]:{}', [
                _rules.chain0.toString(),
                _rules.chain1.toString(),
                _rules.chain0Status.toString(),
                _rules.chain1Status.toString(),
                _rules.chain0Token.toHexString(),
                _rules.chain1Token.toHexString(),
                _rules.chain0minPrice.toString(),
                _rules.chain0maxPrice.toString(),
                _rules.chain1minPrice.toString(),
                _rules.chain1maxPrice.toString(),
                _rules.chain0WithholdingFee.toString(),
                _rules.chain1WithholdingFee.toString(),
                _rules.chain0TradeFee.toString(),
                _rules.chain1TradeFee.toString(),
                _rules.chain0ResponseTime.toString(),
                _rules.chain1ResponseTime.toString(),
                _rules.chain0CompensationRatio.toString(),
                _rules.chain1CompensationRatio.toString()
            ])
        }
        _rules.save()
      }

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
  
    for(let i = 0; i < uniqueEbcs.length; i++){
      log.debug('ebcs: {}', [uniqueEbcs[i].toHexString()])
    } 
  
    return uniqueEbcs;
  }
  