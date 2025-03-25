import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { StreamInput } from "fluent-ffmpeg-multistream";
import { PassThrough } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export class Recorder {
  stream: NodeJS.WritableStream;

  constructor(public options: { outputPath: string }) {
    this.stream = new PassThrough();
  }

  start() {
    const proc = ffmpeg()
      .addInput(new (StreamInput as any)(this.stream).url)
      .addInputOptions(["-f s16le", "-ar 24k", "-ac 1"])
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
