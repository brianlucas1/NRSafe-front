import { Component, OnInit, SimpleChanges } from '@angular/core';
import { StandaloneImports } from '../../util/standalone-imports';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-plano-acao',
  standalone: true,
  imports: [StandaloneImports],
  templateUrl: './plano-acao.component.html',
  styleUrl: './plano-acao.component.scss',
  providers: [MessageService]
})
export class PlanoAcaoComponent implements OnInit {


  constructor(

  ) { }
  ngOnInit(): void {
    
  }

  
}
