import {Injectable} from '@angular/core';
import {UnhandledErrorHandler} from '../models/unhandled-error-handler';

@Injectable({
  providedIn: 'root',
})
export class DoodleUnhandledErrorHandlerService implements UnhandledErrorHandler {

  unhandledError(error: any) {
    // nothing
  }
}
