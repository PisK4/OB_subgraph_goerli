import { BigInt, BigDecimal, Bytes, log, EthereumUtils, ethereum, Address, ByteArray } from '@graphprotocol/graph-ts'
// import { ethers } from "ethers";
// import { AbiCoder } from "ethers/lib/utils";

//for test 
export let funcERC20    = "0x16d38f5d00000000000000000000000028c2a37ff5f74fe17d9c30c15a1234ad48dd992900000000000000000000000000000000000000000000000000000000000000e05876b545fe8e236605e28a4aba0c7ae1922d8e66e7bc5f317d482107e288363700000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000c60000000000000000000000000b0d5753ecb9f470ba5f4047e96f6458ff5b25c6f0000000000000000000000000000000000000000000000000000000000000ae51f8b0800000000000203ed9c7938546f1bc7650b632759b386168a92252a952c21b216cad68bec09d98a48452242a22c8d529646a4642c8d255b2a5bd96a8a626c89f1861f7eef7bfddeebfa5d33d765e699ce9cdf1f8df7fcfbbde67e9e733ee7b99ffbb9effb0c1d1dd94b82bc4c270fd0d700747a3aea2e22fbc952b88cca0fbcc158df9743239a8f266225cb7309f5838d06177534fde5370d0d68d65a07075c2fcbaf07d81722a349474f7bbf24755f8c8b5f07bf98c8f2aca8b2b3860ea3137c6d7696fff8879f9f24401705e822007d0395f36380933f46c36223f7d1248ecbd95b435f3e39d265b7561d43a89bac7f53beebe455dbbc2f4f6e3532d10be5b2f523a8e2c334fb998c5a9c8356aca742a705fe20be8c70f297eb770e7b6fa9b453c5318e2b561691363b6e5448a8cb2cf3f71e28389ba4b7e17d2823a2647359c65abd95cd86ecf7ce7798e218744a233d7271919197e22c15fee3af3788c6f9335279ffbfc49fa12312e5fa6fc99b4b5107d57b7b2a735ecd2f11f9ff38c52183acba49df1cd5ed0ad21d7707b9df2d3c236f5e8b950aff40667d334e2a786adb5c2af81e41e3fc417c99e1e46fa7962be8b2e3e67b354333baead4f90fbbfa8589fcb37d90cf044725d72b03ed59669d095625f594c0bba40cbb9c7a95b4c0bdf60e345df0fea0d4a1a60cfbc24b10e3075ae10fe2bb164efee36bc4ed99f38a6b9c07de5d1fef93ecb7f07b6946a86fc9fe78f370669ddad8f923d1cc25f30de8e82b452b5ad5dce6135dd4beab716df653d243f3580fd9dfd002cc2f8ca4d28111696b9dc8a671fe20be2c70f2df3de6fe3cbbfa88bfc05e995023610c62c79f3baa09f5fd8b98d869e687be95f4a281b9d791cb9c3cc14e2b3f555743456b1c4ac7e7c712a4f54bd1fbf3d740be34ce1fc497154efede99ec5b18b6eb7b4e494c2e606a6daf3e90710d24d4efb605f9ed8c4148d1558485d06de80c926a8a201d7fb39c7389941d6d5a7153c3662fc9f15e3e76a5aab970255dcc69d38f5a5b64757ef9ac0395fee377e70fe2cb06277fbec813ec01d882eac7167f6c1d653ec6dfd91f4ce4ffd3c6032ce5f10fdd0a732abe7332e9176715ab5b5113dfeb61fc92a1bc1f7fc3c3710ed0387f105f049cfcdfea1a17c9b4b2958ef6d9304acd197726f0325d24d49bddb6593d765ea7291cd454d8d5880e8f2f658d26b777092fe9c791d094439ff8690b753c7b0875ff07c59734c21fc4971d4efe1245e9edccc50de80a9f1745e6b327ae326fc920e2879361f768f37bfa20b567ce57272bf098d69ba09b50fc3f65f11bc33985025c0f4979f371a6784cf2048df307f1e58093bf42e3b3cc51cb3e51c7486b81176d6f5f859c4c3b4094ff7bc1ae8bacc26a17737124a7cb6439bf2ce1d385783e279fdffd3b10787d8a4afff1bbf307f1e58493ffa00542f76246c3f04f39fa8642676641adf63d0684fa5052294a45cbc65175fb3324b7b649a961e6cc7d2acfe742d0f6778af203b4c01fc4970b4efec856a5fcf8940d3ab991caaf8c2a9e8b9ad6dccb24d45f3777fd4b04698871ad56a6cb6e40a3f0bcd8d495cd02f3bfe4d73f85e73f52f1230df107f1e586937fed788191c4c1f7e2d844ce1f0e612ed3350c583f42fd8bffcc09fcd1c41776c35efe82ad3deabedd63cf20c6ff94f97f52f9cfd553ff03f1e581937f6e54817fee9f4e27751c95d2e7be307eb489e30f267246e6fc66b65b2a3ffb8e2311d8a9a51b4b674e959332cc28d51ccb4687dc08393e241bffaf9afc3f882f2f9cfca73d2699ae6899e7eb2e0c9926dc93bfd6ce206041a847bcb1c2a62e98b1d6a3860405c7ee55ed5f2f4172fefc85f867ca0c3bcba9e047eefcf8bff731cec094c6f983f8f2c1c93f61f348c5b050a59d2a6afebe97a1a4e9f74f7d86847ac0370b97fb3bec0362a47da4101cfa49862d012dff207f507fc06ae00fe2cb0f27ffe5b38afe68f97d734fc7bcb6ee36718d382cfdd886504f7e139cb0b0b8156bcebab736ddb5d02131ade629f4f8df12edffa55b09e2f96fb5c47f20beebe0e42fbeb469ba9b1d17236f32511f3867cf3c1bf41e47a8efd5ea0d39bf598abf3164b92453d9d6613ad1bc176afe0ec01f1c1f52d63ff2bbf307f1158093bf0e7a31a133e689a53146578047316882215f0e45a88733aa1c2c63f9881ca6b38b0808ba74268f5bcd1d0a7fcaf2fb14f80752fd25b4c31fc4773d9cfcddfdbec61d56ac44d15dcb7a77a30d29f7f316039650df76ad4054cf69ade3baba65f39665cee617d657b5219ddfc03a60fdaf9afc0f88af209cfc43d578d5c6828a35e2f167f48e7b79b0ba332511dddf9d277d77071436860c3308178424cdf66e9c67bf40ddfa24a1535aff07c40734c01fc457084efe07e2b32aa6f97254f4ecde4fa4a111bc7989f444fe5b353146bf71f15d4ebb650b22b0a4cc3b8af3ab0be4f31bf9fa0d85f97d9af7ff20bec270f277fd66ea3aad9e23e67dd4d30415bf7169b0d2298f503fddd929e0ecbc70d064b43e2af4e2a9cdaf4b995aa1e57728f2df24fb3f29eb0fa109fec254daff25fec8d2ec3b2217ee691644de42f99c4f6870e575f622d49f7ced3276466e5dd04dd64f7ece11eabee8e12943ca30b83e4f497cb7727f17a5fd2134c05f84caf17f89bfc6db452b35ad7cacc7bcffe41ffd2da99715f476114d26ecfa50203eddf4827fcc2deb068dba80d1097f2acf6764e243f2f57f607e9936f883ec8bc1c9ff3c62f47115ce73e4946d6cf51b37d38723870688eaffdd0f4eb460b38222a7f4179ba325050ea30666a3a88aff93e9e7a1ed1f14d78f7e77fe6254fefe97f8a31c31fa9fcefa9ce3164d3e3a387abc2eb2fe1a517fd7093c27a2b3ac6e6f142ee79d825f031783f85e2c39e3a0fc2cf9fc1d25fd9d34dfff0bd2c5e1e49fef6d35d2e5f5736ad0c2eb7689862143656b13d1fa5b4e44ed3fea26a2328a14d1b7b05aee8a4963b94cca30d9fc3f65fde1ffbdd85556b9ff07f19580937f461d5ee2a46c477960ad425493decc1f58b4982ca1ee58a87b5ac6452361f7dc1e3c7b3586951f6fc30cd9bf83fd03b9ef3b578bff97a0727ebfc4ff8eb3c740da311603933d17aef5c839b84e1e8922daffb9528e79a444a67c0cc78d8cecee778f2bd4c9ab82783e67139c0af3734fa8b280a4af9efe0fd0f85270f29f09aa4f0fb28f43dfd0106b2c88669c9b71986d23d4434ef679ba2ab34ab1197f1b601710a66f2d8f53276f5d49818c0aea0f04f70f02eac334c01fc4571a4efe3c363ba44df9c6c4f6ec74d3955dd739dfba463596504faaf0b171e4e5c854b0ef6c1d94b7f20aab1e2195df5bf40edda713219562043dfea35be3deaa8d831a1fd0087f105f1938f9cb19af313234ecf62fb9558b7f642a8713ae3b40f4ff033f470566cadb4ea70af97987bfb02c9e52c9bad40a35bf4749fc46fdfbf1dbf307f1dd0827fff245ed8a85e45db91f0cb15efbf5457787ab4be710eab70dd007ba37f8f9060a8c1c89dee2391a6b36924ed23299ef3b28ccdf02f802be0fa10dfe20beb270f27fa5e287bbc19b52fff8100f46f39a74ef27b978a2ff7f70743fbdf3305f60db21be0d9f27b9ae0c0573570d51e3ff49d6effedfff4d295f3938f987c6fe3cea6ddff2f1347f951a5f164b00bdb12a51fcd69791945d8d174faf14b42b09bf74503670d16b1f357cc87fbf09caffac8aef7f417ce5e1e4ff5018fd7132d7ba289edbb6792e47172d625c43c4270a51882dacb93e7dbbaabfac1f2989edb8f76501609f74ff17f9fa2fd07fac92fc0f88ef2638f9ab98bdee70932ae59e74b3a57f1b52f4e8f5831b44f5e7eacd99112c78c6b29e93669f14b095912dba62ed10d737307f03e24b2bfcff0341b25bc740500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000280000000000000000000000000000000000000000000000000000000000000027000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000005af3107a40000000000000000000000000000000000000000000000000000000b5e620f48000"
export let funcETH      = "0x5266dbda00000000000000000000000028c2a37ff5f74fe17d9c30c15a1234ad48dd992900000000000000000000000000000000000000000000000000000000000000c0871b0e795a37fedbe9feacdd6620c0ff2ee382d2071ea0faa316bb24a07227af00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000074000000000000000000000000000000000000000000000000000000000000006081f8b08000000000002036360c00b14f04b33881090672420cfc4401940317f43d5f6cf3c5c8e1bab8e5dd8bb83fb8299957bb52bb2fcbc3d371c33171fd87f29ac6c6a587189a186cdace578ccdeb8688fde51ac3236fa056deb2e999d605fb89580f70a71c9b0289deae66258a24ae3f05324202f43405e9a80bc1c85ee63a666fcb796df4fbad6f9f8e2aad335e156dfa499beb7ba5b22cb27452cddf374f6cdbc28d7fef08d2b267fdff2f76b1f765767f8e845bcdce05af0f12f6e9b37aef3cdd3fb8a554ae7add1c22c69c1176a1a9d38f55f3e247deeccdb85c33cfe09c52f0b35e3ffe6d59b7b22cb7c432739fb4ed9c77c4aadfbd4d2b7c8f2b3354dba8a6b737cdb955eb9cd2d8cec15aa65594466fefe935fe3e0daa834cd97c2fc2d39cce39f50fcb25233fe8d2b63af70e6736f2ea9d858b5ecadfee44deaf7ba90e527fd9eace2734fcfb86ecec78773aac544ede4e7346337b6da297f75e207dec7c933f124ed0add352f6f62f5d483857fd585da233bf69d5a4b8efc308a7f42f1cb46cdf8df685a9d39cd3afe9aacc265ad4bbe3e7c3bbd174a21cb972e39cdde5cf121d4db4bb7f4669f788bc0764767b2ea7f28f038543c15b7ac60c4938489b6f8f4f3f57a050ef3f82714bfecd48cff37e537b3a647d6f41bce6aab0bbe34f9efee0cddf9c8f2ae97f5055bac541fe86db7ea387bf789772c473313f9f99f70fa6060b0e5c421c125f1a1b6387bc2bed0611eff84e297839af19f7e4d7889c1bf990b58841e3205dae42d5448bbf90759fe54afe2e382dd4fcfc5a974669c7f7af2e341e639c114c42f63f619c797e4b40f9140ed308f7f42f1cb49cdf877f921f3abe7d044bb5f35fc9e0d3f7bb7bacb3df885d2e44e2dce33fdb5b1c2abd5dc4d7eede25de2939ecd26b77d07a9ddbe3ec429a715c5da7f68ea5b1ccda277bab98ed1ad6bde370ef3f82714bf5cd48cffa2456ad6cf2a966bb1db1e95be1275e51adf89db12c8f27bdaf7ef2898613447efd661dff91f6e0a68c71d11c59d722bd29bd55e9dc426259bacf9f170cc92fdab777e4dc4a1dba86653b1a3e4e5ed2bc9693f0ea3f82714bfdcd48cff963bea7f76b42ed8dfde24dadec351a47a6cd2da8d285972cdbb634c3ec19a5f8dfcba439c4af4b224e7d6e01cd85afb65bb11b3c94e0afaefec527f3d7b714b87ed297d74cd7098c73fa1f8e5a166fc4bac2eae7f54b5afc382ad6cebafa095a5d3b7b05b23cbfbddcf50becff848fe1f7b46cfb9a97c52664acf25c9aedf098cefe12ffff1972fc328fe09c52f2f35e37fa1f2b9d961537ca20eb6c7ff0c8d3c7567f9794694f1bda65f462defe5bbcebbed12e0fdd4e09b9c24d3df4876fc12ecbfe1eeff8da0fe3fa1f8e5a366fc4f9cdeb17462e9f72a7e999b223f2bbfdcebded8a68c2cffac25264e33f6dafd09a1931be7ccfef0f89d0be30672f22f11e3bb44f5ef4640ff9f50fcf25333feb3a7d45d493c7b4f47a85e7c9a8e40dcf9063fc13a64f9bfdd329e929965df8b24372dda3749f8ea4641851efca61bea52187fd8c7bf889e3f1af2f14f287e05a819ff7a9d2a53e73cd279bf9d738bd3ec33d1cd0d2bfa4f23cb2fe3fdbfc8ff6882fdcd793f7cc4ba952d566d6ce326bffdc6a0dcf629ff2081eacf7484b7ff08c5af2035e35f346b67e07baf88459ed68987fc66bca9b9e1fb13a5fe5e2a343b6541fbe9c7b37d7b6354dda4a32e6ceedc435eff9fa8f1416047f16c2a7ee7db720ef3f82714bf42d48c7f7d37a737ca1b18124a26f1c42c4dbb1c7a929fbb1559fe608897d5570ddea05a51cbe235e7be3e4c7cdb9781cb60c2f37744f4dff18d0f112c1f8645fc138a5f616ac6bfadb09902dffba5ef2d0e78ee7f788d2786456ecd5d14cbb4efe748975c7f912877c4cba28461affd5b366f0aca777cf50371e38704da17c320fe09c5af0835e33f247fd2a68b4cf59a37b4cb2ae25a1616096b669723cbab9ab0049a8a4e49df68f87185d3c4fe777f3e71319119bf4c2c7f9e3e7e14a086bd7ce3e1ac79be674261b4c9ce8f64f61f864bfc138a5f516ac6ffa177479ba2b98efd14dff9f0e0be57c9a59b5ea4ae4696379aca1e2e5b68726e9d33479f5f9090efd11da1b7c819ff21d87f27a67d3f4cd6ff00002f63cd954028000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000005af3107a4000"

