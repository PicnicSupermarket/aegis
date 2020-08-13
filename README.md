# 🛡 Aegis

A tool to convert TypeScript interfaces to JSON Decoders [nvie/decoders](https://github.com/nvie/decoders)

## How to use

`aegis` is currently in alpha and not yet released to NPM.
Just clone the repo if you want to give it a try!

Here are some steps to get you going:
1) Install dependencies:

`yarn install`

2) Transpile typescript:

`yarn tsc`

3) Run the decoder generator:

`node ./lib/index.js generate --inputPath [INPUT_PATH] --outputFile [OUTPUT_FILE]`

## Example

Usage of the tool requires a single directory with the Typescript types you want to create decoders for (can be `export default` or `export`). Use this as your import path for the command shown above.

An example of this can be found in the [`example`](./example) directory. The correct compilation command here would be:

`node ./lib/index.js generate --inputPath ./example --outputFile example.ts`

After running this command, you will be greeted with an `example.ts` file in the root of this repository, containing the generated decoders

## Contributing

To contribute code you can do so through directly via GitHub by forking this repository and sending a pull request.

When submitting code, please make every effort to follow existing conventions and style in order to keep the code as readable as possible.

## License

Copyright 2019 Picnic Technologies

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
