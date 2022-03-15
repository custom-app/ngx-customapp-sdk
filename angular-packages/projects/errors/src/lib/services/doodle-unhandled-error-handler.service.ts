import {Injectable} from '@angular/core';
import {UnhandledErrorHandler} from '../models/unhandled-error-handler';

@Injectable()
export class DoodleUnhandledErrorHandlerService implements UnhandledErrorHandler {

  unhandledError(error: any) {
    // nothing
  }
}
