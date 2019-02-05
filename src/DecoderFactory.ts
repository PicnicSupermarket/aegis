import * as ts from "typescript"

export interface DecoderFactory {
  numberDecoder(): ts.Expression
  stringDecoder(): ts.Expression
  booleanDecoder(): ts.Expression
  nullDecoder(): ts.Expression
  undefinedDecoder(): ts.Expression
  typeDecoder(name: string): ts.Expression
  interfaceDecoder(properties: ts.PropertyAssignment[]): ts.Expression
  arrayDecoder(type: ts.Expression): ts.Expression
  optionalDecoder(type: ts.Expression): ts.Expression
  unionTypeDecoder(types: ts.Expression[]): ts.Expression
  enumDecoder(members: ts.Expression[]): ts.Expression
  enumMemberDecoder(value: string): ts.Expression
  importStatement(): ts.Statement
}