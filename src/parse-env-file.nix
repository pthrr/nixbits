# Parse a dotenv file into an attrset at evaluation time: KEY=value lines,
# optional `export `, # comments (full-line, or " # " after an unquoted
# value), and single or double quotes, where double quotes take \n \t \r
# \\ and \" escapes. A later duplicate key wins; anything else is skipped.
# Needs only nixpkgs lib, so it works before any pkgs exists.
{ lib }:
filePath:
let
  rawContent = builtins.readFile filePath;
  rawLines = lib.strings.splitString "\n" rawContent;

  unescapeDoubleQuotes =
    val: builtins.replaceStrings [ "\\n" "\\t" "\\r" "\\\\" "\\\"" ] [ "\n" "\t" "\r" "\\" "\"" ] val;

  stripQuotes =
    val:
    let
      trimmed = lib.strings.trim val;
      doubleQuoted = builtins.match ''^"(.*)"$'' trimmed;
      singleQuoted = builtins.match "^'(.*)'$" trimmed;
    in
    if doubleQuoted != null then
      unescapeDoubleQuotes (builtins.elemAt doubleQuoted 0)
    else if singleQuoted != null then
      builtins.elemAt singleQuoted 0
    else
      trimmed;

  sanitize =
    line:
    let
      trimmedLine = lib.strings.trim line;
    in
    if trimmedLine == "" || lib.strings.hasPrefix "#" trimmedLine then
      { }
    else
      let
        noExport = builtins.replaceStrings [ "export " ] [ "" ] line;
        match = builtins.match " *([A-Za-z_][A-Za-z0-9_]*) *= *(.*)" noExport;
      in
      if match == null then
        { }
      else
        let
          rawValue = builtins.elemAt match 1;
          trimmedValue = lib.strings.trim rawValue;
          isQuoted = lib.strings.hasPrefix "\"" trimmedValue || lib.strings.hasPrefix "'" trimmedValue;
          value = if isQuoted then trimmedValue else builtins.head (lib.strings.splitString " # " rawValue);
        in
        {
          "${builtins.elemAt match 0}" = stripQuotes value;
        };

in
builtins.foldl' (acc: line: acc // sanitize line) { } rawLines
