import { DecoderFactory } from "../../DecoderFactory"
import * as ts from "typescript"

export class NvieDecoderFactory implements DecoderFactory {
  numberDecoder() {
    return ts.createIdentifier("number")
  }

  stringDecoder() {
    return ts.createIdentifier("string")
  }

  booleanDecoder() {
    return ts.createIdentifier("boolean")
  }

  nullDecoder() {
    return ts.createIdentifier("null_")
  }

  undefinedDecoder() {
    return ts.createIdentifier("undefined_")
  }

  typeDecoder(name: string) {
    return ts.createIdentifier(name)
  }

  interfaceDecoder(properties: ts.PropertyAssignment[]) {
    const functionName = ts.createIdentifier("object")
    const objectLiteral = ts.createObjectLiteral(properties, true)
    return ts.createCall(functionName, undefined, [objectLiteral])
  }

  arrayDecoder(type: ts.Expression) {
    return ts.createCall(ts.createIdentifier("array"), undefined, [type])
  }

  optionalDecoder(type: ts.Expression) {
    return ts.createCall(ts.createIdentifier("optional"), undefined, [type])
  }

  constantDecoder(constant: ts.Expression) {
    return ts.createCall(ts.createIdentifier("constant"), undefined, [constant])
  }

  unionTypeDecoder(types: ts.Expression[]) {
    return ts.createCall(ts.createIdentifier(this.eitherIdentifier(types.length)), undefined, types)
  }

  enumDecoder(members: ts.Expression[]): ts.Expression {
    if (members.length === 1) {
      return members[0]
    }
    return ts.createCall(ts.createIdentifier(this.eitherIdentifier(members.length)), undefined, members)
  }

  enumMemberDecoder(value: string): ts.Expression {
    return ts.createAsExpression(this.constantDecoder(ts.createIdentifier(value)), ts.createTypeReferenceNode(`Decoder<${value}>`, undefined))
  }

  importStatement(): ts.Statement {
    const imports = [
      this.importSpecifier("Decoder"),
      this.importSpecifier("constant"),
      this.importSpecifier("optional"),
      this.importSpecifier("string"),
      this.importSpecifier("boolean"),
      this.importSpecifier("number"),
      this.importSpecifier("null_"),
      this.importSpecifier("undefined_"),
      this.importSpecifier("object"),
      this.importSpecifier("array"),
      this.importSpecifier("either"),
      this.importSpecifier("either3"),
      this.importSpecifier("either4"),
      this.importSpecifier("either5"),
      this.importSpecifier("either6"),
      this.importSpecifier("either7"),
      this.importSpecifier("either8"),
      this.importSpecifier("either9")
    ]

    const importClause = ts.createImportClause(undefined, ts.createNamedImports(imports))
    return ts.createImportDeclaration(undefined, undefined, importClause, ts.createLiteral('decoders'))
  }

  private eitherIdentifier(count: number) {
    return "either" + (count > 2 ? count : "")
  }

  private importSpecifier(name: string) {
    return ts.createImportSpecifier(undefined, ts.createIdentifier(name))
  }
}