import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {ErrorsReporter} from '../models/errors-reporter';
import {ERRORS_CONFIG} from '../constants/di-token';
import {ErrorsConfig} from '../models/errors-config';
import {throwError} from 'rxjs';
import {addErrorContext, errorToUserText, normalizeError} from '../utils/internal';
import {LocaleId, NormalizedError} from '../models/errors-text';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  private readonly doNotSend: Set<NormalizedError>

  constructor(
    @Inject(ERRORS_CONFIG) private config: ErrorsConfig,
    @Inject(LOCALE_ID) private locale: LocaleId,
    private reporter: ErrorsReporter,
  ) {
    this.doNotSend = new Set<NormalizedError>(this.config.doNotSend)
  }

  public sendError(error: any): void {
    if (this.config.production) {
      this
        .reporter
        .report(
          addErrorContext(error)
        )
    }
  }

  reportError = (error: any) => {
    if (this.config.isErrorResponse(error)) {
      // handling error response from backend
      const normalized = this.config.errorResponseToNormalizedError(error)
      if (!this.doNotSend.has(normalized)) {
        // no call to errorToUserText, cos it is being sent to backend, not shown to user
        this.sendError(error);
      }
    } else {
      // handling unknown errors
      const normalized = normalizeError(error)
      if (!this.doNotSend.has(normalized)) {
        this.sendError(error);
      }
    }
    return throwError(error);
  }

  toUserError = (error: any) =>
    throwError(() => errorToUserText(error, this.config, this.locale));
}
