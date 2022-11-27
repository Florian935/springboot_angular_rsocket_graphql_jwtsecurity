import { Component, OnInit } from '@angular/core';
import { map, mergeMap, tap } from 'rxjs';
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
                map((response: any) => response.data.authenticate.token),
                mergeMap((token: string) =>
                    this._rsocketService
                        .requestResponseJwt(productById, 'graphql', token)
                        .pipe(
                            tap(console.log),
                            map(() => token)
                        )
                ),
                mergeMap((token: string) =>
                    this._rsocketService.requestStreamJwt(
                        products,
                        'graphql',
                        token
                    )
                )
            )
            .subscribe(console.log);
    }
}
