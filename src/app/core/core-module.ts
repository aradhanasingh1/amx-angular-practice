import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * CoreModule
 * - Place singleton services, app-wide guards, interceptors (if not provided via app config),
 *   and top-level layout components here.
 * - This module should be imported once (in the application root).
 */
@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [],
  exports: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule | null) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
