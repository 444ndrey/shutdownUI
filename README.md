# Win UI SHUTDOWN

A simple Windows desktop app for shutdown control, packaged with Tauri.

## Install from release

1. Download the latest Windows release artifact for `Win UI SHUTDOWN`.
2. If it is an installer (`.msi` or `.exe`), run it and follow the prompts.
3. If it is a zip archive:
   - Extract the folder.
   - Run the included executable.

## Use the app

- Launch the installed app from the Start menu or the extracted folder.
- Follow the app UI to perform shutdown actions.

## Build locally (optional)

1. Install Node.js and the Rust toolchain.
2. Run:
   - `npm install`
   - `npm run tauri build`
3. Open the release bundle at:
   - `src-tauri/target/release/bundle`

## Contributing

If you want to help improve the app, the source code is in `src/` for the frontend and `src-tauri/` for the Tauri backend. Feel free to submit issues or pull requests.