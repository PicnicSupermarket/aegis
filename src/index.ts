#!/usr/bin/env node
import DecoderGenerator from './DecoderGenerator'
import { NvieDecoderFactory } from "./decoder-factories/nvie/NvieDecoderFactory"
let program = require('commander')

program
  .version('0.0.1', '-V, --version')

program
  .command('generate')
  .option('-I, --inputPath [path]', 'Input folder')
  .option('-O, --outputFile [file]', 'Output file')
  .option('-W, --watch', 'Run in watch mode', false)
  .action((options: { inputPath: string, outputFile: string, watch: boolean }) => {
    const decoderFactory = new NvieDecoderFactory()
    const decoderGenerator = new DecoderGenerator(
      decoderFactory,
      options.inputPath,
      options.outputFile,
      options.watch
    )
    decoderGenerator.generate()
  })

program.parse(process.argv)

