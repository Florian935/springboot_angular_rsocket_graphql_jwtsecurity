import { Codec } from 'rsocket-messaging';

export class ModelCodec<T> implements Codec<T> {
    readonly mimeType: string = 'text/plain';

    decode(buffer: Buffer): T {
        return JSON.parse(buffer.toString());
    }
    encode(entity: T): Buffer {
        return Buffer.from(JSON.stringify(entity));
    }
}
