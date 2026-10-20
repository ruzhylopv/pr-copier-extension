# PR Link Copier

Chrome extension that copies a GitHub pull request as a Markdown link:

```
[ALL-5643 Add backend to the service](https://github.com/org/repo/pull/123)
```

Square brackets are stripped from the title, because Slack can't parse them inside link text.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select this folder.

## Use

- Click **Copy link** next to the PR title, or
- Press `Alt+Shift+C` (Windows), `Option+Shift+C` (MacOS) on a PR page (change it at `chrome://extensions/shortcuts`).

After editing the code, click the reload icon on the extension card and refresh the GitHub tab.
