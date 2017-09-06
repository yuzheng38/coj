import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CollaborationService } from '../../services/collaboration.service';
import { DataService } from '../../services/data.service';
import { UserCode } from '../../data-structure/user-code';

declare const ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  private editor: any;
  private language: string;
  private languages: string[];
  private sessionId: string;
  private defaultContent: any;
  private output: string = '';

  constructor(private collaborationService: CollaborationService,
              private activatedRoute: ActivatedRoute,
              @Inject('data') private dataService) {
    this.defaultContent = {
    'Java': `public class Solution {
    public static void main(String[] args) {
      // Your code here ...
    }
}`,
    'Python': `class Solution:
    def example():
      # Your code here ...`
    };
    this.languages = this.getLanguages();
    this.language = this.languages[0];
  }

  ngOnInit() { 
    // i need to handle
    // 1. creation of a new marker and placed at its default place
    // 2. 
    this.activatedRoute.params.subscribe(params => {
      this.sessionId = params['id'];
      this.initEditor();
    });
  }

  private initEditor(): void {
    this.editor = ace.edit('ace-editor');
    this.editor.setTheme('ace/theme/crimson_editor');
    this.resetEditor();
    // besides focus, need to write a function to get a list of all cursors. i think cursors need to be saved
    // in redis as well. 
    document.getElementsByTagName('textarea')[0].focus();
    this.collaborationService.init(this.editor, this.sessionId);

    this.editor.lastAppliedChange = null;
    this.editor.on('change', e => {
      // console.log('editor change (editor comp): ' + JSON.stringify(e));
      if(e != this.editor.lastAppliedChange){
        this.collaborationService.change(JSON.stringify(e));
        this.editor.lastAppliedChange = e;
      }
    });

    // cursor movement event listener - Selection.changeCursor event from ace API
    // there's also Selection.changeSelection
    this.editor.getSession().getSelection().on('changeCursor', () => {
      const cursor = this.editor.getSession().getSelection().getCursor();
      console.log('cursor move (from comp)', JSON.stringify(cursor));
      this.collaborationService.cursorMove(JSON.stringify(cursor));
    });

    // restoring buffer using collaboration service
    this.collaborationService.restoreBuffer();
  }

  resetEditor(): void {
    console.log(`Setting editor to ${this.language}`);
    this.editor.getSession().setMode(`ace/mode/${this.language.toLowerCase()}`);
    this.editor.setValue(this.defaultContent[this.language]);
    this.output = '';
  }

  submitSolution(): void {
    this.output = '';
    // console.log(this.editor.getValue());
    const userCode = this.editor.getValue();
    const codes: UserCode = {
      lang: this.language.toLowerCase(),
      code: userCode
    };
    this.dataService.repl(codes)
      .then(res => this.output = res.result);
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  getLanguages(): string[] {
    return Object.keys(this.defaultContent);
  }
}
