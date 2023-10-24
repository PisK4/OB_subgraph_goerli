import {
  Address,
  BigInt,
  log,
} from "@graphprotocol/graph-ts"
import { entity } from "./utils"

export const subgraphManagerID: string = entity.createHashID(["subgraphManager"]);

export class FactoryDefinition {

  static getfactoryList(): Array<Address> {
    let staticDefinitions = new Array<Address>(0)
    const factoryList: string[] = [
      "0x6747B308651B23C11D6019E38394b805F3BCa82B",
      "0xfd854cb189Eb6754f02c5d6d0f9a70D78629F644"
    ];
    for (let i = 0; i < factoryList.length; i++) {
      staticDefinitions.push(Address.fromString(factoryList[i]))
    }
    return staticDefinitions
  }
}
