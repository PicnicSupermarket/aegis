import * as fs from "fs"
import * as ts from "typescript"
import { DecoderFactory } from "./DecoderFactory"
import DecoderCompiler from "./DecoderCompiler"

class DecoderGenerator {
  private readonly compilerOptions: ts.CompilerOptions = { noEmit: true }
  private readonly decoderFactory: DecoderFactory
  private readonly inputPath: string
  private readonly outputFilePath: string
  private readonly watchMode: boolean

  constructor(decoderFactory: DecoderFactory,
              inputPath: string,
              outputFilePath: string,
              watchMode: boolean) {
    this.decoderFactory = decoderFactory
    this.inputPath = inputPath
    this.outputFilePath = outputFilePath
    this.watchMode = watchMode
  }

  generate() {
    if (this.watchMode) {
      const watchHost = ts.createWatchCompilerHost(this.getRootFiles(), this.compilerOptions, ts.sys)

      watchHost.afterProgramCreate = (program: ts.BuilderProgram) => {
        this.createDecoderFile(program.getProgram())
      }

      ts.createWatchProgram(watchHost)
    }

    const program = ts.createProgram(this.getRootFiles(), this.compilerOptions)
    this.createDecoderFile(program)
  }

  private getRootFiles(): string[] {
    const files = fs.readdirSync(this.inputPath)
    return files.map(fileName => this.inputPath + "/" + fileName)
  }

  private createDecoderFile(program: ts.Program) {
    const typeChecker = program.getTypeChecker()
    const compiler = new DecoderCompiler(this.decoderFactory, this.outputFilePath, program, typeChecker)
    const decoderStatements = compiler.compile()

    const sourceFile = ts.createSourceFile(this.outputFilePath, "", ts.ScriptTarget.Latest)

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed
    });

    const nodeArray = ts.createNodeArray(decoderStatements)
    const fileContent = printer.printList(ts.ListFormat.SourceFileStatements, nodeArray, sourceFile)

    fs.writeFile(sourceFile.fileName, fileContent, error => {
      if (error) {
        throw new Error(`Failed writing result to ${sourceFile.fileName}`)
      }
    })
  }
}

export default DecoderGenerator