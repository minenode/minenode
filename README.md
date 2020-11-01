<img src="docs/assets/icon_large.png" height="48">

# MineNode

A _Minecraft: Java Edition_ server built on top of Node.JS.

**This project is still in early development. Do not expect a build.**

Join our Discord server if you'd like to contribute, or to stay up to date on progress!

## Links

**Website**: <https://mine.js.org>

**Discord**: <https://discord.gg/khzfmUM8bt>

## Development

To compile/run the project, you will need:
 - Node.JS > 13.0.0
 - Yarn package manager (`npm install -g yarn`)
 - Make (on Windows, you could use MinGW or WSL)

To contribue and develop, it is highly suggested that you have:
 - Visual Studio Code
   - Extensions: Prettier, ESLint (see [extensions.json](.vscode/extensions.json))

The code style is managed by Prettier and ESLint. A pre-commit hook is configured to run the `test` script in package.json. Do not attempt to bypass this hook in your commit.

To compile the project, install the dependencies and run:
```
make
```

You can also find the [other make targets](Makefile) useful.

## License

This project is licensed under the GNU Affero General Public License (AGPL), Version 3.0. A copy of the license text may be found in [LICENSE](LICENSE) or at <https://www.gnu.org/licenses/>.

Contributors: Please read the [Contribution Guidelines](CONTRIBUTING.md).

Copyright &copy; 2020 MineNode.
