import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";


@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        FlexLayoutModule
    ],
    exports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        FlexLayoutModule
    ]
})
export class SharedModule {}