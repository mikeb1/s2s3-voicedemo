import Speaker from "@mastra/node-speaker";
import NodeMic from "node-mic";
import { Recorder } from "./lib/recorder";
import { handleEnterKeypress } from "./lib/keypress";
import { mastra } from "./mastra";
import chalk from "chalk";

const agent = mastra.getAgent("dane");

if (!agent.voice) {
  throw new Error("Agent does not have voice capabilities");
}

let speaker: Speaker | undefined;

const makeSpeaker = () =>
  new Speaker({
    sampleRate: 24100,  // Audio sample rate in Hz - standard for high-quality audio on MacBook Pro
    channels: 1,        // Mono audio output (as opposed to stereo which would be 2)
    bitDepth: 16,       // Bit depth for audio quality - CD quality standard (16-bit resolution)
  });

const mic = new NodeMic({
  rate: 24100,  // Audio sample rate in Hz - matches the speaker configuration for consistent audio processing
});

const recording = new Recorder({
  outputPath: "output/output.mp3",
});

agent.voice.on("writing", (ev) => {
  if (ev.role === 'user') {
    process.stdout.write(chalk.green(ev.text));
  } else {
    process.stdout.write(chalk.blue(ev.text));
  }
})

agent.voice.on("speaker", (stream) => {
  if (speaker) {
    speaker.removeAllListeners();
    speaker.close(true);
  }

  mic.pause();
  speaker = makeSpeaker();
  
  stream.pipe(speaker);
  stream.on('data', (data) => {
    recording.write(data);
  })

  speaker.on('close', () => {
    console.log("Speaker finished, resuming mic");
    mic.resume();
  })
})

// agent.voice.on('session.updated', (ev) => {
//   const event = ev as { session: any };
//   console.log("Session updated", event?.session);
// })

// Error from voice provider
agent.voice.on("error", (error) => {
  console.error("Voice error:", error);
});

await agent.voice.connect();

mic.start();
recording.start();

const microphoneStream = mic.getAudioStream();
microphoneStream.pipe(recording.stream);
agent.voice.send(microphoneStream);

agent.voice.speak('Hello how can I help you today?')


// ALLOW USER TO INTERUPT THE SPEAKER
handleEnterKeypress(() => {
  // Stop all players
  if (speaker) {
    speaker.close(true);
    speaker = undefined;
  }

  mic.resume();
  console.log("\nStopped all speakers, resuming mic");
});