
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

export function entityConcatID(
    entity: string[],
    id: string
): string[] {
    if (entity == null) {
        entity = [id]
    } else if (!entity.includes(id)) {
        entity = entity.concat([id]);
    }
    return entity
}

export function createBindID(
    ids: Array<string>
): string {
    let id = ""
    for(let i = 0; i < ids.length; i++){
        if (i === 0) {
            id = ids[i]
        } else {
            id = id + "-" + ids[i]
        }
    }
    return id
}


export function encode(values: Array<ethereum.Value>): Bytes {
    const tuple = changetype<ethereum.Tuple>(new ArrayBuffer(32 * values.length));
    for (let i = 0; i < values.length; i++) {
        tuple[i] = values[i];
    }
    return ethereum.encode(ethereum.Value.fromTuple(tuple))!;
}

export function createHashID(ids: Array<string>): string {
    const tupleValue: Array<ethereum.Value> = new Array<ethereum.Value>(ids.length);
    for (let i = 0; i < ids.length; i++) {
        tupleValue[i] = ethereum.Value.fromString(ids[i]);
    }
    const encodeData = ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleValue)))!;
    const key = crypto.keccak256(encodeData);
    return key.toHexString();
}

