import { Codec } from 'rsocket-messaging';

export class StringCodec implements Codec<string> {
    readonly mimeType: string = 'text/plain';

    decode(buffer: Buffer): string {
        return buffer.toString();
    }
    encode(entity: string): Buffer {
        return Buffer.from(entity);
    }
}
