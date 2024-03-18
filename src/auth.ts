import { HttpClient, OAuth2AuthCodePKCE } from '@bity/oauth2-auth-code-pkce';
import { readStream } from './ndJsonStream';
import { BASE_PATH } from './routing';

export const lichessHost = 'https://lichess.org';
// export const lichessHost = 'http://l.org';
//export const lichessHost ='https://8080-lichessorg-liladocker-6iz4peawqt3.ws-eu106.gitpod.io';
export const scopes = ['board:play'];
// export const clientId = 'lichess-api-demo';
export const clientId = 'fairchess';
export const clientUrl = `${location.protocol}//${location.host}${BASE_PATH || '/'}`;

export interface Me {
  id: string;
  username: string;
  httpClient: HttpClient; // with pre-set Authorization header
  perfs: { [key: string]: any };
}

export class Auth {
  oauth = new OAuth2AuthCodePKCE({
    authorizationUrl: `${lichessHost}/oauth`,
    tokenUrl: `${lichessHost}/api/token`,
    clientId,
    scopes,
    redirectUrl: clientUrl,
    onAccessTokenExpiry: refreshAccessToken => refreshAccessToken(),
    onInvalidGrant: console.warn,
  });
  me?: Me;

  async makeApiRequest(path: string, config = {}) {
    const res = await this.fetchResponse(path, config);
    if (res.error || !res.ok) {
      const err = `${res.error} ${res.status} ${res.statusText}`;
      alert(err);
      throw err;
    }
    return res;
  }


  async init() {
    try {
      const accessContext = await this.oauth.getAccessToken();
      if (accessContext) await this.authenticate();
    } catch (err) {
      console.error(err);
    }
    if (!this.me) {
      try {
        const hasAuthCode = await this.oauth.isReturningFromAuthServer();
        if (hasAuthCode) await this.authenticate();
      } catch (err) {
        console.error(err);
      }
    }
  }

  async login() {
    await this.oauth.fetchAuthorizationCode();
  }

  async logout() {
    if (this.me) await this.me.httpClient(`${lichessHost}/api/token`, { method: 'DELETE' });
    localStorage.clear();
    this.me = undefined;
  }

  private authenticate = async () => {
    const httpClient = this.oauth.decorateFetchHTTPClient(window.fetch);
    const res = await httpClient(`${lichessHost}/api/account`);
    const me = {
      ...(await res.json()),
      httpClient,
    };
    if (me.error) throw me.error;
    this.me = me;
  };

  openStream = async (path: string, config: any, handler: (_: any) => void) => {
    const stream = await this.fetchResponse(path, config);
    return readStream(`STREAM ${path}`, stream, handler);
  };

  openStreamGame = async (path: string, config: any, handler: (_: any) => void) => {
    const stream = await this.fetchResponse(path, config);
    return readStream(`STREAM ${path}`, stream, handler);
  };

  fetchBody = async (path: string, config: any = {}) => {
    const res = await this.fetchResponse(path, config);
    const body = await res.json();
    return body;
  };

  fetchBodyNoJson = async (path: string, config: any = {}) => {
    const res = await this.fetchResponse(path, config);
    const body = await res.text();
    return body;
  };

  private fetchResponse = async (path: string, config: any = {}) => {
    const res = await (this.me?.httpClient || window.fetch)(`${lichessHost}${path}`, config);
    if (res.error || !res.ok) {
      const err = `${res.error} ${res.status} ${res.statusText}`;
      alert(err);
      throw err;
    }
    return res;
  };

  async streamChat(gameId: string, handler: (_: any) => void) {
    const streamPath = `/api/board/game/stream/${gameId}/chat`;

    const stream = await this.openStream(streamPath, {}, handler);
    return stream;
  }

 
}
