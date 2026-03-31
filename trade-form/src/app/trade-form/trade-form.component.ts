import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-trade-form',
  templateUrl: './trade-form.component.html',
  styleUrls: ['./trade-form.component.css']
})
export class TradeFormComponent implements OnInit {
  tradeForm!: FormGroup;
  selectedFileName = 'No file chosen';
  readonly ROW_COUNT = 10;

  inputTypes = ['Security identifiers', 'Manual entry', 'CSV upload'];
  typeOptions = ['Equity', 'Fixed Income', 'Option', 'Future', 'Fund', 'FX'];
  sideOptions = ['Buy', 'Sell', 'Short Sell', 'Cover'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.tradeForm = this.fb.group({
      inputType: ['Security identifiers', Validators.required],
      attachment: [null],
      rows: this.fb.array(
        Array.from({ length: this.ROW_COUNT }, () => this.createRow())
      )
    });
  }

  createRow(): FormGroup {
    return this.fb.group({
      securityName: ['', Validators.required],
      identifier: ['', Validators.required],
      type: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      side: ['', Validators.required]
    });
  }

  get rows(): FormArray {
    return this.tradeForm.get('rows') as FormArray;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileName = input.files[0].name;
      this.tradeForm.patchValue({ attachment: input.files[0] });
    }
  }

  onAttach(): void {
    // Handle attachment logic
    console.log('Attaching file:', this.selectedFileName);
  }

  onSubmit(): void {
    if (this.tradeForm.valid) {
      console.log('Form submitted:', this.tradeForm.value);
    } else {
      this.tradeForm.markAllAsTouched();
    }
  }

  isInvalid(rowIndex: number, field: string): boolean {
    const control = this.rows.at(rowIndex).get(field);
    return !!(control && control.invalid && control.touched);
  }
}
