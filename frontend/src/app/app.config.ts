import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateModule, TranslateService, TranslationObject } from '@ngx-translate/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/** Çevirileri uygulama açılmadan yükle; böylece ilk sayfada anahtar yerine metin görünür. */
function loadTranslationsBeforeBootstrap(http: HttpClient, translate: TranslateService): () => Promise<void> {
  return () =>
    firstValueFrom(
      forkJoin({
        tr: http.get<TranslationObject>('/assets/i18n/tr.json'),
        en: http.get<TranslationObject>('/assets/i18n/en.json')
      }).pipe(
        tap(({ tr, en }) => {
          translate.setTranslation('tr', tr);
          translate.setTranslation('en', en);
          translate.setDefaultLang('tr');
          translate.use('tr');
        })
      )
    ).then(() => undefined);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideTranslateService({ fallbackLang: 'tr', lang: 'tr' }),
    {
      provide: APP_INITIALIZER,
      useFactory: loadTranslationsBeforeBootstrap,
      deps: [HttpClient, TranslateService],
      multi: true
    },
    importProvidersFrom(TranslateModule)
  ]
};
