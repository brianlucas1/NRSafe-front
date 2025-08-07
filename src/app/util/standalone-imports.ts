import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RippleModule } from "primeng/ripple";
import { StyleClassModule } from "primeng/styleclass";
import { AppConfigurator } from "../components/layout/app.configurator";
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { ChartModule } from 'primeng/chart';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from "primeng/password";
import { FluidModule } from 'primeng/fluid';
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from 'primeng/multiselect';

export const StandaloneImports = [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    RippleModule,
    StyleClassModule,
    FluidModule,
    ToastModule,
    AppConfigurator,
    InputTextModule,
    DropdownModule,
    TableModule,
    ToolbarModule,
    RatingModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    ChartModule,
    IconFieldModule,
    ConfirmDialogModule,
    ButtonModule,
    InputMaskModule,
    PasswordModule,
    MultiSelectModule,
    DatePickerModule
];