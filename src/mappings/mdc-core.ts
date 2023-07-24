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
    updateRuleTypesThenSave
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
  mockMdcAddr 
} from "./mock-data";



export function handleupdateRulesRootEvent(
    event: ethereum.Event,
    impl: Bytes,
    ebc : Bytes,
    root : Bytes,
    version : BigInt
): void{
      let updateRulesRootEntity = isProduction ? 
      parseTransactionInputData(event.transaction.input) :
      parseTransactionInputData(Bytes.fromHexString(funcETHRootMockInput) as Bytes)
      
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
            let _rules = getRuleEntity(ebc)
            updateRuleTypesThenSave(updateRulesRootEntity, _rules, root, version)

            
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