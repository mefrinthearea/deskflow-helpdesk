# Classroom launch and troubleshooting

## Presentation backup: start an existing local copy

**macOS Terminal / Linux Bash** — if the project is already installed in your home directory as `deskflow-presentation`, copy and paste:

```bash
cd "$HOME/deskflow-presentation" && npm start
```

Then open the **Local** URL printed by Vite, usually `http://localhost:5173/`. Do not paste this command from `~` without the `cd` part.

For an existing clone in **another directory**, open a Terminal **in its repository root** (where the root `package.json` is) and run `npm start`.

**If the combined launcher exits before Vite starts:** open **two terminal windows** in the same project and run these separate blocks:

Backend Terminal:

```bash
cd "$HOME/deskflow-presentation/backend"
npm start
```

Frontend Terminal:

```bash
cd "$HOME/deskflow-presentation/frontend"
npm run dev
```

Wait for `VITE ready`, then open the displayed Local URL. Do **not** run `npm run seed` to restart the app; it resets database records. This backup assumes the dependencies, `.env`, and database were configured during first-time setup.

## Quick launch — Terminal / Bash

**Already downloaded and configured?** Open Terminal in the existing `deskflow-helpdesk` project folder (the folder containing `package.json`), then **copy and paste this entire block**:

```bash
# Start both Express (backend) and Vite (frontend).
npm start
```

The application will show a **Local** URL such as `http://localhost:5173/` (the port may differ). Open that URL in a browser. Press **Ctrl+C** to stop the servers.

**Starting from GitHub on another computer for the first time?** Use the complete one-block setup under [Getting started → Fastest classroom demo](#fastest-classroom-demo--copy-and-paste-once) below. It clones the project, installs dependencies, initializes a **new** sample database, and starts both servers. That first-time block requires Git, Node.js and an internet connection; it must **not** be run over an existing database.

## Getting started

### Already downloaded? One paste to start and open DeskFlow (macOS/Linux)

Open **Terminal / Bash / zsh**. You can paste this from your home directory; it checks the common project locations as well as the current folder. **Node.js/npm must already be installed**, and the project must have been set up at least once.

```bash
PROJECT=""
for DIR in "$PWD" "$HOME/deskflow-presentation" "$HOME/deskflow-helpdesk" "$HOME/Documents/University/Web/deskflow-helpdesk"; do
  if [ -f "$DIR/backend/server.js" ] && [ -f "$DIR/frontend/package.json" ]; then
    PROJECT="$DIR"
    break
  fi
done

if [ -z "$PROJECT" ]; then
  echo "DeskFlow not found in the standard locations. Open Terminal in its downloaded project folder and paste this block again."
else
  echo "Starting DeskFlow from: $PROJECT"
  (cd "$PROJECT/backend" && npm start) &
  (cd "$PROJECT/frontend" && npm run dev -- --host 127.0.0.1) &
  sleep 4
  if command -v open >/dev/null 2>&1; then
    open http://localhost:5173
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:5173
  else
    echo "Open the Local URL printed by Vite in your browser."
  fi
  wait
fi
```

**Notes:** This starts backend and frontend **separately**, bypassing the root combined-launcher issue encountered in testing. It does not clone, reinstall, or seed/reset the database. Keep this Terminal window open during the demo. If Vite prints a different port, open that exact URL instead. **If Eka's folder is elsewhere**, open her Terminal in the downloaded DeskFlow folder first, and run the same block; it detects `$PWD`. This block is for macOS/Linux shells, **not Windows PowerShell**. On Windows, follow the first-time instructions or start backend and frontend in separate PowerShell windows.


### Fastest classroom demo — copy and paste once

**Works in macOS Terminal (zsh), Linux Bash, and Windows PowerShell**, provided **Git** and **Node.js 22+ (with npm)** are installed. Internet access is needed to clone the repository and install dependencies.

Open a terminal in a folder where you want a **new** copy of DeskFlow. Copy and paste this **entire block in order**. Copy the raw URL as shown—**do not paste Markdown links** such as `[https://...](https://...)`, and do not add extra letters before `git clone`:

```text
git clone https://github.com/mefrinthearea/deskflow-helpdesk.git deskflow-presentation
cd deskflow-presentation
npm --prefix backend ci
npm --prefix frontend ci
node -e "const fs=require('fs');const p='backend/.env';if(fs.existsSync(p)===false)fs.writeFileSync(p,'PORT=3000\nSESSION_SECRET='+require('crypto').randomBytes(32).toString('hex')+'\n')"
npm --prefix backend run seed
npm start
```

**What happens:** The repository is copied to a new `deskflow-presentation` folder, both sets of dependencies are installed, a local `.env` with a random session secret is created, a **new** SQLite demo database is populated with example accounts and tickets, and Express + Vite start together.

Open the **Local** URL printed by Vite (usually `http://localhost:5173/`; it may choose a different frontend port). The API uses port `3000`. Press **Ctrl+C** to stop. If port 3000 is already occupied, stop the other server first.

> **Safety:** Run the full block **only for a brand-new clone**. `npm --prefix backend run seed` **deletes and recreates database tables**; never run it on a copy with tickets you want to keep. If the folder `deskflow-presentation` already exists, choose another folder name for a new clone or use the repeat-start instructions below. The `.env` file stays local and is not committed.

### Ready-to-run Terminal / Bash block — open the local servers

**If DeskFlow is already downloaded and configured**, open Terminal or Git Bash **in the project folder or any subfolder**, then copy and paste:

```bash
cd "$(git rev-parse --show-toplevel)" && npm start
```

This automatically moves to the repository root, then starts both Express and Vite. Open the **Local** URL printed by Vite. Press **Ctrl+C** to stop. **No cloning, installation, or database reset.**

If your terminal is *outside* the project, open it in the project folder first, or `cd` to the folder where you downloaded the repository. On Windows **PowerShell** (not Git Bash), use:

```powershell
Set-Location (git rev-parse --show-toplevel)
npm start
```

> The command assumes the repository has the root `package.json` startup script and that the initial setup (dependencies, `backend/.env`, fresh database) has already been completed. Teammates with older clones should get the latest commits before using it, after saving any uncommitted work.


### Manual setup (optional)

If you prefer two separate terminals, start `npm start` in `backend/` and `npm run dev` in `frontend/` after completing installation and one-time configuration. Do not run `seed` on a populated database.

