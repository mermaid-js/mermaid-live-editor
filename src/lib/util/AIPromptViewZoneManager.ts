import type * as monaco from 'monaco-editor';

export class AIPromptViewZoneManager {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private viewZoneId: string | null = null;
  private viewZoneNode: HTMLElement | null = null;
  private viewZone: monaco.editor.IViewZone | null = null;
  private topPopupSpace = 8;

  public setEditor(editor: monaco.editor.IStandaloneCodeEditor): void {
    this.editor = editor;
  }

  public show(lineNumber: number, node: HTMLElement, height: number): void {
    if (!this.editor) return;

    this.viewZoneNode = node;

    this.editor.changeViewZones((changeAccessor) => {
      if (this.viewZoneId) {
        changeAccessor.removeZone(this.viewZoneId);
      }

      const domNode = document.createElement('div');
      domNode.style.top = '0px';
      domNode.style.paddingTop = '8px';
      domNode.style.paddingBottom = '0px';
      domNode.appendChild(this.viewZoneNode as Node);

      this.viewZone = {
        afterLineNumber: lineNumber,
        heightInPx: height + this.topPopupSpace,
        domNode: domNode
      };

      this.viewZoneId = changeAccessor.addZone(this.viewZone);
    });
  }

  public updateHeight(height: number): void {
    if (!this.editor || !this.viewZoneId || !this.viewZone) return;

    this.viewZone.heightInPx = height + this.topPopupSpace;
    this.editor.changeViewZones((changeAccessor) => {
      if (this.viewZoneId) {
        changeAccessor.layoutZone(this.viewZoneId);
      }
    });
  }

  public hide(): void {
    if (!this.editor || !this.viewZoneId) return;

    this.editor.changeViewZones((changeAccessor) => {
      if (this.viewZoneId) {
        changeAccessor.removeZone(this.viewZoneId);
        this.viewZoneId = null;
        this.viewZone = null;
      }
    });

    if (this.viewZoneNode) {
      this.viewZoneNode = null;
    }
  }

  public destroy(): void {
    this.hide();
    this.editor = null;
  }
}
