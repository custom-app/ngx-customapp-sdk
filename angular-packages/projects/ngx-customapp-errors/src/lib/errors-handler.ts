import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {ErrorsService} from './services/errors.service';
import {UnhandledErrorHandler} from './models/unhandled-error-handler';

@Injectable()
export class ErrorsHandler extends ErrorHandler {

  constructor(private injector: Injector) {
    super();
  }

  override handleError(error: any): void {
    console.error(error);
    // last resort, if the code below errors, it is impossible to handle error.
    const errorsDisplay = this.injector.get(UnhandledErrorHandler);
    if (errorsDisplay?.unhandledError) {
      errorsDisplay.unhandledError(error)
    }
    const errorsService = this.injector.get(ErrorsService);
    errorsService.sendError(error);
  }
}
