import {ModuleWithProviders, NgModule} from '@angular/core';
import {ErrorsConfig} from './models/errors-config';
import {ERRORS_CONFIG} from './constants/di-token';
import {ErrorsReporter} from './models/errors-reporter';
import {UnhandledErrorHandler} from './models/unhandled-error-handler';
import {DoodleUnhandledErrorHandlerService} from './services/doodle-unhandled-error-handler.service';


@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class ErrorsModule {
  static forRoot(config: ErrorsConfig): ModuleWithProviders<ErrorsModule> {
    return {
      ngModule: ErrorsModule,
      providers: [
        {
          provide: ERRORS_CONFIG,
          useValue: config,
        },
        {
          provide: ErrorsReporter,
          useExisting: config.reporter
        },
        {
          provide: UnhandledErrorHandler,
          useExisting: config.unhandled ? config.unhandled : DoodleUnhandledErrorHandlerService
        }
      ]
    }
  }
}
