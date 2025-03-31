import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export class Recorder {
  stream: NodeJS.WritableStream;
  tempFile: string;

  constructor(public options: { outputPath: string }) {
    this.stream = new PassThrough();
    // Create a temporary file for the audio data
    this.tempFile = path.join(os.tmpdir(), `audio-${Date.now()}.raw`);
  }

  start() {
    // Create a write stream to the temporary file
    const fileStream = fs.createWriteStream(this.tempFile);
    this.stream.pipe(fileStream);

    const proc = ffmpeg()
      .input(this.tempFile)
      .inputOptions(["-f s16le", "-ar 24k", "-ac 1"])
      .on("start", () => {
        console.log("Start recording");
      })
      .on("end", () => {
        console.log("Stop recording");
      })
      .on("error", (err: Error) => {
        console.error("Error recording:", err);
      })
      // .outputOptions(["-c:a libmp3lame", "-b:a 128k"]) // Adjust output format and bitrate as needed
      .output(this.options.outputPath); // Specify the output file path

    proc.run()
  }

  write (data: Buffer) {
    this.stream.write(data);
  }
}
