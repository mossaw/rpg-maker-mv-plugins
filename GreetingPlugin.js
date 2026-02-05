/*:
 * @plugindesc 挨拶を表示するだけのサンプルプラグイン
 * @author mossaw with Gemini
 *
 * @param TimeSetting
 * @text 時間の設定
 * @desc 1:朝、2:昼、3:夜 を選んでくださいね。
 * @type select
 * @option 朝
 * @value 1
 * @option 昼
 * @value 2
 * @option 夜
 * @value 3
 * @default 1
 *
 * @help
 * プラグインコマンドで「SayGreeting」と打つと、
 * 設定した時間に応じた挨拶が表示されますよ
 */

(function() {
    'use strict';

    // パラメータを取得
    var parameters = PluginManager.parameters('GreetingPlugin');
    var timeSetting = Number(parameters['TimeSetting'] || 1);

    // プラグインコマンドの設定
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);

        if (command === 'SayGreeting') {
            var message = "";
            
            // 条件分岐でメッセージを変える
            if (timeSetting === 1) {
                message = "おはようございます！今日も一日頑張りましょう！";
            } else if (timeSetting === 2) {
                message = "こんにちは！いい天気ですね。";
            } else if (timeSetting === 3) {
                message = "こんばんは！ゆっくり休みましょう。";
            }

            // ツクールのメッセージウィンドウに表示！
            $gameMessage.add(message);
        }
    };
})();