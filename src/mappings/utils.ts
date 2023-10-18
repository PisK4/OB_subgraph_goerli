
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

export const tupleprefix = "0x0000000000000000000000000000000000000000000000000000000000000020"


export class entity {
    id: string
    constructor(id: string) {
        this.id = id
    }

    static addRelation(
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

    static createBindID(
        ids: Array<string>
    ): string {
        let id = ""
        for (let i = 0; i < ids.length; i++) {
            if (i === 0) {
                id = ids[i]
            } else {
                id = id + "-" + ids[i]
            }
        }
        return id
    }

    static createHashID(ids: Array<string>): string {
        const tupleValue: Array<ethereum.Value> = new Array<ethereum.Value>(ids.length);
        for (let i = 0; i < ids.length; i++) {
            tupleValue[i] = ethereum.Value.fromString(ids[i]);
        }
        const encodeData = ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleValue)))!;
        const key = crypto.keccak256(encodeData);
        return key.toHexString();
    }

    static createEventID(
        event: ethereum.Event
    ): string {
        return (
            event.transaction.hash.toHexString() +
            "-" +
            event.logIndex.toString()
        );
    }

    static createHashEventID(
        event: ethereum.Event
    ): string {
        const ids = [event.transaction.hash.toHexString(), event.logIndex.toString()];
        const tupleValue: Array<ethereum.Value> = new Array<ethereum.Value>(ids.length);
        for (let i = 0; i < ids.length; i++) {
            tupleValue[i] = ethereum.Value.fromString(ids[i]);
        }
        const encodeData = ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleValue)))!;
        const key = crypto.keccak256(encodeData);
        return key.toHexString();
    }
}

export class calldata {
    static getSelector(data: Bytes): Bytes {
        return Bytes.fromHexString(data.toHexString().slice(2, 10));
    }

    static addPrefix(data: Bytes): Bytes {
        const dataWithoutSelector = Bytes.fromUint8Array(data.slice(4, data.length))
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
    static decodeWOPrefix(data: Bytes, functionFormat: string): ethereum.Tuple {
        const decoded = ethereum.decode(
            functionFormat,
            data
        ) as ethereum.Value;
        if (!decoded) {
            log.error("Failed to decode transaction input data", ["error"])
        }
        let tuple = decoded.toTuple();
        return tuple
    }

    static decode(data: Bytes, functionFormat: string): ethereum.Tuple {
        const tupleInputBytes = this.addPrefix(data)
        const decoded = ethereum.decode(
            functionFormat,
            tupleInputBytes
        ) as ethereum.Value;
        if (!decoded) {
            log.error("Failed to decode transaction input data", ["error"])
        }
        let tuple = decoded.toTuple();
        return tuple
    }
}

export function encode(values: Array<ethereum.Value>): Bytes {
    const tuple = changetype<ethereum.Tuple>(new ArrayBuffer(32 * values.length));
    for (let i = 0; i < values.length; i++) {
        tuple[i] = values[i];
    }
    return ethereum.encode(ethereum.Value.fromTuple(tuple))!;
}


export function intConverHexString(value: BigInt): string {
    if (value) {
        return value.toHexString()
    } else {
        const address = Address.fromString("0x0000000000000000000000000000000000000000")
        return address.toHexString()
    }
}
export function padZeroToUint(hexString: string): string {
    const uint256Length = 64;
    let paddedHexString = hexString;
    if (paddedHexString.startsWith('0x')) {
        paddedHexString = paddedHexString.slice(2);
    }
    const hexStringLength = paddedHexString.length;
    if (hexStringLength < uint256Length) {
        const paddingLength = uint256Length - hexStringLength;
        const padding = '0'.repeat(paddingLength);
        paddedHexString = padding + paddedHexString;
    } else if (hexStringLength > uint256Length) {
        throw new Error('Invalid hex string length');
    }
    return '0x' + paddedHexString;
}

export function padZeroToAddress(hexString: string): string {
    const uint256Length = 40;
    let paddedHexString = hexString;
    if (paddedHexString.startsWith('0x')) {
        paddedHexString = paddedHexString.slice(2);
    }
    const hexStringLength = paddedHexString.length;
    if (hexStringLength < uint256Length) {
        const paddingLength = uint256Length - hexStringLength;
        const padding = '0'.repeat(paddingLength);
        paddedHexString = padding + paddedHexString;
    } else if (hexStringLength > uint256Length) {
        throw new Error('Invalid hex string length');
    }
    return '0x' + paddedHexString;
}

export function findDifferentData(A: string[], B: string[]): string[] {
    // find the elements in A that are not in B
    // b elements > a elements
    const differentData: string[] = [];

    for (let i = 0; i < B.length; i++) {
        let found = false;

        for (let j = 0; j < A.length; j++) {
            if (B[i] == A[j]) {
                found = true;
                break;
            }
        }

        if (!found) {
            differentData.push(B[i]);
        }
    }

    return differentData;
}
