"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
class NvieDecoderFactory {
    numberDecoder() {
        return ts.createIdentifier("number");
    }
    stringDecoder() {
        return ts.createIdentifier("string");
    }
    booleanDecoder() {
        return ts.createIdentifier("boolean");
    }
    nullDecoder() {
        return ts.createIdentifier("null_");
    }
    undefinedDecoder() {
        return ts.createIdentifier("undefined_");
    }
    typeDecoder(name) {
        return ts.createIdentifier(name);
    }
    interfaceDecoder(properties) {
        const functionName = ts.createIdentifier("object");
        const objectLiteral = ts.createObjectLiteral(properties, true);
        return ts.createCall(functionName, undefined, [objectLiteral]);
    }
    arrayDecoder(type) {
        return ts.createCall(ts.createIdentifier("array"), undefined, [type]);
    }
    optionalDecoder(type) {
        return ts.createCall(ts.createIdentifier("optional"), undefined, [type]);
    }
    constantDecoder(constant) {
        return ts.createCall(ts.createIdentifier("constant"), undefined, [constant]);
    }
    unionTypeDecoder(types) {
        return ts.createCall(ts.createIdentifier(this.eitherIdentifier(types.length)), undefined, types);
    }
    enumDecoder(members) {
        if (members.length === 1) {
            return members[0];
        }
        return ts.createCall(ts.createIdentifier(this.eitherIdentifier(members.length)), undefined, members);
    }
    enumMemberDecoder(value) {
        return ts.createAsExpression(this.constantDecoder(ts.createIdentifier(value)), ts.createTypeReferenceNode(`Decoder<${value}>`, undefined));
    }
    importStatement() {
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
        ];
        const importClause = ts.createImportClause(undefined, ts.createNamedImports(imports));
        return ts.createImportDeclaration(undefined, undefined, importClause, ts.createLiteral('decoders'));
    }
    eitherIdentifier(count) {
        return "either" + (count > 2 ? count : "");
    }
    importSpecifier(name) {
        return ts.createImportSpecifier(undefined, ts.createIdentifier(name));
    }
}
exports.NvieDecoderFactory = NvieDecoderFactory;
