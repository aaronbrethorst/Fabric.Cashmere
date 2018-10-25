import {NgModule} from '@angular/core';
import {IconComponent} from './icon.component';
import {HcIconSmallDirective} from './hc-icon-sm.directive';
import {HcIconMediumDirective} from './hc-icon-md.directive';
import {HcIconLargeDirective} from './hc-icon-lg.directive';

@NgModule({
    declarations: [IconComponent, HcIconSmallDirective, HcIconMediumDirective, HcIconLargeDirective],
    exports: [IconComponent, HcIconSmallDirective, HcIconMediumDirective, HcIconLargeDirective]
})
export class IconModule {}
