const fs = require("node:fs")
const path = require("node:path")

function walk(directory, context, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(filename, context, files)
    } else if (entry.isFile() && entry.name.endsWith(".less")) {
      context.addDependency(filename)
      files.push(filename)
    }
  }
  return files
}

module.exports = function expandLessImportGlobs(source) {
  this.cacheable?.()

  return source.replace(
    /^(\s*@import\s+)(['"])([^'"\r\n]*\*[^'"\r\n]*)\2(\s*;?\s*)$/gm,
    (line, prefix, quote, pattern, suffix) => {
      const normalizedPattern = pattern.replace(/\\/g, "/")
      const wildcardIndex = normalizedPattern.search(/[?*[{]/)
      const directoryPart = normalizedPattern.slice(0, wildcardIndex)
      const baseDirectory = path.resolve(path.dirname(this.resourcePath), directoryPart.slice(0, directoryPart.lastIndexOf("/")))
      this.addContextDependency(baseDirectory)
      const matches = walk(baseDirectory, this)
        .sort()
        .map((filename) => {
          const relativePath = path.relative(path.dirname(this.resourcePath), filename).split(path.sep).join("/")
          return `${prefix}${quote}${relativePath}${quote}${suffix}`
        })

      return matches.length ? matches.join("\n") : line
    },
  )
}
