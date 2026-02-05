/*:
 * @plugindesc LLM台詞生成プラグイン
 * @author mossaw with Gemini
 *
 * @param Port
 * @text ポート番号
 * @default 8080
 *
 * @param ModelName
 * @text モデルファイル名
 * @default gemma-3-4b-it-Q4_K_M.gguf
 *
 * @param SystemPrompt
 * @text システムプロンプト
 * @type note
 * @desc AIへの役割指示です。キャラの口調や制約をここに書きます。
 * @default "あなたはプロの脚本家です。以下の制約を厳守し、キャラクターの台詞を1つだけ生成してください。\n\n### 制約条件 ###\n・出力は「台詞のみ」としてください。解説、前置き、鉤括弧（「」）は一切不要です。\n・文字数は必ず「50文字以上、100文字以内」に収めてください。\n・ト書きや地の文を含めないでください。"
 *
 * @param Temperature
 * @text 温度 (Temperature)
 * @desc 創造性（0.0〜2.0）。デフォルト0.5。高いほどランダム性が増します。
 * @default 0.5
 *
 * @param TopP
 * @text Top P
 * @desc 言葉の絞り込み（0.0〜1.0）デフォルト0.5。大きいほど陽気になります。
 * @default 0.5
 *
 * @param RepeatPenalty
 * @text 繰り返しペナルティ
 * @desc 同じ言葉を避ける強さ。デフォルト1.2。（1.0〜1.5）。
 * @default 1.2
 *
 * @param MaxTokens
 * @text 最大トークン数
 * @desc 生成する最大文字数。
 * @default 150
 *
 * @help LLM_CHAT [キャラ名] [状況] [変数ID]
 * スペース区切りで入力してください。
 * 例：LLM_CHAT 勇者 魔王に敗北して悔しがる 10
 */

(function() {
    const cp = require('child_process');
    const path = require('path');
    const root = path.dirname(process.mainModule.filename);

    const params = PluginManager.parameters('LlmConnector');
    
    // note形式のパラメーターはJSON形式で渡されるためデコード
    const parseNote = (param) => {
        try { return JSON.parse(param); } catch (e) { return param; }
    };

    const config = {
        exe: path.join(root, 'llm-bin', 'llama-server.exe'),
        model: path.join(root, 'models', String(params['ModelName'] || '')),
        port: Number(params['Port'] || 8080),
        system: parseNote(params['SystemPrompt']),
        temp: Number(params['Temperature'] || 0.5),
        topP: Number(params['TopP'] || 0.5),
        penalty: Number(params['RepeatPenalty'] || 1.2),
        maxTokens: Number(params['MaxTokens'] || 150)
    };

    // サーバー起動＆終了処理
    const cmd = `"${config.exe}" --model "${config.model}" --port ${config.port}`;
    const server = cp.spawn(cmd, { shell: true });
    const gui = require('nw.gui');
    const win = gui.Window.get();
    win.on('close', function() {
        cp.exec(`taskkill /pid ${server.pid} /t /f`, () => this.close(true));
    });

    window.askLlm = async (character, situation) => {
        const userInput = `# 設定\nキャラクター：${character}\n状況：${situation}\n\n# 出力（台詞のみ）`;

        try {
            const res = await fetch(`http://127.0.0.1:${config.port}/v1/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: config.system },
                        { role: "user", content: userInput }
                    ],
                    temperature: config.temp,
                    top_p: config.topP,
                    repeat_penalty: config.penalty,
                    max_tokens: config.maxTokens,
                    stop: ["#", "###"]
                })
            });
            const data = await res.json();
            return data.choices[0].message.content.trim();
        } catch (e) {
            return "（LLMロード中…しばらくしてからやり直してください）";
        }
    };

    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'LLM_CHAT') {
            const varId = Number(args.pop()); 
            const situation = args.pop();    
            const character = args.join(' '); 
            this._waitMode = 'llm';
            window.askLlm(character, situation).then(res => {
                $gameVariables.setValue(varId, res);
                this._waitMode = '';
            });
        }
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        return this._waitMode === 'llm' || _Game_Interpreter_updateWaitMode.call(this);
    };
})();