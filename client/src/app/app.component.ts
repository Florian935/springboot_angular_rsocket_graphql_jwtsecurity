import { Component, OnInit } from '@angular/core';
import { mergeMap, tap } from 'rxjs';
import { RsocketService } from './rsocket.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(private readonly _rsocketService: RsocketService) {}

    ngOnInit(): void {
        const productById = JSON.stringify({
            query: `query productById($id: ID!) {
                productById(id: $id) {
                    id
                    label
                    price
                }
            }`,
            variables: { id: '123' },
            operationName: 'productById',
        });

        const authenticate = JSON.stringify({
            query: `query authenticate {
                    authenticate {
                        token
                    }
                }`,
            variables: {},
            operationName: 'authenticate',
        });

        this._rsocketService
            .requestResponse(authenticate, 'graphql')
            .pipe(
                tap(console.log),
                mergeMap((response: any) =>
                    this._rsocketService.requestResponseJwt(
                        productById,
                        'graphql',
                        response.data.authenticate.token
                    )
                )
            )
            .subscribe(console.log);

        const products = JSON.stringify({
            query: `subscription products($ids: [ID]!) {
                        products(ids: $ids) {
                            id
                            label
                            price
                        }
                    }
                    `,
            variables: {
                ids: ['1', '2', '3', '4', '5'],
            },
            operationName: 'products',
        });

        this._rsocketService
            .requestResponse(authenticate, 'graphql')
            .pipe(
                tap(console.log),
                mergeMap((response: any) =>
                    this._rsocketService.requestStreamJwt(
                        products,
                        'graphql',
                        response.data.authenticate.token
                    )
                )
            )
            .subscribe(console.log);
    }
}
