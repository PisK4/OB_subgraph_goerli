import {
    ethereum,
    Bytes,
    BigInt
} from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";
import { MDC } from "../types/schema";
import { debugLog } from "./config";
import {
    updateRulesRootMode,
    compareUpdateRulesRootSelector,
    func_updateRulesRootName,
    func_updateRulesRootERC20Name,
    STRING_EMPTY,
    RULEVALIDA_EBCNOTFOUND,
    RULEVALIDA_CHAINIDMISSMATCH,
    RULEVALIDA_CHAINIDNOTFOUND,
    RULEVALIDA_TOKENNOTFOUND,
    RULEVALIDA_SERVICECLOSED,
    RULEVALIDA_NOERROR,
    ZERO_BI,
    getMDCLatestEBCs,
    getMDCLatestChainIds,
    getTokenFromChainInfoUpdated
} from "./helpers";
import { calldata, padZeroToUint } from "./utils";


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

    static parseCalldata(data: Bytes, mdcAddress: string): rscRules {
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

            _rscRuleType.verifyPass = true;
            rscRules.push(_rscRuleType);
        }
        return rscRules;
    }
}