export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)
export const ONE_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff'
export const ONE_NUM = 0xffffffff
const tupleprefix = "0x0000000000000000000000000000000000000000000000000000000000000020"
const ONE_BYTES = new Bytes(32);
const func_updateRulesRoot = "0x5266dbda"
const func_updateRulesRootERC20 = "0x16d38f5d"
const func_updateRulesRootSelector = "(address, bytes, (bytes32,uint32), uint16[], uint256[])"
const func_updateRulesRootERC20Selector = "(address, bytes, (bytes32,uint32), uint16[], uint256[], address)"
enum updateRulesRootMode {
    ETH = 0,
    ERC20 = 1,
    INV = 2,
}

export function getONEBytes(): Bytes {
    if(ONE_BYTES.length == 0) {
        for (let i = 0; i < 32; i++) {
            ONE_BYTES[i] = 0xff;
        }
    }
    return ONE_BYTES as Bytes;
}

export function getFunctionSelector(selector: Bytes): updateRulesRootMode {
    return selector == Bytes.fromHexString(func_updateRulesRoot) ? updateRulesRootMode.ETH : selector == Bytes.fromHexString(func_updateRulesRootERC20) ? updateRulesRootMode.ERC20 : updateRulesRootMode.INV
}



export class updateRulesRoot {
    ebcAddress: Bytes;
    rsc: Bytes;
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
        this.root = root;
        this.version = version;
        this.sourceChainIds = sourceChainIds;
        this.pledgeAmounts = pledgeAmounts;
        this.tokenAddr = tokenAddress
    }
}


