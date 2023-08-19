
import { 
    Address,
    BigInt 
} from '@graphprotocol/graph-ts'
import { TokenDefinition } from './tokenDefinition'
import { ERC20 } from '../types/ORManager/ERC20'
// import { ERC20 as ERC20Template} from "../types/templates"


export function fetchTokenSymbol(tokenAddress: Address): string {
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if(staticDefinition != null) {
      return (staticDefinition as TokenDefinition).symbol
    }
    let contract = ERC20.bind(tokenAddress)
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (!symbolResult.reverted) {
      symbolValue = symbolResult.value
    }
  
    return symbolValue
  }
  
  export function fetchTokenName(tokenAddress: Address): string {
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if(staticDefinition != null) {
      return (staticDefinition as TokenDefinition).name
    }
    // ERC20Template.create(tokenAddress)
    let contract = ERC20.bind(tokenAddress)
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (!nameResult.reverted) {
      nameValue = nameResult.value
    }
    return nameValue
  }
  
  export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    let totalSupplyValue = BigInt.fromI32(0)
    let totalSupplyResult = contract.try_totalSupply()
    if (!totalSupplyResult.reverted) {
      totalSupplyValue = totalSupplyResult.value
    }
    return totalSupplyValue
  }
  
  export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if(staticDefinition != null) {
      return (staticDefinition as TokenDefinition).decimals
    }
  
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = BigInt.fromI32(0)
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
      decimalValue = BigInt.fromI32(decimalResult.value)
    }
    return decimalValue
  }