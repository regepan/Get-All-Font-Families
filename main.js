const { selection, Text, Group, Artboard } = require("scenegraph")
let panel;

function create() {
    const HTML =
        `<style>
            #message {
                color: red;
                font-weight: bold;
            }

            #list {
                font-size: 11px;
            }

            #list li {
                margin-bottom: 10px;
            }

            strong {
                font-weight: bold;
            }
        </style>
        <form method="dialog" id="main">
            <button id="ok" type="submit" uxp-variant="cta">
                Get font families
            </button>
        </form>

        <div id="results"></div>
        <ul id="list"></li>
        `

    panel = document.createElement("div");
    panel.innerHTML = HTML;
    panel.querySelector("form").addEventListener("submit", listFonts);

    return panel;
}

function show(event) {
    if (!panel) event.node.appendChild(create());
}

function listFonts() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";  // 一度クリアする

    // <ul id="list"> にリストを追加
    const list = document.getElementById("list");
    list.innerHTML = "";  // 一度クリアする

    // アートボードが選択されていない場合の処理
    const selectedArtboard = selection.items.find(item => item instanceof Artboard);
    if (!selectedArtboard) {
        const message = document.createElement("p");
        message.id = "message";
        message.textContent = "Please select an artboard.";
        resultsDiv.appendChild(message);
        return;
    }

    // 再帰的にすべての子要素を処理する関数
    function processChildren(children, fontMap) {
        children.forEach(child => {
            if (child instanceof Text) {
                const fontFamily = child.fontFamily;
                const fontWeight = child.fontStyle;

                console.log(fontFamily);

                // フォントファミリーがすでに存在する場合は、ウェイトを追加
                if (fontMap.has(fontFamily)) {
                    const weights = fontMap.get(fontFamily);
                    if (!weights.includes(fontWeight)) {
                        weights.push(fontWeight);
                    }
                } else {
                    fontMap.set(fontFamily, [fontWeight]);
                }
            } else if (child instanceof Group) {
                // グループの場合は再帰的に子要素を処理
                processChildren(child.children, fontMap);
            }
        });
    }

// アートボード内のフォント情報を収集
    const fontMap = new Map();
    processChildren(selectedArtboard.children, fontMap);

// 結果を出力
    console.log(fontMap);

    fontMap.forEach((weights, fontFamily) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `Font Family: <strong>${fontFamily}</strong><br>Font Weight: <strong>${weights.join(", ")}</strong>`;
        list.appendChild(listItem);
    });
}

module.exports = {
    panels: {
        GetFontFamilies: {
            show
        }
    }
};
