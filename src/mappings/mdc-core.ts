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
    funcERC20,
    funcETH,
    func_updateRulesRoot,
    func_updateRulesRootERC20,
    func_updateRulesRootERC20Selector,
    func_updateRulesRootSelector,
    getEbcEntity,
    getMdcEntity,
    getONEBytes,
    mockMdcAddr,
    tupleprefix,
    updateRulesRootMode
} from "./helpers"
import { 
    EBC, 
    FactoryManger, 
    MDC, 
    RulesRootUpdated, 
    ruleTypes 
} from "../types/schema";

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
    minPrice: BigInt;
    maxPrice: BigInt;
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
        minPrice: BigInt,
        maxPrice: BigInt,
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
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
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
    let _rscRuleType = new rscRuleType(ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI,ZERO_BI)

    // TODO : gzip decompress

    // TODO : check if need tuple prefix?
    let rscDecode = ethereum.decode(
        "(uint64,uint64,uint8,uint8,uint,uint,uint128,uint128,uint128,uint128,uint16,uint16,uint32,uint32,uint32,uint32)",
        rsc
    ) as ethereum.Value;
    if (!rscDecode) {
        log.error("Failed to decode transaction input data", ["error"])
    }
    let rscTuple = rscDecode.toTuple();

    // log.debug("kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}, kind[5]:{}, kind[6]:{}, kind[7]:{}, kind[8]:{}, kind[9]:{}, kind[10]:{}, kind[11]:{}, kind[12]:{}, kind[13]:{}, kind[14]:{}, kind[15]:{}", 
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
    //     rscTuple[15].kind.toString()])


        if(checkRulesFormat(rscTuple)){
          _rscRuleType.chain0 = rscTuple[0].toBigInt();
          _rscRuleType.chain1 = rscTuple[1].toBigInt();
          _rscRuleType.chain0Status = rscTuple[2].toBigInt();
          _rscRuleType.chain1Status = rscTuple[3].toBigInt();
          _rscRuleType.chain0Token = rscTuple[4].toBigInt();
          _rscRuleType.chain1Token = rscTuple[5].toBigInt();
          _rscRuleType.minPrice = rscTuple[6].toBigInt();
          _rscRuleType.maxPrice = rscTuple[7].toBigInt();
          _rscRuleType.chain0WithholdingFee = rscTuple[8].toBigInt();
          _rscRuleType.chain1WithholdingFee = rscTuple[9].toBigInt();
          _rscRuleType.chain0TradeFee = rscTuple[10].toBigInt();
          _rscRuleType.chain1TradeFee = rscTuple[11].toBigInt();
          _rscRuleType.chain0ResponseTime = rscTuple[12].toBigInt();
          _rscRuleType.chain1ResponseTime = rscTuple[13].toBigInt();
          _rscRuleType.chain0CompensationRatio = rscTuple[14].toBigInt();
          _rscRuleType.chain1CompensationRatio = rscTuple[15].toBigInt();
          _rscRuleType.verifyPass = true;
        }

        return _rscRuleType

}


export function parseTransactionInputData(data: Bytes): rscRules {
    let selector = data.toHexString().slice(2, 10)
    let func = getFunctionSelector(Bytes.fromHexString(selector))
    // log.debug("selector: {}, func: {}", [selector, func.toString()])

    let selectorofFunc = "0x00000000"
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

export function updateRulesRoot(
    event: ethereum.Event,
    impl: Bytes,
    ebc : Bytes,
    root : Bytes,
    version : BigInt
): void{
      // # for test only
      // let debugInput = Bytes.fromHexString(funcERC20) as Bytes;
      // let updateRulesRootEntity = parseTransactionInputData(debugInput)

      // # for production
      let updateRulesRootEntity = parseTransactionInputData(event.transaction.input)
      const ebcAddress = updateRulesRootEntity.ebcAddress.toHexString()
      const _mdcAddress = event.transaction.to
      ? ((event.transaction.to as Address).toHex()) as string
      : null;
      
      const mdcAddress = _mdcAddress as string
      log.info('ready to update, mdcAddress: {}, ebcAddress: {}', [mdcAddress, ebcAddress])

      let mdc = MDC.load(mdcAddress) // # for production
      // let mdc = MDC.load(ebcAddress)  // for test only

      if (mdc) {
        const _mdcContract = mdcContract.bind(Address.fromString(mdcAddress))  // # for production
        // const _mdcContract = mdcContract.bind(Address.fromString(ebcAddress)) // for test only
        let try_mdcFactory = _mdcContract.try_mdcFactory()
        let factoryAddress = ONE_ADDRESS
        if(!try_mdcFactory.reverted){
          let _factoryAddress = try_mdcFactory.value.toHexString()
          factoryAddress = _factoryAddress as string
        }else{
          log.error('mdcFactory is null, mdcAddress: {}', [mdcAddress])
        }
        log.info('mdcAddress: {}, ebcAddress: {}, factoryAddress{}', [mdcAddress, ebcAddress, factoryAddress])
        let factory = FactoryManger.load(getONEBytes())
        if(factoryAddress != ONE_ADDRESS){
          factory = FactoryManger.load(Bytes.fromHexString(factoryAddress))
        }


        // log.debug('load exist MDC:{}', [ebcAddress])
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
          let ebc = EBC.load(ebcAddress)
          if (ebc == null) {
            log.debug('create new EBC:{}', [ebcAddress])
            ebc = new EBC(ebcAddress) as EBC
            // ebc.rule = "default"
            ebc.version = ONE_NUM
          }
      
          // save ebcs ruletype
          if(updateRulesRootEntity.rscType != null){
            let _rules = ruleTypes.load(ebcAddress)
            if(_rules == null){
              log.debug('create new ruleTypes:{}', [ebcAddress])
              _rules = new ruleTypes(ebcAddress)
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
            }else{
              log.debug('load exist ruleTypes:{}', [ebcAddress])
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
            
          }
          ebc.root = updateRulesRootEntity.root
          // check if version is same
          if(version.equals(BigInt.fromI32(updateRulesRootEntity.version))){
            ebc.version = updateRulesRootEntity.version
          }
          ebc.sourceChainIds = updateRulesRootEntity.sourceChainIds
          ebc.pledgeAmounts = updateRulesRootEntity.pledgeAmounts    
          ebc.lastestUpdatetransactionHash = event.transaction.hash
          ebc.save()
        }        
        mdc.lastestUpdatetransactionHash = event.transaction.hash
        mdc.save()
        if(factory){
          factory.save()
        }
    }else{
        log.error('MDC not exist', ['error'])
    }

    // entity.save()    
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



export function handleColumnArrayUpdatedEvent (
    event: ethereum.Event,
    impl : Bytes,
    columnArrayHash : Bytes,
    dealers : Array<Address>,
    ebcs : Array<Address>,
    chainIds : Array<BigInt>
): void{
    let mdc = getMdcEntity(Address.fromString(mockMdcAddr), Address.fromString(ONE_ADDRESS), event)
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
                let ebc = getEbcEntity(Address.fromString(mockMdcAddr), uniqueEbcs[i])
                ebc.lastestUpdatetransactionHash = event.transaction.hash
                ebc.save()
                mdc.ebc.push(ebc.id);
              }
        }

        mdc.lastestUpdatetransactionHash = event.transaction.hash
        mdc.save()
    }else{
        log.error('MDC not exist', ['error'])
    }
}