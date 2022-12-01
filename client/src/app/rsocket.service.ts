import { Injectable } from '@angular/core';
import { RxRequestersFactory } from 'rsocket-adapter-rxjs';
import {
    encodeBearerAuthMetadata,
    encodeCompositeMetadata,
    encodeRoute,
    WellKnownMimeType,
} from 'rsocket-composite-metadata';
import { RSocket, RSocketConnector } from 'rsocket-core';
import { RSocketRequester } from 'rsocket-messaging';
import { WebsocketClientTransport } from 'rsocket-websocket-client';
import {
    catchError,
    from,
    map,
    mergeMap,
    Observable,
    tap,
    throwError,
} from 'rxjs';
import { ModelCodec } from './model-codec';
import { Product } from './product';
import { StringCodec } from './string-codec';

@Injectable({
    providedIn: 'root',
})
export class RsocketService {
    private _stringCodec = new StringCodec();
    private _modelCodec = new ModelCodec<Product>();
    private _rsocket$!: Observable<RSocket>;
    private _rsocketRequester$!: Observable<RSocketRequester>;
    private _rsocket!: RSocket | null;

    constructor() {
        this._makeRSocketRequester();
    }

    private _makeRSocketRequester(): void {
        this._makeRSocket();
        this._rsocketRequester$ = this._rsocket$.pipe(
            tap((rsocket: RSocket) => {
                this._rsocket = rsocket;
            }),
            map((rsocket: RSocket) => RSocketRequester.wrap(rsocket))
        );
    }

    private _makeRSocket(): void {
        const rsocketConnector = this._makeRSocketConnector();
        this._rsocket$ = from(rsocketConnector.connect());
    }

    private _makeRSocketConnector(): RSocketConnector {
        return new RSocketConnector({
            transport: new WebsocketClientTransport({
                url: 'ws://localhost:7000/graphql',
            }),
            setup: {
                payload: {
                    data: Buffer.from('2a33f36d-dad-4b84-9b63-fd868b84dfd8'),
                    metadata: encodeCompositeMetadata([
                        [
                            WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
                            encodeRoute('connect.setup'),
                        ],
                    ]),
                },
                // ms between sending keepalive to server
                keepAlive: 60000,
                // ms timeout if no keepalive response
                lifetime: 180000,
                dataMimeType: WellKnownMimeType.APPLICATION_JSON.toString(),
                metadataMimeType:
                    WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.toString(),
            },
        });
    }

    requestResponseJwt(
        data: any,
        route: string,
        token: string
    ): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(token)
                    )
                    .request(
                        RxRequestersFactory.requestResponse(
                            data,
                            this._stringCodec,
                            this._modelCodec
                        )
                    )
            ),
            catchError((error: any, caught: Observable<Product>) =>
                throwError(() => new Error('An error occured !'))
            )
        );
    }

    requestResponse(data: any, route: string): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .request(
                        RxRequestersFactory.requestResponse(
                            data,
                            this._stringCodec,
                            this._modelCodec
                        )
                    )
            )
        );
    }

    requestStream(payload: string, route: string): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .request(
                        RxRequestersFactory.requestStream(
                            payload,
                            this._stringCodec,
                            this._modelCodec
                        )
                    )
            )
        );
    }

    requestStreamJwt(
        payload: string,
        route: string,
        token: string
    ): Observable<Product> {
        return this._rsocketRequester$.pipe(
            mergeMap((requester: RSocketRequester) =>
                requester
                    .route(route)
                    .metadata(
                        WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION,
                        encodeBearerAuthMetadata(token)
                    )
                    .request(
                        RxRequestersFactory.requestStream(
                            payload,
                            this._stringCodec,
                            this._modelCodec
                        )
                    )
            )
        );
    }

    closeConnection(): void {
        if (this._rsocket) {
            this._rsocket.close();
            this._rsocket = null;
        }
    }
}
