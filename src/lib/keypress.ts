import readline from "readline"

export function handleEnterKeypress(fn: () => void) {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.setRawMode != null) {
    process.stdin.setRawMode(true);
  }

  process.stdin.on("keypress", function (letter, key) {
    if (key.ctrl && key.name === "c") {
      process.exit();
    }
    if (key.name === "return") {
      fn();
    }
  });
}
