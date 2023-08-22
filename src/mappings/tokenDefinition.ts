import {
  Address,
  BigInt,
  log,
} from "@graphprotocol/graph-ts"

// Initialize a Token Definition with the attributes
export class TokenDefinition {
  address : Address
  symbol: string
  name: string
  decimals: BigInt

  // Initialize a Token Definition with its attributes
  constructor(address: Address, symbol: string, name: string, decimals: BigInt) {
    this.address = address
    this.symbol = symbol
    this.name = name
    this.decimals = decimals
  }

  // Get all tokens with a static defintion
  static getStaticDefinitions(): Array<TokenDefinition> {
    let staticDefinitions = new Array<TokenDefinition>(0)

    // add mock tokens
    let tokenMock1 = new TokenDefinition(
      Address.fromString('0x2265d16498efe5e63e08fa50f4344a2668db90ad'),
      'MOCK1',
      'Mock Token 1',
      BigInt.fromI32(18)
    )
    staticDefinitions.push(tokenMock1)

    // // add orbiter token
    // let orbiterArbiUSDT = new TokenDefinition(
    //   Address.fromString('0x76FC39362EF66DAd742791BDe738b9B050C3cBf5'),
    //   'OUSDT',
    //   'Orbiter USDT',
    //   BigInt.fromI32(18)
    // )
    // staticDefinitions.push(orbiterArbiUSDT)

    // let orbiterArbiUSDC = new TokenDefinition(
    //   Address.fromString('0xA3FDF06e3c59Df2DEaAE6D597353477FC3daaEaf'),
    //   'OUSDC',
    //   'Orbiter USDC',
    //   BigInt.fromI32(18)
    // )
    // staticDefinitions.push(orbiterArbiUSDC)

    // let orbiterOPUSDT = new TokenDefinition(
    //   Address.fromString('0x4C6c591254769CD6D1850aa626bc45B12d8d9ce0'),
    //   'OUSDT',
    //   'Orbiter OUSDT',
    //   BigInt.fromI32(18)
    // )
    // staticDefinitions.push(orbiterOPUSDT)

    // let orbiterOPUSDC = new TokenDefinition(
    //   Address.fromString('0x17464cFfd501430302f20F37145E36cC47842790'),
    //   'OUSDC',
    //   'Orbiter OUSDC',
    //   BigInt.fromI32(18)
    // )

    return staticDefinitions
  }

  // Helper for hardcoded tokens
  static fromAddress(tokenAddress: Address) : TokenDefinition | null {
    let staticDefinitions = this.getStaticDefinitions()
    // log.info('staticDefinitions length: {}', [staticDefinitions.length.toString()])
    let tokenAddressHex = tokenAddress.toHexString()

    // Search the definition using the address
    for (let i = 0; i < staticDefinitions.length; i++) {
      let staticDefinition = staticDefinitions[i]
      if(staticDefinition.address.toHexString() == tokenAddressHex) {
        return staticDefinition
      }
    }

    // If not found, return null
    return null
  }

}