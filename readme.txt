PommuR18imgView

DLsiteの「pommu」の投稿一覧で、R18かつ画像付きの投稿のみを表示するためのTampermonkeyユーザースクリプトです。

対応サイト

https://ch.dlsite.com/

インストール

tampermonky必須。
↓googleChrome版↓
https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ja

↓firefox版↓
https://addons.mozilla.org/ja/firefox/addon/tampermonkey/

firefox版であればスマートフォンからも使用可能。


以下のボタンからスクリプトを開くと、Tampermonkeyのインストール画面を表示できます。

"▶ Tampermonkeyでインストール" (https://raw.githubusercontent.com/4STRA1/pommu-r18view/main/pommu-r18view.user.js)

インストール画面が表示されたら「インストール」を選択してください。

Raw URL

直接URLを開いてインストールすることもできます。

https://raw.githubusercontent.com/4STRA1/pommu-r18view/main/pommu-r18view.user.js

機能

- 「R18画像のみ表示」トグルを追加
- R18の投稿のみを抽出
- 画像が含まれている投稿のみを抽出
- 条件に合う投稿を集めるため、複数ページを自動で先読み
- PC・スマートフォンに対応
- ON/OFF状態を保存
- 取得した投稿数を表示
- 取得に失敗した場合は通常のリクエストに戻す

使い方

DLsiteの対象ページを開くと、既存の「R18投稿表示」トグルの上に、

R18画像のみ表示

というトグルが追加されます。

ON

R18かつ画像付きの投稿のみ表示します。

OFF

通常の投稿一覧に戻ります。

設定を変更した場合、ページを再読み込みすると反映されます。

投稿の取得

R18かつ画像付きの投稿を一定数集めるため、投稿一覧の次ページを自動で先読みします。

現在の設定：

- 最低取得件数：6件
- 最大先読みページ数：8ページ

条件に合う投稿が6件以上集まった場合、または次のページが存在しない場合は先読みを終了します。

更新

スクリプトにはGitHubのRawファイルを更新先として設定しています。

GitHub上でスクリプトを更新し、"@version" を変更することで新しいバージョンを公開できます。

現在のバージョン：

1.0.0

更新用URL：

https://raw.githubusercontent.com/4STRA1/pommu-r18view/main/pommu-r18view.user.js

GitHub

リポジトリ：

https://github.com/4STRA1/pommu-r18view

作者：

https://github.com/4STRA1

注意事項

このスクリプトはDLsiteの公式機能ではありません。

サイト側の仕様変更などにより、正常に動作しなくなる場合があります。