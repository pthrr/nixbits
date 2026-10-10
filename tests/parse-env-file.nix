{ pkgs }:

let
  inherit (pkgs) lib;
  inherit (import ../. { inherit lib; }) parseEnvFile;

  parse = name: text: parseEnvFile (builtins.toFile "${name}.env" text);

  failures = lib.runTests {
    testBasicAssignment = {
      expr = parse "basic" ''
        FOO=bar
        BAZ=qux
      '';
      expected = {
        FOO = "bar";
        BAZ = "qux";
      };
    };

    testEmptyLinesIgnored = {
      expr = parse "empty" ''
        FOO=bar

        BAZ=qux
      '';
      expected = {
        FOO = "bar";
        BAZ = "qux";
      };
    };

    testMalformedLineIgnored = {
      expr = parse "malformed" ''
        GOOD=ok
        THIS_IS_BAD
        ALSO_GOOD=ok2
      '';
      expected = {
        GOOD = "ok";
        ALSO_GOOD = "ok2";
      };
    };

    testExportPrefixStripped = {
      expr = parse "export" ''
        export KEY=value
        export ANOTHER=123
      '';
      expected = {
        KEY = "value";
        ANOTHER = "123";
      };
    };

    testCommentsIgnored = {
      expr = parse "comments" ''
        A=1
        # full-line comment
        B=2 # inline comment
        C=3
      '';
      expected = {
        A = "1";
        B = "2";
        C = "3";
      };
    };

    testWhitespaceTrimmed = {
      expr = parse "whitespace" ''
        KEY = value
        A   =    b
      '';
      expected = {
        KEY = "value";
        A = "b";
      };
    };

    testDuplicateKeysLastWins = {
      expr = parse "dups" ''
        VAR=first
        VAR=second
      '';
      expected = {
        VAR = "second";
      };
    };

    testEmptyValue = {
      expr = parse "emptyval" ''
        KEY=
        ANOTHER=not_empty
      '';
      expected = {
        KEY = "";
        ANOTHER = "not_empty";
      };
    };

    testDoubleQuoted = {
      expr = parse "doubleq" ''
        NAME="Alice Smith"
        ESCAPED="line\nbreak"
      '';
      expected = {
        NAME = "Alice Smith";
        ESCAPED = "line\nbreak";
      };
    };

    testSingleQuoted = {
      expr = parse "singleq" ''
        RAW='foo $HOME bar'
      '';
      expected = {
        RAW = "foo $HOME bar";
      };
    };

    testQuotedEscapeChars = {
      expr = parse "esc" ''
        QUOTE="She said: \"Hi\""
        BACK="C:\\Path\\File"
      '';
      expected = {
        QUOTE = "She said: \"Hi\"";
        BACK = "C:\\Path\\File";
      };
    };

    testMixedQuotedUnquoted = {
      expr = parse "mixed" ''
        A=unquoted
        B="quoted"
        C='quoted single'
      '';
      expected = {
        A = "unquoted";
        B = "quoted";
        C = "quoted single";
      };
    };

    testQuotedHashNotComment = {
      expr = parse "quotedhash" ''
        KEY="value # not a comment"
        SINGLE='also # not stripped'
        PLAIN=value # this is a comment
      '';
      expected = {
        KEY = "value # not a comment";
        SINGLE = "also # not stripped";
        PLAIN = "value";
      };
    };

    testOnlyComments = {
      expr = parse "onlycomments" ''
        # nothing here
        # just comments
      '';
      expected = { };
    };
  };
in
pkgs.runCommand "nixbits-parse-env-file" { } ''
  ${lib.optionalString (failures != [ ]) ''
    echo ${lib.escapeShellArg (builtins.toJSON failures)} >&2
    exit 1
  ''}
  touch $out
''
