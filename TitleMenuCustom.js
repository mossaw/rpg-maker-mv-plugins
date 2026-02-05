/*:
 * @plugindesc タイトルメニューカスタム
 * @author mossaw with Gemini3
 *
 * @param ShowContinue
 * @text コンティニュー表示
 * @desc タイトル画面でコンティニューを表示するかどうか
 * @type boolean
 * @default false
 *
 * @param ShowOptions
 * @text オプション表示
 * @desc タイトル画面でオプションを表示するかどうか
 * @type boolean
 * @default true
 *
 * @help
 * タイトル画面のコマンド（ニューゲーム、コンティニュー、オプション）
 * の表示・非表示を個別に切り替えられるプラグインです。
 */

(() => {
    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
    const parameters = PluginManager.parameters(pluginName);
    
    const showContinue = parameters['ShowContinue'] === 'true';
    const showOptions = parameters['ShowOptions'] === 'true';

    // タイトルコマンドウィンドウのリスト作成処理を上書き
    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        // ニューゲームは基本出すのでそのまま
        this.addCommand(TextManager.newGame, "newGame");
        
        // コンティニュー判定
        if (showContinue) {
            this.addCommand(TextManager.continue_, "continue", this.isContinueEnabled());
        }
        
        // オプション判定
        if (showOptions) {
            this.addCommand(TextManager.options, "options");
        }
    };
})();