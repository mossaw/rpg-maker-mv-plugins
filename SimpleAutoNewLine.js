/*:
 * @plugindesc 指定文字数ごとに自動改行（禁則処理付き）
 * @author mossaw with Gemini3
 * * @help
 * メッセージウィンドウで、指定文字数に達した時に自動で改行します。
 * ・行頭禁則処理（「。」や「）」などが先頭に来ないように調整）。
 * ・制御文字（\V[n]など）の展開後の文字数カウントに対応。
 * * @param MaxChars
 * @text 改行文字数
 * @desc 1行に表示する最大文字数です。
 * @type number
 * @default 26
 * * @param KinsokuChars
 * @text 行頭禁則文字
 * @desc 行の先頭に来てはいけない文字を指定します。
 * @default 、。！？）］｝〉》」』】〕ぁぃぅぇぉっゃゅょゎー
 */

(() => {
    const pluginName = 'SimpleAutoNewLine';
    const parameters = PluginManager.parameters(pluginName);
    const maxChars = Number(parameters['MaxChars'] || 26);
    const kinsokuChars = String(parameters['KinsokuChars'] || "、。！？）］｝〉》」』】〕ぁぃぅぇぉっゃゅょゎー");

    // メッセージ開始時にカウントをリセット
    const _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        this._lineCharCount = 0;
        _Window_Message_startMessage.call(this);
    };

    // 通常文字の描画処理
    const _Window_Message_processNormalCharacter = Window_Message.prototype.processNormalCharacter;
    Window_Message.prototype.processNormalCharacter = function(textState) {
        const c = textState.text[textState.index]; // これから描画する文字
        
        // 指定文字数に達しているかチェック
        if (this._lineCharCount >= maxChars) {
            // 禁則処理：今から書く文字が行頭禁止文字なら、改行を1文字遅らせる
            if (!kinsokuChars.contains(c)) {
                this.processAutoNewLine(textState);
            }
        }
        
        _Window_Message_processNormalCharacter.call(this, textState);
        this._lineCharCount++;
    };
    
    // 手動改行（\n）があった時の処理
    const _Window_Message_processNewLine = Window_Message.prototype.processNewLine;
    Window_Message.prototype.processNewLine = function(textState) {
        _Window_Message_processNewLine.call(this, textState);
        this._lineCharCount = 0; 
    };

    /**
     * 自動改行用の処理（標準のprocessNewLineと違い、indexを進めない）
     */
    Window_Message.prototype.processAutoNewLine = function(textState) {
        textState.x = textState.left;
        textState.y += textState.height;
        textState.height = this.calcTextHeight(textState, false);
        this._lineCharCount = 0;
        // textState.index++ をしないのがポイント
    };
})();