import * as ts from "typescript"
import * as path from "path"
import { DecoderFactory } from "./DecoderFactory"

class DecoderCompiler {
  private readonly decoderFactory: DecoderFactory
  private readonly outputFilePath: string
  private readonly program: ts.Program
  private readonly typeChecker: ts.TypeChecker

  private decoderStatements = new Map<string, ts.Statement>()
  private decoderOrder = new Set<string>()

  constructor(decoderFactory: DecoderFactory,
              outputFilePath: string,
              program: ts.Program,
              typeChecker: ts.TypeChecker) {
    this.decoderFactory = decoderFactory
    this.outputFilePath = outputFilePath
    this.program = program
    this.typeChecker = typeChecker
  }

  compile(): ts.Statement[] {
    const enumImportStatements: ts.Statement[] = []

    for (const sourceFile of this.program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        ts.forEachChild(sourceFile, node => {
          if (ts.isInterfaceDeclaration(node)
            || ts.isEnumDeclaration(node)
            || ts.isTypeAliasDeclaration(node)) {
            const decoderName = this.decoderNameForType(node.name.text)
            this.decoderStatements.set(decoderName, this.decoderStatement(decoderName, node))
            this.decoderOrder.add(decoderName)
          }
          if (ts.isEnumDeclaration(node) && this.isNodeExported(node)) {
            const importFilePath = path.resolve(sourceFile.fileName)
            const generatedFilePath = path.resolve(this.outputFilePath)
            const importPathDir = path.relative(path.dirname(generatedFilePath), path.dirname(importFilePath))
            const importPath = "./" + importPathDir + "/" + path.parse(importFilePath).name
            enumImportStatements.push(this.getImportStatement(node.name.text, importPath))
          }
        });
      }
    }

    const orderedDecoders = [...this.decoderOrder].map(name => {
      if (!this.decoderStatements.has(name)) {
        throw new Error(`No decoder named: ${name} found!`)
      }
      return this.decoderStatements.get(name)!
    })

    const decoderInputStatement = ts.addSyntheticLeadingComment(
      this.decoderFactory.importStatement(),
      ts.SyntaxKind.SingleLineCommentTrivia,
      " DO NOT EDIT - Generated using Aegis"
    )

    return [decoderInputStatement, ...enumImportStatements, ...orderedDecoders]
  }

  private decoderStatement(decoderName: string, node: ts.Node): ts.Statement {
    const decoderDeclaration = ts.createVariableDeclaration(decoderName, undefined, this.decoderForNode(node))
    const decoderDeclarationList = ts.createVariableDeclarationList([decoderDeclaration], ts.NodeFlags.Const)
    const exportModifier = ts.createModifier(ts.SyntaxKind.ExportKeyword)
    return ts.createVariableStatement([exportModifier], decoderDeclarationList)
  }

  private decoderForNode(node: ts.Node): ts.Expression {
    switch (node.kind) {
      case ts.SyntaxKind.NumberKeyword:
        return this.decoderFactory.numberDecoder()
      case ts.SyntaxKind.BooleanKeyword:
        return this.decoderFactory.booleanDecoder()
      case ts.SyntaxKind.StringKeyword:
        return this.decoderFactory.stringDecoder()
      case ts.SyntaxKind.NullKeyword:
        return this.decoderFactory.nullDecoder()
      case ts.SyntaxKind.UndefinedKeyword:
        return this.decoderFactory.undefinedDecoder()
      case ts.SyntaxKind.ArrayType:
        return this.decoderForArray(<ts.ArrayTypeNode>node)
      case ts.SyntaxKind.PropertySignature:
        return this.decoderForProperty(<ts.PropertySignature>node)
      case ts.SyntaxKind.UnionType:
        return this.decoderForUnionType(<ts.UnionTypeNode>node)
      case ts.SyntaxKind.TypeAliasDeclaration:
        return this.decoderForTypeAlias(<ts.TypeAliasDeclaration>node)
      case ts.SyntaxKind.TypeReference:
        return this.decoderForType(<ts.TypeReferenceNode>node)
      case ts.SyntaxKind.InterfaceDeclaration:
        return this.decoderForInterface(<ts.InterfaceDeclaration>node)
      case ts.SyntaxKind.EnumDeclaration:
        return this.decoderForEnum(<ts.EnumDeclaration>node)
      case ts.SyntaxKind.EnumMember:
        return this.decoderForEnumMember(<ts.EnumMember>node)
      default:
        throw(`Node type ${ts.SyntaxKind[node.kind]} not supported`)
    }
  }

  private decoderForArray(node: ts.ArrayTypeNode) {
    return this.decoderFactory.arrayDecoder(this.decoderForNode(node.elementType))
  }

  private decoderForProperty(node: ts.PropertySignature) {
    return node.questionToken
      ? this.decoderFactory.optionalDecoder(this.decoderForNode(node.type!))
      : this.decoderForNode(node.type!)
  }

  private decoderForUnionType(node: ts.UnionTypeNode) {
    const typeDecoders = node.types.map(typeNode => this.decoderForNode(typeNode))
    return this.decoderFactory.unionTypeDecoder(typeDecoders)
  }

  private decoderForTypeAlias(node: ts.TypeAliasDeclaration) {
    return this.decoderForNode(node.type)
  }

  private decoderForType(node: ts.TypeReferenceNode) {
    if (node.typeName.kind === ts.SyntaxKind.QualifiedName) {
      const typeNode = this.typeChecker.getTypeFromTypeNode(node)
      return this.decoderForNode(typeNode.symbol.valueDeclaration)
    } else {
      const typeName = node.typeName.text
      const decoderName = this.decoderNameForType(typeName)
      this.decoderOrder.add(decoderName)
      return this.decoderFactory.typeDecoder(decoderName)
    }
  }

  private decoderForInterface(node: ts.InterfaceDeclaration) {
    const type = this.typeChecker.getTypeAtLocation(node)
    const properties = this.typeChecker.getPropertiesOfType(type)
    const propertyNodes = properties.map(propertySymbol => propertySymbol.valueDeclaration) as ts.TypeElement[]
    const propertyAssignments = propertyNodes.map(node =>
      ts.createPropertyAssignment((<ts.Identifier>node.name).text, this.decoderForNode(node))
    )
    return this.decoderFactory.interfaceDecoder(propertyAssignments)
  }

  private decoderForEnum(node: ts.EnumDeclaration) {
    const memberValues = node.members.map(member => this.decoderForNode(member))
    return this.decoderFactory.enumDecoder(memberValues)
  }

  private decoderForEnumMember(node: ts.EnumMember) {
    const enumMemberLiteralString = node.parent.name.text + "." + (node.name as ts.Identifier).text
    return this.decoderFactory.enumMemberDecoder(enumMemberLiteralString)
  }

  private decoderNameForType(type: string) {
    const camelCaseType = type.charAt(0).toLowerCase() + type.slice(1)
    return camelCaseType + "Decoder"
  }

  private isNodeExported(node: ts.Node): boolean {
    const flags = ts.getCombinedModifierFlags(node as ts.Declaration)
    return (flags & ts.ModifierFlags.Export) === ts.ModifierFlags.Export
  }

  private getImportStatement(name: string, importPath: string): ts.Statement {
    ts.createImportSpecifier(undefined, ts.createIdentifier(name))
    const importClause = ts.createImportClause(undefined, ts.createNamedImports([ts.createImportSpecifier(undefined, ts.createIdentifier(name))]))
    return ts.createImportDeclaration(undefined, undefined, importClause, ts.createLiteral(importPath))
  }
}

export default DecoderCompiler
