/*:
 * @plugindesc メニューカスタムプラグイン
 * @author mossaw with Gemini3
 *
 * @param ShowItem
 * @text アイテム表示
 * @type boolean
 * @default false
 *
 * @param ShowSkill
 * @text スキル表示
 * @type boolean
 * @default false
 *
 * @param ShowEquip
 * @text 装備表示
 * @type boolean
 * @default false
 *
 * @param ShowStatus
 * @text ステータス表示
 * @type boolean
 * @default false
 *
 * @param ShowOptions
 * @text オプション表示
 * @type boolean
 * @default true
 *
 * @param ShowParty
 * @text パーティー画像(ステータス)表示
 * @type boolean
 * @default false
 *
 * @param ShowSave
 * @text セーブ表示
 * @type boolean
 * @default true
 *
 * @param ShowLoad
 * @text ロード表示
 * @type boolean
 * @default true
 *
 * @param ShowGold
 * @text 所持金表示
 * @type boolean
 * @default false
 *
 * @help
 * ・デフォルトのメニューの表示/非表示を切り替えられます
 * ・パーティー画像非表示の場合はメニューが画面中央寄せになります
 */

(() => {
    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");
    const parameters = PluginManager.parameters(pluginName);
    
    const showItem = parameters['ShowItem'] === 'true';
    const showSkill = parameters['ShowSkill'] === 'true';
    const showEquip = parameters['ShowEquip'] === 'true';
    const showStatus = parameters['ShowStatus'] === 'true';
    const showOptions = parameters['ShowOptions'] === 'true';
    const showParty = parameters['ShowParty'] === 'true';
    const showSave = parameters['ShowSave'] === 'true';
    const showLoad = parameters['ShowLoad'] === 'true';
    const showGold = parameters['ShowGold'] === 'true';

    // 1. メニューコマンドの整理
    Window_MenuCommand.prototype.makeCommandList = function() {
        if (showItem) this.addMainCommands();
        if (showSkill) this.addSkillCommands();
        if (showEquip) this.addEquipCommands();
        if (showStatus) this.addStatusCommand();
        if (showOptions) this.addOptionsCommand();
        if (showSave) this.addSaveCommand();
        if (showLoad) this.addCommand("ロード", "load"); 
        this.addGameEndCommand();
    };

    Window_MenuCommand.prototype.addFormationCommand = function() {};

    // 2. ロード機能の紐付け
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler('load', this.commandLoad.bind(this));
    };

    Scene_Menu.prototype.commandLoad = function() {
        SceneManager.push(Scene_Load);
    };

    // 3. パーティーウィンドウ（画像）の表示切り替え
    const _Scene_Menu_createStatusWindow = Scene_Menu.prototype.createStatusWindow;
    Scene_Menu.prototype.createStatusWindow = function() {
        _Scene_Menu_createStatusWindow.call(this);
        if (showParty) {
            this._statusWindow.show();
        } else {
            this._statusWindow.hide();
            this._statusWindow.deactivate();
        }
    };

    // 4. お金ウィンドウ
    const _Scene_Menu_createGoldWindow = Scene_Menu.prototype.createGoldWindow;
    Scene_Menu.prototype.createGoldWindow = function() {
        _Scene_Menu_createGoldWindow.call(this);
        if (showGold) {
            this._goldWindow.show();
        } else {
            this._goldWindow.hide();
        }
    };

    // 5. レイアウト調整
    const _Scene_Menu_start = Scene_Menu.prototype.start;
    Scene_Menu.prototype.start = function() {
        _Scene_Menu_start.call(this);
        if (!showParty) {
            this._commandWindow.x = (Graphics.boxWidth - this._commandWindow.width) / 2;
            this._commandWindow.y = (Graphics.boxHeight - this._commandWindow.height) / 2;
        } else {
            this._commandWindow.x = 0;
            this._commandWindow.y = 0;
        }
    };
})();