export function parseTransactionInputData(data: Bytes): updateRulesRoot {
    let selector = data.toHexString().slice(2, 10)
    let func = getFunctionSelector(Bytes.fromHexString(selector))
    log.debug("selector: {}, func: {}", [selector, func.toString()])

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
        log.debug("kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}, kind[5]:{}", [
            tuple[0].kind.toString(),
            tuple[1].kind.toString(),
            tuple[2].kind.toString(),
            tuple[3].kind.toString(),
            tuple[4].kind.toString(),
            tuple[5].kind.toString(),
        ])
    }else{
        log.debug("kind[0]:{}, kind[1]:{}, kind[2]:{}, kind[3]:{}, kind[4]:{}", [
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

    if(tuple[1].kind == ethereum.ValueKind.UINT) {
        let _rcs = tuple[1].toBigInt();
        rsc = Bytes.fromI32(_rcs.toI32());
    }    

    if(tuple[2].kind == ethereum.ValueKind.TUPLE){
        rootWithVersion = tuple[2].toTuple();
        log.debug("rootWithVersion[0].kind: {}, rootWithVersion[1].kind: {}", [
            rootWithVersion[0].kind.toString(),
            rootWithVersion[1].kind.toString()
        ])
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
        if(tuple[5].kind == ethereum.ValueKind.UINT) {
            tokenAddress = Address.fromHexString(tuple[5].toBigInt().toHexString())
        }
    }

    let updateRulesRootEntity = new updateRulesRoot(
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

