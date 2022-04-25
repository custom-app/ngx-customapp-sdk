import {Inject, Injectable} from '@angular/core';
import {WebSocketChain} from '../models/web-socket-chain';
import {WEB_SOCKET_CHAIN} from '../constants/di-token';
import {SocketId} from '../models/individual-web-socket-config';
import {WebSocketController} from 'customapp-rxjs-websocket';
import {
  catchError,
  EMPTY, first,
  forkJoin,
  map,
  mergeMap,
  Observable,
  Subject,
  take,
  tap,
  timeout,
  withLatestFrom,
  zip
} from 'rxjs';
import {createSocket, socketResponses, SocketResponses} from '../utils/socket';
import {Store} from '@ngrx/store';
import {JWT_SELECTORS, JwtGroup, JwtInfo, JwtSelectors, JwtService} from 'ngx-customapp-jwt';
import {WebSocketChainLink} from '../models/web-socket-chain-link';

export const closeTimeout = 10 * 1000;

@Injectable({
  providedIn: 'root'
})
export class WebSocketsOwnerService<RequestType,
  ResponseType,
  UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView,
  UserInfo,
  Credentials,
  AuthResponse,
  UserId = number> {

  constructor(
    @Inject(WEB_SOCKET_CHAIN) private chain: WebSocketChain<RequestType, ResponseType, UnderlyingDataType, UserInfo>,
    private store: Store<any>, // used only for one selector: selectJwtUser
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo, UserId>,
    @Inject(JWT_SELECTORS) private s: JwtSelectors<UserInfo>
  ) {
    this._initFirstChainLink()
  }

  private _jwtAndUserInfo = (): Observable<[JwtGroup<JwtInfo> | undefined, UserInfo | undefined]> => this.jwtService
    .freshJwt()
    .pipe(
      withLatestFrom(this.store.select(this.s.selectJwtUser))
    )

  private _sockets: Record<SocketId, WebSocketController<RequestType, ResponseType, UnderlyingDataType>> = {}

  get sockets() {
    return this._sockets
  }

  socketsArray(): WebSocketController<RequestType, ResponseType, UnderlyingDataType>[] {
    const arr = []
    const dict = this.sockets
    for (const socketId in dict) {
      arr.push(dict[socketId])
    }
    return arr
  }

  private _initFirstChainLink() {
    const commonConfig = this.chain.commonConfig
    const chainLink = this.chain.chain
    chainLink.sockets.forEach(individualConfig => {
      this.sockets[individualConfig.socketId] = createSocket(commonConfig, individualConfig, this._jwtAndUserInfo)
    })
  }

  /**
   * Init all the sockets according to config. Should be called only once per login.
   */
  init(): Observable<void> {
    const initialized$ = new Subject<void>()
    const commonConfig = this.chain.commonConfig
    const commonOpenOptions = this.chain.commonOpenOptions
    let currentChainLink: WebSocketChainLink<RequestType, ResponseType, UserInfo> = this.chain.chain
    // first chain link in WebSocketChain is initialized (but not opened) in the constructor.
    let firstRun = true
    console.log('init sockets', this.chain)
    const launch = () => {
      forkJoin(
        currentChainLink
          .sockets
          .map(individualConfig => {
            let socket: WebSocketController<RequestType, ResponseType, UnderlyingDataType>
            if (firstRun) {
              socket = this.sockets[individualConfig.socketId]
            } else {
              socket = createSocket(commonConfig, individualConfig, this._jwtAndUserInfo)
              this.sockets[individualConfig.socketId] = socket
            }
            socket.open(commonOpenOptions)
            return socketResponses(socket)
          })
      ).pipe(
        tap(responses => console.log('init socket responses', responses)),
        // to handle case, when one of the socketResponse$ observable completed without emitting a value
        // that means, that socket is not opened, and initialized$ should error
        first(),
        mergeMap(responses =>
          this._jwtAndUserInfo()
            .pipe(
              take(1),
              mergeMap(([jwt, userInfo]) => {
                  if (currentChainLink.socketsReady) {
                    return currentChainLink.socketsReady(
                      userInfo,
                      jwt,
                      responses
                        .reduce((acc, response, index) => {
                          const individualConfig = currentChainLink.sockets[index]
                          acc[individualConfig.socketId] = response
                          return acc
                        }, {} as Record<SocketId, SocketResponses<ResponseType>>)
                    )
                  } else {
                    initialized$.next()
                    initialized$.complete()
                    return EMPTY
                  }
                }
              )
            )
        ),
        catchError(err => {
          initialized$.error(err)
          return EMPTY
        }),
      ).subscribe(
        nextChainLink => {
          currentChainLink = nextChainLink
          firstRun = false
          launch()
        }
      )
    }
    launch()
    return initialized$
  }

  closeAll(): Observable<void> {
    return zip(
      this.socketsArray()
        .map(socket => socket.close())
    ).pipe(
      map(() => void 0),
      timeout(closeTimeout)
    )
  }
}
