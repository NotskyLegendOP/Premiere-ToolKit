/* Azy presets engine — prebuilt bundle of @azy/presets-core (+ ws, chokidar, fast-xml-parser).
   Built by azy-presets/tools/bundle-engine.js. Do not edit by hand. */
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/picomatch/lib/constants.js
var require_constants = __commonJS({
  "node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var path17 = require("path");
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      SEP: path17.sep,
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// node_modules/picomatch/lib/utils.js
var require_utils = __commonJS({
  "node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var path17 = require("path");
    var win32 = process.platform === "win32";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports2.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path17.sep === "\\";
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === "\\") return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  }
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// node_modules/picomatch/lib/parse.js
var require_parse = __commonJS({
  "node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants();
    var utils = require_utils();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const a = values[i];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const win32 = utils.isWindows(options);
      const PLATFORM_CHARS = constants.globChars(win32);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.value += tok.value;
          prev.output = (prev.output || "") + tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (next === "<" && !utils.supportsLookbehinds()) {
              throw new Error("Node.js v10 or higher is required for regex lookbehinds");
            }
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const win32 = utils.isWindows(options);
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(win32);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse;
  }
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var path17 = require("path");
    var scan = require_scan();
    var parse = require_parse();
    var utils = require_utils();
    var constants = require_constants();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = utils.isWindows(options);
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(path17.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err2) {
        if (options && options.debug === true) throw err2;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_picomatch();
  }
});

// node_modules/readdirp/index.js
var require_readdirp = __commonJS({
  "node_modules/readdirp/index.js"(exports2, module2) {
    "use strict";
    var fs10 = require("fs");
    var { Readable } = require("stream");
    var sysPath = require("path");
    var { promisify: promisify3 } = require("util");
    var picomatch = require_picomatch2();
    var readdir2 = promisify3(fs10.readdir);
    var stat5 = promisify3(fs10.stat);
    var lstat = promisify3(fs10.lstat);
    var realpath = promisify3(fs10.realpath);
    var BANG = "!";
    var RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR";
    var NORMAL_FLOW_ERRORS = /* @__PURE__ */ new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
    var FILE_TYPE = "files";
    var DIR_TYPE = "directories";
    var FILE_DIR_TYPE = "files_directories";
    var EVERYTHING_TYPE = "all";
    var ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];
    var isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
    var [maj, min] = process.versions.node.split(".").slice(0, 2).map((n) => Number.parseInt(n, 10));
    var wantBigintFsStats = process.platform === "win32" && (maj > 10 || maj === 10 && min >= 5);
    var normalizeFilter = (filter) => {
      if (filter === void 0) return;
      if (typeof filter === "function") return filter;
      if (typeof filter === "string") {
        const glob = picomatch(filter.trim());
        return (entry) => glob(entry.basename);
      }
      if (Array.isArray(filter)) {
        const positive = [];
        const negative = [];
        for (const item of filter) {
          const trimmed = item.trim();
          if (trimmed.charAt(0) === BANG) {
            negative.push(picomatch(trimmed.slice(1)));
          } else {
            positive.push(picomatch(trimmed));
          }
        }
        if (negative.length > 0) {
          if (positive.length > 0) {
            return (entry) => positive.some((f) => f(entry.basename)) && !negative.some((f) => f(entry.basename));
          }
          return (entry) => !negative.some((f) => f(entry.basename));
        }
        return (entry) => positive.some((f) => f(entry.basename));
      }
    };
    var ReaddirpStream = class _ReaddirpStream extends Readable {
      static get defaultOptions() {
        return {
          root: ".",
          /* eslint-disable no-unused-vars */
          fileFilter: (path17) => true,
          directoryFilter: (path17) => true,
          /* eslint-enable no-unused-vars */
          type: FILE_TYPE,
          lstat: false,
          depth: 2147483648,
          alwaysStat: false
        };
      }
      constructor(options = {}) {
        super({
          objectMode: true,
          autoDestroy: true,
          highWaterMark: options.highWaterMark || 4096
        });
        const opts = { ..._ReaddirpStream.defaultOptions, ...options };
        const { root, type } = opts;
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        const statMethod = opts.lstat ? lstat : stat5;
        if (wantBigintFsStats) {
          this._stat = (path17) => statMethod(path17, { bigint: true });
        } else {
          this._stat = statMethod;
        }
        this._maxDepth = opts.depth;
        this._wantsDir = [DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
        this._wantsFile = [FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE].includes(type);
        this._wantsEverything = type === EVERYTHING_TYPE;
        this._root = sysPath.resolve(root);
        this._isDirent = "Dirent" in fs10 && !opts.alwaysStat;
        this._statsProp = this._isDirent ? "dirent" : "stats";
        this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
        this.parents = [this._exploreDir(root, 1)];
        this.reading = false;
        this.parent = void 0;
      }
      async _read(batch) {
        if (this.reading) return;
        this.reading = true;
        try {
          while (!this.destroyed && batch > 0) {
            const { path: path17, depth, files = [] } = this.parent || {};
            if (files.length > 0) {
              const slice = files.splice(0, batch).map((dirent) => this._formatEntry(dirent, path17));
              for (const entry of await Promise.all(slice)) {
                if (this.destroyed) return;
                const entryType = await this._getEntryType(entry);
                if (entryType === "directory" && this._directoryFilter(entry)) {
                  if (depth <= this._maxDepth) {
                    this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                  }
                  if (this._wantsDir) {
                    this.push(entry);
                    batch--;
                  }
                } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                  if (this._wantsFile) {
                    this.push(entry);
                    batch--;
                  }
                }
              }
            } else {
              const parent = this.parents.pop();
              if (!parent) {
                this.push(null);
                break;
              }
              this.parent = await parent;
              if (this.destroyed) return;
            }
          }
        } catch (error) {
          this.destroy(error);
        } finally {
          this.reading = false;
        }
      }
      async _exploreDir(path17, depth) {
        let files;
        try {
          files = await readdir2(path17, this._rdOptions);
        } catch (error) {
          this._onError(error);
        }
        return { files, depth, path: path17 };
      }
      async _formatEntry(dirent, path17) {
        let entry;
        try {
          const basename5 = this._isDirent ? dirent.name : dirent;
          const fullPath = sysPath.resolve(sysPath.join(path17, basename5));
          entry = { path: sysPath.relative(this._root, fullPath), fullPath, basename: basename5 };
          entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
        } catch (err2) {
          this._onError(err2);
        }
        return entry;
      }
      _onError(err2) {
        if (isNormalFlowError(err2) && !this.destroyed) {
          this.emit("warn", err2);
        } else {
          this.destroy(err2);
        }
      }
      async _getEntryType(entry) {
        const stats = entry && entry[this._statsProp];
        if (!stats) {
          return;
        }
        if (stats.isFile()) {
          return "file";
        }
        if (stats.isDirectory()) {
          return "directory";
        }
        if (stats && stats.isSymbolicLink()) {
          const full = entry.fullPath;
          try {
            const entryRealPath = await realpath(full);
            const entryRealPathStats = await lstat(entryRealPath);
            if (entryRealPathStats.isFile()) {
              return "file";
            }
            if (entryRealPathStats.isDirectory()) {
              const len = entryRealPath.length;
              if (full.startsWith(entryRealPath) && full.substr(len, 1) === sysPath.sep) {
                const recursiveError = new Error(
                  `Circular symlink detected: "${full}" points to "${entryRealPath}"`
                );
                recursiveError.code = RECURSIVE_ERROR_CODE;
                return this._onError(recursiveError);
              }
              return "directory";
            }
          } catch (error) {
            this._onError(error);
          }
        }
      }
      _includeAsFile(entry) {
        const stats = entry && entry[this._statsProp];
        return stats && this._wantsEverything && !stats.isDirectory();
      }
    };
    var readdirp = (root, options = {}) => {
      let type = options.entryType || options.type;
      if (type === "both") type = FILE_DIR_TYPE;
      if (type) options.type = type;
      if (!root) {
        throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
      } else if (typeof root !== "string") {
        throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
      } else if (type && !ALL_TYPES.includes(type)) {
        throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
      }
      options.root = root;
      return new ReaddirpStream(options);
    };
    var readdirpPromise = (root, options = {}) => {
      return new Promise((resolve5, reject) => {
        const files = [];
        readdirp(root, options).on("data", (entry) => files.push(entry)).on("end", () => resolve5(files)).on("error", (error) => reject(error));
      });
    };
    readdirp.promise = readdirpPromise;
    readdirp.ReaddirpStream = ReaddirpStream;
    readdirp.default = readdirp;
    module2.exports = readdirp;
  }
});

// node_modules/normalize-path/index.js
var require_normalize_path = __commonJS({
  "node_modules/normalize-path/index.js"(exports2, module2) {
    module2.exports = function(path17, stripTrailing) {
      if (typeof path17 !== "string") {
        throw new TypeError("expected path to be a string");
      }
      if (path17 === "\\" || path17 === "/") return "/";
      var len = path17.length;
      if (len <= 1) return path17;
      var prefix = "";
      if (len > 4 && path17[3] === "\\") {
        var ch = path17[2];
        if ((ch === "?" || ch === ".") && path17.slice(0, 2) === "\\\\") {
          path17 = path17.slice(2);
          prefix = "//";
        }
      }
      var segs = path17.split(/[/\\]+/);
      if (stripTrailing !== false && segs[segs.length - 1] === "") {
        segs.pop();
      }
      return prefix + segs.join("/");
    };
  }
});

// node_modules/anymatch/index.js
var require_anymatch = __commonJS({
  "node_modules/anymatch/index.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var picomatch = require_picomatch2();
    var normalizePath2 = require_normalize_path();
    var BANG = "!";
    var DEFAULT_OPTIONS = { returnIndex: false };
    var arrify = (item) => Array.isArray(item) ? item : [item];
    var createPattern = (matcher, options) => {
      if (typeof matcher === "function") {
        return matcher;
      }
      if (typeof matcher === "string") {
        const glob = picomatch(matcher, options);
        return (string) => matcher === string || glob(string);
      }
      if (matcher instanceof RegExp) {
        return (string) => matcher.test(string);
      }
      return (string) => false;
    };
    var matchPatterns = (patterns, negPatterns, args, returnIndex) => {
      const isList = Array.isArray(args);
      const _path = isList ? args[0] : args;
      if (!isList && typeof _path !== "string") {
        throw new TypeError("anymatch: second argument must be a string: got " + Object.prototype.toString.call(_path));
      }
      const path17 = normalizePath2(_path, false);
      for (let index = 0; index < negPatterns.length; index++) {
        const nglob = negPatterns[index];
        if (nglob(path17)) {
          return returnIndex ? -1 : false;
        }
      }
      const applied = isList && [path17].concat(args.slice(1));
      for (let index = 0; index < patterns.length; index++) {
        const pattern = patterns[index];
        if (isList ? pattern(...applied) : pattern(path17)) {
          return returnIndex ? index : true;
        }
      }
      return returnIndex ? -1 : false;
    };
    var anymatch = (matchers, testString, options = DEFAULT_OPTIONS) => {
      if (matchers == null) {
        throw new TypeError("anymatch: specify first argument");
      }
      const opts = typeof options === "boolean" ? { returnIndex: options } : options;
      const returnIndex = opts.returnIndex || false;
      const mtchers = arrify(matchers);
      const negatedGlobs = mtchers.filter((item) => typeof item === "string" && item.charAt(0) === BANG).map((item) => item.slice(1)).map((item) => picomatch(item, opts));
      const patterns = mtchers.filter((item) => typeof item !== "string" || typeof item === "string" && item.charAt(0) !== BANG).map((matcher) => createPattern(matcher, opts));
      if (testString == null) {
        return (testString2, ri = false) => {
          const returnIndex2 = typeof ri === "boolean" ? ri : false;
          return matchPatterns(patterns, negatedGlobs, testString2, returnIndex2);
        };
      }
      return matchPatterns(patterns, negatedGlobs, testString, returnIndex);
    };
    anymatch.default = anymatch;
    module2.exports = anymatch;
  }
});

// node_modules/is-extglob/index.js
var require_is_extglob = __commonJS({
  "node_modules/is-extglob/index.js"(exports2, module2) {
    module2.exports = function isExtglob(str) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      var match;
      while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
        if (match[2]) return true;
        str = str.slice(match.index + match[0].length);
      }
      return false;
    };
  }
});

// node_modules/is-glob/index.js
var require_is_glob = __commonJS({
  "node_modules/is-glob/index.js"(exports2, module2) {
    var isExtglob = require_is_extglob();
    var chars = { "{": "}", "(": ")", "[": "]" };
    var strictCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      var pipeIndex = -2;
      var closeSquareIndex = -2;
      var closeCurlyIndex = -2;
      var closeParenIndex = -2;
      var backSlashIndex = -2;
      while (index < str.length) {
        if (str[index] === "*") {
          return true;
        }
        if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
          return true;
        }
        if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
          if (closeSquareIndex < index) {
            closeSquareIndex = str.indexOf("]", index);
          }
          if (closeSquareIndex > index) {
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
          }
        }
        if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
          closeCurlyIndex = str.indexOf("}", index);
          if (closeCurlyIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
              return true;
            }
          }
        }
        if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
          closeParenIndex = str.indexOf(")", index);
          if (closeParenIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
        if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
          if (pipeIndex < index) {
            pipeIndex = str.indexOf("|", index);
          }
          if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
            closeParenIndex = str.indexOf(")", pipeIndex);
            if (closeParenIndex > pipeIndex) {
              backSlashIndex = str.indexOf("\\", pipeIndex);
              if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
                return true;
              }
            }
          }
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    var relaxedCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      while (index < str.length) {
        if (/[*?{}()[\]]/.test(str[index])) {
          return true;
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    module2.exports = function isGlob(str, options) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      if (isExtglob(str)) {
        return true;
      }
      var check = strictCheck;
      if (options && options.strict === false) {
        check = relaxedCheck;
      }
      return check(str);
    };
  }
});

// node_modules/glob-parent/index.js
var require_glob_parent = __commonJS({
  "node_modules/glob-parent/index.js"(exports2, module2) {
    "use strict";
    var isGlob = require_is_glob();
    var pathPosixDirname = require("path").posix.dirname;
    var isWin32 = require("os").platform() === "win32";
    var slash = "/";
    var backslash = /\\/g;
    var enclosure = /[\{\[].*[\}\]]$/;
    var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
    var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
    module2.exports = function globParent(str, opts) {
      var options = Object.assign({ flipBackslashes: true }, opts);
      if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
        str = str.replace(backslash, slash);
      }
      if (enclosure.test(str)) {
        str += slash;
      }
      str += "a";
      do {
        str = pathPosixDirname(str);
      } while (isGlob(str) || globby.test(str));
      return str.replace(escaped, "$1");
    };
  }
});

// node_modules/braces/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/braces/lib/utils.js"(exports2) {
    "use strict";
    exports2.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports2.find = (node, type) => node.nodes.find((node2) => node2.type === type);
    exports2.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false) return false;
      if (!exports2.isInteger(min) || !exports2.isInteger(max)) return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };
    exports2.escapeNode = (block, n = 0, type) => {
      const node = block.nodes[n];
      if (!node) return;
      if (type && node.type === type || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports2.encloseBrace = (node) => {
      if (node.type !== "brace") return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isInvalidBrace = (block) => {
      if (block.type !== "brace") return false;
      if (block.invalid === true || block.dollar) return true;
      if (block.commas >> 0 + block.ranges >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text") acc.push(node.value);
      if (node.type === "range") node.type = "text";
      return acc;
    }, []);
    exports2.flatten = (...args) => {
      const result = [];
      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const ele = arr[i];
          if (Array.isArray(ele)) {
            flat(ele);
            continue;
          }
          if (ele !== void 0) {
            result.push(ele);
          }
        }
        return result;
      };
      flat(args);
      return result;
    };
  }
});

// node_modules/braces/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/braces/lib/stringify.js"(exports2, module2) {
    "use strict";
    var utils = require_utils2();
    module2.exports = (ast, options = {}) => {
      const stringify = (node, parent = {}) => {
        const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        let output = "";
        if (node.value) {
          if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
            return "\\" + node.value;
          }
          return node.value;
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += stringify(child);
          }
        }
        return output;
      };
      return stringify(ast);
    };
  }
});

// node_modules/is-number/index.js
var require_is_number = __commonJS({
  "node_modules/is-number/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(num) {
      if (typeof num === "number") {
        return num - num === 0;
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }
      return false;
    };
  }
});

// node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS({
  "node_modules/to-regex-range/index.js"(exports2, module2) {
    "use strict";
    var isNumber = require_is_number();
    var toRegexRange = (min, max, options) => {
      if (isNumber(min) === false) {
        throw new TypeError("toRegexRange: expected the first argument to be a number");
      }
      if (max === void 0 || min === max) {
        return String(min);
      }
      if (isNumber(max) === false) {
        throw new TypeError("toRegexRange: expected the second argument to be a number.");
      }
      let opts = { relaxZeros: true, ...options };
      if (typeof opts.strictZeros === "boolean") {
        opts.relaxZeros = opts.strictZeros === false;
      }
      let relax = String(opts.relaxZeros);
      let shorthand = String(opts.shorthand);
      let capture = String(opts.capture);
      let wrap = String(opts.wrap);
      let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
      if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
        return toRegexRange.cache[cacheKey].result;
      }
      let a = Math.min(min, max);
      let b = Math.max(min, max);
      if (Math.abs(a - b) === 1) {
        let result = min + "|" + max;
        if (opts.capture) {
          return `(${result})`;
        }
        if (opts.wrap === false) {
          return result;
        }
        return `(?:${result})`;
      }
      let isPadded = hasPadding(min) || hasPadding(max);
      let state = { min, max, a, b };
      let positives = [];
      let negatives = [];
      if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
      }
      if (a < 0) {
        let newMin = b < 0 ? Math.abs(b) : 1;
        negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
        a = state.a = 0;
      }
      if (b >= 0) {
        positives = splitToPatterns(a, b, state, opts);
      }
      state.negatives = negatives;
      state.positives = positives;
      state.result = collatePatterns(negatives, positives, opts);
      if (opts.capture === true) {
        state.result = `(${state.result})`;
      } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
      }
      toRegexRange.cache[cacheKey] = state;
      return state.result;
    };
    function collatePatterns(neg, pos, options) {
      let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
      let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
      let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
      let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
      return subpatterns.join("|");
    }
    function splitToRanges(min, max) {
      let nines = 1;
      let zeros = 1;
      let stop = countNines(min, nines);
      let stops = /* @__PURE__ */ new Set([max]);
      while (min <= stop && stop <= max) {
        stops.add(stop);
        nines += 1;
        stop = countNines(min, nines);
      }
      stop = countZeros(max + 1, zeros) - 1;
      while (min < stop && stop <= max) {
        stops.add(stop);
        zeros += 1;
        stop = countZeros(max + 1, zeros) - 1;
      }
      stops = [...stops];
      stops.sort(compare);
      return stops;
    }
    function rangeToPattern(start, stop, options) {
      if (start === stop) {
        return { pattern: start, count: [], digits: 0 };
      }
      let zipped = zip(start, stop);
      let digits = zipped.length;
      let pattern = "";
      let count = 0;
      for (let i = 0; i < digits; i++) {
        let [startDigit, stopDigit] = zipped[i];
        if (startDigit === stopDigit) {
          pattern += startDigit;
        } else if (startDigit !== "0" || stopDigit !== "9") {
          pattern += toCharacterClass(startDigit, stopDigit, options);
        } else {
          count++;
        }
      }
      if (count) {
        pattern += options.shorthand === true ? "\\d" : "[0-9]";
      }
      return { pattern, count: [count], digits };
    }
    function splitToPatterns(min, max, tok, options) {
      let ranges = splitToRanges(min, max);
      let tokens = [];
      let start = min;
      let prev;
      for (let i = 0; i < ranges.length; i++) {
        let max2 = ranges[i];
        let obj = rangeToPattern(String(start), String(max2), options);
        let zeros = "";
        if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
          if (prev.count.length > 1) {
            prev.count.pop();
          }
          prev.count.push(obj.count[0]);
          prev.string = prev.pattern + toQuantifier(prev.count);
          start = max2 + 1;
          continue;
        }
        if (tok.isPadded) {
          zeros = padZeros(max2, tok, options);
        }
        obj.string = zeros + obj.pattern + toQuantifier(obj.count);
        tokens.push(obj);
        start = max2 + 1;
        prev = obj;
      }
      return tokens;
    }
    function filterPatterns(arr, comparison, prefix, intersection, options) {
      let result = [];
      for (let ele of arr) {
        let { string } = ele;
        if (!intersection && !contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
        if (intersection && contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
      }
      return result;
    }
    function zip(a, b) {
      let arr = [];
      for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
      return arr;
    }
    function compare(a, b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    function contains(arr, key, val) {
      return arr.some((ele) => ele[key] === val);
    }
    function countNines(min, len) {
      return Number(String(min).slice(0, -len) + "9".repeat(len));
    }
    function countZeros(integer, zeros) {
      return integer - integer % Math.pow(10, zeros);
    }
    function toQuantifier(digits) {
      let [start = 0, stop = ""] = digits;
      if (stop || start > 1) {
        return `{${start + (stop ? "," + stop : "")}}`;
      }
      return "";
    }
    function toCharacterClass(a, b, options) {
      return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
    }
    function hasPadding(str) {
      return /^-?(0+)\d/.test(str);
    }
    function padZeros(value, tok, options) {
      if (!tok.isPadded) {
        return value;
      }
      let diff = Math.abs(tok.maxLen - String(value).length);
      let relax = options.relaxZeros !== false;
      switch (diff) {
        case 0:
          return "";
        case 1:
          return relax ? "0?" : "0";
        case 2:
          return relax ? "0{0,2}" : "00";
        default: {
          return relax ? `0{0,${diff}}` : `0{${diff}}`;
        }
      }
    }
    toRegexRange.cache = {};
    toRegexRange.clearCache = () => toRegexRange.cache = {};
    module2.exports = toRegexRange;
  }
});

// node_modules/fill-range/index.js
var require_fill_range = __commonJS({
  "node_modules/fill-range/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var toRegexRange = require_to_regex_range();
    var isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    var transform = (toNumber2) => {
      return (value) => toNumber2 === true ? Number(value) : String(value);
    };
    var isValidValue = (value) => {
      return typeof value === "number" || typeof value === "string" && value !== "";
    };
    var isNumber = (num) => Number.isInteger(+num);
    var zeros = (input) => {
      let value = `${input}`;
      let index = -1;
      if (value[0] === "-") value = value.slice(1);
      if (value === "0") return false;
      while (value[++index] === "0") ;
      return index > 0;
    };
    var stringify = (start, end, options) => {
      if (typeof start === "string" || typeof end === "string") {
        return true;
      }
      return options.stringify === true;
    };
    var pad = (input, maxLength, toNumber2) => {
      if (maxLength > 0) {
        let dash = input[0] === "-" ? "-" : "";
        if (dash) input = input.slice(1);
        input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
      }
      if (toNumber2 === false) {
        return String(input);
      }
      return input;
    };
    var toMaxLen = (input, maxLength) => {
      let negative = input[0] === "-" ? "-" : "";
      if (negative) {
        input = input.slice(1);
        maxLength--;
      }
      while (input.length < maxLength) input = "0" + input;
      return negative ? "-" + input : input;
    };
    var toSequence = (parts, options, maxLen) => {
      parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      let prefix = options.capture ? "" : "?:";
      let positives = "";
      let negatives = "";
      let result;
      if (parts.positives.length) {
        positives = parts.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
      }
      if (parts.negatives.length) {
        negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
      }
      if (positives && negatives) {
        result = `${positives}|${negatives}`;
      } else {
        result = positives || negatives;
      }
      if (options.wrap) {
        return `(${prefix}${result})`;
      }
      return result;
    };
    var toRange = (a, b, isNumbers, options) => {
      if (isNumbers) {
        return toRegexRange(a, b, { wrap: false, ...options });
      }
      let start = String.fromCharCode(a);
      if (a === b) return start;
      let stop = String.fromCharCode(b);
      return `[${start}-${stop}]`;
    };
    var toRegex = (start, end, options) => {
      if (Array.isArray(start)) {
        let wrap = options.wrap === true;
        let prefix = options.capture ? "" : "?:";
        return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
      }
      return toRegexRange(start, end, options);
    };
    var rangeError = (...args) => {
      return new RangeError("Invalid range arguments: " + util.inspect(...args));
    };
    var invalidRange = (start, end, options) => {
      if (options.strictRanges === true) throw rangeError([start, end]);
      return [];
    };
    var invalidStep = (step, options) => {
      if (options.strictRanges === true) {
        throw new TypeError(`Expected step "${step}" to be a number`);
      }
      return [];
    };
    var fillNumbers = (start, end, step = 1, options = {}) => {
      let a = Number(start);
      let b = Number(end);
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        if (options.strictRanges === true) throw rangeError([start, end]);
        return [];
      }
      if (a === 0) a = 0;
      if (b === 0) b = 0;
      let descending = a > b;
      let startString = String(start);
      let endString = String(end);
      let stepString = String(step);
      step = Math.max(Math.abs(step), 1);
      let padded = zeros(startString) || zeros(endString) || zeros(stepString);
      let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
      let toNumber2 = padded === false && stringify(start, end, options) === false;
      let format = options.transform || transform(toNumber2);
      if (options.toRegex && step === 1) {
        return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
      }
      let parts = { negatives: [], positives: [] };
      let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        if (options.toRegex === true && step > 1) {
          push(a);
        } else {
          range.push(pad(format(a, index), maxLen, toNumber2));
        }
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return step > 1 ? toSequence(parts, options, maxLen) : toRegex(range, null, { wrap: false, ...options });
      }
      return range;
    };
    var fillLetters = (start, end, step = 1, options = {}) => {
      if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
        return invalidRange(start, end, options);
      }
      let format = options.transform || ((val) => String.fromCharCode(val));
      let a = `${start}`.charCodeAt(0);
      let b = `${end}`.charCodeAt(0);
      let descending = a > b;
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      if (options.toRegex && step === 1) {
        return toRange(min, max, false, options);
      }
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        range.push(format(a, index));
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return toRegex(range, null, { wrap: false, options });
      }
      return range;
    };
    var fill = (start, end, step, options = {}) => {
      if (end == null && isValidValue(start)) {
        return [start];
      }
      if (!isValidValue(start) || !isValidValue(end)) {
        return invalidRange(start, end, options);
      }
      if (typeof step === "function") {
        return fill(start, end, 1, { transform: step });
      }
      if (isObject(step)) {
        return fill(start, end, 0, step);
      }
      let opts = { ...options };
      if (opts.capture === true) opts.wrap = true;
      step = step || opts.step || 1;
      if (!isNumber(step)) {
        if (step != null && !isObject(step)) return invalidStep(step, opts);
        return fill(start, end, 1, step);
      }
      if (isNumber(start) && isNumber(end)) {
        return fillNumbers(start, end, step, opts);
      }
      return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
    };
    module2.exports = fill;
  }
});

// node_modules/braces/lib/compile.js
var require_compile = __commonJS({
  "node_modules/braces/lib/compile.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var utils = require_utils2();
    var compile = (ast, options = {}) => {
      const walk = (node, parent = {}) => {
        const invalidBlock = utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        const invalid = invalidBlock === true || invalidNode === true;
        const prefix = options.escapeInvalid === true ? "\\" : "";
        let output = "";
        if (node.isOpen === true) {
          return prefix + node.value;
        }
        if (node.isClose === true) {
          console.log("node.isClose", prefix, node.value);
          return prefix + node.value;
        }
        if (node.type === "open") {
          return invalid ? prefix + node.value : "(";
        }
        if (node.type === "close") {
          return invalid ? prefix + node.value : ")";
        }
        if (node.type === "comma") {
          return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          const range = fill(...args, { ...options, wrap: false, toRegex: true, strictZeros: true });
          if (range.length !== 0) {
            return args.length > 1 && range.length > 1 ? `(${range})` : range;
          }
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += walk(child, node);
          }
        }
        return output;
      };
      return walk(ast);
    };
    module2.exports = compile;
  }
});

// node_modules/braces/lib/expand.js
var require_expand = __commonJS({
  "node_modules/braces/lib/expand.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var stringify = require_stringify();
    var utils = require_utils2();
    var append = (queue = "", stash = "", enclose = false) => {
      const result = [];
      queue = [].concat(queue);
      stash = [].concat(stash);
      if (!stash.length) return queue;
      if (!queue.length) {
        return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
      }
      for (const item of queue) {
        if (Array.isArray(item)) {
          for (const value of item) {
            result.push(append(value, stash, enclose));
          }
        } else {
          for (let ele of stash) {
            if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
            result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
          }
        }
      }
      return utils.flatten(result);
    };
    var expand = (ast, options = {}) => {
      const rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
      const walk = (node, parent = {}) => {
        node.queue = [];
        let p = parent;
        let q = parent.queue;
        while (p.type !== "brace" && p.type !== "root" && p.parent) {
          p = p.parent;
          q = p.queue;
        }
        if (node.invalid || node.dollar) {
          q.push(append(q.pop(), stringify(node, options)));
          return;
        }
        if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
          q.push(append(q.pop(), ["{}"]));
          return;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
            throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
          }
          let range = fill(...args, options);
          if (range.length === 0) {
            range = stringify(node, options);
          }
          q.push(append(q.pop(), range));
          node.nodes = [];
          return;
        }
        const enclose = utils.encloseBrace(node);
        let queue = node.queue;
        let block = node;
        while (block.type !== "brace" && block.type !== "root" && block.parent) {
          block = block.parent;
          queue = block.queue;
        }
        for (let i = 0; i < node.nodes.length; i++) {
          const child = node.nodes[i];
          if (child.type === "comma" && node.type === "brace") {
            if (i === 1) queue.push("");
            queue.push("");
            continue;
          }
          if (child.type === "close") {
            q.push(append(q.pop(), queue, enclose));
            continue;
          }
          if (child.value && child.type !== "open") {
            queue.push(append(queue.pop(), child.value));
            continue;
          }
          if (child.nodes) {
            walk(child, node);
          }
        }
        return queue;
      };
      return utils.flatten(walk(ast));
    };
    module2.exports = expand;
  }
});

// node_modules/braces/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/braces/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      MAX_LENGTH: 1e4,
      // Digits
      CHAR_0: "0",
      /* 0 */
      CHAR_9: "9",
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: "A",
      /* A */
      CHAR_LOWERCASE_A: "a",
      /* a */
      CHAR_UPPERCASE_Z: "Z",
      /* Z */
      CHAR_LOWERCASE_Z: "z",
      /* z */
      CHAR_LEFT_PARENTHESES: "(",
      /* ( */
      CHAR_RIGHT_PARENTHESES: ")",
      /* ) */
      CHAR_ASTERISK: "*",
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: "&",
      /* & */
      CHAR_AT: "@",
      /* @ */
      CHAR_BACKSLASH: "\\",
      /* \ */
      CHAR_BACKTICK: "`",
      /* ` */
      CHAR_CARRIAGE_RETURN: "\r",
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: "^",
      /* ^ */
      CHAR_COLON: ":",
      /* : */
      CHAR_COMMA: ",",
      /* , */
      CHAR_DOLLAR: "$",
      /* . */
      CHAR_DOT: ".",
      /* . */
      CHAR_DOUBLE_QUOTE: '"',
      /* " */
      CHAR_EQUAL: "=",
      /* = */
      CHAR_EXCLAMATION_MARK: "!",
      /* ! */
      CHAR_FORM_FEED: "\f",
      /* \f */
      CHAR_FORWARD_SLASH: "/",
      /* / */
      CHAR_HASH: "#",
      /* # */
      CHAR_HYPHEN_MINUS: "-",
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: "<",
      /* < */
      CHAR_LEFT_CURLY_BRACE: "{",
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: "[",
      /* [ */
      CHAR_LINE_FEED: "\n",
      /* \n */
      CHAR_NO_BREAK_SPACE: "\xA0",
      /* \u00A0 */
      CHAR_PERCENT: "%",
      /* % */
      CHAR_PLUS: "+",
      /* + */
      CHAR_QUESTION_MARK: "?",
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: ">",
      /* > */
      CHAR_RIGHT_CURLY_BRACE: "}",
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: "]",
      /* ] */
      CHAR_SEMICOLON: ";",
      /* ; */
      CHAR_SINGLE_QUOTE: "'",
      /* ' */
      CHAR_SPACE: " ",
      /*   */
      CHAR_TAB: "	",
      /* \t */
      CHAR_UNDERSCORE: "_",
      /* _ */
      CHAR_VERTICAL_LINE: "|",
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
      /* \uFEFF */
    };
  }
});

// node_modules/braces/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/braces/lib/parse.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var {
      MAX_LENGTH,
      CHAR_BACKSLASH,
      /* \ */
      CHAR_BACKTICK,
      /* ` */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_RIGHT_SQUARE_BRACKET,
      /* ] */
      CHAR_DOUBLE_QUOTE,
      /* " */
      CHAR_SINGLE_QUOTE,
      /* ' */
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE
    } = require_constants2();
    var parse = (input, options = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      const opts = options || {};
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      if (input.length > max) {
        throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
      }
      const ast = { type: "root", input, nodes: [] };
      const stack = [ast];
      let block = ast;
      let prev = ast;
      let brackets = 0;
      const length = input.length;
      let index = 0;
      let depth = 0;
      let value;
      const advance = () => input[index++];
      const push = (node) => {
        if (node.type === "text" && prev.type === "dot") {
          prev.type = "text";
        }
        if (prev && prev.type === "text" && node.type === "text") {
          prev.value += node.value;
          return;
        }
        block.nodes.push(node);
        node.parent = block;
        node.prev = prev;
        prev = node;
        return node;
      };
      push({ type: "bos" });
      while (index < length) {
        block = stack[stack.length - 1];
        value = advance();
        if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
          continue;
        }
        if (value === CHAR_BACKSLASH) {
          push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
          continue;
        }
        if (value === CHAR_RIGHT_SQUARE_BRACKET) {
          push({ type: "text", value: "\\" + value });
          continue;
        }
        if (value === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          let next;
          while (index < length && (next = advance())) {
            value += next;
            if (next === CHAR_LEFT_SQUARE_BRACKET) {
              brackets++;
              continue;
            }
            if (next === CHAR_BACKSLASH) {
              value += advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              brackets--;
              if (brackets === 0) {
                break;
              }
            }
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_PARENTHESES) {
          block = push({ type: "paren", nodes: [] });
          stack.push(block);
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_RIGHT_PARENTHESES) {
          if (block.type !== "paren") {
            push({ type: "text", value });
            continue;
          }
          block = stack.pop();
          push({ type: "text", value });
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
          const open = value;
          let next;
          if (options.keepQuotes !== true) {
            value = "";
          }
          while (index < length && (next = advance())) {
            if (next === CHAR_BACKSLASH) {
              value += next + advance();
              continue;
            }
            if (next === open) {
              if (options.keepQuotes === true) value += next;
              break;
            }
            value += next;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_CURLY_BRACE) {
          depth++;
          const dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
          const brace = {
            type: "brace",
            open: true,
            close: false,
            dollar,
            depth,
            commas: 0,
            ranges: 0,
            nodes: []
          };
          block = push(brace);
          stack.push(block);
          push({ type: "open", value });
          continue;
        }
        if (value === CHAR_RIGHT_CURLY_BRACE) {
          if (block.type !== "brace") {
            push({ type: "text", value });
            continue;
          }
          const type = "close";
          block = stack.pop();
          block.close = true;
          push({ type, value });
          depth--;
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_COMMA && depth > 0) {
          if (block.ranges > 0) {
            block.ranges = 0;
            const open = block.nodes.shift();
            block.nodes = [open, { type: "text", value: stringify(block) }];
          }
          push({ type: "comma", value });
          block.commas++;
          continue;
        }
        if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
          const siblings = block.nodes;
          if (depth === 0 || siblings.length === 0) {
            push({ type: "text", value });
            continue;
          }
          if (prev.type === "dot") {
            block.range = [];
            prev.value += value;
            prev.type = "range";
            if (block.nodes.length !== 3 && block.nodes.length !== 5) {
              block.invalid = true;
              block.ranges = 0;
              prev.type = "text";
              continue;
            }
            block.ranges++;
            block.args = [];
            continue;
          }
          if (prev.type === "range") {
            siblings.pop();
            const before = siblings[siblings.length - 1];
            before.value += prev.value + value;
            prev = before;
            block.ranges--;
            continue;
          }
          push({ type: "dot", value });
          continue;
        }
        push({ type: "text", value });
      }
      do {
        block = stack.pop();
        if (block.type !== "root") {
          block.nodes.forEach((node) => {
            if (!node.nodes) {
              if (node.type === "open") node.isOpen = true;
              if (node.type === "close") node.isClose = true;
              if (!node.nodes) node.type = "text";
              node.invalid = true;
            }
          });
          const parent = stack[stack.length - 1];
          const index2 = parent.nodes.indexOf(block);
          parent.nodes.splice(index2, 1, ...block.nodes);
        }
      } while (stack.length > 0);
      push({ type: "eos" });
      return ast;
    };
    module2.exports = parse;
  }
});

// node_modules/braces/index.js
var require_braces = __commonJS({
  "node_modules/braces/index.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var compile = require_compile();
    var expand = require_expand();
    var parse = require_parse2();
    var braces = (input, options = {}) => {
      let output = [];
      if (Array.isArray(input)) {
        for (const pattern of input) {
          const result = braces.create(pattern, options);
          if (Array.isArray(result)) {
            output.push(...result);
          } else {
            output.push(result);
          }
        }
      } else {
        output = [].concat(braces.create(input, options));
      }
      if (options && options.expand === true && options.nodupes === true) {
        output = [...new Set(output)];
      }
      return output;
    };
    braces.parse = (input, options = {}) => parse(input, options);
    braces.stringify = (input, options = {}) => {
      if (typeof input === "string") {
        return stringify(braces.parse(input, options), options);
      }
      return stringify(input, options);
    };
    braces.compile = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      return compile(input, options);
    };
    braces.expand = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      let result = expand(input, options);
      if (options.noempty === true) {
        result = result.filter(Boolean);
      }
      if (options.nodupes === true) {
        result = [...new Set(result)];
      }
      return result;
    };
    braces.create = (input, options = {}) => {
      if (input === "" || input.length < 3) {
        return [input];
      }
      return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
    };
    module2.exports = braces;
  }
});

// node_modules/binary-extensions/binary-extensions.json
var require_binary_extensions = __commonJS({
  "node_modules/binary-extensions/binary-extensions.json"(exports2, module2) {
    module2.exports = [
      "3dm",
      "3ds",
      "3g2",
      "3gp",
      "7z",
      "a",
      "aac",
      "adp",
      "afdesign",
      "afphoto",
      "afpub",
      "ai",
      "aif",
      "aiff",
      "alz",
      "ape",
      "apk",
      "appimage",
      "ar",
      "arj",
      "asf",
      "au",
      "avi",
      "bak",
      "baml",
      "bh",
      "bin",
      "bk",
      "bmp",
      "btif",
      "bz2",
      "bzip2",
      "cab",
      "caf",
      "cgm",
      "class",
      "cmx",
      "cpio",
      "cr2",
      "cur",
      "dat",
      "dcm",
      "deb",
      "dex",
      "djvu",
      "dll",
      "dmg",
      "dng",
      "doc",
      "docm",
      "docx",
      "dot",
      "dotm",
      "dra",
      "DS_Store",
      "dsk",
      "dts",
      "dtshd",
      "dvb",
      "dwg",
      "dxf",
      "ecelp4800",
      "ecelp7470",
      "ecelp9600",
      "egg",
      "eol",
      "eot",
      "epub",
      "exe",
      "f4v",
      "fbs",
      "fh",
      "fla",
      "flac",
      "flatpak",
      "fli",
      "flv",
      "fpx",
      "fst",
      "fvt",
      "g3",
      "gh",
      "gif",
      "graffle",
      "gz",
      "gzip",
      "h261",
      "h263",
      "h264",
      "icns",
      "ico",
      "ief",
      "img",
      "ipa",
      "iso",
      "jar",
      "jpeg",
      "jpg",
      "jpgv",
      "jpm",
      "jxr",
      "key",
      "ktx",
      "lha",
      "lib",
      "lvp",
      "lz",
      "lzh",
      "lzma",
      "lzo",
      "m3u",
      "m4a",
      "m4v",
      "mar",
      "mdi",
      "mht",
      "mid",
      "midi",
      "mj2",
      "mka",
      "mkv",
      "mmr",
      "mng",
      "mobi",
      "mov",
      "movie",
      "mp3",
      "mp4",
      "mp4a",
      "mpeg",
      "mpg",
      "mpga",
      "mxu",
      "nef",
      "npx",
      "numbers",
      "nupkg",
      "o",
      "odp",
      "ods",
      "odt",
      "oga",
      "ogg",
      "ogv",
      "otf",
      "ott",
      "pages",
      "pbm",
      "pcx",
      "pdb",
      "pdf",
      "pea",
      "pgm",
      "pic",
      "png",
      "pnm",
      "pot",
      "potm",
      "potx",
      "ppa",
      "ppam",
      "ppm",
      "pps",
      "ppsm",
      "ppsx",
      "ppt",
      "pptm",
      "pptx",
      "psd",
      "pya",
      "pyc",
      "pyo",
      "pyv",
      "qt",
      "rar",
      "ras",
      "raw",
      "resources",
      "rgb",
      "rip",
      "rlc",
      "rmf",
      "rmvb",
      "rpm",
      "rtf",
      "rz",
      "s3m",
      "s7z",
      "scpt",
      "sgi",
      "shar",
      "snap",
      "sil",
      "sketch",
      "slk",
      "smv",
      "snk",
      "so",
      "stl",
      "suo",
      "sub",
      "swf",
      "tar",
      "tbz",
      "tbz2",
      "tga",
      "tgz",
      "thmx",
      "tif",
      "tiff",
      "tlz",
      "ttc",
      "ttf",
      "txz",
      "udf",
      "uvh",
      "uvi",
      "uvm",
      "uvp",
      "uvs",
      "uvu",
      "viv",
      "vob",
      "war",
      "wav",
      "wax",
      "wbmp",
      "wdp",
      "weba",
      "webm",
      "webp",
      "whl",
      "wim",
      "wm",
      "wma",
      "wmv",
      "wmx",
      "woff",
      "woff2",
      "wrm",
      "wvx",
      "xbm",
      "xif",
      "xla",
      "xlam",
      "xls",
      "xlsb",
      "xlsm",
      "xlsx",
      "xlt",
      "xltm",
      "xltx",
      "xm",
      "xmind",
      "xpi",
      "xpm",
      "xwd",
      "xz",
      "z",
      "zip",
      "zipx"
    ];
  }
});

// node_modules/binary-extensions/index.js
var require_binary_extensions2 = __commonJS({
  "node_modules/binary-extensions/index.js"(exports2, module2) {
    module2.exports = require_binary_extensions();
  }
});

// node_modules/is-binary-path/index.js
var require_is_binary_path = __commonJS({
  "node_modules/is-binary-path/index.js"(exports2, module2) {
    "use strict";
    var path17 = require("path");
    var binaryExtensions = require_binary_extensions2();
    var extensions = new Set(binaryExtensions);
    module2.exports = (filePath) => extensions.has(path17.extname(filePath).slice(1).toLowerCase());
  }
});

// node_modules/chokidar/lib/constants.js
var require_constants3 = __commonJS({
  "node_modules/chokidar/lib/constants.js"(exports2) {
    "use strict";
    var { sep: sep2 } = require("path");
    var { platform } = process;
    var os3 = require("os");
    exports2.EV_ALL = "all";
    exports2.EV_READY = "ready";
    exports2.EV_ADD = "add";
    exports2.EV_CHANGE = "change";
    exports2.EV_ADD_DIR = "addDir";
    exports2.EV_UNLINK = "unlink";
    exports2.EV_UNLINK_DIR = "unlinkDir";
    exports2.EV_RAW = "raw";
    exports2.EV_ERROR = "error";
    exports2.STR_DATA = "data";
    exports2.STR_END = "end";
    exports2.STR_CLOSE = "close";
    exports2.FSEVENT_CREATED = "created";
    exports2.FSEVENT_MODIFIED = "modified";
    exports2.FSEVENT_DELETED = "deleted";
    exports2.FSEVENT_MOVED = "moved";
    exports2.FSEVENT_CLONED = "cloned";
    exports2.FSEVENT_UNKNOWN = "unknown";
    exports2.FSEVENT_FLAG_MUST_SCAN_SUBDIRS = 1;
    exports2.FSEVENT_TYPE_FILE = "file";
    exports2.FSEVENT_TYPE_DIRECTORY = "directory";
    exports2.FSEVENT_TYPE_SYMLINK = "symlink";
    exports2.KEY_LISTENERS = "listeners";
    exports2.KEY_ERR = "errHandlers";
    exports2.KEY_RAW = "rawEmitters";
    exports2.HANDLER_KEYS = [exports2.KEY_LISTENERS, exports2.KEY_ERR, exports2.KEY_RAW];
    exports2.DOT_SLASH = `.${sep2}`;
    exports2.BACK_SLASH_RE = /\\/g;
    exports2.DOUBLE_SLASH_RE = /\/\//;
    exports2.SLASH_OR_BACK_SLASH_RE = /[/\\]/;
    exports2.DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
    exports2.REPLACER_RE = /^\.[/\\]/;
    exports2.SLASH = "/";
    exports2.SLASH_SLASH = "//";
    exports2.BRACE_START = "{";
    exports2.BANG = "!";
    exports2.ONE_DOT = ".";
    exports2.TWO_DOTS = "..";
    exports2.STAR = "*";
    exports2.GLOBSTAR = "**";
    exports2.ROOT_GLOBSTAR = "/**/*";
    exports2.SLASH_GLOBSTAR = "/**";
    exports2.DIR_SUFFIX = "Dir";
    exports2.ANYMATCH_OPTS = { dot: true };
    exports2.STRING_TYPE = "string";
    exports2.FUNCTION_TYPE = "function";
    exports2.EMPTY_STR = "";
    exports2.EMPTY_FN = () => {
    };
    exports2.IDENTITY_FN = (val) => val;
    exports2.isWindows = platform === "win32";
    exports2.isMacos = platform === "darwin";
    exports2.isLinux = platform === "linux";
    exports2.isIBMi = os3.type() === "OS400";
  }
});

// node_modules/chokidar/lib/nodefs-handler.js
var require_nodefs_handler = __commonJS({
  "node_modules/chokidar/lib/nodefs-handler.js"(exports2, module2) {
    "use strict";
    var fs10 = require("fs");
    var sysPath = require("path");
    var { promisify: promisify3 } = require("util");
    var isBinaryPath = require_is_binary_path();
    var {
      isWindows,
      isLinux,
      EMPTY_FN,
      EMPTY_STR,
      KEY_LISTENERS,
      KEY_ERR,
      KEY_RAW,
      HANDLER_KEYS,
      EV_CHANGE,
      EV_ADD,
      EV_ADD_DIR,
      EV_ERROR,
      STR_DATA,
      STR_END,
      BRACE_START,
      STAR
    } = require_constants3();
    var THROTTLE_MODE_WATCH = "watch";
    var open = promisify3(fs10.open);
    var stat5 = promisify3(fs10.stat);
    var lstat = promisify3(fs10.lstat);
    var close = promisify3(fs10.close);
    var fsrealpath = promisify3(fs10.realpath);
    var statMethods = { lstat, stat: stat5 };
    var foreach = (val, fn) => {
      if (val instanceof Set) {
        val.forEach(fn);
      } else {
        fn(val);
      }
    };
    var addAndConvert = (main, prop, item) => {
      let container = main[prop];
      if (!(container instanceof Set)) {
        main[prop] = container = /* @__PURE__ */ new Set([container]);
      }
      container.add(item);
    };
    var clearItem = (cont) => (key) => {
      const set = cont[key];
      if (set instanceof Set) {
        set.clear();
      } else {
        delete cont[key];
      }
    };
    var delFromSet = (main, prop, item) => {
      const container = main[prop];
      if (container instanceof Set) {
        container.delete(item);
      } else if (container === item) {
        delete main[prop];
      }
    };
    var isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val;
    var FsWatchInstances = /* @__PURE__ */ new Map();
    function createFsWatchInstance(path17, options, listener, errHandler, emitRaw) {
      const handleEvent = (rawEvent, evPath) => {
        listener(path17);
        emitRaw(rawEvent, evPath, { watchedPath: path17 });
        if (evPath && path17 !== evPath) {
          fsWatchBroadcast(
            sysPath.resolve(path17, evPath),
            KEY_LISTENERS,
            sysPath.join(path17, evPath)
          );
        }
      };
      try {
        return fs10.watch(path17, options, handleEvent);
      } catch (error) {
        errHandler(error);
      }
    }
    var fsWatchBroadcast = (fullPath, type, val1, val2, val3) => {
      const cont = FsWatchInstances.get(fullPath);
      if (!cont) return;
      foreach(cont[type], (listener) => {
        listener(val1, val2, val3);
      });
    };
    var setFsWatchListener = (path17, fullPath, options, handlers) => {
      const { listener, errHandler, rawEmitter } = handlers;
      let cont = FsWatchInstances.get(fullPath);
      let watcher;
      if (!options.persistent) {
        watcher = createFsWatchInstance(
          path17,
          options,
          listener,
          errHandler,
          rawEmitter
        );
        return watcher.close.bind(watcher);
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_ERR, errHandler);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        watcher = createFsWatchInstance(
          path17,
          options,
          fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS),
          errHandler,
          // no need to use broadcast here
          fsWatchBroadcast.bind(null, fullPath, KEY_RAW)
        );
        if (!watcher) return;
        watcher.on(EV_ERROR, async (error) => {
          const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
          cont.watcherUnusable = true;
          if (isWindows && error.code === "EPERM") {
            try {
              const fd = await open(path17, "r");
              await close(fd);
              broadcastErr(error);
            } catch (err2) {
            }
          } else {
            broadcastErr(error);
          }
        });
        cont = {
          listeners: listener,
          errHandlers: errHandler,
          rawEmitters: rawEmitter,
          watcher
        };
        FsWatchInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_ERR, errHandler);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          cont.watcher.close();
          FsWatchInstances.delete(fullPath);
          HANDLER_KEYS.forEach(clearItem(cont));
          cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var FsWatchFileInstances = /* @__PURE__ */ new Map();
    var setFsWatchFileListener = (path17, fullPath, options, handlers) => {
      const { listener, rawEmitter } = handlers;
      let cont = FsWatchFileInstances.get(fullPath);
      let listeners = /* @__PURE__ */ new Set();
      let rawEmitters = /* @__PURE__ */ new Set();
      const copts = cont && cont.options;
      if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
        listeners = cont.listeners;
        rawEmitters = cont.rawEmitters;
        fs10.unwatchFile(fullPath);
        cont = void 0;
      }
      if (cont) {
        addAndConvert(cont, KEY_LISTENERS, listener);
        addAndConvert(cont, KEY_RAW, rawEmitter);
      } else {
        cont = {
          listeners: listener,
          rawEmitters: rawEmitter,
          options,
          watcher: fs10.watchFile(fullPath, options, (curr, prev) => {
            foreach(cont.rawEmitters, (rawEmitter2) => {
              rawEmitter2(EV_CHANGE, fullPath, { curr, prev });
            });
            const currmtime = curr.mtimeMs;
            if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
              foreach(cont.listeners, (listener2) => listener2(path17, curr));
            }
          })
        };
        FsWatchFileInstances.set(fullPath, cont);
      }
      return () => {
        delFromSet(cont, KEY_LISTENERS, listener);
        delFromSet(cont, KEY_RAW, rawEmitter);
        if (isEmptySet(cont.listeners)) {
          FsWatchFileInstances.delete(fullPath);
          fs10.unwatchFile(fullPath);
          cont.options = cont.watcher = void 0;
          Object.freeze(cont);
        }
      };
    };
    var NodeFsHandler = class {
      /**
       * @param {import("../index").FSWatcher} fsW
       */
      constructor(fsW) {
        this.fsw = fsW;
        this._boundHandleError = (error) => fsW._handleError(error);
      }
      /**
       * Watch file for changes with fs_watchFile or fs_watch.
       * @param {String} path to file or dir
       * @param {Function} listener on fs change
       * @returns {Function} closer for the watcher instance
       */
      _watchWithNodeFs(path17, listener) {
        const opts = this.fsw.options;
        const directory = sysPath.dirname(path17);
        const basename5 = sysPath.basename(path17);
        const parent = this.fsw._getWatchedDir(directory);
        parent.add(basename5);
        const absolutePath = sysPath.resolve(path17);
        const options = { persistent: opts.persistent };
        if (!listener) listener = EMPTY_FN;
        let closer;
        if (opts.usePolling) {
          options.interval = opts.enableBinaryInterval && isBinaryPath(basename5) ? opts.binaryInterval : opts.interval;
          closer = setFsWatchFileListener(path17, absolutePath, options, {
            listener,
            rawEmitter: this.fsw._emitRaw
          });
        } else {
          closer = setFsWatchListener(path17, absolutePath, options, {
            listener,
            errHandler: this._boundHandleError,
            rawEmitter: this.fsw._emitRaw
          });
        }
        return closer;
      }
      /**
       * Watch a file and emit add event if warranted.
       * @param {Path} file Path
       * @param {fs.Stats} stats result of fs_stat
       * @param {Boolean} initialAdd was the file added at watch instantiation?
       * @returns {Function} closer for the watcher instance
       */
      _handleFile(file, stats, initialAdd) {
        if (this.fsw.closed) {
          return;
        }
        const dirname10 = sysPath.dirname(file);
        const basename5 = sysPath.basename(file);
        const parent = this.fsw._getWatchedDir(dirname10);
        let prevStats = stats;
        if (parent.has(basename5)) return;
        const listener = async (path17, newStats) => {
          if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5)) return;
          if (!newStats || newStats.mtimeMs === 0) {
            try {
              const newStats2 = await stat5(file);
              if (this.fsw.closed) return;
              const at = newStats2.atimeMs;
              const mt = newStats2.mtimeMs;
              if (!at || at <= mt || mt !== prevStats.mtimeMs) {
                this.fsw._emit(EV_CHANGE, file, newStats2);
              }
              if (isLinux && prevStats.ino !== newStats2.ino) {
                this.fsw._closeFile(path17);
                prevStats = newStats2;
                this.fsw._addPathCloser(path17, this._watchWithNodeFs(file, listener));
              } else {
                prevStats = newStats2;
              }
            } catch (error) {
              this.fsw._remove(dirname10, basename5);
            }
          } else if (parent.has(basename5)) {
            const at = newStats.atimeMs;
            const mt = newStats.mtimeMs;
            if (!at || at <= mt || mt !== prevStats.mtimeMs) {
              this.fsw._emit(EV_CHANGE, file, newStats);
            }
            prevStats = newStats;
          }
        };
        const closer = this._watchWithNodeFs(file, listener);
        if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
          if (!this.fsw._throttle(EV_ADD, file, 0)) return;
          this.fsw._emit(EV_ADD, file, stats);
        }
        return closer;
      }
      /**
       * Handle symlinks encountered while reading a dir.
       * @param {Object} entry returned by readdirp
       * @param {String} directory path of dir being read
       * @param {String} path of this item
       * @param {String} item basename of this item
       * @returns {Promise<Boolean>} true if no more processing is needed for this entry.
       */
      async _handleSymlink(entry, directory, path17, item) {
        if (this.fsw.closed) {
          return;
        }
        const full = entry.fullPath;
        const dir = this.fsw._getWatchedDir(directory);
        if (!this.fsw.options.followSymlinks) {
          this.fsw._incrReadyCount();
          let linkPath;
          try {
            linkPath = await fsrealpath(path17);
          } catch (e) {
            this.fsw._emitReady();
            return true;
          }
          if (this.fsw.closed) return;
          if (dir.has(item)) {
            if (this.fsw._symlinkPaths.get(full) !== linkPath) {
              this.fsw._symlinkPaths.set(full, linkPath);
              this.fsw._emit(EV_CHANGE, path17, entry.stats);
            }
          } else {
            dir.add(item);
            this.fsw._symlinkPaths.set(full, linkPath);
            this.fsw._emit(EV_ADD, path17, entry.stats);
          }
          this.fsw._emitReady();
          return true;
        }
        if (this.fsw._symlinkPaths.has(full)) {
          return true;
        }
        this.fsw._symlinkPaths.set(full, true);
      }
      _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
        directory = sysPath.join(directory, EMPTY_STR);
        if (!wh.hasGlob) {
          throttler = this.fsw._throttle("readdir", directory, 1e3);
          if (!throttler) return;
        }
        const previous = this.fsw._getWatchedDir(wh.path);
        const current = /* @__PURE__ */ new Set();
        let stream = this.fsw._readdirp(directory, {
          fileFilter: (entry) => wh.filterPath(entry),
          directoryFilter: (entry) => wh.filterDir(entry),
          depth: 0
        }).on(STR_DATA, async (entry) => {
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          const item = entry.path;
          let path17 = sysPath.join(directory, item);
          current.add(item);
          if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path17, item)) {
            return;
          }
          if (this.fsw.closed) {
            stream = void 0;
            return;
          }
          if (item === target || !target && !previous.has(item)) {
            this.fsw._incrReadyCount();
            path17 = sysPath.join(dir, sysPath.relative(dir, path17));
            this._addToNodeFs(path17, initialAdd, wh, depth + 1);
          }
        }).on(EV_ERROR, this._boundHandleError);
        return new Promise(
          (resolve5) => stream.once(STR_END, () => {
            if (this.fsw.closed) {
              stream = void 0;
              return;
            }
            const wasThrottled = throttler ? throttler.clear() : false;
            resolve5();
            previous.getChildren().filter((item) => {
              return item !== directory && !current.has(item) && // in case of intersecting globs;
              // a path may have been filtered out of this readdir, but
              // shouldn't be removed because it matches a different glob
              (!wh.hasGlob || wh.filterPath({
                fullPath: sysPath.resolve(directory, item)
              }));
            }).forEach((item) => {
              this.fsw._remove(directory, item);
            });
            stream = void 0;
            if (wasThrottled) this._handleRead(directory, false, wh, target, dir, depth, throttler);
          })
        );
      }
      /**
       * Read directory to add / remove files from `@watched` list and re-read it on change.
       * @param {String} dir fs path
       * @param {fs.Stats} stats
       * @param {Boolean} initialAdd
       * @param {Number} depth relative to user-supplied path
       * @param {String} target child path targeted for watch
       * @param {Object} wh Common watch helpers for this path
       * @param {String} realpath
       * @returns {Promise<Function>} closer for the watcher instance.
       */
      async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath) {
        const parentDir = this.fsw._getWatchedDir(sysPath.dirname(dir));
        const tracked = parentDir.has(sysPath.basename(dir));
        if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
          if (!wh.hasGlob || wh.globFilter(dir)) this.fsw._emit(EV_ADD_DIR, dir, stats);
        }
        parentDir.add(sysPath.basename(dir));
        this.fsw._getWatchedDir(dir);
        let throttler;
        let closer;
        const oDepth = this.fsw.options.depth;
        if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath)) {
          if (!target) {
            await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
            if (this.fsw.closed) return;
          }
          closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
            if (stats2 && stats2.mtimeMs === 0) return;
            this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
          });
        }
        return closer;
      }
      /**
       * Handle added file, directory, or glob pattern.
       * Delegates call to _handleFile / _handleDir after checks.
       * @param {String} path to file or ir
       * @param {Boolean} initialAdd was the file added at watch instantiation?
       * @param {Object} priorWh depth relative to user-supplied path
       * @param {Number} depth Child path actually targeted for watch
       * @param {String=} target Child path actually targeted for watch
       * @returns {Promise}
       */
      async _addToNodeFs(path17, initialAdd, priorWh, depth, target) {
        const ready = this.fsw._emitReady;
        if (this.fsw._isIgnored(path17) || this.fsw.closed) {
          ready();
          return false;
        }
        const wh = this.fsw._getWatchHelpers(path17, depth);
        if (!wh.hasGlob && priorWh) {
          wh.hasGlob = priorWh.hasGlob;
          wh.globFilter = priorWh.globFilter;
          wh.filterPath = (entry) => priorWh.filterPath(entry);
          wh.filterDir = (entry) => priorWh.filterDir(entry);
        }
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed) return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            ready();
            return false;
          }
          const follow = this.fsw.options.followSymlinks && !path17.includes(STAR) && !path17.includes(BRACE_START);
          let closer;
          if (stats.isDirectory()) {
            const absPath = sysPath.resolve(path17);
            const targetPath = follow ? await fsrealpath(path17) : path17;
            if (this.fsw.closed) return;
            closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
            if (this.fsw.closed) return;
            if (absPath !== targetPath && targetPath !== void 0) {
              this.fsw._symlinkPaths.set(absPath, targetPath);
            }
          } else if (stats.isSymbolicLink()) {
            const targetPath = follow ? await fsrealpath(path17) : path17;
            if (this.fsw.closed) return;
            const parent = sysPath.dirname(wh.watchPath);
            this.fsw._getWatchedDir(parent).add(wh.watchPath);
            this.fsw._emit(EV_ADD, wh.watchPath, stats);
            closer = await this._handleDir(parent, stats, initialAdd, depth, path17, wh, targetPath);
            if (this.fsw.closed) return;
            if (targetPath !== void 0) {
              this.fsw._symlinkPaths.set(sysPath.resolve(path17), targetPath);
            }
          } else {
            closer = this._handleFile(wh.watchPath, stats, initialAdd);
          }
          ready();
          this.fsw._addPathCloser(path17, closer);
          return false;
        } catch (error) {
          if (this.fsw._handleError(error)) {
            ready();
            return path17;
          }
        }
      }
    };
    module2.exports = NodeFsHandler;
  }
});

// node_modules/chokidar/lib/fsevents-handler.js
var require_fsevents_handler = __commonJS({
  "node_modules/chokidar/lib/fsevents-handler.js"(exports2, module2) {
    "use strict";
    var fs10 = require("fs");
    var sysPath = require("path");
    var { promisify: promisify3 } = require("util");
    var fsevents;
    try {
      fsevents = require("fsevents");
    } catch (error) {
      if (process.env.CHOKIDAR_PRINT_FSEVENTS_REQUIRE_ERROR) console.error(error);
    }
    if (fsevents) {
      const mtch = process.version.match(/v(\d+)\.(\d+)/);
      if (mtch && mtch[1] && mtch[2]) {
        const maj = Number.parseInt(mtch[1], 10);
        const min = Number.parseInt(mtch[2], 10);
        if (maj === 8 && min < 16) {
          fsevents = void 0;
        }
      }
    }
    var {
      EV_ADD,
      EV_CHANGE,
      EV_ADD_DIR,
      EV_UNLINK,
      EV_ERROR,
      STR_DATA,
      STR_END,
      FSEVENT_CREATED,
      FSEVENT_MODIFIED,
      FSEVENT_DELETED,
      FSEVENT_MOVED,
      // FSEVENT_CLONED,
      FSEVENT_UNKNOWN,
      FSEVENT_FLAG_MUST_SCAN_SUBDIRS,
      FSEVENT_TYPE_FILE,
      FSEVENT_TYPE_DIRECTORY,
      FSEVENT_TYPE_SYMLINK,
      ROOT_GLOBSTAR,
      DIR_SUFFIX,
      DOT_SLASH,
      FUNCTION_TYPE,
      EMPTY_FN,
      IDENTITY_FN
    } = require_constants3();
    var Depth = (value) => isNaN(value) ? {} : { depth: value };
    var stat5 = promisify3(fs10.stat);
    var lstat = promisify3(fs10.lstat);
    var realpath = promisify3(fs10.realpath);
    var statMethods = { stat: stat5, lstat };
    var FSEventsWatchers = /* @__PURE__ */ new Map();
    var consolidateThreshhold = 10;
    var wrongEventFlags = /* @__PURE__ */ new Set([
      69888,
      70400,
      71424,
      72704,
      73472,
      131328,
      131840,
      262912
    ]);
    var createFSEventsInstance = (path17, callback) => {
      const stop = fsevents.watch(path17, callback);
      return { stop };
    };
    function setFSEventsListener(path17, realPath, listener, rawEmitter) {
      let watchPath = sysPath.extname(realPath) ? sysPath.dirname(realPath) : realPath;
      const parentPath = sysPath.dirname(watchPath);
      let cont = FSEventsWatchers.get(watchPath);
      if (couldConsolidate(parentPath)) {
        watchPath = parentPath;
      }
      const resolvedPath = sysPath.resolve(path17);
      const hasSymlink = resolvedPath !== realPath;
      const filteredListener = (fullPath, flags, info) => {
        if (hasSymlink) fullPath = fullPath.replace(realPath, resolvedPath);
        if (fullPath === resolvedPath || !fullPath.indexOf(resolvedPath + sysPath.sep)) listener(fullPath, flags, info);
      };
      let watchedParent = false;
      for (const watchedPath of FSEventsWatchers.keys()) {
        if (realPath.indexOf(sysPath.resolve(watchedPath) + sysPath.sep) === 0) {
          watchPath = watchedPath;
          cont = FSEventsWatchers.get(watchPath);
          watchedParent = true;
          break;
        }
      }
      if (cont || watchedParent) {
        cont.listeners.add(filteredListener);
      } else {
        cont = {
          listeners: /* @__PURE__ */ new Set([filteredListener]),
          rawEmitter,
          watcher: createFSEventsInstance(watchPath, (fullPath, flags) => {
            if (!cont.listeners.size) return;
            if (flags & FSEVENT_FLAG_MUST_SCAN_SUBDIRS) return;
            const info = fsevents.getInfo(fullPath, flags);
            cont.listeners.forEach((list) => {
              list(fullPath, flags, info);
            });
            cont.rawEmitter(info.event, fullPath, info);
          })
        };
        FSEventsWatchers.set(watchPath, cont);
      }
      return () => {
        const lst = cont.listeners;
        lst.delete(filteredListener);
        if (!lst.size) {
          FSEventsWatchers.delete(watchPath);
          if (cont.watcher) return cont.watcher.stop().then(() => {
            cont.rawEmitter = cont.watcher = void 0;
            Object.freeze(cont);
          });
        }
      };
    }
    var couldConsolidate = (path17) => {
      let count = 0;
      for (const watchPath of FSEventsWatchers.keys()) {
        if (watchPath.indexOf(path17) === 0) {
          count++;
          if (count >= consolidateThreshhold) {
            return true;
          }
        }
      }
      return false;
    };
    var canUse = () => fsevents && FSEventsWatchers.size < 128;
    var calcDepth = (path17, root) => {
      let i = 0;
      while (!path17.indexOf(root) && (path17 = sysPath.dirname(path17)) !== root) i++;
      return i;
    };
    var sameTypes = (info, stats) => info.type === FSEVENT_TYPE_DIRECTORY && stats.isDirectory() || info.type === FSEVENT_TYPE_SYMLINK && stats.isSymbolicLink() || info.type === FSEVENT_TYPE_FILE && stats.isFile();
    var FsEventsHandler = class {
      /**
       * @param {import('../index').FSWatcher} fsw
       */
      constructor(fsw) {
        this.fsw = fsw;
      }
      checkIgnored(path17, stats) {
        const ipaths = this.fsw._ignoredPaths;
        if (this.fsw._isIgnored(path17, stats)) {
          ipaths.add(path17);
          if (stats && stats.isDirectory()) {
            ipaths.add(path17 + ROOT_GLOBSTAR);
          }
          return true;
        }
        ipaths.delete(path17);
        ipaths.delete(path17 + ROOT_GLOBSTAR);
      }
      addOrChange(path17, fullPath, realPath, parent, watchedDir, item, info, opts) {
        const event = watchedDir.has(item) ? EV_CHANGE : EV_ADD;
        this.handleEvent(event, path17, fullPath, realPath, parent, watchedDir, item, info, opts);
      }
      async checkExists(path17, fullPath, realPath, parent, watchedDir, item, info, opts) {
        try {
          const stats = await stat5(path17);
          if (this.fsw.closed) return;
          if (sameTypes(info, stats)) {
            this.addOrChange(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
          } else {
            this.handleEvent(EV_UNLINK, path17, fullPath, realPath, parent, watchedDir, item, info, opts);
          }
        } catch (error) {
          if (error.code === "EACCES") {
            this.addOrChange(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
          } else {
            this.handleEvent(EV_UNLINK, path17, fullPath, realPath, parent, watchedDir, item, info, opts);
          }
        }
      }
      handleEvent(event, path17, fullPath, realPath, parent, watchedDir, item, info, opts) {
        if (this.fsw.closed || this.checkIgnored(path17)) return;
        if (event === EV_UNLINK) {
          const isDirectory = info.type === FSEVENT_TYPE_DIRECTORY;
          if (isDirectory || watchedDir.has(item)) {
            this.fsw._remove(parent, item, isDirectory);
          }
        } else {
          if (event === EV_ADD) {
            if (info.type === FSEVENT_TYPE_DIRECTORY) this.fsw._getWatchedDir(path17);
            if (info.type === FSEVENT_TYPE_SYMLINK && opts.followSymlinks) {
              const curDepth = opts.depth === void 0 ? void 0 : calcDepth(fullPath, realPath) + 1;
              return this._addToFsEvents(path17, false, true, curDepth);
            }
            this.fsw._getWatchedDir(parent).add(item);
          }
          const eventName = info.type === FSEVENT_TYPE_DIRECTORY ? event + DIR_SUFFIX : event;
          this.fsw._emit(eventName, path17);
          if (eventName === EV_ADD_DIR) this._addToFsEvents(path17, false, true);
        }
      }
      /**
       * Handle symlinks encountered during directory scan
       * @param {String} watchPath  - file/dir path to be watched with fsevents
       * @param {String} realPath   - real path (in case of symlinks)
       * @param {Function} transform  - path transformer
       * @param {Function} globFilter - path filter in case a glob pattern was provided
       * @returns {Function} closer for the watcher instance
      */
      _watchWithFsEvents(watchPath, realPath, transform, globFilter) {
        if (this.fsw.closed || this.fsw._isIgnored(watchPath)) return;
        const opts = this.fsw.options;
        const watchCallback = async (fullPath, flags, info) => {
          if (this.fsw.closed) return;
          if (opts.depth !== void 0 && calcDepth(fullPath, realPath) > opts.depth) return;
          const path17 = transform(sysPath.join(
            watchPath,
            sysPath.relative(watchPath, fullPath)
          ));
          if (globFilter && !globFilter(path17)) return;
          const parent = sysPath.dirname(path17);
          const item = sysPath.basename(path17);
          const watchedDir = this.fsw._getWatchedDir(
            info.type === FSEVENT_TYPE_DIRECTORY ? path17 : parent
          );
          if (wrongEventFlags.has(flags) || info.event === FSEVENT_UNKNOWN) {
            if (typeof opts.ignored === FUNCTION_TYPE) {
              let stats;
              try {
                stats = await stat5(path17);
              } catch (error) {
              }
              if (this.fsw.closed) return;
              if (this.checkIgnored(path17, stats)) return;
              if (sameTypes(info, stats)) {
                this.addOrChange(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
              } else {
                this.handleEvent(EV_UNLINK, path17, fullPath, realPath, parent, watchedDir, item, info, opts);
              }
            } else {
              this.checkExists(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
            }
          } else {
            switch (info.event) {
              case FSEVENT_CREATED:
              case FSEVENT_MODIFIED:
                return this.addOrChange(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
              case FSEVENT_DELETED:
              case FSEVENT_MOVED:
                return this.checkExists(path17, fullPath, realPath, parent, watchedDir, item, info, opts);
            }
          }
        };
        const closer = setFSEventsListener(
          watchPath,
          realPath,
          watchCallback,
          this.fsw._emitRaw
        );
        this.fsw._emitReady();
        return closer;
      }
      /**
       * Handle symlinks encountered during directory scan
       * @param {String} linkPath path to symlink
       * @param {String} fullPath absolute path to the symlink
       * @param {Function} transform pre-existing path transformer
       * @param {Number} curDepth level of subdirectories traversed to where symlink is
       * @returns {Promise<void>}
       */
      async _handleFsEventsSymlink(linkPath, fullPath, transform, curDepth) {
        if (this.fsw.closed || this.fsw._symlinkPaths.has(fullPath)) return;
        this.fsw._symlinkPaths.set(fullPath, true);
        this.fsw._incrReadyCount();
        try {
          const linkTarget = await realpath(linkPath);
          if (this.fsw.closed) return;
          if (this.fsw._isIgnored(linkTarget)) {
            return this.fsw._emitReady();
          }
          this.fsw._incrReadyCount();
          this._addToFsEvents(linkTarget || linkPath, (path17) => {
            let aliasedPath = linkPath;
            if (linkTarget && linkTarget !== DOT_SLASH) {
              aliasedPath = path17.replace(linkTarget, linkPath);
            } else if (path17 !== DOT_SLASH) {
              aliasedPath = sysPath.join(linkPath, path17);
            }
            return transform(aliasedPath);
          }, false, curDepth);
        } catch (error) {
          if (this.fsw._handleError(error)) {
            return this.fsw._emitReady();
          }
        }
      }
      /**
       *
       * @param {Path} newPath
       * @param {fs.Stats} stats
       */
      emitAdd(newPath, stats, processPath, opts, forceAdd) {
        const pp = processPath(newPath);
        const isDir = stats.isDirectory();
        const dirObj = this.fsw._getWatchedDir(sysPath.dirname(pp));
        const base = sysPath.basename(pp);
        if (isDir) this.fsw._getWatchedDir(pp);
        if (dirObj.has(base)) return;
        dirObj.add(base);
        if (!opts.ignoreInitial || forceAdd === true) {
          this.fsw._emit(isDir ? EV_ADD_DIR : EV_ADD, pp, stats);
        }
      }
      initWatch(realPath, path17, wh, processPath) {
        if (this.fsw.closed) return;
        const closer = this._watchWithFsEvents(
          wh.watchPath,
          sysPath.resolve(realPath || wh.watchPath),
          processPath,
          wh.globFilter
        );
        this.fsw._addPathCloser(path17, closer);
      }
      /**
       * Handle added path with fsevents
       * @param {String} path file/dir path or glob pattern
       * @param {Function|Boolean=} transform converts working path to what the user expects
       * @param {Boolean=} forceAdd ensure add is emitted
       * @param {Number=} priorDepth Level of subdirectories already traversed.
       * @returns {Promise<void>}
       */
      async _addToFsEvents(path17, transform, forceAdd, priorDepth) {
        if (this.fsw.closed) {
          return;
        }
        const opts = this.fsw.options;
        const processPath = typeof transform === FUNCTION_TYPE ? transform : IDENTITY_FN;
        const wh = this.fsw._getWatchHelpers(path17);
        try {
          const stats = await statMethods[wh.statMethod](wh.watchPath);
          if (this.fsw.closed) return;
          if (this.fsw._isIgnored(wh.watchPath, stats)) {
            throw null;
          }
          if (stats.isDirectory()) {
            if (!wh.globFilter) this.emitAdd(processPath(path17), stats, processPath, opts, forceAdd);
            if (priorDepth && priorDepth > opts.depth) return;
            this.fsw._readdirp(wh.watchPath, {
              fileFilter: (entry) => wh.filterPath(entry),
              directoryFilter: (entry) => wh.filterDir(entry),
              ...Depth(opts.depth - (priorDepth || 0))
            }).on(STR_DATA, (entry) => {
              if (this.fsw.closed) {
                return;
              }
              if (entry.stats.isDirectory() && !wh.filterPath(entry)) return;
              const joinedPath = sysPath.join(wh.watchPath, entry.path);
              const { fullPath } = entry;
              if (wh.followSymlinks && entry.stats.isSymbolicLink()) {
                const curDepth = opts.depth === void 0 ? void 0 : calcDepth(joinedPath, sysPath.resolve(wh.watchPath)) + 1;
                this._handleFsEventsSymlink(joinedPath, fullPath, processPath, curDepth);
              } else {
                this.emitAdd(joinedPath, entry.stats, processPath, opts, forceAdd);
              }
            }).on(EV_ERROR, EMPTY_FN).on(STR_END, () => {
              this.fsw._emitReady();
            });
          } else {
            this.emitAdd(wh.watchPath, stats, processPath, opts, forceAdd);
            this.fsw._emitReady();
          }
        } catch (error) {
          if (!error || this.fsw._handleError(error)) {
            this.fsw._emitReady();
            this.fsw._emitReady();
          }
        }
        if (opts.persistent && forceAdd !== true) {
          if (typeof transform === FUNCTION_TYPE) {
            this.initWatch(void 0, path17, wh, processPath);
          } else {
            let realPath;
            try {
              realPath = await realpath(wh.watchPath);
            } catch (e) {
            }
            this.initWatch(realPath, path17, wh, processPath);
          }
        }
      }
    };
    module2.exports = FsEventsHandler;
    module2.exports.canUse = canUse;
  }
});

// node_modules/chokidar/index.js
var require_chokidar = __commonJS({
  "node_modules/chokidar/index.js"(exports2) {
    "use strict";
    var { EventEmitter: EventEmitter11 } = require("events");
    var fs10 = require("fs");
    var sysPath = require("path");
    var { promisify: promisify3 } = require("util");
    var readdirp = require_readdirp();
    var anymatch = require_anymatch().default;
    var globParent = require_glob_parent();
    var isGlob = require_is_glob();
    var braces = require_braces();
    var normalizePath2 = require_normalize_path();
    var NodeFsHandler = require_nodefs_handler();
    var FsEventsHandler = require_fsevents_handler();
    var {
      EV_ALL,
      EV_READY,
      EV_ADD,
      EV_CHANGE,
      EV_UNLINK,
      EV_ADD_DIR,
      EV_UNLINK_DIR,
      EV_RAW,
      EV_ERROR,
      STR_CLOSE,
      STR_END,
      BACK_SLASH_RE,
      DOUBLE_SLASH_RE,
      SLASH_OR_BACK_SLASH_RE,
      DOT_RE,
      REPLACER_RE,
      SLASH,
      SLASH_SLASH,
      BRACE_START,
      BANG,
      ONE_DOT,
      TWO_DOTS,
      GLOBSTAR,
      SLASH_GLOBSTAR,
      ANYMATCH_OPTS,
      STRING_TYPE,
      FUNCTION_TYPE,
      EMPTY_STR,
      EMPTY_FN,
      isWindows,
      isMacos,
      isIBMi
    } = require_constants3();
    var stat5 = promisify3(fs10.stat);
    var readdir2 = promisify3(fs10.readdir);
    var arrify = (value = []) => Array.isArray(value) ? value : [value];
    var flatten = (list, result = []) => {
      list.forEach((item) => {
        if (Array.isArray(item)) {
          flatten(item, result);
        } else {
          result.push(item);
        }
      });
      return result;
    };
    var unifyPaths = (paths_) => {
      const paths = flatten(arrify(paths_));
      if (!paths.every((p) => typeof p === STRING_TYPE)) {
        throw new TypeError(`Non-string provided as watch path: ${paths}`);
      }
      return paths.map(normalizePathToUnix);
    };
    var toUnix = (string) => {
      let str = string.replace(BACK_SLASH_RE, SLASH);
      let prepend = false;
      if (str.startsWith(SLASH_SLASH)) {
        prepend = true;
      }
      while (str.match(DOUBLE_SLASH_RE)) {
        str = str.replace(DOUBLE_SLASH_RE, SLASH);
      }
      if (prepend) {
        str = SLASH + str;
      }
      return str;
    };
    var normalizePathToUnix = (path17) => toUnix(sysPath.normalize(toUnix(path17)));
    var normalizeIgnored = (cwd = EMPTY_STR) => (path17) => {
      if (typeof path17 !== STRING_TYPE) return path17;
      return normalizePathToUnix(sysPath.isAbsolute(path17) ? path17 : sysPath.join(cwd, path17));
    };
    var getAbsolutePath = (path17, cwd) => {
      if (sysPath.isAbsolute(path17)) {
        return path17;
      }
      if (path17.startsWith(BANG)) {
        return BANG + sysPath.join(cwd, path17.slice(1));
      }
      return sysPath.join(cwd, path17);
    };
    var undef = (opts, key) => opts[key] === void 0;
    var DirEntry = class {
      /**
       * @param {Path} dir
       * @param {Function} removeWatcher
       */
      constructor(dir, removeWatcher) {
        this.path = dir;
        this._removeWatcher = removeWatcher;
        this.items = /* @__PURE__ */ new Set();
      }
      add(item) {
        const { items } = this;
        if (!items) return;
        if (item !== ONE_DOT && item !== TWO_DOTS) items.add(item);
      }
      async remove(item) {
        const { items } = this;
        if (!items) return;
        items.delete(item);
        if (items.size > 0) return;
        const dir = this.path;
        try {
          await readdir2(dir);
        } catch (err2) {
          if (this._removeWatcher) {
            this._removeWatcher(sysPath.dirname(dir), sysPath.basename(dir));
          }
        }
      }
      has(item) {
        const { items } = this;
        if (!items) return;
        return items.has(item);
      }
      /**
       * @returns {Array<String>}
       */
      getChildren() {
        const { items } = this;
        if (!items) return;
        return [...items.values()];
      }
      dispose() {
        this.items.clear();
        delete this.path;
        delete this._removeWatcher;
        delete this.items;
        Object.freeze(this);
      }
    };
    var STAT_METHOD_F = "stat";
    var STAT_METHOD_L = "lstat";
    var WatchHelper = class {
      constructor(path17, watchPath, follow, fsw) {
        this.fsw = fsw;
        this.path = path17 = path17.replace(REPLACER_RE, EMPTY_STR);
        this.watchPath = watchPath;
        this.fullWatchPath = sysPath.resolve(watchPath);
        this.hasGlob = watchPath !== path17;
        if (path17 === EMPTY_STR) this.hasGlob = false;
        this.globSymlink = this.hasGlob && follow ? void 0 : false;
        this.globFilter = this.hasGlob ? anymatch(path17, void 0, ANYMATCH_OPTS) : false;
        this.dirParts = this.getDirParts(path17);
        this.dirParts.forEach((parts) => {
          if (parts.length > 1) parts.pop();
        });
        this.followSymlinks = follow;
        this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
      }
      checkGlobSymlink(entry) {
        if (this.globSymlink === void 0) {
          this.globSymlink = entry.fullParentDir === this.fullWatchPath ? false : { realPath: entry.fullParentDir, linkPath: this.fullWatchPath };
        }
        if (this.globSymlink) {
          return entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath);
        }
        return entry.fullPath;
      }
      entryPath(entry) {
        return sysPath.join(
          this.watchPath,
          sysPath.relative(this.watchPath, this.checkGlobSymlink(entry))
        );
      }
      filterPath(entry) {
        const { stats } = entry;
        if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
        const resolvedPath = this.entryPath(entry);
        const matchesGlob = this.hasGlob && typeof this.globFilter === FUNCTION_TYPE ? this.globFilter(resolvedPath) : true;
        return matchesGlob && this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
      }
      getDirParts(path17) {
        if (!this.hasGlob) return [];
        const parts = [];
        const expandedPath = path17.includes(BRACE_START) ? braces.expand(path17) : [path17];
        expandedPath.forEach((path18) => {
          parts.push(sysPath.relative(this.watchPath, path18).split(SLASH_OR_BACK_SLASH_RE));
        });
        return parts;
      }
      filterDir(entry) {
        if (this.hasGlob) {
          const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
          let globstar = false;
          this.unmatchedGlob = !this.dirParts.some((parts) => {
            return parts.every((part, i) => {
              if (part === GLOBSTAR) globstar = true;
              return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], ANYMATCH_OPTS);
            });
          });
        }
        return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
      }
    };
    var FSWatcher = class extends EventEmitter11 {
      // Not indenting methods for history sake; for now.
      constructor(_opts) {
        super();
        const opts = {};
        if (_opts) Object.assign(opts, _opts);
        this._watched = /* @__PURE__ */ new Map();
        this._closers = /* @__PURE__ */ new Map();
        this._ignoredPaths = /* @__PURE__ */ new Set();
        this._throttled = /* @__PURE__ */ new Map();
        this._symlinkPaths = /* @__PURE__ */ new Map();
        this._streams = /* @__PURE__ */ new Set();
        this.closed = false;
        if (undef(opts, "persistent")) opts.persistent = true;
        if (undef(opts, "ignoreInitial")) opts.ignoreInitial = false;
        if (undef(opts, "ignorePermissionErrors")) opts.ignorePermissionErrors = false;
        if (undef(opts, "interval")) opts.interval = 100;
        if (undef(opts, "binaryInterval")) opts.binaryInterval = 300;
        if (undef(opts, "disableGlobbing")) opts.disableGlobbing = false;
        opts.enableBinaryInterval = opts.binaryInterval !== opts.interval;
        if (undef(opts, "useFsEvents")) opts.useFsEvents = !opts.usePolling;
        const canUseFsEvents = FsEventsHandler.canUse();
        if (!canUseFsEvents) opts.useFsEvents = false;
        if (undef(opts, "usePolling") && !opts.useFsEvents) {
          opts.usePolling = isMacos;
        }
        if (isIBMi) {
          opts.usePolling = true;
        }
        const envPoll = process.env.CHOKIDAR_USEPOLLING;
        if (envPoll !== void 0) {
          const envLower = envPoll.toLowerCase();
          if (envLower === "false" || envLower === "0") {
            opts.usePolling = false;
          } else if (envLower === "true" || envLower === "1") {
            opts.usePolling = true;
          } else {
            opts.usePolling = !!envLower;
          }
        }
        const envInterval = process.env.CHOKIDAR_INTERVAL;
        if (envInterval) {
          opts.interval = Number.parseInt(envInterval, 10);
        }
        if (undef(opts, "atomic")) opts.atomic = !opts.usePolling && !opts.useFsEvents;
        if (opts.atomic) this._pendingUnlinks = /* @__PURE__ */ new Map();
        if (undef(opts, "followSymlinks")) opts.followSymlinks = true;
        if (undef(opts, "awaitWriteFinish")) opts.awaitWriteFinish = false;
        if (opts.awaitWriteFinish === true) opts.awaitWriteFinish = {};
        const awf = opts.awaitWriteFinish;
        if (awf) {
          if (!awf.stabilityThreshold) awf.stabilityThreshold = 2e3;
          if (!awf.pollInterval) awf.pollInterval = 100;
          this._pendingWrites = /* @__PURE__ */ new Map();
        }
        if (opts.ignored) opts.ignored = arrify(opts.ignored);
        let readyCalls = 0;
        this._emitReady = () => {
          readyCalls++;
          if (readyCalls >= this._readyCount) {
            this._emitReady = EMPTY_FN;
            this._readyEmitted = true;
            process.nextTick(() => this.emit(EV_READY));
          }
        };
        this._emitRaw = (...args) => this.emit(EV_RAW, ...args);
        this._readyEmitted = false;
        this.options = opts;
        if (opts.useFsEvents) {
          this._fsEventsHandler = new FsEventsHandler(this);
        } else {
          this._nodeFsHandler = new NodeFsHandler(this);
        }
        Object.freeze(opts);
      }
      // Public methods
      /**
       * Adds paths to be watched on an existing FSWatcher instance
       * @param {Path|Array<Path>} paths_
       * @param {String=} _origAdd private; for handling non-existent paths to be watched
       * @param {Boolean=} _internal private; indicates a non-user add
       * @returns {FSWatcher} for chaining
       */
      add(paths_, _origAdd, _internal) {
        const { cwd, disableGlobbing } = this.options;
        this.closed = false;
        let paths = unifyPaths(paths_);
        if (cwd) {
          paths = paths.map((path17) => {
            const absPath = getAbsolutePath(path17, cwd);
            if (disableGlobbing || !isGlob(path17)) {
              return absPath;
            }
            return normalizePath2(absPath);
          });
        }
        paths = paths.filter((path17) => {
          if (path17.startsWith(BANG)) {
            this._ignoredPaths.add(path17.slice(1));
            return false;
          }
          this._ignoredPaths.delete(path17);
          this._ignoredPaths.delete(path17 + SLASH_GLOBSTAR);
          this._userIgnored = void 0;
          return true;
        });
        if (this.options.useFsEvents && this._fsEventsHandler) {
          if (!this._readyCount) this._readyCount = paths.length;
          if (this.options.persistent) this._readyCount += paths.length;
          paths.forEach((path17) => this._fsEventsHandler._addToFsEvents(path17));
        } else {
          if (!this._readyCount) this._readyCount = 0;
          this._readyCount += paths.length;
          Promise.all(
            paths.map(async (path17) => {
              const res = await this._nodeFsHandler._addToNodeFs(path17, !_internal, 0, 0, _origAdd);
              if (res) this._emitReady();
              return res;
            })
          ).then((results) => {
            if (this.closed) return;
            results.filter((item) => item).forEach((item) => {
              this.add(sysPath.dirname(item), sysPath.basename(_origAdd || item));
            });
          });
        }
        return this;
      }
      /**
       * Close watchers or start ignoring events from specified paths.
       * @param {Path|Array<Path>} paths_ - string or array of strings, file/directory paths and/or globs
       * @returns {FSWatcher} for chaining
      */
      unwatch(paths_) {
        if (this.closed) return this;
        const paths = unifyPaths(paths_);
        const { cwd } = this.options;
        paths.forEach((path17) => {
          if (!sysPath.isAbsolute(path17) && !this._closers.has(path17)) {
            if (cwd) path17 = sysPath.join(cwd, path17);
            path17 = sysPath.resolve(path17);
          }
          this._closePath(path17);
          this._ignoredPaths.add(path17);
          if (this._watched.has(path17)) {
            this._ignoredPaths.add(path17 + SLASH_GLOBSTAR);
          }
          this._userIgnored = void 0;
        });
        return this;
      }
      /**
       * Close watchers and remove all listeners from watched paths.
       * @returns {Promise<void>}.
      */
      close() {
        if (this.closed) return this._closePromise;
        this.closed = true;
        this.removeAllListeners();
        const closers = [];
        this._closers.forEach((closerList) => closerList.forEach((closer) => {
          const promise = closer();
          if (promise instanceof Promise) closers.push(promise);
        }));
        this._streams.forEach((stream) => stream.destroy());
        this._userIgnored = void 0;
        this._readyCount = 0;
        this._readyEmitted = false;
        this._watched.forEach((dirent) => dirent.dispose());
        ["closers", "watched", "streams", "symlinkPaths", "throttled"].forEach((key) => {
          this[`_${key}`].clear();
        });
        this._closePromise = closers.length ? Promise.all(closers).then(() => void 0) : Promise.resolve();
        return this._closePromise;
      }
      /**
       * Expose list of watched paths
       * @returns {Object} for chaining
      */
      getWatched() {
        const watchList = {};
        this._watched.forEach((entry, dir) => {
          const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
          watchList[key || ONE_DOT] = entry.getChildren().sort();
        });
        return watchList;
      }
      emitWithAll(event, args) {
        this.emit(...args);
        if (event !== EV_ERROR) this.emit(EV_ALL, ...args);
      }
      // Common helpers
      // --------------
      /**
       * Normalize and emit events.
       * Calling _emit DOES NOT MEAN emit() would be called!
       * @param {EventName} event Type of event
       * @param {Path} path File or directory path
       * @param {*=} val1 arguments to be passed with event
       * @param {*=} val2
       * @param {*=} val3
       * @returns the error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      async _emit(event, path17, val1, val2, val3) {
        if (this.closed) return;
        const opts = this.options;
        if (isWindows) path17 = sysPath.normalize(path17);
        if (opts.cwd) path17 = sysPath.relative(opts.cwd, path17);
        const args = [event, path17];
        if (val3 !== void 0) args.push(val1, val2, val3);
        else if (val2 !== void 0) args.push(val1, val2);
        else if (val1 !== void 0) args.push(val1);
        const awf = opts.awaitWriteFinish;
        let pw;
        if (awf && (pw = this._pendingWrites.get(path17))) {
          pw.lastChange = /* @__PURE__ */ new Date();
          return this;
        }
        if (opts.atomic) {
          if (event === EV_UNLINK) {
            this._pendingUnlinks.set(path17, args);
            setTimeout(() => {
              this._pendingUnlinks.forEach((entry, path18) => {
                this.emit(...entry);
                this.emit(EV_ALL, ...entry);
                this._pendingUnlinks.delete(path18);
              });
            }, typeof opts.atomic === "number" ? opts.atomic : 100);
            return this;
          }
          if (event === EV_ADD && this._pendingUnlinks.has(path17)) {
            event = args[0] = EV_CHANGE;
            this._pendingUnlinks.delete(path17);
          }
        }
        if (awf && (event === EV_ADD || event === EV_CHANGE) && this._readyEmitted) {
          const awfEmit = (err2, stats) => {
            if (err2) {
              event = args[0] = EV_ERROR;
              args[1] = err2;
              this.emitWithAll(event, args);
            } else if (stats) {
              if (args.length > 2) {
                args[2] = stats;
              } else {
                args.push(stats);
              }
              this.emitWithAll(event, args);
            }
          };
          this._awaitWriteFinish(path17, awf.stabilityThreshold, event, awfEmit);
          return this;
        }
        if (event === EV_CHANGE) {
          const isThrottled = !this._throttle(EV_CHANGE, path17, 50);
          if (isThrottled) return this;
        }
        if (opts.alwaysStat && val1 === void 0 && (event === EV_ADD || event === EV_ADD_DIR || event === EV_CHANGE)) {
          const fullPath = opts.cwd ? sysPath.join(opts.cwd, path17) : path17;
          let stats;
          try {
            stats = await stat5(fullPath);
          } catch (err2) {
          }
          if (!stats || this.closed) return;
          args.push(stats);
        }
        this.emitWithAll(event, args);
        return this;
      }
      /**
       * Common handler for errors
       * @param {Error} error
       * @returns {Error|Boolean} The error if defined, otherwise the value of the FSWatcher instance's `closed` flag
       */
      _handleError(error) {
        const code = error && error.code;
        if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
          this.emit(EV_ERROR, error);
        }
        return error || this.closed;
      }
      /**
       * Helper utility for throttling
       * @param {ThrottleType} actionType type being throttled
       * @param {Path} path being acted upon
       * @param {Number} timeout duration of time to suppress duplicate actions
       * @returns {Object|false} tracking object or false if action should be suppressed
       */
      _throttle(actionType, path17, timeout) {
        if (!this._throttled.has(actionType)) {
          this._throttled.set(actionType, /* @__PURE__ */ new Map());
        }
        const action = this._throttled.get(actionType);
        const actionPath = action.get(path17);
        if (actionPath) {
          actionPath.count++;
          return false;
        }
        let timeoutObject;
        const clear = () => {
          const item = action.get(path17);
          const count = item ? item.count : 0;
          action.delete(path17);
          clearTimeout(timeoutObject);
          if (item) clearTimeout(item.timeoutObject);
          return count;
        };
        timeoutObject = setTimeout(clear, timeout);
        const thr = { timeoutObject, clear, count: 0 };
        action.set(path17, thr);
        return thr;
      }
      _incrReadyCount() {
        return this._readyCount++;
      }
      /**
       * Awaits write operation to finish.
       * Polls a newly created file for size variations. When files size does not change for 'threshold' milliseconds calls callback.
       * @param {Path} path being acted upon
       * @param {Number} threshold Time in milliseconds a file size must be fixed before acknowledging write OP is finished
       * @param {EventName} event
       * @param {Function} awfEmit Callback to be called when ready for event to be emitted.
       */
      _awaitWriteFinish(path17, threshold, event, awfEmit) {
        let timeoutHandler;
        let fullPath = path17;
        if (this.options.cwd && !sysPath.isAbsolute(path17)) {
          fullPath = sysPath.join(this.options.cwd, path17);
        }
        const now = /* @__PURE__ */ new Date();
        const awaitWriteFinish = (prevStat) => {
          fs10.stat(fullPath, (err2, curStat) => {
            if (err2 || !this._pendingWrites.has(path17)) {
              if (err2 && err2.code !== "ENOENT") awfEmit(err2);
              return;
            }
            const now2 = Number(/* @__PURE__ */ new Date());
            if (prevStat && curStat.size !== prevStat.size) {
              this._pendingWrites.get(path17).lastChange = now2;
            }
            const pw = this._pendingWrites.get(path17);
            const df = now2 - pw.lastChange;
            if (df >= threshold) {
              this._pendingWrites.delete(path17);
              awfEmit(void 0, curStat);
            } else {
              timeoutHandler = setTimeout(
                awaitWriteFinish,
                this.options.awaitWriteFinish.pollInterval,
                curStat
              );
            }
          });
        };
        if (!this._pendingWrites.has(path17)) {
          this._pendingWrites.set(path17, {
            lastChange: now,
            cancelWait: () => {
              this._pendingWrites.delete(path17);
              clearTimeout(timeoutHandler);
              return event;
            }
          });
          timeoutHandler = setTimeout(
            awaitWriteFinish,
            this.options.awaitWriteFinish.pollInterval
          );
        }
      }
      _getGlobIgnored() {
        return [...this._ignoredPaths.values()];
      }
      /**
       * Determines whether user has asked to ignore this path.
       * @param {Path} path filepath or dir
       * @param {fs.Stats=} stats result of fs.stat
       * @returns {Boolean}
       */
      _isIgnored(path17, stats) {
        if (this.options.atomic && DOT_RE.test(path17)) return true;
        if (!this._userIgnored) {
          const { cwd } = this.options;
          const ign = this.options.ignored;
          const ignored = ign && ign.map(normalizeIgnored(cwd));
          const paths = arrify(ignored).filter((path18) => typeof path18 === STRING_TYPE && !isGlob(path18)).map((path18) => path18 + SLASH_GLOBSTAR);
          const list = this._getGlobIgnored().map(normalizeIgnored(cwd)).concat(ignored, paths);
          this._userIgnored = anymatch(list, void 0, ANYMATCH_OPTS);
        }
        return this._userIgnored([path17, stats]);
      }
      _isntIgnored(path17, stat6) {
        return !this._isIgnored(path17, stat6);
      }
      /**
       * Provides a set of common helpers and properties relating to symlink and glob handling.
       * @param {Path} path file, directory, or glob pattern being watched
       * @param {Number=} depth at any depth > 0, this isn't a glob
       * @returns {WatchHelper} object containing helpers for this path
       */
      _getWatchHelpers(path17, depth) {
        const watchPath = depth || this.options.disableGlobbing || !isGlob(path17) ? path17 : globParent(path17);
        const follow = this.options.followSymlinks;
        return new WatchHelper(path17, watchPath, follow, this);
      }
      // Directory helpers
      // -----------------
      /**
       * Provides directory tracking objects
       * @param {String} directory path of the directory
       * @returns {DirEntry} the directory's tracking object
       */
      _getWatchedDir(directory) {
        if (!this._boundRemove) this._boundRemove = this._remove.bind(this);
        const dir = sysPath.resolve(directory);
        if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._boundRemove));
        return this._watched.get(dir);
      }
      // File helpers
      // ------------
      /**
       * Check for read permissions.
       * Based on this answer on SO: https://stackoverflow.com/a/11781404/1358405
       * @param {fs.Stats} stats - object, result of fs_stat
       * @returns {Boolean} indicates whether the file can be read
      */
      _hasReadPermissions(stats) {
        if (this.options.ignorePermissionErrors) return true;
        const md = stats && Number.parseInt(stats.mode, 10);
        const st = md & 511;
        const it = Number.parseInt(st.toString(8)[0], 10);
        return Boolean(4 & it);
      }
      /**
       * Handles emitting unlink events for
       * files and directories, and via recursion, for
       * files and directories within directories that are unlinked
       * @param {String} directory within which the following item is located
       * @param {String} item      base path of item/directory
       * @returns {void}
      */
      _remove(directory, item, isDirectory) {
        const path17 = sysPath.join(directory, item);
        const fullPath = sysPath.resolve(path17);
        isDirectory = isDirectory != null ? isDirectory : this._watched.has(path17) || this._watched.has(fullPath);
        if (!this._throttle("remove", path17, 100)) return;
        if (!isDirectory && !this.options.useFsEvents && this._watched.size === 1) {
          this.add(directory, item, true);
        }
        const wp = this._getWatchedDir(path17);
        const nestedDirectoryChildren = wp.getChildren();
        nestedDirectoryChildren.forEach((nested) => this._remove(path17, nested));
        const parent = this._getWatchedDir(directory);
        const wasTracked = parent.has(item);
        parent.remove(item);
        if (this._symlinkPaths.has(fullPath)) {
          this._symlinkPaths.delete(fullPath);
        }
        let relPath = path17;
        if (this.options.cwd) relPath = sysPath.relative(this.options.cwd, path17);
        if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
          const event = this._pendingWrites.get(relPath).cancelWait();
          if (event === EV_ADD) return;
        }
        this._watched.delete(path17);
        this._watched.delete(fullPath);
        const eventName = isDirectory ? EV_UNLINK_DIR : EV_UNLINK;
        if (wasTracked && !this._isIgnored(path17)) this._emit(eventName, path17);
        if (!this.options.useFsEvents) {
          this._closePath(path17);
        }
      }
      /**
       * Closes all watchers for a path
       * @param {Path} path
       */
      _closePath(path17) {
        this._closeFile(path17);
        const dir = sysPath.dirname(path17);
        this._getWatchedDir(dir).remove(sysPath.basename(path17));
      }
      /**
       * Closes only file-specific watchers
       * @param {Path} path
       */
      _closeFile(path17) {
        const closers = this._closers.get(path17);
        if (!closers) return;
        closers.forEach((closer) => closer());
        this._closers.delete(path17);
      }
      /**
       *
       * @param {Path} path
       * @param {Function} closer
       */
      _addPathCloser(path17, closer) {
        if (!closer) return;
        let list = this._closers.get(path17);
        if (!list) {
          list = [];
          this._closers.set(path17, list);
        }
        list.push(closer);
      }
      _readdirp(root, opts) {
        if (this.closed) return;
        const options = { type: EV_ALL, alwaysStat: true, lstat: true, ...opts };
        let stream = readdirp(root, options);
        this._streams.add(stream);
        stream.once(STR_CLOSE, () => {
          stream = void 0;
        });
        stream.once(STR_END, () => {
          if (stream) {
            this._streams.delete(stream);
            stream = void 0;
          }
        });
        return stream;
      }
    };
    exports2.FSWatcher = FSWatcher;
    var watch2 = (paths, options) => {
      const watcher = new FSWatcher(options);
      watcher.add(paths);
      return watcher;
    };
    exports2.watch = watch2;
  }
});

// node_modules/ws/lib/constants.js
var require_constants4 = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants4();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants4();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && (typeof params.client_max_window_bits === "number" ? opts.clientMaxWindowBits > params.client_max_window_bits : !params.client_max_window_bits)) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err2, result) => {
            done();
            callback(err2, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err2, result) => {
            done();
            callback(err2, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err2 = this._inflate[kError];
          if (err2) {
            this._inflate.close();
            this._inflate = null;
            callback(err2);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err2) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err2[kStatusCode] = 1007;
      this[kCallback](err2);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants4();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants4();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._numFragments = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {
          const error = this.createError(
            RangeError,
            "Too many message fragments",
            false,
            1008,
            "WS_ERR_TOO_MANY_BUFFERED_PARTS"
          );
          cb(error);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err2, buf) => {
          if (err2) return cb(err2);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._numFragments = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err2 = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err2, this.createError);
        err2.code = errorCode;
        err2[kStatusCode] = statusCode;
        return err2;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var {
      types: { isUint8Array }
    } = require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants4();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT2 = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT2;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT2) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT2) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT2) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT2) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT2) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT2) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT2) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress2, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err2 = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err2, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress2) {
            this._state = DEFAULT2;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress2, options, cb);
          }
        }).catch((err2) => {
          process.nextTick(onError, this, err2, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress2, options, cb) {
        if (!compress2) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err2 = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err2, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT2;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT2 && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err2, cb) {
      if (typeof cb === "function") cb(err2);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err2);
      }
    }
    function onError(sender, err2, cb) {
      callCallbacks(sender, err2, cb);
      sender.onerror(err2);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants4();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter11 = require("events");
    var https = require("https");
    var http2 = require("http");
    var net2 = require("net");
    var tls = require("tls");
    var { randomBytes: randomBytes2, createHash: createHash3 } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants4();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter11 {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err2) => {
          if (err2) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 256 * 1024,
        maxFragments: 16 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err2 = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err2;
        } else {
          emitErrorAndClose(websocket, err2);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes2(16).toString("base64");
      const request = isSecure ? https.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err2) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err2);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err2 = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err2);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err2) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err2) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err2) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err2);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net2.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net2.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err2 = new Error(message);
      Error.captureStackTrace(err2, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err2);
      } else {
        stream.destroy(err2);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err2 = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err2);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err2) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err2[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err2);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err2) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err2);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err2) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err2);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err2) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err2);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err2, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err2);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err3) {
          called = true;
          callback(err3);
        });
        ws.once("close", function close() {
          if (!called) callback(err2);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter11 = require("events");
    var http2 = require("http");
    var { Duplex } = require("stream");
    var { createHash: createHash3 } = require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants4();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter11 {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=262144] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=16384] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 256 * 1024,
          maxFragments: 16 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err2) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err2) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash3("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http2.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err2 = new Error(message);
        Error.captureStackTrace(err2, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err2, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// packages/core/src/index.ts
var index_exports = {};
__export(index_exports, {
  BridgeConnector: () => BridgeConnector,
  BridgeError: () => BridgeError,
  BridgeServer: () => BridgeServer,
  CEP_EXTENSION_ID: () => CEP_EXTENSION_ID,
  CSXS_VERSIONS: () => CSXS_VERSIONS,
  CommandBus: () => CommandBus,
  DragSession: () => DragSession,
  Flow: () => Flow,
  FolderWatcher: () => FolderWatcher,
  IPC: () => IPC,
  IPC_EVENTS: () => IPC_EVENTS,
  LEGACY_CEP_BUNDLE_ID: () => LEGACY_CEP_BUNDLE_ID,
  Logger: () => Logger,
  MAX_PRFPSET_BYTES: () => MAX_PRFPSET_BYTES,
  MetadataStore: () => MetadataStore,
  ModuleManager: () => ModuleManager,
  PREMIERE_MIN_VERSION: () => PREMIERE_MIN_VERSION,
  PREMIERE_MODULE_ID: () => PREMIERE_MODULE_ID,
  PREMIERE_PRESETS_FILE: () => PREMIERE_PRESETS_FILE,
  PremierePresetsSource: () => PremierePresetsSource,
  PremiereProcessMonitor: () => PremiereProcessMonitor,
  PresetIndex: () => PresetIndex,
  PresetLibrary: () => PresetLibrary,
  PresetSearch: () => PresetSearch,
  PrfpsetParseError: () => PrfpsetParseError,
  START_KEYFRAME_SENTINEL_TICKS: () => START_KEYFRAME_SENTINEL_TICKS,
  ScopedLogger: () => ScopedLogger,
  SnapAction: () => SnapAction,
  buildPresetPreloadApi: () => buildPresetPreloadApi,
  cepExtensionsDir: () => cepExtensionsDir,
  createPresetsRuntime: () => createPresetsRuntime,
  defaultLogger: () => defaultLogger,
  defaultNameFromPath: () => defaultNameFromPath,
  detectPremiere: () => detectPremiere,
  findFreePort: () => findFreePort,
  folderIdForPath: () => folderIdForPath,
  hostYear: () => hostYear,
  isPrfpsetName: () => isPrfpsetName,
  looksLikePrfpset: () => looksLikePrfpset,
  makeRecord: () => makeRecord,
  newOperationId: () => newOperationId,
  newPairingCode: () => newPairingCode,
  newRequestId: () => newRequestId,
  newToken: () => newToken,
  normalizePath: () => normalizePath,
  parseKeyframeTuple: () => parseKeyframeTuple,
  parsePackedColor: () => parsePackedColor,
  parsePrfpsetAll: () => parsePrfpsetAll,
  parsePrfpsetFile: () => parsePrfpsetFile,
  parsePrfpsetXml: () => parsePrfpsetXml,
  parseTasklistCsv: () => parseTasklistCsv,
  parseValue: () => parseValue2,
  placeAudio: () => placeAudio,
  playerDebugModeEnabled: () => playerDebugModeEnabled,
  premiereInstalledVersion: () => premiereInstalledVersion,
  presetIdForPath: () => presetIdForPath,
  readCepManifestVersion: () => readCepManifestVersion,
  readDiscovery: () => readDiscovery,
  readJsonVersion: () => readJsonVersion,
  registerPremiereModule: () => registerPremiereModule,
  registerPresetIpc: () => registerPresetIpc,
  scanFolder: () => scanFolder,
  setPlayerDebugMode: () => setPlayerDebugMode,
  statRecord: () => statRecord,
  structuredObj: () => structuredObj,
  subsequenceScore: () => subsequenceScore,
  toRel: () => toRel,
  uxpPluginsDir: () => uxpPluginsDir,
  versionFromExePath: () => versionFromExePath
});
module.exports = __toCommonJS(index_exports);

// packages/core/src/presets/prfpset.ts
var fs = __toESM(require("node:fs/promises"));

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches2 = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches2.push(allmatches);
    match = regex.exec(string);
  }
  return matches2;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}
var DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  "hasOwnProperty",
  "toString",
  "valueOf",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
];
var criticalProperties = ["__proto__", "constructor", "prototype"];

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err) return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
function scanAttributeTokens(attrStr) {
  const tokens = [];
  const len = attrStr.length;
  let i = 0;
  while (i < len) {
    const tokenStart = i;
    while (i < len && isWhiteSpace(attrStr[i])) i++;
    if (i >= len) break;
    if (attrStr[i] === "=") {
      i = tokenStart + 1;
      continue;
    }
    const leadingWs = attrStr.slice(tokenStart, i);
    const nameStart = i;
    while (i < len && !isWhiteSpace(attrStr[i]) && attrStr[i] !== "=") i++;
    const name = attrStr.slice(nameStart, i);
    let equalsGroup;
    let j = i;
    while (j < len && isWhiteSpace(attrStr[j])) j++;
    if (j < len && attrStr[j] === "=") {
      equalsGroup = attrStr.slice(i, j + 1);
      i = j + 1;
    }
    let quoteChar;
    let value;
    let k = i;
    while (k < len && isWhiteSpace(attrStr[k])) k++;
    if (k < len && (attrStr[k] === '"' || attrStr[k] === "'")) {
      const valueStart = k + 1;
      const closeIdx = attrStr.indexOf(attrStr[k], valueStart);
      if (closeIdx !== -1) {
        quoteChar = attrStr[k];
        value = attrStr.slice(valueStart, closeIdx);
        i = closeIdx + 1;
      }
    }
    const token = { startIndex: tokenStart };
    token[1] = leadingWs;
    token[2] = name;
    token[3] = equalsGroup;
    token[4] = quoteChar !== void 0 ? true : void 0;
    token[5] = quoteChar;
    token[6] = value;
    tokens.push(token);
  }
  return tokens;
}
function validateAttributeString(attrStr, options) {
  const matches2 = scanAttributeTokens(attrStr);
  const attrNames = {};
  for (let i = 0; i < matches2.length; i++) {
    if (matches2[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches2[i][2] + "' has no space in starting.", getPositionFromMatch(matches2[i]));
    } else if (matches2[i][3] !== void 0 && matches2[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches2[i][2] + "' is without value.", getPositionFromMatch(matches2[i]));
    } else if (matches2[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches2[i][2] + "' is not allowed.", getPositionFromMatch(matches2[i]));
    }
    const attrName = matches2[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches2[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches2[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/@nodable/entities/src/entities.js
var CURRENCY = {
  cent: "\xA2",
  pound: "\xA3",
  curren: "\xA4",
  yen: "\xA5",
  euro: "\u20AC",
  dollar: "$",
  fnof: "\u0192",
  inr: "\u20B9",
  af: "\u060B",
  birr: "\u1265\u122D",
  peso: "\u20B1",
  rub: "\u20BD",
  won: "\u20A9",
  yuan: "\xA5",
  cedil: "\xB8"
};
var XML = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"'
};
var COMMON_HTML = {
  nbsp: "\xA0",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  laquo: "\xAB",
  raquo: "\xBB",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bull: "\u2022",
  para: "\xB6",
  sect: "\xA7",
  deg: "\xB0",
  frac12: "\xBD",
  frac14: "\xBC",
  frac34: "\xBE"
};

// node_modules/@nodable/entities/src/EntityDecoder.js
var ENTITY_ACTION = Object.freeze({
  /** Resolve and expand the entity normally. */
  ALLOW: "allow",
  /** Silently skip this entity — it will not be registered. */
  BLOCK: "block",
  /** Throw an error, aborting entity registration entirely. */
  THROW: "throw"
});
var SPECIAL_CHARS = new Set("!?\\\\/[]$%{}^&*()<>|+");
function validateEntityName(name) {
  if (name[0] === "#") {
    throw new Error(`[EntityReplacer] Invalid character '#' in entity name: "${name}"`);
  }
  for (const ch of name) {
    if (SPECIAL_CHARS.has(ch)) {
      throw new Error(`[EntityReplacer] Invalid character '${ch}' in entity name: "${name}"`);
    }
  }
  return name;
}
function mergeEntityMaps(...maps) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const map of maps) {
    if (!map) continue;
    for (const key of Object.keys(map)) {
      const raw = map[key];
      if (typeof raw === "string") {
        out[key] = raw;
      } else if (raw && typeof raw === "object" && raw.val !== void 0) {
        const val = raw.val;
        if (typeof val === "string") {
          out[key] = val;
        }
      }
    }
  }
  return out;
}
var LIMIT_TIER_EXTERNAL = "external";
var LIMIT_TIER_BASE = "base";
var LIMIT_TIER_ALL = "all";
function parseLimitTiers(raw) {
  if (!raw || raw === LIMIT_TIER_EXTERNAL) return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
  if (raw === LIMIT_TIER_ALL) return /* @__PURE__ */ new Set([LIMIT_TIER_ALL]);
  if (raw === LIMIT_TIER_BASE) return /* @__PURE__ */ new Set([LIMIT_TIER_BASE]);
  if (Array.isArray(raw)) return new Set(raw);
  return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
}
var NCR_LEVEL = Object.freeze({ allow: 0, leave: 1, remove: 2, throw: 3 });
var XML10_ALLOWED_C0 = /* @__PURE__ */ new Set([9, 10, 13]);
function parseNCRConfig(ncr) {
  if (!ncr) {
    return { xmlVersion: 1, onLevel: NCR_LEVEL.allow, nullLevel: NCR_LEVEL.remove };
  }
  const xmlVersion = ncr.xmlVersion === 1.1 ? 1.1 : 1;
  const onLevel = NCR_LEVEL[ncr.onNCR] ?? NCR_LEVEL.allow;
  const nullLevel = NCR_LEVEL[ncr.nullNCR] ?? NCR_LEVEL.remove;
  const clampedNull = Math.max(nullLevel, NCR_LEVEL.remove);
  return { xmlVersion, onLevel, nullLevel: clampedNull };
}
var EntityDecoder = class {
  /**
   * @param {object} [options]
   * @param {object|null}  [options.namedEntities]        — extra named entities merged into base map
   * @param {object}  [options.limit]                 — security limits
   * @param {number}       [options.limit.maxTotalExpansions=0]  — 0 = unlimited
   * @param {number}       [options.limit.maxExpandedLength=0]   — 0 = unlimited
   * @param {'external'|'base'|'all'|string[]} [options.limit.applyLimitsTo='external']
   *   Which entity tiers count against the security limits:
   *   - 'external' (default) — only input/runtime + persistent external entities
   *   - 'base'               — only DEFAULT_XML_ENTITIES + namedEntities
   *   - 'all'                — every entity regardless of tier
   *   - string[]             — explicit combination, e.g. ['external', 'base']
   * @param {((resolved: string, original: string) => string)|null} [options.postCheck=null]
   * @param {string[]} [options.remove=[]] — entity names (e.g. ['nbsp', '#13']) to delete (replace with empty string)
   * @param {string[]} [options.leave=[]]  — entity names to keep as literal (unchanged in output)
   * @param {object}   [options.ncr]       — Numeric Character Reference controls
   * @param {1.0|1.1}  [options.ncr.xmlVersion=1.0]
   *   XML version governing which codepoint ranges are restricted:
   *   - 1.0 — C0 controls U+0001–U+001F (except U+0009/000A/000D) are prohibited
   *   - 1.1 — C0 controls are allowed when written as NCRs; C1 (U+007F–U+009F) decoded as-is
   * @param {'allow'|'leave'|'remove'|'throw'} [options.ncr.onNCR='allow']
   *   Base action for numeric references. Severity order: allow < leave < remove < throw.
   *   For codepoint ranges that carry a minimum level (surrogates → remove, XML 1.0 C0 → remove),
   *   the effective action is max(onNCR, rangeMinimum).
   * @param {'remove'|'throw'} [options.ncr.nullNCR='remove']
   *   Action for U+0000 (null). 'allow' and 'leave' are clamped to 'remove' since null is never safe.
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onExternalEntity=null]
   *   Hook called when an external entity is registered via `setExternalEntities()` or
   *   `addExternalEntity()`. Return `ENTITY_ACTION.ALLOW` to accept the entity,
   *   `ENTITY_ACTION.BLOCK` to silently skip it, or `ENTITY_ACTION.THROW` to abort with an error.
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} [options.onInputEntity=null]
   *   Hook called when an input entity is registered via `addInputEntities()`. Return
   *   `ENTITY_ACTION.ALLOW` to accept, `ENTITY_ACTION.BLOCK` to silently skip, or
   *   `ENTITY_ACTION.THROW` to abort with an error.
   */
  constructor(options = {}) {
    this._limit = options.limit || {};
    this._maxTotalExpansions = this._limit.maxTotalExpansions || 0;
    this._maxExpandedLength = this._limit.maxExpandedLength || 0;
    this._postCheck = typeof options.postCheck === "function" ? options.postCheck : (r) => r;
    this._limitTiers = parseLimitTiers(this._limit.applyLimitsTo ?? LIMIT_TIER_EXTERNAL);
    this._numericAllowed = options.numericAllowed ?? true;
    this._baseMap = mergeEntityMaps(XML, options.namedEntities || null);
    this._externalMap = /* @__PURE__ */ Object.create(null);
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    this._removeSet = new Set(options.remove && Array.isArray(options.remove) ? options.remove : []);
    this._leaveSet = new Set(options.leave && Array.isArray(options.leave) ? options.leave : []);
    const ncrCfg = parseNCRConfig(options.ncr);
    this._ncrXmlVersion = ncrCfg.xmlVersion;
    this._ncrOnLevel = ncrCfg.onLevel;
    this._ncrNullLevel = ncrCfg.nullLevel;
    this._onExternalEntity = typeof options.onExternalEntity === "function" ? options.onExternalEntity : null;
    this._onInputEntity = typeof options.onInputEntity === "function" ? options.onInputEntity : null;
  }
  // -------------------------------------------------------------------------
  // Private: registration hook dispatch
  // -------------------------------------------------------------------------
  /**
   * Invoke a registration hook for a single entity name/value pair.
   * Returns true when the entity should be accepted, false when it should be
   * silently skipped (BLOCK), and throws when the hook returns THROW.
   *
   * @param {((name: string, value: string) => 'allow'|'block'|'throw')|null} hook
   * @param {string} name
   * @param {string} value
   * @param {string} context  — used in error messages ('external' | 'input')
   * @returns {boolean}  true = accept, false = skip
   */
  _applyRegistrationHook(hook, name, value, context) {
    if (!hook) return true;
    const action = hook(name, value);
    if (action === ENTITY_ACTION.BLOCK) return false;
    if (action === ENTITY_ACTION.THROW) {
      throw new Error(
        `[EntityDecoder] Registration of ${context} entity "&${name};" was rejected by hook`
      );
    }
    return true;
  }
  // -------------------------------------------------------------------------
  // Persistent external entity registration
  // -------------------------------------------------------------------------
  /**
   * Replace the full set of persistent external entities.
   * All keys are validated — throws on invalid characters.
   * If `onExternalEntity` is set, it is called once per entry; entries that
   * return `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW`
   * aborts the whole call.
   * @param {Record<string, string | { regex?: RegExp, val: string }>} map
   */
  setExternalEntities(map) {
    if (map) {
      for (const key of Object.keys(map)) {
        validateEntityName(key);
      }
    }
    if (!this._onExternalEntity) {
      this._externalMap = mergeEntityMaps(map);
      return;
    }
    const flat = mergeEntityMaps(map);
    const filtered = /* @__PURE__ */ Object.create(null);
    for (const [name, value] of Object.entries(flat)) {
      if (this._applyRegistrationHook(this._onExternalEntity, name, value, "external")) {
        filtered[name] = value;
      }
    }
    this._externalMap = filtered;
  }
  /**
   * Add a single persistent external entity.
   * If `onExternalEntity` is set it is called before the entity is stored;
   * `ENTITY_ACTION.BLOCK` silently skips storage, `ENTITY_ACTION.THROW` raises.
   * @param {string} key
   * @param {string} value
   */
  addExternalEntity(key, value) {
    validateEntityName(key);
    if (typeof value === "string" && value.indexOf("&") === -1) {
      if (this._applyRegistrationHook(this._onExternalEntity, key, value, "external")) {
        this._externalMap[key] = value;
      }
    }
  }
  // -------------------------------------------------------------------------
  // Input / runtime entity registration (per document)
  // -------------------------------------------------------------------------
  /**
   * Inject DOCTYPE entities for the current document.
   * Also resets per-document expansion counters.
   * If `onInputEntity` is set it is called once per entry; entries returning
   * `ENTITY_ACTION.BLOCK` are silently omitted, `ENTITY_ACTION.THROW` aborts.
   * @param {Record<string, string | { regx?: RegExp, regex?: RegExp, val: string }>} map
   */
  addInputEntities(map) {
    this._totalExpansions = 0;
    this._expandedLength = 0;
    if (!this._onInputEntity) {
      this._inputMap = mergeEntityMaps(map);
      return;
    }
    const flat = mergeEntityMaps(map);
    const filtered = /* @__PURE__ */ Object.create(null);
    for (const [name, value] of Object.entries(flat)) {
      if (this._applyRegistrationHook(this._onInputEntity, name, value, "input")) {
        filtered[name] = value;
      }
    }
    this._inputMap = filtered;
  }
  // -------------------------------------------------------------------------
  // Per-document reset
  // -------------------------------------------------------------------------
  /**
   * Wipe input/runtime entities and reset counters.
   * Call this before processing each new document.
   * @returns {this}
   */
  reset() {
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    return this;
  }
  // -------------------------------------------------------------------------
  // XML version (can be set after construction, e.g. once parser reads <?xml?>)
  // -------------------------------------------------------------------------
  /**
   * Update the XML version used for NCR classification.
   * Call this as soon as the document's `<?xml version="...">` declaration is parsed.
   * @param {1.0|1.1|number} version
   */
  setXmlVersion(version) {
    this._ncrXmlVersion = version === 1.1 ? 1.1 : 1;
  }
  // -------------------------------------------------------------------------
  // Primary API
  // -------------------------------------------------------------------------
  /**
   * Replace all entity references in `str` in a single pass.
   *
   * @param {string} str
   * @returns {string}
   */
  decode(str) {
    if (typeof str !== "string" || str.length === 0) return str;
    if (str.indexOf("&") === -1) return str;
    const original = str;
    const chunks = [];
    const len = str.length;
    let last = 0;
    let i = 0;
    const limitExpansions = this._maxTotalExpansions > 0;
    const limitLength = this._maxExpandedLength > 0;
    const checkLimits = limitExpansions || limitLength;
    while (i < len) {
      if (str.charCodeAt(i) !== 38) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < len && str.charCodeAt(j) !== 59 && j - i <= 32) j++;
      if (j >= len || str.charCodeAt(j) !== 59) {
        i++;
        continue;
      }
      const token = str.slice(i + 1, j);
      if (token.length === 0) {
        i++;
        continue;
      }
      let replacement;
      let tier;
      if (this._removeSet.has(token)) {
        replacement = "";
        if (tier === void 0) {
          tier = LIMIT_TIER_EXTERNAL;
        }
      } else if (this._leaveSet.has(token)) {
        i++;
        continue;
      } else if (token.charCodeAt(0) === 35) {
        const ncrResult = this._resolveNCR(token);
        if (ncrResult === void 0) {
          i++;
          continue;
        }
        replacement = ncrResult;
        tier = LIMIT_TIER_BASE;
      } else {
        const resolved = this._resolveName(token);
        replacement = resolved?.value;
        tier = resolved?.tier;
      }
      if (replacement === void 0) {
        i++;
        continue;
      }
      if (i > last) chunks.push(str.slice(last, i));
      chunks.push(replacement);
      last = j + 1;
      i = last;
      if (checkLimits && this._tierCounts(tier)) {
        if (limitExpansions) {
          this._totalExpansions++;
          if (this._totalExpansions > this._maxTotalExpansions) {
            throw new Error(
              `[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`
            );
          }
        }
        if (limitLength) {
          const delta = replacement.length - (token.length + 2);
          if (delta > 0) {
            this._expandedLength += delta;
            if (this._expandedLength > this._maxExpandedLength) {
              throw new Error(
                `[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`
              );
            }
          }
        }
      }
    }
    if (last < len) chunks.push(str.slice(last));
    const result = chunks.length === 0 ? str : chunks.join("");
    return this._postCheck(result, original);
  }
  // -------------------------------------------------------------------------
  // Private: limit tier check
  // -------------------------------------------------------------------------
  /**
   * Returns true if a resolved entity of the given tier should count
   * against the expansion/length limits.
   * @param {string} tier  — LIMIT_TIER_EXTERNAL | LIMIT_TIER_BASE
   * @returns {boolean}
   */
  _tierCounts(tier) {
    if (this._limitTiers.has(LIMIT_TIER_ALL)) return true;
    return this._limitTiers.has(tier);
  }
  // -------------------------------------------------------------------------
  // Private: entity resolution
  // -------------------------------------------------------------------------
  /**
   * Resolve a named entity token (without & and ;).
   * Priority: inputMap > externalMap > baseMap
   * Returns the resolved value tagged with its limit tier.
   *
   * @param {string} name
   * @returns {{ value: string, tier: string }|undefined}
   */
  _resolveName(name) {
    if (name in this._inputMap) return { value: this._inputMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._externalMap) return { value: this._externalMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._baseMap) return { value: this._baseMap[name], tier: LIMIT_TIER_BASE };
    return void 0;
  }
  /**
   * Classify a codepoint and return the minimum action level that must be applied.
   * Returns -1 when no minimum is imposed (normal allow path).
   *
   * Ranges checked (in priority order):
   *   1. U+0000            — null, governed by nullNCR (always ≥ remove)
   *   2. U+D800–U+DFFF     — surrogates, always prohibited (min: remove)
   *   3. U+0001–U+001F \ {0x09,0x0A,0x0D}  — XML 1.0 restricted C0 (min: remove)
   *      (skipped in XML 1.1 — C0 controls are allowed when written as NCRs)
   *
   * @param {number} cp  — codepoint
   * @returns {number}   — minimum NCR_LEVEL value, or -1 for no restriction
   */
  _classifyNCR(cp) {
    if (cp === 0) return this._ncrNullLevel;
    if (cp >= 55296 && cp <= 57343) return NCR_LEVEL.remove;
    if (this._ncrXmlVersion === 1) {
      if (cp >= 1 && cp <= 31 && !XML10_ALLOWED_C0.has(cp)) return NCR_LEVEL.remove;
    }
    return -1;
  }
  /**
   * Execute a resolved NCR action.
   *
   * @param {number} action   — NCR_LEVEL value
   * @param {string} token    — raw token (e.g. '#38') for error messages
   * @param {number} cp       — codepoint, used only for error messages
   * @returns {string|undefined}
   *   - decoded character string  → 'allow'
   *   - ''                        → 'remove'
   *   - undefined                 → 'leave' (caller must skip past '&' only)
   *   - throws Error              → 'throw'
   */
  _applyNCRAction(action, token, cp) {
    switch (action) {
      case NCR_LEVEL.allow:
        return String.fromCodePoint(cp);
      case NCR_LEVEL.remove:
        return "";
      case NCR_LEVEL.leave:
        return void 0;
      // signal: keep literal
      case NCR_LEVEL.throw:
        throw new Error(
          `[EntityDecoder] Prohibited numeric character reference &${token}; (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`
        );
      default:
        return String.fromCodePoint(cp);
    }
  }
  /**
   * Full NCR resolution pipeline for a numeric token.
   *
   * Steps:
   *   1. Parse the codepoint (decimal or hex).
   *   2. Validate the raw codepoint range (NaN, <0, >0x10FFFF).
   *   3. If numericAllowed is false and no minimum restriction applies → leave as-is.
   *   4. Classify the codepoint to find the minimum required action level.
   *   5. Resolve effective action = max(onNCR, minimum).
   *   6. Apply and return.
   *
   * @param {string} token  — e.g. '#38', '#x26', '#X26'
   * @returns {string|undefined}
   *   - string (incl. '')  — replacement ('' = remove)
   *   - undefined          — leave original &token; as-is
   */
  _resolveNCR(token) {
    const second = token.charCodeAt(1);
    let cp;
    if (second === 120 || second === 88) {
      cp = parseInt(token.slice(2), 16);
    } else {
      cp = parseInt(token.slice(1), 10);
    }
    if (Number.isNaN(cp) || cp < 0 || cp > 1114111) return void 0;
    const minimum = this._classifyNCR(cp);
    if (!this._numericAllowed && minimum < NCR_LEVEL.remove) return void 0;
    const effective = minimum === -1 ? this._ncrOnLevel : Math.max(this._ncrOnLevel, minimum);
    return this._applyNCRAction(effective, token, cp);
  }
};

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true,
    unicode: false
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  entityDecoder: null,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  jPath: true,
  // if true, pass jPath string to callbacks; if false, pass matcher instance
  onDangerousProperty: defaultOnDangerousProperty
};
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== "string") {
    return;
  }
  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
  if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}
function normalizeProcessEntities(value, htmlEntities) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      // true or false
      maxEntitySize: 1e4,
      maxExpansionDepth: 1e4,
      maxTotalExpansions: Infinity,
      maxExpandedLength: 1e5,
      maxEntityCount: 1e3,
      allowedTags: null,
      tagFilter: null,
      appliesTo: "all"
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null,
      appliesTo: value.appliesTo ?? "all"
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions2, options);
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
    { value: built.attributesGroupName, name: "attributesGroupName" },
    { value: built.textNodeName, name: "textNodeName" },
    { value: built.cdataPropName, name: "cdataPropName" },
    { value: built.commentPropName, name: "commentPropName" }
  ];
  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }
  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }
  built.processEntities = normalizeProcessEntities(built.processEntities, built.htmlEntities);
  built.unpairedTagsSet = new Set(built.unpairedTags);
  if (built.stopNodes && Array.isArray(built.stopNodes)) {
    built.stopNodes = built.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  return built;
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = /* @__PURE__ */ Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__") key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__") node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    this.addStartIndex(startIndex);
  }
  addStartIndex(startIndex) {
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  addEndIndex(endIndex) {
    const lastChild = this.child[this.child.length - 1];
    if (lastChild !== void 0 && lastChild[METADATA_SYMBOL] !== void 0 && lastChild[METADATA_SYMBOL].endIndex === void 0) {
      lastChild[METADATA_SYMBOL].endIndex = endIndex;
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/xml-naming/src/index.js
var nameStartChar10 = ":A-Za-z_\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u0486\u0488-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
var nameChar10 = nameStartChar10 + "\\-\\.\\d\xB7\u0300-\u036F\u203F-\u2040";
var nameStartChar11 = ":A-Za-z_\xC0-\u02FF\u0370-\u037D\u037F-\u0486\u0488-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}";
var nameChar11 = nameStartChar11 + "\\-\\.\\d\xB7\u0300-\u036F\u0487\u203F-\u2040";
var buildRegexes = (startChar, char, flags = "") => {
  const ncStart = startChar.replace(":", "");
  const ncChar = char.replace(":", "");
  const ncNamePat = `[${ncStart}][${ncChar}]*`;
  return {
    name: new RegExp(`^[${startChar}][${char}]*$`, flags),
    ncName: new RegExp(`^${ncNamePat}$`, flags),
    qName: new RegExp(`^${ncNamePat}(?::${ncNamePat})?$`, flags),
    nmToken: new RegExp(`^[${char}]+$`, flags),
    nmTokens: new RegExp(`^[${char}]+(?:\\s+[${char}]+)*$`, flags)
  };
};
var regexes10 = buildRegexes(nameStartChar10, nameChar10);
var regexes11 = buildRegexes(nameStartChar11, nameChar11, "u");
var nameStartCharAscii = ":A-Za-z_";
var nameCharAscii = nameStartCharAscii + "\\-\\.\\d";
var regexesAscii = buildRegexes(nameStartCharAscii, nameCharAscii);
var getRegexes = (xmlVersion = "1.0", asciiOnly = false) => {
  if (asciiOnly) return regexesAscii;
  return xmlVersion === "1.1" ? regexes11 : regexes10;
};
var qName = (str, { xmlVersion = "1.0", asciiOnly = false } = {}) => getRegexes(xmlVersion, asciiOnly).qName.test(str);

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(options, xmlVersion) {
    this.suppressValidationErr = !options;
    this.options = options;
    this.xmlVersion = xmlVersion || 1;
  }
  setXmlVersion(xmlVersion = 1) {
    this.xmlVersion = xmlVersion;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let quoteChar = null;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (quoteChar !== null) {
          if (xmlData[i] === quoteChar) quoteChar = null;
          exp += xmlData[i];
          continue;
        }
        if (!hasBody && !comment && (xmlData[i] === '"' || xmlData[i] === "'")) {
          quoteChar = xmlData[i];
          exp += xmlData[i];
          continue;
        }
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                throw new Error(
                  `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                );
              }
              entities[entityName] = val;
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i)) comment = true;
          else throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (quoteChar !== null || angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      i++;
    }
    let entityName = xmlData.substring(startIndex, i);
    validateEntityName2(entityName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
      throw new Error(
        `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
      );
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let notationName = xmlData.substring(startIndex, i);
    !this.suppressValidationErr && validateEntityName2(notationName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    const startIndex = i;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      i++;
    }
    identifierVal = xmlData.substring(startIndex, i);
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    if (!this.suppressValidationErr && !qName(elementName, { xmlVersion: this.xmlVersion })) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
    else if (xmlData[i] === "(") {
      i++;
      const startIndex2 = i;
      while (i < xmlData.length && xmlData[i] !== ")") {
        i++;
      }
      contentModel = xmlData.substring(startIndex2, i);
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    validateEntityName2(elementName, { xmlVersion: this.xmlVersion });
    i = skipWhitespace(xmlData, i);
    startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let attributeName = xmlData.substring(startIndex, i);
    if (!validateEntityName2(attributeName, { xmlVersion: this.xmlVersion })) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        const startIndex2 = i;
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          i++;
        }
        let notation = xmlData.substring(startIndex2, i);
        notation = notation.trim();
        if (!validateEntityName2(notation, { xmlVersion: this.xmlVersion })) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      const startIndex2 = i;
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        i++;
      }
      attributeType += xmlData.substring(startIndex2, i);
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1]) return false;
  }
  return true;
}
function validateEntityName2(name, xmlVersion) {
  if (qName(name, { xmlVersion }))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/anynum/digitTable.js
var SCRIPT_ZEROS = [
  // Basic Latin (ASCII) — included for completeness / pass-through
  48,
  // 0-9
  // Arabic scripts
  1632,
  // Arabic-Indic ٠١٢٣٤٥٦٧٨٩
  1776,
  // Extended Arabic-Indic (Urdu/Persian/Sindhi) ۰۱۲۳
  // Indic scripts
  2406,
  // Devanagari ०१२३४५६७८९
  2534,
  // Bengali ০১২৩৪৫৬৭৮৯
  2662,
  // Gurmukhi ੦੧੨੩੪੫੬੭੮੯
  2790,
  // Gujarati ૦૧૨૩૪૫૬૭૮૯
  2918,
  // Odia ୦୧୨୩୪୫୬୭୮୯
  3046,
  // Tamil ௦௧௨௩௪௫௬௭௮௯
  3174,
  // Telugu ౦౧౨౩౪౫౬౭౮౯
  3302,
  // Kannada ೦೧೨೩೪೫೬೭೮೯
  3430,
  // Malayalam ൦൧൨൩൪൫൬൭൮൯
  3558,
  // Sinhala Archaic ෦෧෨෩෪෫෬෭෮෯
  // Southeast Asian scripts
  3664,
  // Thai ๐๑๒๓๔๕๖๗๘๙
  3792,
  // Lao ໐໑໒໓໔໕໖໗໘໙
  3872,
  // Tibetan ༠༡༢༣༤༥༦༧༨༩
  4160,
  // Myanmar ၀၁၂၃၄၅၆၇၈၉
  4240,
  // Myanmar Shan ႐႑႒႓႔႕႖႗႘႙
  6112,
  // Khmer ០១២៣៤៥៦៧៨៩
  6160,
  // Mongolian ᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙
  6470,
  // Limbu ᥆᥇᥈᥉᥊᥋᥌᥍᥎᥏
  6608,
  // New Tai Lue ᧐᧑᧒᧓᧔᧕᧖᧗᧘᧙
  6784,
  // Tai Tham Hora ᪀᪁᪂᪃᪄᪅᪆᪇᪈᪉
  6800,
  // Tai Tham Tham ᪐᪑᪒᪓᪔᪕᪖᪗᪘᪙
  6992,
  // Balinese ᭐᭑᭒᭓᭔᭕᭖᭗᭘᭙
  7088,
  // Sundanese ᮰᮱᮲᮳᮴᮵᮶᮷᮸᮹
  7232,
  // Lepcha ᱀᱁᱂᱃᱄᱅᱆᱇᱈᱉
  7248,
  // Ol Chiki ᱐᱑᱒᱓᱔᱕᱖᱗᱘᱙
  // Fullwidth (CJK context)
  65296,
  // Fullwidth ０１２３４５６７８９
  // Mathematical digit variants (Unicode math block)
  120782,
  // Mathematical Bold
  120792,
  // Mathematical Double-Struck
  120802,
  // Mathematical Sans-Serif
  120812,
  // Mathematical Sans-Serif Bold
  120822,
  // Mathematical Monospace
  // Other scripts
  66720,
  // Osmanya 𐒠𐒡𐒢𐒣𐒤𐒥𐒦𐒧𐒨𐒩
  68912,
  // Hanifi Rohingya 𐴰𐴱𐴲𐴳𐴴𐴵𐴶𐴷𐴸𐴹
  69734,
  // Brahmi 𑁦𑁧𑁨𑁩𑁪𑁫𑁬𑁭𑁮𑁯
  69872,
  // Sora Sompeng 𑃰𑃱𑃲𑃳𑃴𑃵𑃶𑃷𑃸𑃹
  69942,
  // Chakma 𑄶𑄷𑄸𑄹𑄺𑄻𑄼𑄽𑄾𑄿
  70096,
  // Sharada 𑇐𑇑𑇒𑇓𑇔𑇕𑇖𑇗𑇘𑇙
  70384,
  // Khudawadi 𑋰𑋱𑋲𑋳𑋴𑋵𑋶𑋷𑋸𑋹
  70736,
  // Newa 𑑐𑑑𑑒𑑓𑑔𑑕𑑖𑑗𑑘𑑙
  70864,
  // Tirhuta 𑓐𑓑𑓒𑓓𑓔𑓕𑓖𑓗𑓘𑓙
  71248,
  // Modi 𑙐𑙑𑙒𑙓𑙔𑙕𑙖𑙗𑙘𑙙
  71360,
  // Takri 𑛀𑛁𑛂𑛃𑛄𑛅𑛆𑛇𑛈𑛉
  71472,
  // Ahom 𑜰𑜱𑜲𑜳𑜴𑜵𑜶𑜷𑜸𑜹
  71904,
  // Warang Citi 𑣠𑣡𑣢𑣣𑣤𑣥𑣦𑣧𑣨𑣩
  72016,
  // Dives Akuru 𑥐𑥑𑥒𑥓𑥔𑥕𑥖𑥗𑥘𑥙
  72688,
  // Khitan Small Script 𑯰𑯱𑯲𑯳𑯴𑯵𑯶𑯷𑯸𑯹
  72784,
  // Bhaiksuki 𑱐𑱑𑱒𑱓𑱔𑱕𑱖𑱗𑱘𑱙
  73040,
  // Masaram Gondi 𑵐𑵑𑵒𑵓𑵔𑵕𑵖𑵗𑵘𑵙
  73120,
  // Gunjala Gondi 𑶠𑶡𑶢𑶣𑶤𑶥𑶦𑶧𑶨𑶩
  73552,
  // Kawi 𑽐𑽑𑽒𑽓𑽔𑽕𑽖𑽗𑽘𑽙
  92768,
  // Mro 𖩠𖩡𖩢𖩣𖩤𖩥𖩦𖩧𖩨𖩩
  92864,
  // Tangsa 𖫀𖫁𖫂𖫃𖫄𖫅𖫆𖫇𖫈𖫉
  93008,
  // Pahawh Hmong 𖭐𖭑𖭒𖭓𖭔𖭕𖭖𖭗𖭘𖭙
  123200,
  // Nyiakeng Puachue Hmong 𞅀𞅁𞅂𞅃𞅄𞅅𞅆𞅇𞅈𞅉
  123632,
  // Wancho 𞋰𞋱𞋲𞋳𞋴𞋵𞋶𞋷𞋸𞋹
  124144,
  // Nag Mundari 𞓰𞓱𞓲𞓳𞓴𞓵𞓶𞓷𞓸𞓹
  125264,
  // Adlam 𞥐𞥑𞥒𞥓𞥔𞥕𞥖𞥗𞥘𞥙
  130032
  // Segmented digit symbols 🯰🯱🯲🯳🯴🯵🯶🯷🯸🯹
];
var NOT_DIGIT = 255;
var HIGH_MAP = /* @__PURE__ */ new Map();
var LOW_MAX = 65535;
var LOW_MIN = 1632;
var TABLE_OFFSET = LOW_MIN;
var TABLE_SIZE = LOW_MAX - LOW_MIN + 1;
var TABLE = new Uint8Array(TABLE_SIZE).fill(NOT_DIGIT);
for (const zero of SCRIPT_ZEROS) {
  for (let d = 0; d < 10; d++) {
    const cp = zero + d;
    if (cp <= LOW_MAX) {
      TABLE[cp - TABLE_OFFSET] = d;
    } else {
      HIGH_MAP.set(cp, d);
    }
  }
}

// node_modules/anynum/anynum.js
var CHAR_0 = 48;
var CHAR_9 = 57;
var CHAR_MINUS = 45;
var MINUS_SET = /* @__PURE__ */ new Set([8722, 65293, 65123]);
function anynum(str) {
  if (typeof str !== "string") return str;
  const len = str.length;
  if (len === 0) return str;
  let firstHit = -1;
  for (let i = 0; i < len; i++) {
    const cc = str.charCodeAt(i);
    if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) continue;
    if (cc < TABLE_OFFSET) {
      if (MINUS_SET.has(cc)) {
        firstHit = i;
        break;
      }
      continue;
    }
    if (cc >= 55296 && cc <= 56319) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 56320 && low <= 57343) {
          const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
          if (HIGH_MAP.has(cp)) {
            firstHit = i;
            break;
          }
        }
      }
      continue;
    }
    if (TABLE[cc - TABLE_OFFSET] !== NOT_DIGIT || MINUS_SET.has(cc)) {
      firstHit = i;
      break;
    }
  }
  if (firstHit === -1) return str;
  const chars = [];
  if (firstHit > 0) chars.push(str.slice(0, firstHit));
  for (let i = firstHit; i < len; i++) {
    const cc = str.charCodeAt(i);
    if (cc >= CHAR_0 && cc <= CHAR_9 || cc === CHAR_MINUS) {
      chars.push(str[i]);
      continue;
    }
    if (cc < TABLE_OFFSET) {
      chars.push(MINUS_SET.has(cc) ? "-" : str[i]);
      continue;
    }
    if (cc >= 55296 && cc <= 56319) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 56320 && low <= 57343) {
          const cp = 65536 + (cc - 55296 << 10) + (low - 56320);
          const d2 = HIGH_MAP.get(cp);
          if (d2 !== void 0) {
            chars.push(String.fromCharCode(d2 + 48));
            i++;
            continue;
          }
        }
      }
      chars.push(str[i]);
      continue;
    }
    if (MINUS_SET.has(cc)) {
      chars.push("-");
      continue;
    }
    const d = TABLE[cc - TABLE_OFFSET];
    chars.push(d !== NOT_DIGIT ? String.fromCharCode(d + 48) : str[i]);
  }
  return chars.join("");
}
var anynum_default = anynum;

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var binRegex = /^0b[01]+$/;
var octRegex = /^0o[0-7]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  binary: false,
  octal: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  //skipLike: /regex/,
  infinity: "original",
  // "null", "infinity" (Infinity type), "string" ("Infinity" (the string literal))
  unicode: false
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string") return str;
  let trimmedStr = str.trim();
  if (trimmedStr.length === 0) return str;
  else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
  else if (trimmedStr === "0") return 0;
  if (options.unicode) {
    trimmedStr = anynum_default(trimmedStr);
    if (trimmedStr === "0") return 0;
  }
  if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (options.binary && binRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 2);
  } else if (options.octal && octRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 8);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0) return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation) return num;
          else return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0") return num;
          else if (parsedStr === numTrimmedByZeros) return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
          else return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation) return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (leadingZeros.length > 0) {
      if (options.leadingZeros && !eAdjacentToLeadingZeros) {
        trimmedStr = (notation[1] || "") + notation[3];
        return Number(trimmedStr);
      } else return str;
    } else {
      return Number(trimmedStr);
    }
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    let end = numStr.length;
    while (end > 0 && numStr.charCodeAt(end - 1) === 48) end--;
    numStr = numStr.slice(0, end);
    if (numStr === ".") numStr = "0";
    else if (numStr[0] === ".") numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  const str = numStr.trim();
  if (base === 2 || base === 8) numStr = str.substring(2);
  if (parseInt) return parseInt(numStr, base);
  else if (Number.parseInt) return Number.parseInt(numStr, base);
  else if (window && window.parseInt) return window.parseInt(numStr, base);
  else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    // Return Infinity or -Infinity
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/path-expression-matcher/src/Expression.js
var Expression = class {
  /**
   * Create a new Expression
   * @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
   * @param {Object} options - Configuration options
   * @param {string} options.separator - Path separator (default: '.')
   */
  constructor(pattern, options = {}, data) {
    this.pattern = pattern;
    this.separator = options.separator || ".";
    this.segments = this._parse(pattern);
    this.data = data;
    this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
    this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
    this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
  }
  /**
   * Parse pattern string into segments
   * @private
   * @param {string} pattern - Pattern to parse
   * @returns {Array} Array of segment objects
   */
  _parse(pattern) {
    const segments = [];
    let i = 0;
    let currentPart = "";
    while (i < pattern.length) {
      if (pattern[i] === this.separator) {
        if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
            currentPart = "";
          }
          segments.push({ type: "deep-wildcard" });
          i += 2;
        } else {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
          }
          currentPart = "";
          i++;
        }
      } else {
        currentPart += pattern[i];
        i++;
      }
    }
    if (currentPart.trim()) {
      segments.push(this._parseSegment(currentPart.trim()));
    }
    return segments;
  }
  /**
   * Parse a single segment
   * @private
   * @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
   * @returns {Object} Segment object
   */
  _parseSegment(part) {
    const segment = { type: "tag" };
    let bracketContent = null;
    let withoutBrackets = part;
    const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
    if (bracketMatch) {
      withoutBrackets = bracketMatch[1] + bracketMatch[3];
      if (bracketMatch[2]) {
        const content = bracketMatch[2].slice(1, -1);
        if (content) {
          bracketContent = content;
        }
      }
    }
    let namespace = void 0;
    let tagAndPosition = withoutBrackets;
    if (withoutBrackets.includes("::")) {
      const nsIndex = withoutBrackets.indexOf("::");
      namespace = withoutBrackets.substring(0, nsIndex).trim();
      tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
      if (!namespace) {
        throw new Error(`Invalid namespace in pattern: ${part}`);
      }
    }
    let tag = void 0;
    let positionMatch = null;
    if (tagAndPosition.includes(":")) {
      const colonIndex = tagAndPosition.lastIndexOf(":");
      const tagPart = tagAndPosition.substring(0, colonIndex).trim();
      const posPart = tagAndPosition.substring(colonIndex + 1).trim();
      const isPositionKeyword = ["first", "last", "odd", "even"].includes(posPart) || /^nth\(\d+\)$/.test(posPart);
      if (isPositionKeyword) {
        tag = tagPart;
        positionMatch = posPart;
      } else {
        tag = tagAndPosition;
      }
    } else {
      tag = tagAndPosition;
    }
    if (!tag) {
      throw new Error(`Invalid segment pattern: ${part}`);
    }
    segment.tag = tag;
    if (namespace) {
      segment.namespace = namespace;
    }
    if (bracketContent) {
      if (bracketContent.includes("=")) {
        const eqIndex = bracketContent.indexOf("=");
        segment.attrName = bracketContent.substring(0, eqIndex).trim();
        segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
      } else {
        segment.attrName = bracketContent.trim();
      }
    }
    if (positionMatch) {
      const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
      if (nthMatch) {
        segment.position = "nth";
        segment.positionValue = parseInt(nthMatch[1], 10);
      } else {
        segment.position = positionMatch;
      }
    }
    return segment;
  }
  /**
   * Get the number of segments
   * @returns {number}
   */
  get length() {
    return this.segments.length;
  }
  /**
   * Check if expression contains deep wildcard
   * @returns {boolean}
   */
  hasDeepWildcard() {
    return this._hasDeepWildcard;
  }
  /**
   * Check if expression has attribute conditions
   * @returns {boolean}
   */
  hasAttributeCondition() {
    return this._hasAttributeCondition;
  }
  /**
   * Check if expression has position selectors
   * @returns {boolean}
   */
  hasPositionSelector() {
    return this._hasPositionSelector;
  }
  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.pattern;
  }
};

// node_modules/path-expression-matcher/src/ExpressionSet.js
var ExpressionSet = class {
  constructor() {
    this._byDepthAndTag = /* @__PURE__ */ new Map();
    this._wildcardByDepth = /* @__PURE__ */ new Map();
    this._deepWildcards = [];
    this._deepByTerminalTag = /* @__PURE__ */ new Map();
    this._patterns = /* @__PURE__ */ new Set();
    this._sealed = false;
  }
  /**
   * Add an Expression to the set.
   * Duplicate patterns (same pattern string) are silently ignored.
   *
   * @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
   * @returns {this} for chaining
   * @throws {TypeError} if called after seal()
   *
   * @example
   * set.add(new Expression('root.users.user'));
   * set.add(new Expression('..script'));
   */
  add(expression) {
    if (this._sealed) {
      throw new TypeError(
        "ExpressionSet is sealed. Create a new ExpressionSet to add more expressions."
      );
    }
    if (this._patterns.has(expression.pattern)) return this;
    this._patterns.add(expression.pattern);
    if (expression.hasDeepWildcard()) {
      const lastSeg2 = expression.segments[expression.segments.length - 1];
      if (lastSeg2 && lastSeg2.type !== "deep-wildcard" && lastSeg2.tag !== "*") {
        const tag2 = lastSeg2.tag;
        if (!this._deepByTerminalTag.has(tag2)) this._deepByTerminalTag.set(tag2, []);
        this._deepByTerminalTag.get(tag2).push(expression);
      } else {
        this._deepWildcards.push(expression);
      }
      return this;
    }
    const depth = expression.length;
    const lastSeg = expression.segments[expression.segments.length - 1];
    const tag = lastSeg?.tag;
    if (!tag || tag === "*") {
      if (!this._wildcardByDepth.has(depth)) this._wildcardByDepth.set(depth, []);
      this._wildcardByDepth.get(depth).push(expression);
    } else {
      const key = `${depth}:${tag}`;
      if (!this._byDepthAndTag.has(key)) this._byDepthAndTag.set(key, []);
      this._byDepthAndTag.get(key).push(expression);
    }
    return this;
  }
  /**
   * Add multiple expressions at once.
   *
   * @param {import('./Expression.js').default[]} expressions - Array of Expression instances
   * @returns {this} for chaining
   *
   * @example
   * set.addAll([
   *   new Expression('root.users.user'),
   *   new Expression('root.config.setting'),
   * ]);
   */
  addAll(expressions) {
    for (const expr of expressions) this.add(expr);
    return this;
  }
  /**
   * Check whether a pattern string is already present in the set.
   *
   * @param {import('./Expression.js').default} expression
   * @returns {boolean}
   */
  has(expression) {
    return this._patterns.has(expression.pattern);
  }
  /**
   * Number of expressions in the set.
   * @type {number}
   */
  get size() {
    return this._patterns.size;
  }
  /**
   * Seal the set against further modifications.
   * Useful to prevent accidental mutations after config is built.
   * Calling add() or addAll() on a sealed set throws a TypeError.
   *
   * @returns {this}
   */
  seal() {
    this._sealed = true;
    return this;
  }
  /**
   * Whether the set has been sealed.
   * @type {boolean}
   */
  get isSealed() {
    return this._sealed;
  }
  /**
   * Test whether the matcher's current path matches any expression in the set.
   *
   * Evaluation order (cheapest → most expensive):
   *  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
   *  2. Depth-only wildcard bucket — O(1) lookup, rare
   *  3. Deep-wildcard list         — always checked, but usually small
   *
   * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
   * @returns {boolean} true if any expression matches the current path
   *
   * @example
   * if (stopNodes.matchesAny(matcher)) {
   *   // handle stop node
   * }
   */
  matchesAny(matcher) {
    return this.findMatch(matcher) !== null;
  }
  /**
  * Find and return the first Expression that matches the matcher's current path.
  *
  * Uses the same evaluation order as matchesAny (cheapest → most expensive):
  *  1. Exact depth + tag bucket
  *  2. Depth-only wildcard bucket
  *  3. Deep-wildcard list
  *
  * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
  * @returns {import('./Expression.js').default | null} the first matching Expression, or null
  *
  * @example
  * const expr = stopNodes.findMatch(matcher);
  * if (expr) {
  *   // access expr.config, expr.pattern, etc.
  * }
  */
  findMatch(matcher) {
    const depth = matcher.getDepth();
    const tag = matcher.getCurrentTag();
    const exactKey = `${depth}:${tag}`;
    const exactBucket = this._byDepthAndTag.get(exactKey);
    if (exactBucket) {
      for (let i = 0; i < exactBucket.length; i++) {
        if (matcher.matches(exactBucket[i])) return exactBucket[i];
      }
    }
    const wildcardBucket = this._wildcardByDepth.get(depth);
    if (wildcardBucket) {
      for (let i = 0; i < wildcardBucket.length; i++) {
        if (matcher.matches(wildcardBucket[i])) return wildcardBucket[i];
      }
    }
    const deepBucket = this._deepByTerminalTag.get(tag);
    if (deepBucket) {
      for (let i = 0; i < deepBucket.length; i++) {
        if (matcher.matches(deepBucket[i])) return deepBucket[i];
      }
    }
    for (let i = 0; i < this._deepWildcards.length; i++) {
      if (matcher.matches(this._deepWildcards[i])) return this._deepWildcards[i];
    }
    return null;
  }
};

// node_modules/path-expression-matcher/src/Matcher.js
var MatcherView = class {
  /**
   * @param {Matcher} matcher - The parent Matcher instance to read from.
   */
  constructor(matcher) {
    this._matcher = matcher;
  }
  /**
   * Get the path separator used by the parent matcher.
   * @returns {string}
   */
  get separator() {
    return this._matcher.separator;
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    const path17 = this._matcher.path;
    return path17.length > 0 ? path17[path17.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    const path17 = this._matcher.path;
    return path17.length > 0 ? path17[path17.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    const path17 = this._matcher.path;
    if (path17.length === 0) return void 0;
    return path17[path17.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    const path17 = this._matcher.path;
    if (path17.length === 0) return false;
    const current = path17[path17.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get the value of a "kept" attribute from the nearest ancestor (or
   * current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {*}
   */
  getAnyParentAttr(attrName) {
    return this._matcher.getAnyParentAttr(attrName);
  }
  /**
   * Check whether any ancestor (or the current node) kept the given
   * attribute via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAnyParentAttr(attrName) {
    return this._matcher.hasAnyParentAttr(attrName);
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    const path17 = this._matcher.path;
    if (path17.length === 0) return -1;
    return path17[path17.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    const path17 = this._matcher.path;
    if (path17.length === 0) return -1;
    return path17[path17.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this._matcher.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    return this._matcher.toString(separator, includeNamespace);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this._matcher.path.map((n) => n.tag);
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    return this._matcher.matches(expression);
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this._matcher);
  }
};
var Matcher = class {
  /**
   * Create a new Matcher.
   * @param {Object} [options={}]
   * @param {string} [options.separator='.'] - Default path separator
   */
  constructor(options = {}) {
    this.separator = options.separator || ".";
    this.path = [];
    this.siblingStacks = [];
    this._pathStringCache = null;
    this._view = new MatcherView(this);
    this._keptAttrs = [];
  }
  /**
   * Push a new tag onto the path.
   * @param {string} tagName
   * @param {Object|null} [attrValues=null]
   * @param {string|null} [namespace=null]
   * @param {Object|null} [options=null]
   * @param {string[]} [options.keep] - Names of attributes (from attrValues)
   */
  push(tagName, attrValues = null, namespace = null, options = null) {
    this._pathStringCache = null;
    if (this.path.length > 0) {
      this.path[this.path.length - 1].values = void 0;
    }
    const currentLevel = this.path.length;
    let level = this.siblingStacks[currentLevel];
    if (!level) {
      level = { counts: /* @__PURE__ */ new Map(), total: 0 };
      this.siblingStacks[currentLevel] = level;
    }
    const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
    const counter = level.counts.get(siblingKey) || 0;
    const position = level.total;
    level.counts.set(siblingKey, counter + 1);
    level.total++;
    const node = {
      tag: tagName,
      position,
      counter
    };
    if (namespace !== null && namespace !== void 0) {
      node.namespace = namespace;
    }
    if (attrValues !== null && attrValues !== void 0) {
      node.values = attrValues;
    }
    this.path.push(node);
    const depth = this.path.length;
    const keep = options !== null ? options.keep : null;
    if (keep !== null && keep !== void 0 && keep.length > 0 && attrValues) {
      for (let i = 0; i < keep.length; i++) {
        const name = keep[i];
        if (attrValues[name] !== void 0) {
          this._keptAttrs.push({ depth, name, value: attrValues[name] });
        }
      }
    }
  }
  /**
   * Pop the last tag from the path.
   * @returns {Object|undefined} The popped node
   */
  pop() {
    if (this.path.length === 0) return void 0;
    this._pathStringCache = null;
    const node = this.path.pop();
    if (this.siblingStacks.length > this.path.length + 1) {
      this.siblingStacks.length = this.path.length + 1;
    }
    const poppedDepth = this.path.length + 1;
    while (this._keptAttrs.length > 0 && this._keptAttrs[this._keptAttrs.length - 1].depth >= poppedDepth) {
      this._keptAttrs.pop();
    }
    return node;
  }
  /**
   * Update current node's attribute values.
   * Useful when attributes are parsed after push.
   * @param {Object} attrValues
   */
  updateCurrent(attrValues) {
    if (this.path.length > 0) {
      const current = this.path[this.path.length - 1];
      if (attrValues !== null && attrValues !== void 0) {
        current.values = attrValues;
      }
    }
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    if (this.path.length === 0) return void 0;
    return this.path[this.path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    if (this.path.length === 0) return false;
    const current = this.path[this.path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get the value of a "kept" attribute from the nearest ancestor (or
   * current node) that declared it via `push(tag, attrs, ns, { keep: [...] })`.
   * Unlike getAttrValue(), this works regardless of how deep the path has
   * gone since the attribute was pushed — but only for attribute names that
   * were explicitly marked with `keep` at push time. Cost is proportional to
   * the number of currently-kept attributes (typically 0-3), not path depth.
   * @param {string} attrName
   * @returns {*} the value, or undefined if no ancestor kept this attribute
   */
  getAnyParentAttr(attrName) {
    const kept = this._keptAttrs;
    for (let i = kept.length - 1; i >= 0; i--) {
      if (kept[i].name === attrName) return kept[i].value;
    }
    return void 0;
  }
  /**
   * Check whether any ancestor (or the current node) kept the given
   * attribute via `push(tag, attrs, ns, { keep: [...] })`.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAnyParentAttr(attrName) {
    const kept = this._keptAttrs;
    for (let i = kept.length - 1; i >= 0; i--) {
      if (kept[i].name === attrName) return true;
    }
    return false;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    const sep2 = separator || this.separator;
    const isDefault = sep2 === this.separator && includeNamespace === true;
    if (isDefault) {
      if (this._pathStringCache !== null) {
        return this._pathStringCache;
      }
      const result = this.path.map(
        (n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag
      ).join(sep2);
      this._pathStringCache = result;
      return result;
    }
    return this.path.map(
      (n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag
    ).join(sep2);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this.path.map((n) => n.tag);
  }
  /**
   * Reset the path to empty.
   */
  reset() {
    this._pathStringCache = null;
    this.path = [];
    this.siblingStacks = [];
    this._keptAttrs = [];
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    const segments = expression.segments;
    if (segments.length === 0) {
      return false;
    }
    if (expression.hasDeepWildcard()) {
      return this._matchWithDeepWildcard(segments);
    }
    return this._matchSimple(segments);
  }
  /**
   * @private
   */
  _matchSimple(segments) {
    if (this.path.length !== segments.length) {
      return false;
    }
    for (let i = 0; i < segments.length; i++) {
      if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) {
        return false;
      }
    }
    return true;
  }
  /**
   * @private
   */
  _matchWithDeepWildcard(segments) {
    let pathIdx = this.path.length - 1;
    let segIdx = segments.length - 1;
    while (segIdx >= 0 && pathIdx >= 0) {
      const segment = segments[segIdx];
      if (segment.type === "deep-wildcard") {
        segIdx--;
        if (segIdx < 0) {
          return true;
        }
        const nextSeg = segments[segIdx];
        let found = false;
        for (let i = pathIdx; i >= 0; i--) {
          if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
            pathIdx = i - 1;
            segIdx--;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      } else {
        if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) {
          return false;
        }
        pathIdx--;
        segIdx--;
      }
    }
    return segIdx < 0;
  }
  /**
   * @private
   */
  _matchSegment(segment, node, isCurrentNode) {
    if (segment.tag !== "*" && segment.tag !== node.tag) {
      return false;
    }
    if (segment.namespace !== void 0) {
      if (segment.namespace !== "*" && segment.namespace !== node.namespace) {
        return false;
      }
    }
    if (segment.attrName !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      if (!node.values || !(segment.attrName in node.values)) {
        return false;
      }
      if (segment.attrValue !== void 0) {
        if (String(node.values[segment.attrName]) !== String(segment.attrValue)) {
          return false;
        }
      }
    }
    if (segment.position !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      const counter = node.counter ?? 0;
      if (segment.position === "first" && counter !== 0) {
        return false;
      } else if (segment.position === "odd" && counter % 2 !== 1) {
        return false;
      } else if (segment.position === "even" && counter % 2 !== 0) {
        return false;
      } else if (segment.position === "nth" && counter !== segment.positionValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this);
  }
  /**
   * Create a snapshot of current state.
   * @returns {Object}
   */
  snapshot() {
    return {
      path: this.path.map((node) => ({ ...node })),
      siblingStacks: this.siblingStacks.map((level) => level ? { counts: new Map(level.counts), total: level.total } : level),
      keptAttrs: this._keptAttrs.map((entry) => ({ ...entry }))
    };
  }
  /**
   * Restore state from snapshot.
   * @param {Object} snapshot
   */
  restore(snapshot) {
    this._pathStringCache = null;
    this.path = snapshot.path.map((node) => ({ ...node }));
    this.siblingStacks = snapshot.siblingStacks.map((level) => level ? { counts: new Map(level.counts), total: level.total } : level);
    this._keptAttrs = (snapshot.keptAttrs || []).map((entry) => ({ ...entry }));
  }
  /**
   * Return the read-only {@link MatcherView} for this matcher.
   *
   * The same instance is returned on every call — no allocation occurs.
   * It always reflects the current parser state and is safe to pass to
   * user callbacks without risk of accidental mutation.
   *
   * @returns {MatcherView}
   *
   * @example
   * const view = matcher.readOnly();
   * // pass view to callbacks — it stays in sync automatically
   * view.matches(expr);       // ✓
   * view.getCurrentTag();     // ✓
   * // view.push(...)         // ✗ method does not exist — caught by TypeScript
   */
  readOnly() {
    return this._view;
  }
};

// node_modules/is-unsafe/src/contexts/html.js
var HTML_PATTERNS = [
  {
    id: "html-script-open",
    description: "<script opening tag",
    pattern: /<script[\s>/]/i
  },
  {
    id: "html-script-close",
    description: "</script closing tag",
    pattern: /<\/script[\s>]/i
  },
  {
    id: "html-javascript-protocol",
    description: "javascript: URI scheme (with optional whitespace/encoding)",
    // Handles j&#x61;vascript:, j\u0061vascript:, and whitespace variants
    pattern: /j[\t\n\r ]*a[\t\n\r ]*v[\t\n\r ]*a[\t\n\r ]*s[\t\n\r ]*c[\t\n\r ]*r[\t\n\r ]*i[\t\n\r ]*p[\t\n\r ]*t[\t\n\r ]*:/i
  },
  {
    id: "html-vbscript-protocol",
    description: "vbscript: URI scheme",
    pattern: /vbscript[\t\n\r ]*:/i
  },
  {
    id: "html-data-html",
    description: "data:text/html URI \u2014 can execute scripts in browsers",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*text\/html/i
  },
  {
    id: "html-data-xhtml",
    description: "data:application/xhtml+xml URI",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*application\/xhtml/i
  },
  {
    id: "html-data-svg",
    description: "data:image/svg+xml URI \u2014 can execute scripts",
    pattern: /data[\t\n\r ]*:[\t\n\r ]*image\/svg\+xml/i
  },
  {
    id: "html-inline-event-handler",
    description: "Inline event handler attributes: onclick=, onerror=, onload=, etc.",
    // \bon ensures we match a word boundary so "phonetic=" is not caught
    pattern: /\bon\w{1,30}\s*=/i
  },
  {
    id: "html-entity-obfuscated-script",
    description: "HTML-entity-encoded <script (e.g. &#x3C;script or &lt;script)",
    // Entities include optional trailing semicolon: &#x3C; or &#x3C (both valid in HTML5)
    pattern: /(?:&#x0*3[Cc];?|&#0*60;?|&lt;)\s*script/i
  },
  {
    id: "html-entity-obfuscated-javascript",
    description: 'HTML-entity-encoded javascript: (partial \u2014 catches common &#106; or &#x6a; for "j")',
    pattern: /(?:&#x0*6[Aa];?|&#0*106;?)\s*(?:&#x0*61;?|a)[\s\S]{0,80}script\s*:/i
  },
  {
    id: "html-style-expression",
    description: "CSS expression() \u2014 IE-era code execution in style attributes",
    pattern: /style[\s\S]{0,20}expression\s*\(/i
  },
  {
    id: "html-object-embed",
    description: "<object or <embed tags that can load active content",
    pattern: /<(?:object|embed)[\s>/]/i
  },
  {
    id: "html-base-tag",
    description: "<base href= \u2014 can hijack all relative URLs on a page",
    pattern: /<base[\s>]/i
  },
  {
    id: "html-meta-refresh",
    description: '<meta http-equiv="refresh" \u2014 can redirect users',
    pattern: /<meta[\s\S]{0,40}http-equiv[\s\S]{0,20}refresh/i
  },
  {
    id: "html-srcdoc",
    description: "srcdoc= attribute on iframes \u2014 embeds HTML that can run scripts",
    pattern: /srcdoc\s*=/i
  },
  {
    id: "html-iframe",
    description: "<iframe tag",
    pattern: /<iframe[\s>/]/i
  },
  {
    id: "html-form",
    description: "<form tag \u2014 can be used for phishing / credential harvesting injection",
    pattern: /<form[\s>/]/i
  }
];
var html_default = HTML_PATTERNS;

// node_modules/is-unsafe/src/contexts/xml.js
var XML_PATTERNS = [
  {
    id: "xml-cdata-injection",
    description: "CDATA section injection: <![CDATA[ breaks out of text node context",
    pattern: /<!\[CDATA\[/i
  },
  {
    id: "xml-cdata-close",
    description: "CDATA close sequence: ]]> can terminate an enclosing CDATA section",
    pattern: /\]\]>/
  },
  {
    id: "xml-processing-instruction",
    description: "XML processing instruction: <?xml-stylesheet or <?php etc.",
    pattern: /<\?(?:xml[\- ]|php|asp)/i
  },
  {
    id: "xml-doctype-injection",
    description: "DOCTYPE declaration embedded in content \u2014 can define entities",
    // Match <!DOCTYPE followed by end-of-string, whitespace, or [ (internal subset)
    pattern: /<!DOCTYPE(?:[\s[]|$)/i
  },
  {
    id: "xml-entity-system",
    description: "SYSTEM keyword \u2014 used in external entity declarations (XXE)",
    pattern: /\bSYSTEM\s+["']/i
  },
  {
    id: "xml-entity-public",
    description: "PUBLIC keyword \u2014 used in external entity declarations (XXE)",
    pattern: /\bPUBLIC\s+["']/i
  },
  {
    id: "xml-entity-declaration",
    description: "<!ENTITY declaration \u2014 defines entities, potential XXE or entity expansion",
    pattern: /<!ENTITY[\s%]/i
  },
  {
    id: "xml-billion-laughs",
    description: "Entity reference chaining / billion laughs: repeated &eX; style references",
    // Heuristic: 3+ consecutive entity refs suggests expansion attack
    pattern: /(?:&\w{1,20};){3,}/
  },
  {
    id: "xml-namespace-confusion",
    description: "xmlns: attribute injection \u2014 can redefine namespaces to confuse parsers",
    // pattern: /\bxmlns\s*(?::\w{1,40})?\s*=/i,
    pattern: /\bxmlns(?::\w{1,40})?\s*=/i
  },
  {
    id: "xml-comment-injection",
    description: "<!-- comment injection \u2014 can hide content from some parsers",
    pattern: /<!--/
  },
  {
    id: "xml-comment-close",
    description: "--> closes an enclosing XML comment",
    pattern: /-->/
  },
  {
    id: "xml-pi-close",
    description: "?> closes an enclosing processing instruction",
    pattern: /\?>/
  }
];
var xml_default = XML_PATTERNS;

// node_modules/is-unsafe/src/contexts/svg.js
var SVG_PATTERNS = [
  {
    id: "svg-script-element",
    description: "<script element inside SVG executes JavaScript",
    pattern: /<script[\s>/]/i
  },
  {
    id: "svg-xlink-href-javascript",
    description: "xlink:href with javascript: \u2014 classic SVG XSS via <a> or <use>",
    pattern: /xlink\s*:\s*href\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-href-javascript",
    description: "href= with javascript: in SVG context (<a>, <animate>, etc.)",
    pattern: /href\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-foreignobject",
    description: "<foreignObject embeds HTML inside SVG \u2014 can execute scripts",
    pattern: /<foreignObject[\s>/]/i
  },
  {
    id: "svg-use-external",
    description: "<use xlink:href or href pointing to external resource (non-fragment URL)",
    // Match <use with href= where the value starts with a non-# character (external URL)
    // [\"'][^#] catches quoted values not starting with #; [^\"'#\s>] catches unquoted
    pattern: /<use[\s\S]{0,60}(?:xlink\s*:\s*)?href\s*=\s*(?:["'][^#]|[^"'#\s>])/i
  },
  {
    id: "svg-animate-href",
    description: '<animate attributeName="href" \u2014 can dynamically change href to javascript:',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*href["']/i
  },
  {
    id: "svg-animate-xlinkhref",
    description: '<animate attributeName="xlink:href"',
    pattern: /<animate[\s\S]{0,80}attributeName\s*=\s*["'][\s]*xlink\s*:\s*href["']/i
  },
  {
    id: "svg-set-javascript",
    description: '<set to="javascript:..." \u2014 sets an attribute to a javascript: URI',
    pattern: /<set[\s\S]{0,80}to\s*=\s*["']?\s*javascript\s*:/i
  },
  {
    id: "svg-event-handler",
    description: "SVG-specific event handler attributes: onload=, onerror=, onactivate=, etc.",
    pattern: /\bon(?:load|error|activate|begin|end|repeat|focus|blur|click|mouse\w{1,20}|key\w{1,20})\s*=/i
  },
  {
    id: "svg-handler-generic",
    description: "Generic on* handler catch-all for SVG attributes",
    pattern: /\bon\w{1,30}\s*=/i
  },
  {
    id: "svg-filter-feimage",
    description: "<feImage href= \u2014 filter primitive that can load external resources",
    pattern: /<feImage[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=/i
  },
  {
    id: "svg-image-external",
    description: "<image xlink:href with http/https or javascript protocol",
    pattern: /<image[\s\S]{0,80}(?:xlink\s*:\s*)?href\s*=\s*["']?\s*(?:https?|javascript)\s*:/i
  },
  {
    id: "svg-style-javascript",
    description: "style= attribute containing javascript: (e.g. background:url(javascript:...))",
    pattern: /style\s*=[\s\S]{0,60}javascript\s*:/i
  }
];
var svg_default = SVG_PATTERNS;

// node_modules/is-unsafe/src/contexts/sql.js
var SQL_PATTERNS = [
  {
    id: "sql-block-comment-open",
    description: "SQL block comment open: /* ... */ \u2014 unusual in legitimate user text",
    pattern: /\/\*/
  },
  {
    id: "sql-union-select",
    description: "UNION SELECT \u2014 most common SQL injection aggregation attack",
    pattern: /\bUNION\s{1,20}(?:ALL\s{1,20})?SELECT\b/i
  },
  {
    id: "sql-drop-table",
    description: "DROP TABLE \u2014 destructive DDL injection",
    pattern: /\bDROP\s{1,20}TABLE\b/i
  },
  {
    id: "sql-drop-database",
    description: "DROP DATABASE \u2014 destructive DDL injection",
    pattern: /\bDROP\s{1,20}DATABASE\b/i
  },
  {
    id: "sql-insert-into",
    description: "INSERT INTO \u2014 data injection",
    pattern: /\bINSERT\s{1,20}INTO\b/i
  },
  {
    id: "sql-delete-from",
    description: "DELETE FROM \u2014 data deletion injection",
    pattern: /\bDELETE\s{1,20}FROM\b/i
  },
  {
    id: "sql-update-set",
    description: "UPDATE ... SET \u2014 data modification injection",
    // Allows arbitrary content between UPDATE and SET (table name, alias, etc.)
    pattern: /\bUPDATE\b[\s\S]{1,60}\bSET\b/i
  },
  {
    id: "sql-exec-xp",
    description: "EXEC xp_ \u2014 MSSQL extended stored procedure execution",
    pattern: /\bEXEC(?:UTE)?\s{1,20}xp_/i
  },
  {
    id: "sql-tautology-string",
    description: `Classic string tautology: ' OR '1'='1 or " OR "1"="1"`,
    // Last quote is optional — injection may truncate it: ' OR '1'='1--
    pattern: /'\s{0,10}OR\s{0,10}'[^']{0,20}'\s*=\s*'[^']{0,20}/i
  },
  {
    id: "sql-tautology-numeric",
    description: "Numeric tautology: OR 1=1",
    pattern: /\bOR\s{1,10}1\s*=\s*1\b/i
  },
  {
    id: "sql-always-true-zero",
    description: "Numeric tautology: OR 0=0",
    pattern: /\bOR\s{1,10}0\s*=\s*0\b/i
  },
  {
    id: "sql-sleep-benchmark",
    description: "Time-based blind injection: SLEEP() or BENCHMARK()",
    pattern: /\b(?:SLEEP|BENCHMARK)\s*\(/i
  },
  {
    id: "sql-waitfor-delay",
    description: "MSSQL time-based blind injection: WAITFOR DELAY",
    pattern: /\bWAITFOR\s{1,20}DELAY\b/i
  },
  {
    id: "sql-char-function",
    description: "CHAR() function \u2014 used to obfuscate injected strings",
    pattern: /\bCHAR\s*\(\s*\d{1,3}/i
  },
  {
    id: "sql-information-schema",
    description: "INFORMATION_SCHEMA \u2014 reconnaissance query for table/column enumeration",
    pattern: /\bINFORMATION_SCHEMA\b/i
  }
];
var sql_default = SQL_PATTERNS;

// node_modules/is-unsafe/src/contexts/shell.js
var SHELL_PATTERNS = [
  {
    id: "shell-path-traversal-unix",
    description: "Unix path traversal: ../  \u2014 climbing the directory tree",
    pattern: /\.\.\//
  },
  {
    id: "shell-path-traversal-windows",
    description: "Windows path traversal: ..\\ \u2014 climbing the directory tree",
    pattern: /\.\.\\/
  },
  {
    id: "shell-path-traversal-encoded",
    description: "URL-encoded path traversal: %2e%2e or %2f variants",
    pattern: /%2e%2e|%2f\.\.|\.\.%2f/i
  },
  {
    id: "shell-null-byte",
    description: "Null byte injection: \\x00 or %00 \u2014 truncates strings in C-backed functions",
    pattern: /\x00|%00/
  },
  {
    id: "shell-semicolon",
    description: "Semicolon command separator: cmd1; cmd2",
    pattern: /;/
  },
  {
    id: "shell-pipe",
    description: "Pipe operator: cmd1 | cmd2",
    pattern: /\|/
  },
  {
    id: "shell-and-operator",
    description: "AND operator: cmd1 && cmd2",
    pattern: /&&/
  },
  {
    id: "shell-or-operator",
    description: "OR operator: cmd1 || cmd2",
    pattern: /\|\|/
  },
  {
    id: "shell-backtick",
    description: "Backtick command substitution: `cmd`",
    pattern: /`/
  },
  {
    id: "shell-dollar-paren",
    description: "Dollar-paren command substitution: $(cmd)",
    pattern: /\$\(/
  },
  {
    id: "shell-dollar-brace",
    description: "Dollar-brace variable expansion: ${var} \u2014 can be abused for injection",
    pattern: /\$\{/
  },
  {
    id: "shell-redirect-out",
    description: "Output redirection: cmd > file or cmd >> file",
    pattern: />{1,2}/
  },
  {
    id: "shell-redirect-in",
    description: "Input redirection: cmd < file",
    pattern: /</
  },
  {
    id: "shell-newline-injection",
    description: "Newline injection: \\n or \\r \u2014 can inject new shell commands",
    pattern: /[\n\r]/
  },
  {
    id: "shell-glob-star",
    description: "Glob expansion: * or ? \u2014 can expand to unintended files",
    // Only flag when combined with path separators to reduce false positives
    pattern: /[/\\][*?]/
  },
  {
    id: "shell-absolute-root",
    description: "Absolute root path injection: string starting with / or \\ (Windows UNC)",
    pattern: /^(?:\/|\\\\)/
  },
  {
    id: "shell-windows-drive",
    description: "Windows drive letter path injection: C:\\ or D:/",
    pattern: /^[a-zA-Z]:[/\\]/
  },
  {
    id: "shell-curl-wget",
    description: "curl/wget with URL or flags \u2014 can exfiltrate data or download payloads",
    // Require a URL scheme (http/https/ftp) or a flag (-) to reduce false positives
    // "curl is a tool" won't match; "curl http://..." or "curl -s ..." will
    pattern: /\b(?:curl|wget)\s+(?:https?:\/\/|ftp:\/\/|-)/i
  }
];
var shell_default = SHELL_PATTERNS;

// node_modules/is-unsafe/src/contexts/redos.js
var REDOS_PATTERNS = [
  {
    id: "redos-nested-quantifier-plus",
    description: "Nested + quantifier inside a group with outer quantifier: (a+)+, (.+b)*, etc.",
    // Matches any group containing a + quantifier, with an outer * or + — catches (a+)+, (.+b)*, etc.
    pattern: /\([^)]*\+[^)]*\)[+*]/
  },
  {
    id: "redos-nested-quantifier-star",
    description: "Nested * quantifier: (a*)* or (a*)+ \u2014 catastrophic backtracking",
    pattern: /\([^)]*\*[^)]*\)[*+]/
  },
  {
    id: "redos-nested-groups",
    description: "Doubly nested quantified groups: ((a+)+) \u2014 guaranteed catastrophic",
    pattern: /\(\([^)]{0,40}\)[+*]\)[+*]/
  },
  {
    id: "redos-alternation-overlap",
    description: "Overlapping alternation under quantifier: (a|a)+ \u2014 ambiguous NFA paths",
    // Detect repeated identical alternatives under a quantifier
    pattern: /\(([^|()]{1,20})\|(?:\1)(?:\|[^|()]{1,20}){0,5}\)[+*?]{1,2}/
  },
  {
    id: "redos-star-plus-concat",
    description: "(x*x)+ pattern \u2014 triggers super-linear backtracking",
    pattern: /\([^)]{0,10}\*[^)]{0,10}\)[+*]/
  },
  {
    id: "redos-dot-star-greedy",
    description: "(.*){n,} or (.+){n,} \u2014 repeated greedy dot quantifiers",
    pattern: /\(\.[*+]\)\{?\d/
  },
  {
    id: "redos-large-repetition",
    description: "Very large fixed or range repetition count {1000,} or {1000,n} \u2014 denial of service via backtracking",
    // Matches { followed by 4+ digits (≥1000), then optional ,digits }
    pattern: /\{\d{4,}(?:,\d*)?\}/
  },
  {
    id: "redos-catastrophic-alternation",
    description: "Long alternation with many similar branches \u2014 polynomial backtracking risk",
    // Heuristic: 10+ pipe-separated alternatives in a single group
    pattern: /\([^)]{0,200}(?:\|[^|)]{0,50}){9,}\)/
  }
];
var redos_default = REDOS_PATTERNS;

// node_modules/is-unsafe/src/contexts/nosql.js
var sep = `["'\\s]*:`;
var NOSQL_PATTERNS = [
  // ─── MongoDB $ operator injection ────────────────────────────────────────
  {
    id: "nosql-where-operator",
    description: "$where \u2014 executes arbitrary JavaScript server-side in MongoDB",
    pattern: new RegExp(`\\$where${sep}`, "i")
  },
  {
    id: "nosql-ne-operator",
    description: '$ne \u2014 "not equal" operator used to bypass equality checks',
    pattern: new RegExp(`\\$ne${sep}`, "i")
  },
  {
    id: "nosql-gt-operator",
    description: '$gt \u2014 "greater than" used to bypass password/value checks',
    pattern: new RegExp(`\\$gte?${sep}`, "i")
  },
  {
    id: "nosql-lt-operator",
    description: '$lt / $lte \u2014 "less than" bypass variants',
    pattern: new RegExp(`\\$lte?${sep}`, "i")
  },
  {
    id: "nosql-regex-operator",
    description: "$regex \u2014 can be used to extract data character by character (blind injection)",
    pattern: new RegExp(`\\$regex${sep}`, "i")
  },
  {
    id: "nosql-or-operator",
    description: "$or \u2014 logical OR; used to create always-true conditions",
    pattern: new RegExp(`\\$or${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-and-operator",
    description: "$and \u2014 logical AND operator injection",
    pattern: new RegExp(`\\$and${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-nor-operator",
    description: "$nor \u2014 logical NOR operator injection",
    pattern: new RegExp(`\\$nor${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-exists-operator",
    description: "$exists \u2014 can enumerate fields to determine schema",
    pattern: new RegExp(`\\$exists${sep}`, "i")
  },
  {
    id: "nosql-in-operator",
    description: "$in \u2014 matches any value in a list; can enumerate values",
    pattern: new RegExp(`\\$in${sep}\\s*\\[`, "i")
  },
  {
    id: "nosql-expr-operator",
    description: "$expr \u2014 allows aggregation expressions in queries (MongoDB 3.6+)",
    pattern: new RegExp(`\\$expr${sep}`, "i")
  },
  {
    id: "nosql-function-operator",
    description: "$function \u2014 executes arbitrary JavaScript in MongoDB 4.4+",
    pattern: new RegExp(`\\$function${sep}`, "i")
  },
  {
    id: "nosql-accumulator-operator",
    description: "$accumulator \u2014 custom aggregation with arbitrary JS execution",
    pattern: new RegExp(`\\$accumulator${sep}`, "i")
  },
  // ─── Prototype pollution ─────────────────────────────────────────────────
  {
    id: "nosql-proto-pollution",
    description: "__proto__ \u2014 prototype pollution via object key injection",
    pattern: /__proto__/
  },
  {
    id: "nosql-constructor-prototype",
    description: "constructor.prototype \u2014 alternative prototype pollution vector (dot notation or JSON key)",
    // Matches dot-notation (obj.constructor.prototype) and JSON key adjacency
    // ("constructor": {"prototype": ...})
    pattern: /constructor[\s"':.,{\[]*prototype/i
  },
  {
    id: "nosql-proto-bracket",
    description: '["__proto__"] \u2014 bracket-notation prototype pollution',
    pattern: /\[["']__proto__["']\]/
  }
];
var nosql_default = NOSQL_PATTERNS;

// node_modules/is-unsafe/src/contexts/log.js
var LOG_PATTERNS = [
  // ─── CRLF / newline injection ─────────────────────────────────────────────
  {
    id: "log-crlf-injection",
    description: "CRLF injection: literal \\r or \\n embeds fake log lines",
    pattern: /[\r\n]/
  },
  {
    id: "log-url-encoded-crlf",
    description: "URL-encoded CRLF: %0d, %0a, %0D, %0A \u2014 decoded by some log parsers",
    pattern: /%0[dDaA]/
  },
  {
    id: "log-unicode-newline",
    description: "Unicode newline variants: U+2028 (line separator), U+2029 (paragraph separator)",
    pattern: /[\u2028\u2029]/
  },
  // ─── Log4Shell / JNDI injection (CVE-2021-44228) ─────────────────────────
  {
    id: "log-log4shell-jndi",
    description: "Log4Shell: ${jndi:...} triggers remote code execution in Apache Log4j",
    pattern: /\$\{jndi\s*:/i
  },
  {
    id: "log-log4shell-obfuscated",
    description: "Obfuscated Log4Shell: ${::-j}... lookup-bypass prefix used to evade WAF detection",
    // ${::- is the Log4j lookup-bypass escape sequence; presence alone is suspicious
    pattern: /\$\{::-/
  },
  {
    id: "log-log4j-lookup",
    description: "Log4j lookup syntax: ${env:...}, ${sys:...}, ${ctx:...} \u2014 data exfiltration",
    pattern: /\$\{(?:env|sys|ctx|main|map|sd|web|docker|k8s|spring)\s*:/i
  },
  // ─── Server-Side Template Injection (SSTI) in log messages ───────────────
  {
    id: "log-ssti-double-brace",
    description: "SSTI double-brace: {{expression}} \u2014 Jinja2, Twig, Handlebars, etc.",
    pattern: /\{\{[\s\S]{0,80}\}\}/
  },
  {
    id: "log-ssti-hash-brace",
    description: "SSTI hash-brace: #{expression} \u2014 Thymeleaf, Velocity, Ruby ERB",
    pattern: /#\{[\s\S]{0,80}\}/
  },
  {
    id: "log-ssti-dollar-brace",
    description: "SSTI/EL injection: ${expression with operators or method calls} \u2014 JSP EL, Freemarker, SpEL",
    // Require that the ${...} content looks like an expression, not a plain variable name.
    // Flags if the content contains: . ( * + operators, or known SSTI keywords.
    // This avoids flagging ${PATH}, ${HOME} etc. (plain shell variables).
    pattern: /\$\{[^}]*(?:\.|\(|\*|\+|\bclass\b|\bruntime\b|\bprocess\b|\bexec\b)[^}]{0,80}\}/i
  },
  {
    id: "log-ssti-percent-tag",
    description: "SSTI ERB/ASP tag: <%= expression %> \u2014 Ruby ERB, ASP",
    pattern: /<%=[\s\S]{0,80}%>/
  },
  // ─── Null byte ────────────────────────────────────────────────────────────
  {
    id: "log-null-byte",
    description: "Null byte: \\x00 or %00 \u2014 can truncate log entries in C-backed loggers",
    pattern: /\x00|%00/
  },
  // ─── ANSI escape injection ────────────────────────────────────────────────
  {
    id: "log-ansi-escape",
    description: "ANSI escape sequence: ESC[ \u2014 can manipulate terminal output when logs are tailed",
    pattern: /\x1b\[/
  }
];
var log_default = LOG_PATTERNS;

// node_modules/is-unsafe/src/contexts/sql-strict.js
var SQL_STRICT_EXTRA = [
  {
    id: "sql-line-comment",
    description: "SQL line comment: -- followed by whitespace or end of string",
    pattern: /--(?:\s|$)/
  },
  {
    id: "sql-stacked-query",
    description: "Stacked queries: semicolon immediately followed by a SQL keyword",
    pattern: /;\s{0,10}(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b/i
  },
  {
    id: "sql-hex-encoding",
    description: "Hex-encoded string injection: 0x41414141 style (MySQL)",
    pattern: /\b0x[0-9a-f]{4,}/i
  }
];
var SQL_STRICT_PATTERNS = [...sql_default, ...SQL_STRICT_EXTRA];
var sql_strict_default = SQL_STRICT_PATTERNS;

// node_modules/is-unsafe/src/index.js
html_default.label = "HTML";
xml_default.label = "XML";
svg_default.label = "SVG";
sql_default.label = "SQL";
sql_strict_default.label = "SQL-STRICT";
shell_default.label = "SHELL";
redos_default.label = "REDOS";
nosql_default.label = "NOSQL";
log_default.label = "LOG";
var VALID_CONTEXTS = Object.freeze({
  HTML: html_default,
  XML: xml_default,
  SVG: svg_default,
  SQL: sql_default,
  "SQL-STRICT": sql_strict_default,
  SHELL: shell_default,
  REDOS: redos_default,
  NOSQL: nosql_default,
  LOG: log_default
});
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(
      `is-unsafe: first argument must be a string, got ${typeof value}`
    );
  }
}
function assertContext(context) {
  if (context instanceof RegExp) return;
  if (Array.isArray(context)) {
    if (context.length === 0) {
      throw new TypeError("is-unsafe: context must not be an empty array");
    }
    if (Array.isArray(context[0])) {
      for (const list of context) {
        if (!Array.isArray(list) || list.length === 0) {
          throw new TypeError(
            "is-unsafe: each context in the array must be a non-empty pattern array (PatternList)"
          );
        }
      }
    }
    return;
  }
  throw new TypeError(
    `is-unsafe: second argument must be a PatternList (e.g. HTML), an array of PatternLists (e.g. [HTML, XML]), or a RegExp. Got: ${typeof context}`
  );
}
function normalise(context) {
  if (context instanceof RegExp) return { lists: null, regex: context };
  if (Array.isArray(context[0])) return { lists: context, regex: null };
  return { lists: [context], regex: null };
}
function matchList(value, list) {
  const label = list.label ?? "CUSTOM";
  for (const rule of list) {
    if (rule.pattern.test(value)) {
      return { context: label, id: rule.id, description: rule.description, pattern: rule.pattern };
    }
  }
  return null;
}
function isUnsafe(value, context) {
  assertString(value);
  assertContext(context);
  const { lists, regex } = normalise(context);
  if (regex) return regex.test(value);
  for (const list of lists) {
    if (matchList(value, list) !== null) return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function extractRawAttributes(prefixedAttrs, options) {
  if (!prefixedAttrs) return {};
  const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
  if (!attrs) return {};
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(options.attributeNamePrefix)) {
      const rawName = key.substring(options.attributeNamePrefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function extractNamespace(rawTagName) {
  if (!rawTagName || typeof rawTagName !== "string") return void 0;
  const colonIndex = rawTagName.indexOf(":");
  if (colonIndex !== -1 && colonIndex > 0) {
    const ns = rawTagName.substring(0, colonIndex);
    if (ns !== "xmlns") {
      return ns;
    }
  }
  return void 0;
}
var OrderedObjParser = class {
  constructor(options, externalEntities) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    this.doctypefound = false;
    let namedEntities = { ...XML };
    if (this.options.entityDecoder) {
      this.entityDecoder = this.options.entityDecoder;
    } else {
      if (typeof this.options.htmlEntities === "object") namedEntities = this.options.htmlEntities;
      else if (this.options.htmlEntities === true) namedEntities = { ...COMMON_HTML, ...CURRENCY };
      this.entityDecoder = new EntityDecoder({
        namedEntities: { ...namedEntities, ...externalEntities },
        numericAllowed: this.options.htmlEntities,
        limit: {
          maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
          maxExpandedLength: this.options.processEntities.maxExpandedLength,
          applyLimitsTo: this.options.processEntities.appliesTo
        },
        // onExternalEntity: (name, value) => isUnsafe(value) ? 'block' : 'allow',
        onInputEntity: (name, value) => (
          //TODO: VALID_CONTEXTS.HTML should be set only if this.options.htmlEntities
          isUnsafe(value, [html_default, xml_default]) ? ENTITY_ACTION.BLOCK : ENTITY_ACTION.ALLOW
        )
        //postCheck: resolved => resolved
      });
    }
    this.matcher = new Matcher();
    this.readonlyMatcher = this.matcher.readOnly();
    this.isCurrentNodeStopNode = false;
    this.stopNodeExpressionsSet = new ExpressionSet();
    const stopNodesOpts = this.options.stopNodes;
    if (stopNodesOpts && stopNodesOpts.length > 0) {
      for (let i = 0; i < stopNodesOpts.length; i++) {
        const stopNodeExp = stopNodesOpts[i];
        if (typeof stopNodeExp === "string") {
          this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
        } else if (stopNodeExp instanceof Expression) {
          this.stopNodeExpressionsSet.add(stopNodeExp);
        }
      }
      this.stopNodeExpressionsSet.seal();
    }
  }
};
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  const options = this.options;
  if (val !== void 0) {
    if (options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
      const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
      const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (options.trimValues) {
        return parseValue(val, options.parseTagValue, options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, options.parseTagValue, options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName, force = false) {
  const options = this.options;
  if (force === true || options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches2 = getAllMatches(attrStr, attrsRegx);
    const len = matches2.length;
    const attrs = {};
    const processedVals = new Array(len);
    let hasRawAttrs = false;
    const rawAttrsForMatcher = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches2[i][1]);
      const oldVal = matches2[i][4];
      if (attrName.length && oldVal !== void 0) {
        let val = oldVal;
        if (options.trimValues) val = val.trim();
        val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
        processedVals[i] = val;
        rawAttrsForMatcher[attrName] = val;
        hasRawAttrs = true;
      }
    }
    if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) {
      jPath.updateCurrent(rawAttrsForMatcher);
    }
    const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
    let hasAttrs = false;
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches2[i][1]);
      if (this.ignoreAttributesFn(attrName, jPathStr)) continue;
      let aName = options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (options.transformAttributeName) {
          aName = options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, options);
        if (matches2[i][4] !== void 0) {
          const oldVal = processedVals[i];
          const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(oldVal, options.parseAttributeValue, options.numberParseOptions);
          }
          hasAttrs = true;
        } else if (options.allowBooleanAttributes) {
          attrs[aName] = true;
          hasAttrs = true;
        }
      }
    }
    if (!hasAttrs) return;
    if (options.attributesGroupName && !options.preserveOrder) {
      const attrCollection = {};
      attrCollection[options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  this.matcher.reset();
  this.entityDecoder.reset();
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  this.doctypefound = false;
  const options = this.options;
  const docTypeReader = new DocTypeReader(options.processEntities);
  const xmlLen = xmlData.length;
  for (let i = 0; i < xmlLen; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        }
        const lastTagName = this.matcher.getCurrentTag();
        if (tagName && options.unpairedTagsSet.has(tagName)) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
          this.matcher.pop();
          this.tagsNodeStack.pop();
        }
        this.matcher.pop();
        this.isCurrentNodeStopNode = false;
        currentNode = this.tagsNodeStack.pop() || xmlObj;
        if (options.captureMetaData && currentNode) {
          currentNode.addEndIndex(closeIndex + 1);
        }
        textData = "";
        i = closeIndex;
      } else if (c1 === 63) {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        const attsMap = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName, true);
        if (attsMap) {
          const ver = attsMap[this.options.attributeNamePrefix + "version"];
          this.entityDecoder.setXmlVersion(Number(ver) || 1);
          docTypeReader.setXmlVersion(Number(ver) || 1);
        }
        if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent && options.ignoreAttributes !== true) {
            childNode[":@"] = attsMap;
          }
          this.addChild(currentNode, childNode, this.readonlyMatcher, i);
          if (options.captureMetaData) {
            currentNode.addEndIndex(tagData.closeIndex + 2);
          }
        }
        i = tagData.closeIndex + 1;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
          currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
        if (this.doctypefound) throw new Error("Multiple DOCTYPE declarations found.");
        this.doctypefound = true;
        const result = docTypeReader.readDocType(xmlData, i);
        this.entityDecoder.addInputEntities(result.entities);
        i = result.i;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
        if (val == void 0) val = "";
        if (options.cdataPropName) {
          currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, options.removeNSPrefix);
        if (!result) {
          const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
          throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
        }
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
        if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
          currentNode = this.tagsNodeStack.pop();
          this.matcher.pop();
        }
        let isSelfClosing = false;
        if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
          isSelfClosing = true;
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          } else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }
          attrExpPresent = tagName !== tagExp;
        }
        let prefixedAttrs = null;
        let rawAttrs = {};
        let namespace = void 0;
        namespace = extractNamespace(rawTagName);
        if (tagName !== xmlObj.tagname) {
          this.matcher.push(tagName, {}, namespace);
        }
        if (tagName !== tagExp && attrExpPresent) {
          prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
          if (prefixedAttrs) {
            rawAttrs = extractRawAttributes(prefixedAttrs, options);
          }
        }
        if (tagName !== xmlObj.tagname) {
          this.isCurrentNodeStopNode = this.isItStopNode();
        }
        const startIndex = i;
        if (this.isCurrentNodeStopNode) {
          let tagContent = "";
          if (isSelfClosing) {
            i = result.closeIndex;
          } else if (options.unpairedTagsSet.has(tagName)) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (prefixedAttrs) {
            childNode[":@"] = prefixedAttrs;
          }
          childNode.add(options.textNodeName, tagContent);
          this.matcher.pop();
          this.isCurrentNodeStopNode = false;
          this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
          if (options.captureMetaData) {
            currentNode.addEndIndex(i + 1);
          }
        } else {
          if (isSelfClosing) {
            ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            if (options.captureMetaData) {
              currentNode.addEndIndex(closeIndex + 1);
            }
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
          } else if (options.unpairedTagsSet.has(tagName)) {
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            if (options.captureMetaData) {
              currentNode.addEndIndex(result.closeIndex + 1);
            }
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
  if (!this.options.captureMetaData) startIndex = void 0;
  const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
  const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
function replaceEntitiesValue(val, tagName, jPath) {
  const entityConfig = this.options.processEntities;
  if (!entityConfig || !entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    const allowed = Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher);
    if (!allowed) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) {
      return val;
    }
  }
  return this.entityDecoder.decode(val);
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      parentNode.tagname,
      matcher,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode() {
  if (this.stopNodeExpressionsSet.size === 0) return false;
  return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary = 0;
  const len = xmlData.length;
  const closeCode0 = closingChar.charCodeAt(0);
  const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
  let result = "";
  let segmentStart = i;
  for (let index = i; index < len; index++) {
    const code = xmlData.charCodeAt(index);
    if (attrBoundary) {
      if (code === attrBoundary) attrBoundary = 0;
    } else if (code === 34 || code === 39) {
      attrBoundary = code;
    } else if (code === closeCode0) {
      if (closeCode1 !== -1) {
        if (xmlData.charCodeAt(index + 1) === closeCode1) {
          result += xmlData.substring(segmentStart, index);
          return { data: result, index };
        }
      } else {
        result += xmlData.substring(segmentStart, index);
        return { data: result, index };
      }
    } else if (code === 9 && !attrBoundary) {
      result += xmlData.substring(segmentStart, index) + " ";
      segmentStart = index + 1;
    }
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function findClosingChar(xmlData, char, i, errMsg) {
  const closingIndex = xmlData.indexOf(char, i);
  if (closingIndex === -1) throw new Error(errMsg);
  return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  const xmllen = xmlData.length;
  for (; i < xmllen; i++) {
    if (xmlData[i] === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (c1 === 63) {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, false);
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true") return true;
    else if (newval === "false") return false;
    else return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function transformTagName(fn, tagName, tagExp, options) {
  if (fn) {
    const newTagName = fn(tagName);
    if (tagExp === tagName) {
      tagExp = newTagName;
    }
    tagName = newTagName;
  }
  tagName = sanitizeName(tagName, options);
  return { tagName, tagExp };
}
function sanitizeName(name, options) {
  if (criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function stripAttributePrefix(attrs, prefix) {
  if (!attrs || typeof attrs !== "object") return {};
  if (!prefix) return attrs;
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(prefix)) {
      const rawName = key.substring(prefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function prettify(node, options, matcher, readonlyMatcher) {
  return compress(node, options, matcher, readonlyMatcher);
}
function compress(arr, options, matcher, readonlyMatcher) {
  let text2;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    if (property !== void 0 && property !== options.textNodeName) {
      const rawAttrs = stripAttributePrefix(
        tagObj[":@"] || {},
        options.attributeNamePrefix
      );
      matcher.push(property, rawAttrs);
    }
    if (property === options.textNodeName) {
      if (text2 === void 0) text2 = tagObj[property];
      else text2 += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, matcher, readonlyMatcher);
      const isLeaf = isLeafTag(val, options);
      if (Object.keys(val).length === 0 && options.alwaysCreateTextNode) {
        val[options.textNodeName] = "";
      }
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }
      if (tagObj[METADATA_SYMBOL2] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
        if (options.isArray(property, jPathOrMatcher, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
      if (property !== void 0 && property !== options.textNodeName) {
        matcher.pop();
      }
    }
  }
  if (typeof text2 === "string") {
    if (text2.length > 0) compressedObj[options.textNodeName] = text2;
  } else if (text2 !== void 0) compressedObj[options.textNodeName] = text2;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@") return key;
  }
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
      const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
      if (options.isArray(atrrName, jPathOrMatcher, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true) validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options, this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
    else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// packages/shared/src/protocol.ts
var PROTOCOL_VERSION = 1;
var DEFAULT_PORT_RANGE = { start: 47811, end: 47820 };
var MAX_FRAME_BYTES = 4 * 1024 * 1024;
var WS_SUBPROTOCOL = "azy-bridge-v1";
function isFrame(value) {
  if (!value || typeof value !== "object") return false;
  const v = value;
  return v.protocol === PROTOCOL_VERSION && typeof v.kind === "string";
}
function makeReq(id, type, payload) {
  return { protocol: PROTOCOL_VERSION, kind: "req", id, type, payload };
}
function makeRes(id, result) {
  return { protocol: PROTOCOL_VERSION, kind: "res", id, ok: true, result };
}
function makeErrRes(id, error) {
  return { protocol: PROTOCOL_VERSION, kind: "res", id, ok: false, error };
}
function makeEvt(name, payload) {
  return { protocol: PROTOCOL_VERSION, kind: "evt", name, payload };
}

// packages/shared/src/errors.ts
var ErrorCodes = {
  PREMIERE_NOT_RUNNING: "PREMIERE_NOT_RUNNING",
  CONNECTOR_NOT_CONNECTED: "CONNECTOR_NOT_CONNECTED",
  CONNECTOR_NOT_INSTALLED: "CONNECTOR_NOT_INSTALLED",
  UNSUPPORTED_PREMIERE_VERSION: "UNSUPPORTED_PREMIERE_VERSION",
  INCOMPATIBLE_PROTOCOL: "INCOMPATIBLE_PROTOCOL",
  UNAUTHORIZED: "UNAUTHORIZED",
  NO_ACTIVE_PROJECT: "NO_ACTIVE_PROJECT",
  NO_ACTIVE_SEQUENCE: "NO_ACTIVE_SEQUENCE",
  NO_TARGET_CLIP: "NO_TARGET_CLIP",
  INVALID_PRESET: "INVALID_PRESET",
  UNKNOWN_EFFECT: "UNKNOWN_EFFECT",
  PRESET_APPLICATION_FAILED: "PRESET_APPLICATION_FAILED",
  PARTIAL_APPLY: "PARTIAL_APPLY",
  IPC_TIMEOUT: "IPC_TIMEOUT",
  CONNECTION_LOST: "CONNECTION_LOST",
  UNSUPPORTED_COMMAND: "UNSUPPORTED_COMMAND",
  OPERATION_IN_PROGRESS: "OPERATION_IN_PROGRESS",
  NO_KEYFRAMES: "NO_KEYFRAMES",
  UNSUPPORTED_PROPERTY: "UNSUPPORTED_PROPERTY",
  INVALID_EASING: "INVALID_EASING",
  INTERNAL_ERROR: "INTERNAL_ERROR"
};
var DefaultErrorMessages = {
  PREMIERE_NOT_RUNNING: "Premiere Pro isn't running. Open Premiere Pro to apply presets.",
  CONNECTOR_NOT_CONNECTED: "The Azy Premiere connector isn't connected. Open the Azy panel in Premiere (Window \u2192 Extensions).",
  CONNECTOR_NOT_INSTALLED: "The Azy Premiere connector isn't installed. Install the Azy Premiere connector.",
  UNSUPPORTED_PREMIERE_VERSION: "This version of Premiere Pro isn't currently supported.",
  INCOMPATIBLE_PROTOCOL: "The Azy Premiere connector is out of date. Please update the connector.",
  UNAUTHORIZED: "Connection rejected: the connector could not be authenticated.",
  NO_ACTIVE_PROJECT: "No project is open in Premiere Pro.",
  NO_ACTIVE_SEQUENCE: "No active sequence in Premiere Pro. Open a sequence first.",
  NO_TARGET_CLIP: "Select a clip in Premiere first.",
  INVALID_PRESET: "This file doesn't appear to be a valid Premiere preset.",
  UNKNOWN_EFFECT: "This preset uses an effect that isn't available in this Premiere installation.",
  PRESET_APPLICATION_FAILED: "Premiere couldn't apply the preset.",
  PARTIAL_APPLY: "The preset was only partially applied. Some parameters could not be set.",
  IPC_TIMEOUT: "Premiere didn't respond in time.",
  CONNECTION_LOST: "Connection to Premiere was lost. Reconnecting\u2026",
  UNSUPPORTED_COMMAND: "The connector doesn't support this command.",
  OPERATION_IN_PROGRESS: "Another preset is still being applied.",
  NO_KEYFRAMES: "No keyframes selected in Premiere.",
  UNSUPPORTED_PROPERTY: "This property's keyframes can't be eased through Premiere's API.",
  INVALID_EASING: "This easing preset is invalid.",
  INTERNAL_ERROR: "Something went wrong."
};
var AzyError = class _AzyError extends Error {
  code;
  details;
  constructor(code, message, details) {
    super(message ?? DefaultErrorMessages[code]);
    this.name = "AzyError";
    this.code = code;
    this.details = details;
  }
  toStructured() {
    return { code: this.code, message: this.message, details: this.details };
  }
  static from(err2, fallback = ErrorCodes.INTERNAL_ERROR) {
    if (err2 instanceof _AzyError) return err2;
    if (err2 && typeof err2 === "object" && "code" in err2 && typeof err2.code === "string") {
      const s = err2;
      if (Object.values(ErrorCodes).includes(s.code)) {
        return new _AzyError(s.code, s.message, s.details);
      }
    }
    const message = err2 instanceof Error ? err2.message : String(err2);
    return new _AzyError(fallback, `${DefaultErrorMessages[fallback]} (${message})`);
  }
};

// packages/shared/src/plan.ts
var START_KEYFRAME_SENTINEL_TICKS = "-91445760000000000";
var INTRINSIC_VIDEO_MATCH_NAMES = /* @__PURE__ */ new Set([
  "AE.ADBE Motion",
  "AE.ADBE Opacity",
  "AE.ADBE Time Remapping",
  "AE.ADBE Speed",
  "PR.ADBE Motion",
  "PR.ADBE Opacity"
]);
var INTRINSIC_AUDIO_MATCH_NAMES = /* @__PURE__ */ new Set([
  "PR.ADBE Volume",
  "PR.ADBE Channel Volume",
  "PR.ADBE Panner",
  "AE.ADBE Volume"
]);
function isIntrinsicMatchName(matchName) {
  return INTRINSIC_VIDEO_MATCH_NAMES.has(matchName) || INTRINSIC_AUDIO_MATCH_NAMES.has(matchName);
}
var MEDIA_TYPE_GUIDS = {
  "228cda18-3625-4d2d-951e-348879e4ed93": "video",
  "80b8e3d5-6dca-4195-aefb-cb5f407ab009": "audio"
};

// packages/shared/src/version.ts
function parseSemver(input) {
  const m = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[-+]([0-9A-Za-z.-]+))?/.exec(input.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2] ?? 0), patch: Number(m[3] ?? 0), pre: m[4] };
}
function compareSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return 0;
}
function gte(version, min) {
  const a = parseSemver(version);
  const b = parseSemver(min);
  if (!a || !b) return false;
  return compareSemver(a, b) >= 0;
}
function classifyPremiere(version) {
  const v = parseSemver(version);
  if (!v) return "unsupported";
  if (v.major >= 26) return "cep-2026";
  if (v.major === 25) return "cep-2025";
  if (v.major === 24) return "cep-2024";
  if (v.major === 23) return "cep-2023";
  return "unsupported";
}

// packages/shared/src/capabilities.ts
function canApplyPresets(c) {
  return c.uxpDom && c.readSelection && c.addVideoEffects && c.setParams;
}

// packages/shared/src/flow.ts
var FLOW_KEEP_PRESET_ID = "flow:builtin:keep";
var FLOW_BUILTIN_PRESETS = [
  {
    id: FLOW_KEEP_PRESET_ID,
    name: "Keep ease",
    type: "builtin",
    description: "Changes only the timing. The ease already on the keyframes is measured and re-baked at the new speed.",
    easing: { first: "linear", middle: "linear", last: "linear", keep: true, curve: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1, steps: 0 } }
  },
  {
    id: "flow:builtin:ease-in",
    name: "Ease In",
    type: "builtin",
    description: "Decelerate into the last keyframe. Sampled from an ease-in-to-stop curve, because UXP can't shape Bezier handles.",
    easing: { first: "linear", middle: "linear", last: "linear", curve: { x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94, steps: 0 } }
  },
  {
    id: "flow:builtin:ease-out",
    name: "Ease Out",
    type: "builtin",
    description: "Accelerate out of the first keyframe. Sampled from a slow-start curve.",
    easing: { first: "linear", middle: "linear", last: "linear", curve: { x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53, steps: 0 } }
  },
  {
    id: "flow:builtin:ease-in-out",
    name: "Ease In & Out",
    type: "builtin",
    description: "Slow start, fast middle, slow stop \u2014 sampled from an ease-in-out cubic curve.",
    easing: { first: "linear", middle: "linear", last: "linear", curve: { x1: 0.645, y1: 0.045, x2: 0.355, y2: 1, steps: 0 } }
  },
  {
    id: "flow:builtin:smooth",
    name: "Smooth",
    type: "builtin",
    description: "Gentle ease on both ends (the classic CSS 'ease' curve), sampled between each keyframe pair.",
    easing: { first: "linear", middle: "linear", last: "linear", curve: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1, steps: 0 } }
  },
  {
    id: "flow:builtin:linear",
    name: "Linear",
    type: "builtin",
    description: "Reset every keyframe to a constant rate of change.",
    easing: { first: "linear", middle: "linear", last: "linear" }
  },
  {
    id: "flow:builtin:hold",
    name: "Hold",
    type: "builtin",
    description: "Step changes \u2014 each keyframe holds its value until the next one.",
    easing: { first: "hold", middle: "hold", last: "hold" }
  }
];
var INTERPS = ["linear", "bezier", "hold"];
function validateEasing(e) {
  const errs = [];
  const o = e;
  if (!o || typeof o !== "object") return ["easing must be an object"];
  for (const k of ["first", "middle", "last"]) if (!INTERPS.includes(o[k])) errs.push(`${k} must be linear|bezier|hold`);
  if (o.curve !== void 0) {
    const c = o.curve;
    if (!c || typeof c !== "object") errs.push("curve must be an object");
    else {
      for (const k of ["x1", "y1", "x2", "y2"]) if (typeof c[k] !== "number" || !Number.isFinite(c[k])) errs.push(`curve.${k} must be a number`);
      if (typeof c.x1 === "number" && (c.x1 < 0 || c.x1 > 1)) errs.push("curve.x1 must be within 0..1");
      if (typeof c.x2 === "number" && (c.x2 < 0 || c.x2 > 1)) errs.push("curve.x2 must be within 0..1");
      if (!Number.isInteger(c.steps) || c.steps < 0 || c.steps === 1 || c.steps > 24) errs.push("curve.steps must be 0 (every frame) or an integer 2..24");
      if (c.every !== void 0 && (!Number.isInteger(c.every) || c.every < 1 || c.every > 6)) errs.push("curve.every must be an integer 1..6");
    }
  }
  return errs;
}

// packages/core/src/presets/prfpset.ts
var MAX_PRFPSET_BYTES = 64 * 1024 * 1024;
var PrfpsetParseError = class extends Error {
  constructor(message, filePath) {
    super(message);
    this.filePath = filePath;
    this.name = "PrfpsetParseError";
  }
  filePath;
};
var parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  // keep everything as strings: we need exact tick precision
  parseAttributeValue: false,
  trimValues: true,
  allowBooleanAttributes: true,
  processEntities: true,
  // fast-xml-parser ≥5 types `jpath` as string | Matcher; with the default `jPath: true` it is always a string.
  isArray: (_name, jpath) => typeof jpath === "string" && /(\.Items\.Item|\.Params\.Param|\.FilterPresets\.FilterPreset)$/.test(jpath)
});
async function parsePrfpsetFile(filePath, presetId) {
  const stat5 = await fs.stat(filePath);
  if (stat5.size > MAX_PRFPSET_BYTES) throw new PrfpsetParseError(`File too large (${stat5.size} bytes)`, filePath);
  const xml = await fs.readFile(filePath, "utf8");
  const plan = parsePrfpsetXml(xml, presetId, defaultNameFromPath(filePath));
  plan.sourcePath = filePath;
  return plan;
}
function defaultNameFromPath(filePath) {
  const base = filePath.replace(/\\/g, "/").split("/").pop() ?? filePath;
  return base.replace(/\.prfpset$/i, "");
}
function looksLikePrfpset(head) {
  return /<PremiereData\b/.test(head);
}
function parseDoc(xml) {
  if (!looksLikePrfpset(xml.slice(0, 4096))) throw new PrfpsetParseError("Not a PremiereData XML document");
  let doc;
  try {
    doc = parser.parse(xml);
  } catch (e) {
    throw new PrfpsetParseError(`XML parse error: ${e.message}`);
  }
  const root = doc["PremiereData"];
  if (!root) throw new PrfpsetParseError("Missing <PremiereData> root");
  return buildGraph(root);
}
function parsePrfpsetXml(xml, presetId, fallbackName) {
  const graph = parseDoc(xml);
  const presetItems = graph.byTag.get("FilterPresetItem") ?? [];
  if (presetItems.length === 0) throw new PrfpsetParseError("No FilterPresetItem found \u2014 not an effect preset");
  const warnings = [];
  const name = findPresetName(graph, presetItems[0]) ?? fallbackName;
  if (presetItems.length > 1) {
    warnings.push(`File contains ${presetItems.length} presets; Azy uses the first ("${name}"). Split the file to use the others.`);
  }
  return buildPlan(graph, presetItems[0], presetId, name, warnings);
}
function parsePrfpsetAll(xml, idPrefix) {
  const graph = parseDoc(xml);
  const presetItems = graph.byTag.get("FilterPresetItem") ?? [];
  const entries = [];
  const errors = [];
  const tree = buildTreeIndex(graph);
  presetItems.forEach((item, index) => {
    const id = item["@_ObjectID"];
    const loc = id ? tree.get(id) : void 0;
    const name = loc?.name ?? `Preset ${index + 1}`;
    try {
      const plan = buildPlan(graph, item, `${idPrefix}#${index}`, name, []);
      entries.push({ index, name, binPath: loc?.binPath ?? [], plan });
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
    }
  });
  return { entries, errors };
}
function buildPlan(graph, firstItem, presetId, name, warnings) {
  const filterPresetRefs = asArray(firstItem["FilterPresets"]?.["FilterPreset"]);
  if (filterPresetRefs.length === 0) throw new PrfpsetParseError("FilterPresetItem has no FilterPreset entries");
  const effects = [];
  let timingType = 0 /* Scale */;
  let anchorIn = "0";
  let anchorOut = "0";
  let firstTiming = true;
  for (const ref of filterPresetRefs) {
    const fp = resolveRef(graph, ref);
    if (!fp) {
      warnings.push("Dangling FilterPreset reference");
      continue;
    }
    const type = Number(text(fp.node["Type"]) ?? "0");
    const aIn = text(fp.node["AnchorInPoint"]) ?? "0";
    const aOut = text(fp.node["AnchorOutPoint"]) ?? "0";
    if (firstTiming) {
      timingType = Number.isFinite(type) ? type : 0;
      anchorIn = aIn;
      anchorOut = aOut;
      firstTiming = false;
    } else if (type !== timingType || aIn !== anchorIn || aOut !== anchorOut) {
      warnings.push("Effects inside this preset use different timing anchors; the first one is used for all.");
    }
    const mediaGuid = (text(fp.node["MediaType"]) ?? "").toLowerCase();
    const media = MEDIA_TYPE_GUIDS[mediaGuid] ?? "video";
    const filterMatchName = text(fp.node["FilterMatchName"]) ?? "";
    const compRef = fp.node["Component"];
    const comp = compRef ? resolveRef(graph, compRef) : void 0;
    if (!comp) {
      warnings.push(`Effect "${filterMatchName}" has no component data; skipped`);
      continue;
    }
    const effect = parseComponent(graph, comp.tag, comp.node, filterMatchName, media, warnings);
    if (effect) effects.push(effect);
  }
  if (effects.length === 0) throw new PrfpsetParseError("Preset contains no usable effects");
  return {
    schema: 1,
    presetId,
    name,
    description: text(firstItem["Description"]) ?? void 0,
    timing: { type: timingType, anchorInTicks: anchorIn, anchorOutTicks: anchorOut },
    effects,
    warnings
  };
}
function buildTreeIndex(graph) {
  const trees = graph.byTag.get("TreeItem") ?? [];
  const byTreeId = /* @__PURE__ */ new Map();
  for (const t of trees) {
    const id = t["@_ObjectID"];
    if (id) byTreeId.set(id, t);
  }
  const parent = /* @__PURE__ */ new Map();
  for (const t of trees) {
    const id = t["@_ObjectID"];
    if (!id) continue;
    for (const key of ["Children", "Items", "TreeItems"]) {
      const kids = asArray(t[key]?.["TreeItem"] ?? t[key]?.["Item"]);
      for (const k of kids) {
        const ref = k?.["@_ObjectRef"];
        if (ref) parent.set(ref, id);
      }
    }
  }
  const nameOf = (t) => text(t["TreeItemBase"]?.["Name"]) ?? text(t["Name"]) ?? "";
  const out = /* @__PURE__ */ new Map();
  for (const t of trees) {
    const base = t["TreeItemBase"];
    const dataRef = base?.["Data"]?.["@_ObjectRef"];
    if (!dataRef) continue;
    const binPath = [];
    let cur = parent.get(t["@_ObjectID"]);
    let guard = 0;
    while (cur && guard++ < 32) {
      const p = byTreeId.get(cur);
      if (!p) break;
      const n = nameOf(p);
      if (n && n !== "Presets") binPath.unshift(n);
      cur = parent.get(cur);
    }
    out.set(dataRef, { name: nameOf(t), binPath });
  }
  return out;
}
function buildGraph(root) {
  const byId = /* @__PURE__ */ new Map();
  const byTag = /* @__PURE__ */ new Map();
  for (const [tag, value] of Object.entries(root)) {
    if (tag.startsWith("@_")) continue;
    for (const node of asArray(value)) {
      if (!node || typeof node !== "object") continue;
      const n = node;
      const id = n["@_ObjectID"];
      if (id) byId.set(id, { tag, node: n });
      const list = byTag.get(tag) ?? [];
      list.push(n);
      byTag.set(tag, list);
    }
  }
  return { byId, byTag };
}
function resolveRef(graph, refNode) {
  if (!refNode || typeof refNode !== "object") return void 0;
  const ref = refNode["@_ObjectRef"];
  if (!ref) return void 0;
  return graph.byId.get(ref);
}
function findPresetName(graph, presetItem) {
  const id = presetItem["@_ObjectID"];
  if (!id) return void 0;
  for (const tree of graph.byTag.get("TreeItem") ?? []) {
    const base = tree["TreeItemBase"];
    const data = base?.["Data"];
    if (data?.["@_ObjectRef"] === id) {
      const n = text(base?.["Name"]);
      if (n) return n;
    }
  }
  return void 0;
}
function asArray(v) {
  if (v === void 0 || v === null) return [];
  return Array.isArray(v) ? v : [v];
}
function text(v) {
  if (v === void 0 || v === null) return void 0;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object" && "#text" in v) return String(v["#text"]);
  return void 0;
}
function parseComponent(graph, tag, node, filterMatchName, media, warnings) {
  const matchName = text(node["MatchName"]) ?? filterMatchName;
  const inner = node["Component"] ?? node;
  const displayName = text(inner["DisplayName"]) ?? matchName;
  const bypass = (text(inner["Bypass"]) ?? "false") === "true";
  const paramRefs = asArray(inner["Params"]?.["Param"]);
  const params = [];
  paramRefs.forEach((ref, i) => {
    const p = resolveRef(graph, ref);
    if (!p) {
      warnings.push(`${displayName}: dangling param reference at index ${i}`);
      return;
    }
    const parsed = parseParam(p.tag, p.node, i, warnings, displayName);
    if (parsed) params.push(parsed);
  });
  if (!matchName) {
    warnings.push(`Component "${displayName}" has no match name; skipped`);
    return void 0;
  }
  const isAudioTag = /^Audio/i.test(tag);
  return {
    matchName,
    displayName,
    media: isAudioTag ? "audio" : media,
    intrinsic: isIntrinsicMatchName(matchName) || (text(inner["Intrinsic"]) ?? "false") === "true",
    bypass,
    params
  };
}
var OPAQUE_PARAM_CLASSES = /* @__PURE__ */ new Set(["ArbitraryDataComponentParam", "ArbComponentParam", "BinaryComponentParam", "BlobComponentParam"]);
function parseParam(tag, node, index, warnings, effectName) {
  const name = text(node["Name"]) ?? `param ${index}`;
  const parameterId = Number(text(node["ParameterID"]) ?? index + 1);
  const controlType = text(node["ParameterControlType"]);
  const timeVarying = (text(node["IsTimeVarying"]) ?? "false") === "true";
  const startKf = text(node["StartKeyframe"]);
  const currentValue = text(node["CurrentValue"]);
  const keyframesRaw = text(node["Keyframes"]) ?? "";
  const opaque = OPAQUE_PARAM_CLASSES.has(tag) || tag.includes("Arbitrary") || /Blob|Binary/i.test(tag);
  const kind = valueKindFor(tag);
  let value = null;
  if (opaque) {
    const raw = currentValue ?? (startKf ? startKf.split(",")[1] : void 0);
    value = raw !== void 0 ? { kind: "opaque", encoding: "raw", value: raw } : null;
  } else if (startKf) {
    const kf = parseKeyframeTuple(startKf, kind);
    value = kf?.value ?? null;
  } else if (currentValue !== void 0) {
    value = parseValue2(currentValue, kind);
  }
  const keyframes = [];
  if (timeVarying && keyframesRaw.trim().length > 0 && !opaque) {
    for (const chunk of keyframesRaw.split(";")) {
      const c = chunk.trim();
      if (!c) continue;
      const kf = parseKeyframeTuple(c, kind);
      if (kf) keyframes.push(kf);
      else warnings.push(`${effectName} \u203A ${name}: could not parse keyframe "${c.slice(0, 40)}"`);
    }
  }
  if (opaque) {
    warnings.push(`${effectName} \u203A ${name}: opaque/binary parameter can't be set through the Premiere API`);
  }
  return {
    index,
    parameterId: Number.isFinite(parameterId) ? parameterId : index + 1,
    name,
    xmlClass: tag,
    controlType: controlType !== void 0 ? Number(controlType) : void 0,
    value,
    timeVarying,
    keyframes,
    settable: !opaque && value !== null
  };
}
function valueKindFor(tag) {
  if (/Point/i.test(tag)) return "point";
  if (/Color/i.test(tag)) return "color";
  if (/Bool|Check/i.test(tag)) return "boolean";
  if (/String|Text|Path/i.test(tag)) return "string";
  if (/Arbitrary|Blob|Binary/i.test(tag)) return "opaque";
  return "number";
}
function parseKeyframeTuple(tuple, kind) {
  const parts = tuple.split(",");
  if (parts.length < 2) return void 0;
  const ticks = parts[0].trim();
  if (!/^-?\d+$/.test(ticks)) return void 0;
  const value = parseValue2(parts[1].trim(), kind);
  if (!value) return void 0;
  const interpRaw = Number(parts[2] ?? "0");
  const interpolation = Number.isFinite(interpRaw) ? interpRaw : 0;
  return { ticks, value, interpolation, raw: parts.slice(3) };
}
function parseValue2(raw, kind) {
  const s = raw.trim();
  if (kind === "opaque") return { kind: "opaque", encoding: "raw", value: s };
  if (kind === "point" || s.includes(":")) {
    const [x, y] = s.split(":").map((v) => Number(v));
    if (Number.isFinite(x) && Number.isFinite(y)) return { kind: "point", x, y };
    return null;
  }
  if (kind === "color") {
    const c = parsePackedColor(s);
    return c ? { kind: "color", ...c } : null;
  }
  if (s === "true" || s === "false") return { kind: "boolean", value: s === "true" };
  if (kind === "string") return { kind: "string", value: s };
  const n = Number(s);
  if (Number.isFinite(n)) {
    if (Math.abs(n) > 2 ** 40 && /^\d+$/.test(s)) {
      const c = parsePackedColor(s);
      if (c) return { kind: "color", ...c };
    }
    return { kind: "number", value: n };
  }
  return { kind: "string", value: s };
}
function parsePackedColor(s) {
  if (!/^\d+$/.test(s)) return null;
  let v;
  try {
    v = BigInt(s);
  } catch {
    return null;
  }
  if (v > 0xffffffffffffffffn) return null;
  const a = Number(v >> 48n & 0xffffn) / 65535;
  const r = Number(v >> 32n & 0xffffn) / 65535;
  const g = Number(v >> 16n & 0xffffn) / 65535;
  const b = Number(v & 0xffffn) / 65535;
  return { r, g, b, a };
}

// packages/core/src/presets/index-store.ts
var fs2 = __toESM(require("node:fs"));
var fsp = __toESM(require("node:fs/promises"));
var path = __toESM(require("node:path"));
var PresetIndex = class {
  /**
   * @param snapshotPath  rebuildable cache of scanned presets (safe to delete)
   * @param foldersPath   user's pinned-folder registrations (authoritative; written synchronously on change).
   *                      Defaults to `<snapshot dir>/pinned-folders.json`.
   */
  constructor(snapshotPath, foldersPath) {
    this.snapshotPath = snapshotPath;
    this.foldersPath = foldersPath ?? (snapshotPath ? path.join(path.dirname(snapshotPath), "pinned-folders.json") : void 0);
  }
  snapshotPath;
  presets = /* @__PURE__ */ new Map();
  byFolder = /* @__PURE__ */ new Map();
  folders = /* @__PURE__ */ new Map();
  listeners = /* @__PURE__ */ new Set();
  dirty = false;
  saveTimer;
  foldersPath;
  // ---- events ----------------------------------------------------------------------------------
  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(c) {
    this.dirty = true;
    this.scheduleSave();
    for (const l of this.listeners) l(c);
  }
  // ---- folders ---------------------------------------------------------------------------------
  getFolders() {
    return [...this.folders.values()].sort((a, b) => a.order - b.order);
  }
  getFolder(id) {
    return this.folders.get(id);
  }
  upsertFolder(folder) {
    const existed = this.folders.has(folder.id);
    this.folders.set(folder.id, folder);
    if (!this.byFolder.has(folder.id)) this.byFolder.set(folder.id, /* @__PURE__ */ new Set());
    this.saveFoldersSync();
    this.emit(existed ? { type: "folderUpdated", folder } : { type: "folderAdded", folder });
  }
  removeFolder(id) {
    const folder = this.folders.get(id);
    if (!folder) return void 0;
    const ids = this.byFolder.get(id) ?? /* @__PURE__ */ new Set();
    for (const pid of ids) this.presets.delete(pid);
    this.byFolder.delete(id);
    this.folders.delete(id);
    this.saveFoldersSync();
    this.emit({ type: "folderRemoved", folder, removedPresets: ids.size });
    return folder;
  }
  saveFoldersSync() {
    if (!this.foldersPath) return;
    try {
      fs2.mkdirSync(path.dirname(this.foldersPath), { recursive: true });
      const tmp = this.foldersPath + ".tmp";
      fs2.writeFileSync(tmp, JSON.stringify({ version: 1, folders: this.getFolders() }, null, 2), "utf8");
      fs2.renameSync(tmp, this.foldersPath);
    } catch {
    }
  }
  loadFoldersSync() {
    if (!this.foldersPath) return false;
    try {
      const raw = fs2.readFileSync(this.foldersPath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed.version !== 1 || !Array.isArray(parsed.folders)) return false;
      for (const f of parsed.folders) {
        this.folders.set(f.id, f);
        if (!this.byFolder.has(f.id)) this.byFolder.set(f.id, /* @__PURE__ */ new Set());
      }
      return true;
    } catch {
      return false;
    }
  }
  // ---- presets ---------------------------------------------------------------------------------
  get size() {
    return this.presets.size;
  }
  get(id) {
    return this.presets.get(id);
  }
  all() {
    return this.presets.values();
  }
  inFolder(folderId) {
    const ids = this.byFolder.get(folderId);
    if (!ids) return [];
    const out = [];
    for (const id of ids) {
      const p = this.presets.get(id);
      if (p) out.push(p);
    }
    return out;
  }
  countInFolder(folderId) {
    return this.byFolder.get(folderId)?.size ?? 0;
  }
  upsert(rec, opts = {}) {
    const prev = this.presets.get(rec.id);
    if (prev && prev.mtimeMs === rec.mtimeMs && prev.size === rec.size && prev.path === rec.path) {
      return "unchanged";
    }
    const merged = prev ? { ...prev, ...rec, addedAt: prev.addedAt, parsed: prev.mtimeMs === rec.mtimeMs ? prev.parsed : void 0 } : rec;
    this.presets.set(rec.id, merged);
    let set = this.byFolder.get(rec.folderId);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this.byFolder.set(rec.folderId, set);
    }
    set.add(rec.id);
    if (!opts.silent) this.emit(prev ? { type: "updated", preset: merged, previous: prev } : { type: "added", preset: merged });
    else this.dirty = true;
    return prev ? "updated" : "added";
  }
  setParsed(id, parsed) {
    const p = this.presets.get(id);
    if (!p) return;
    p.parsed = parsed;
    this.dirty = true;
    this.scheduleSave();
  }
  remove(id, opts = {}) {
    const p = this.presets.get(id);
    if (!p) return void 0;
    this.presets.delete(id);
    this.byFolder.get(p.folderId)?.delete(id);
    if (!opts.silent) this.emit({ type: "removed", preset: p });
    else this.dirty = true;
    return p;
  }
  emitBulk(added, updated, removed) {
    this.emit({ type: "bulk", added, updated, removed });
  }
  // ---- persistence -----------------------------------------------------------------------------
  async load() {
    const haveFolders = this.loadFoldersSync();
    if (!this.snapshotPath) return false;
    try {
      const raw = await fsp.readFile(this.snapshotPath, "utf8");
      const snap = JSON.parse(raw);
      if (snap.version !== 1) return false;
      for (const f of snap.folders) {
        if (haveFolders && !this.folders.has(f.id)) continue;
        if (!this.folders.has(f.id)) this.folders.set(f.id, f);
        if (!this.byFolder.has(f.id)) this.byFolder.set(f.id, /* @__PURE__ */ new Set());
      }
      for (const p of snap.presets) {
        if (!this.folders.has(p.folderId)) continue;
        this.presets.set(p.id, p);
        this.byFolder.get(p.folderId).add(p.id);
      }
      return true;
    } catch {
      return false;
    }
  }
  scheduleSave() {
    if (!this.snapshotPath || this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = void 0;
      void this.save();
    }, 1500);
    this.saveTimer.unref?.();
  }
  async save() {
    if (!this.snapshotPath || !this.dirty) return;
    this.dirty = false;
    const snap = {
      version: 1,
      savedAt: Date.now(),
      folders: this.getFolders(),
      presets: [...this.presets.values()]
    };
    const tmp = this.snapshotPath + ".tmp";
    await fsp.mkdir(path.dirname(this.snapshotPath), { recursive: true });
    await fsp.writeFile(tmp, JSON.stringify(snap), "utf8");
    await fsp.rename(tmp, this.snapshotPath);
  }
  /** Synchronous flush for app quit. */
  saveSync() {
    if (!this.snapshotPath || !this.dirty) return;
    this.dirty = false;
    const snap = { version: 1, savedAt: Date.now(), folders: this.getFolders(), presets: [...this.presets.values()] };
    fs2.mkdirSync(path.dirname(this.snapshotPath), { recursive: true });
    fs2.writeFileSync(this.snapshotPath, JSON.stringify(snap), "utf8");
  }
};

// packages/core/src/presets/scanner.ts
var fsp2 = __toESM(require("node:fs/promises"));
var path3 = __toESM(require("node:path"));

// packages/core/src/shared/ids.ts
var import_node_crypto = require("node:crypto");
var path2 = __toESM(require("node:path"));
function presetIdForPath(absPath) {
  const norm = normalizePath(absPath);
  return "p_" + (0, import_node_crypto.createHash)("sha1").update(norm).digest("hex").slice(0, 20);
}
function folderIdForPath(absPath) {
  return "f_" + (0, import_node_crypto.createHash)("sha1").update(normalizePath(absPath)).digest("hex").slice(0, 16);
}
function normalizePath(p) {
  let n = path2.resolve(p).replace(/\\/g, "/");
  if (n.length > 1 && n.endsWith("/")) n = n.slice(0, -1);
  return process.platform === "win32" ? n.toLowerCase() : n;
}
function newOperationId() {
  return "op_" + (0, import_node_crypto.randomUUID)();
}
function newRequestId() {
  return "r_" + (0, import_node_crypto.randomBytes)(8).toString("hex");
}
function newToken() {
  return (0, import_node_crypto.randomBytes)(32).toString("base64url");
}
function newPairingCode() {
  const n = (0, import_node_crypto.randomBytes)(4).readUInt32BE(0) % 1e6;
  return n.toString().padStart(6, "0");
}

// packages/core/src/presets/scanner.ts
var DEFAULT_IGNORE = (name) => name.startsWith(".") || name === "node_modules" || name === "$RECYCLE.BIN" || name === "System Volume Information";
function isPrfpsetName(name) {
  return name.length > 8 && name.slice(-8).toLowerCase() === ".prfpset";
}
async function scanFolder(rootPath, folderId, opts = {}) {
  const yieldEvery = opts.yieldEvery ?? 200;
  const maxDepth = opts.maxDepth ?? 32;
  const ignoreDir = opts.ignoreDir ?? DEFAULT_IGNORE;
  const result = { records: [], dirs: 0, files: 0, aborted: false, errors: [], dirCounts: /* @__PURE__ */ new Map() };
  const root = path3.resolve(rootPath);
  let sinceYield = 0;
  const stack = [{ dir: root, depth: 0 }];
  const now = Date.now();
  while (stack.length) {
    if (opts.signal?.aborted) {
      result.aborted = true;
      break;
    }
    const { dir, depth } = stack.pop();
    result.dirs++;
    const rel = toRel(root, dir);
    if (!result.dirCounts.has(rel)) result.dirCounts.set(rel, 0);
    let handle;
    try {
      handle = await fsp2.opendir(dir);
    } catch (e) {
      result.errors.push({ path: dir, error: e.message });
      continue;
    }
    try {
      for await (const ent of handle) {
        if (++sinceYield >= yieldEvery) {
          sinceYield = 0;
          await new Promise((r) => setImmediate(r));
          opts.onProgress?.({ dirs: result.dirs, files: result.files, presets: result.records.length });
          if (opts.signal?.aborted) {
            result.aborted = true;
            break;
          }
        }
        const full = path3.join(dir, ent.name);
        if (ent.isDirectory()) {
          if (depth < maxDepth && !ignoreDir(ent.name) && !ent.isSymbolicLink()) stack.push({ dir: full, depth: depth + 1 });
          continue;
        }
        if (!isRegularOrLinkFile(ent)) continue;
        result.files++;
        if (!isPrfpsetName(ent.name)) continue;
        try {
          const st = await fsp2.stat(full);
          if (!st.isFile()) continue;
          result.records.push(makeRecord(full, root, folderId, st.size, st.mtimeMs, now));
          result.dirCounts.set(rel, (result.dirCounts.get(rel) ?? 0) + 1);
        } catch (e) {
          result.errors.push({ path: full, error: e.message });
        }
      }
    } catch (e) {
      result.errors.push({ path: dir, error: e.message });
    }
    if (result.aborted) break;
  }
  opts.onProgress?.({ dirs: result.dirs, files: result.files, presets: result.records.length });
  return result;
}
function isRegularOrLinkFile(ent) {
  return ent.isFile() || ent.isSymbolicLink();
}
function toRel(root, full) {
  const rel = path3.relative(root, full).replace(/\\/g, "/");
  return rel === "." ? "" : rel;
}
function makeRecord(fullPath, root, folderId, size, mtimeMs, addedAt) {
  const relDir = toRel(root, path3.dirname(fullPath));
  return {
    id: presetIdForPath(fullPath),
    name: path3.basename(fullPath).replace(/\.prfpset$/i, ""),
    path: fullPath,
    folderId,
    relDir,
    size,
    mtimeMs,
    addedAt
  };
}
async function statRecord(fullPath, root, folderId) {
  try {
    const st = await fsp2.stat(fullPath);
    if (!st.isFile()) return void 0;
    return makeRecord(fullPath, root, folderId, st.size, st.mtimeMs, Date.now());
  } catch {
    return void 0;
  }
}

// packages/core/src/presets/watcher.ts
var import_chokidar = __toESM(require_chokidar());
var path4 = __toESM(require("node:path"));
var import_node_events = require("node:events");
var FolderWatcher = class extends import_node_events.EventEmitter {
  constructor(root, opts = {}) {
    super();
    this.root = root;
    this.opts = opts;
    this.debounceMs = opts.debounceMs ?? 400;
    this.reconcileIntervalMs = opts.reconcileIntervalMs ?? 6e4;
  }
  root;
  opts;
  watcher;
  pending = /* @__PURE__ */ new Map();
  healthy = true;
  reconcileTimer;
  debounceMs;
  reconcileIntervalMs;
  start() {
    if (this.watcher) return;
    this.watcher = import_chokidar.default.watch(this.root, {
      ignoreInitial: true,
      // the scanner already produced the initial state
      persistent: true,
      followSymlinks: false,
      usePolling: this.opts.usePolling ?? false,
      depth: 32,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
      ignored: (p) => {
        const base = path4.basename(p);
        return base.startsWith(".") || base === "node_modules" || base === "$RECYCLE.BIN";
      }
    });
    this.watcher.on("add", (p) => this.queue("add", p)).on("change", (p) => this.queue("change", p)).on("unlink", (p) => this.queue("unlink", p)).on("unlinkDir", (p) => this.emit("event", { type: "unlinkDir", path: p })).on("error", (err2) => {
      this.healthy = false;
      this.emit("event", { type: "error", error: err2 });
      this.armReconcile();
    }).on("ready", () => {
      this.healthy = true;
      this.emit("ready");
    });
  }
  get isHealthy() {
    return this.healthy;
  }
  queue(type, p) {
    if (!isPrfpsetName(path4.basename(p))) return;
    const prev = this.pending.get(p);
    if (prev) clearTimeout(prev.timer);
    let effective = type;
    if (prev) {
      if (prev.type === "add" && type === "unlink") {
        this.pending.delete(p);
        return;
      }
      if (prev.type === "unlink" && type === "add") effective = "change";
      if (prev.type === "add" && type === "change") effective = "add";
    }
    const timer = setTimeout(() => {
      this.pending.delete(p);
      this.emit("event", { type: effective, path: p });
    }, this.debounceMs);
    timer.unref?.();
    this.pending.set(p, { type: effective, timer });
  }
  armReconcile() {
    if (this.reconcileTimer) return;
    this.reconcileTimer = setInterval(() => this.emit("reconcile"), this.reconcileIntervalMs);
    this.reconcileTimer.unref?.();
  }
  async stop() {
    for (const { timer } of this.pending.values()) clearTimeout(timer);
    this.pending.clear();
    if (this.reconcileTimer) clearInterval(this.reconcileTimer);
    this.reconcileTimer = void 0;
    await this.watcher?.close();
    this.watcher = void 0;
  }
};

// packages/core/src/presets/search.ts
function tokenize(s) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}
function tokenizeRich(s) {
  const spaced = s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2");
  return tokenize(spaced);
}
var PresetSearch = class {
  docs = /* @__PURE__ */ new Map();
  postings = /* @__PURE__ */ new Map();
  // token → ids
  tokensById = /* @__PURE__ */ new Map();
  upsert(doc) {
    this.remove(doc.id);
    this.docs.set(doc.id, doc);
    const tokens = [.../* @__PURE__ */ new Set([...tokenizeRich(doc.name), ...tokenizeRich(doc.path)])];
    this.tokensById.set(doc.id, tokens);
    for (const t of tokens) {
      let set = this.postings.get(t);
      if (!set) this.postings.set(t, set = /* @__PURE__ */ new Set());
      set.add(doc.id);
    }
  }
  remove(id) {
    const tokens = this.tokensById.get(id);
    if (!tokens) return;
    for (const t of tokens) {
      const set = this.postings.get(t);
      set?.delete(id);
      if (set && set.size === 0) this.postings.delete(t);
    }
    this.tokensById.delete(id);
    this.docs.delete(id);
  }
  fromRecord(rec, folderLabel, favorite, lastUsed) {
    const p = rec.relDir ? `${folderLabel}/${rec.relDir}` : folderLabel;
    return { id: rec.id, name: rec.name, path: p, favorite, lastUsed };
  }
  get size() {
    return this.docs.size;
  }
  search(query, opts = {}) {
    const limit = opts.limit ?? 200;
    const qTokens = tokenize(query);
    if (qTokens.length === 0) {
      const ids = opts.within ? [...opts.within] : [...this.docs.keys()];
      return ids.map((id) => ({ id, score: this.staticBoost(id, opts) })).sort((a, b) => b.score - a.score || this.docs.get(a.id).name.localeCompare(this.docs.get(b.id).name)).slice(0, limit);
    }
    let candidates;
    for (const qt of qTokens) {
      const matched = /* @__PURE__ */ new Set();
      for (const [tok, ids] of this.postings) {
        if (tok.startsWith(qt) || qt.length >= 3 && tok.includes(qt)) for (const id of ids) matched.add(id);
      }
      candidates = candidates ? intersect(candidates, matched) : matched;
      if (candidates.size === 0) break;
    }
    if (!candidates || candidates.size === 0) {
      candidates = /* @__PURE__ */ new Set();
      const q = qTokens.join("");
      for (const [id, d] of this.docs) if (subsequenceScore(q, d.name.toLowerCase()) > 0) candidates.add(id);
    }
    const hits = [];
    for (const id of candidates) {
      if (opts.within && !opts.within.has(id)) continue;
      const d = this.docs.get(id);
      hits.push({ id, score: this.score(d, qTokens, opts) });
    }
    hits.sort((a, b) => b.score - a.score || this.docs.get(a.id).name.localeCompare(this.docs.get(b.id).name));
    return hits.slice(0, limit);
  }
  score(d, qTokens, opts) {
    const name = d.name.toLowerCase();
    const nameTokens = tokenizeRich(d.name);
    const pathTokens = tokenizeRich(d.path);
    let s = 0;
    for (const qt of qTokens) {
      if (name === qt) s += 100;
      else if (name.startsWith(qt)) s += 60;
      else if (nameTokens.some((t) => t === qt)) s += 50;
      else if (nameTokens.some((t) => t.startsWith(qt))) s += 40;
      else if (name.includes(qt)) s += 25;
      else if (pathTokens.some((t) => t.startsWith(qt))) s += 15;
      else s += subsequenceScore(qt, name) * 10;
    }
    s -= Math.min(name.length, 60) * 0.1;
    return s + this.staticBoost(d.id, opts);
  }
  staticBoost(id, opts) {
    const d = this.docs.get(id);
    if (!d) return 0;
    let b = 0;
    if (opts.boostFavorites !== false && d.favorite) b += 8;
    if (opts.boostRecent !== false && d.lastUsed) {
      const ageDays = (Date.now() - d.lastUsed) / 864e5;
      b += Math.max(0, 6 - ageDays);
    }
    return b;
  }
};
function intersect(a, b) {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  const out = /* @__PURE__ */ new Set();
  for (const x of small) if (large.has(x)) out.add(x);
  return out;
}
function subsequenceScore(q, s) {
  if (!q) return 0;
  let qi = 0;
  let gaps = 0;
  let last = -1;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) {
      if (last >= 0 && i - last > 1) gaps++;
      last = i;
      qi++;
    }
  }
  if (qi < q.length) return 0;
  return Math.max(0.05, 1 - gaps / q.length);
}

// packages/core/src/presets/library.ts
var fsp4 = __toESM(require("node:fs/promises"));
var path7 = __toESM(require("node:path"));
var import_node_events2 = require("node:events");

// packages/core/src/presets/metadata-store.ts
var fsp3 = __toESM(require("node:fs/promises"));
var fs3 = __toESM(require("node:fs"));
var path5 = __toESM(require("node:path"));
var DEFAULT = { version: 1, presets: {}, ui: { view: "grid", sort: "name" } };
var MetadataStore = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  filePath;
  data = structuredClone(DEFAULT);
  saveTimer;
  dirty = false;
  async load() {
    try {
      const raw = await fsp3.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1) this.data = { ...structuredClone(DEFAULT), ...parsed, ui: { ...DEFAULT.ui, ...parsed.ui } };
    } catch {
    }
  }
  get ui() {
    return this.data.ui;
  }
  setUi(patch) {
    Object.assign(this.data.ui, patch);
    this.touch();
  }
  get(id) {
    return this.data.presets[id];
  }
  lastUsedOf(id) {
    return this.data.presets[id]?.lastUsed;
  }
  isFavorite(id) {
    return !!this.data.presets[id]?.favorite;
  }
  favorites() {
    return Object.entries(this.data.presets).filter(([, m]) => m.favorite).map(([id]) => id);
  }
  setFavorite(id, favorite, fp) {
    const m = this.data.presets[id] ??= {};
    m.favorite = favorite;
    if (fp) m.fp = fp;
    if (!favorite && !m.lastUsed && !m.customIcon && !m.tags?.length) delete this.data.presets[id];
    this.touch();
  }
  markUsed(id, fp) {
    const m = this.data.presets[id] ??= {};
    m.lastUsed = Date.now();
    m.useCount = (m.useCount ?? 0) + 1;
    if (fp) m.fp = fp;
    this.touch();
  }
  recent(limit = 20) {
    return Object.entries(this.data.presets).filter(([, m]) => m.lastUsed).map(([id, m]) => ({ id, lastUsed: m.lastUsed })).sort((a, b) => b.lastUsed - a.lastUsed).slice(0, limit);
  }
  /**
   * Re-link metadata from an orphaned id (file gone) to a new id (new file appeared) when their
   * fingerprints match. Called by the library when it observes remove+add pairs.
   */
  relink(oldId, newId) {
    const m = this.data.presets[oldId];
    if (!m || oldId === newId) return false;
    this.data.presets[newId] = { ...m, ...this.data.presets[newId] };
    delete this.data.presets[oldId];
    this.touch();
    return true;
  }
  /** Find an orphaned meta entry whose fingerprint matches (same size & mtime, any name). */
  findOrphanByFingerprint(size, mtimeMs, liveIds) {
    for (const [id, m] of Object.entries(this.data.presets)) {
      if (liveIds.has(id) || !m.fp) continue;
      if (m.fp.size === size && Math.abs(m.fp.mtimeMs - mtimeMs) < 2) return id;
    }
    return void 0;
  }
  touch() {
    this.dirty = true;
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = void 0;
      void this.save();
    }, 500);
    this.saveTimer.unref?.();
  }
  async save() {
    if (!this.dirty) return;
    this.dirty = false;
    await fsp3.mkdir(path5.dirname(this.filePath), { recursive: true });
    const tmp = this.filePath + ".tmp";
    await fsp3.writeFile(tmp, JSON.stringify(this.data, null, 2), "utf8");
    await fsp3.rename(tmp, this.filePath);
  }
  saveSync() {
    if (!this.dirty) return;
    this.dirty = false;
    fs3.mkdirSync(path5.dirname(this.filePath), { recursive: true });
    fs3.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
  }
};

// packages/core/src/shared/logger.ts
var fs4 = __toESM(require("node:fs"));
var path6 = __toESM(require("node:path"));
var LEVEL_ORDER = { debug: 10, info: 20, warn: 30, error: 40 };
var Logger = class {
  level;
  ring = [];
  ringSize;
  filePath;
  redact;
  sink;
  listeners = /* @__PURE__ */ new Set();
  constructor(opts = {}) {
    this.level = opts.level ?? "info";
    this.ringSize = opts.ringSize ?? 2e3;
    this.filePath = opts.filePath;
    this.redact = opts.redact ?? [];
    this.sink = opts.sink;
    if (this.filePath) fs4.mkdirSync(path6.dirname(this.filePath), { recursive: true });
  }
  setLevel(level) {
    this.level = level;
  }
  addRedaction(secret) {
    if (secret && !this.redact.includes(secret)) this.redact.push(secret);
  }
  onEntry(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  entries() {
    return this.ring;
  }
  child(scope) {
    return new ScopedLogger(this, scope);
  }
  log(level, scope, message, data) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;
    const entry = { ts: Date.now(), level, scope, message: this.scrub(message), data: this.scrubData(data) };
    this.ring.push(entry);
    if (this.ring.length > this.ringSize) this.ring.splice(0, this.ring.length - this.ringSize);
    const line = `[${new Date(entry.ts).toISOString()}] ${level.toUpperCase().padEnd(5)} ${scope}: ${entry.message}${entry.data !== void 0 ? " " + safeJson(entry.data) : ""}`;
    if (this.filePath) {
      try {
        fs4.appendFileSync(this.filePath, line + "\n");
      } catch {
      }
    }
    if (this.sink) this.sink(entry);
    else if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    for (const l of this.listeners) l(entry);
  }
  scrub(s) {
    let out = s;
    for (const r of this.redact) if (r) out = out.split(r).join("\xABredacted\xBB");
    return out;
  }
  scrubData(d) {
    if (d === void 0 || this.redact.length === 0) return d;
    try {
      return JSON.parse(this.scrub(JSON.stringify(d)));
    } catch {
      return d;
    }
  }
};
var ScopedLogger = class _ScopedLogger {
  constructor(root, scope) {
    this.root = root;
    this.scope = scope;
  }
  root;
  scope;
  debug(m, d) {
    this.root.log("debug", this.scope, m, d);
  }
  info(m, d) {
    this.root.log("info", this.scope, m, d);
  }
  warn(m, d) {
    this.root.log("warn", this.scope, m, d);
  }
  error(m, d) {
    this.root.log("error", this.scope, m, d);
  }
  child(sub) {
    return new _ScopedLogger(this.root, `${this.scope}/${sub}`);
  }
};
function safeJson(v) {
  try {
    return JSON.stringify(v, (_k, val) => typeof val === "bigint" ? val.toString() : val);
  } catch {
    return String(v);
  }
}
var defaultLogger = new Logger({ level: process.env.AZY_DEBUG ? "debug" : "info" });

// packages/core/src/presets/library.ts
var PresetLibrary = class extends import_node_events2.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("library");
    this.planCacheSize = opts.planCacheSize ?? 256;
    this.index = new PresetIndex(path7.join(opts.dataDir, "preset-index.json"));
    this.meta = new MetadataStore(path7.join(opts.dataDir, "preset-meta.json"));
    this.index.onChange((c) => this.onIndexChange(c));
  }
  opts;
  index;
  meta;
  search = new PresetSearch();
  watchers = /* @__PURE__ */ new Map();
  scanAborts = /* @__PURE__ */ new Map();
  scanStatus = /* @__PURE__ */ new Map();
  planCache = /* @__PURE__ */ new Map();
  log;
  planCacheSize;
  started = false;
  // ---------------------------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------------------------
  async start() {
    if (this.started) return;
    this.started = true;
    await this.meta.load();
    const restored = await this.index.load();
    this.log.info(`index ${restored ? "restored" : "empty"}: ${this.index.size} presets, ${this.index.getFolders().length} folders`);
    for (const rec of this.index.all()) this.indexForSearch(rec);
    for (const f of this.index.getFolders()) {
      void this.rescan(f.id);
      this.watch(f);
    }
  }
  async stop() {
    for (const c of this.scanAborts.values()) c.abort();
    await Promise.all([...this.watchers.values()].map((w) => w.stop()));
    this.watchers.clear();
    await this.index.save();
    await this.meta.save();
  }
  flushSync() {
    this.index.saveSync();
    this.meta.saveSync();
  }
  // ---------------------------------------------------------------------------------------------
  // Folders
  // ---------------------------------------------------------------------------------------------
  async pinFolder(folderPath, opts = {}) {
    const abs = path7.resolve(folderPath);
    const st = await fsp4.stat(abs);
    if (!st.isDirectory()) throw new Error("Not a directory");
    const id = folderIdForPath(abs);
    const existing = this.index.getFolder(id);
    if (existing) return existing;
    for (const f of this.index.getFolders()) {
      const a = normalizePath(abs);
      const b = normalizePath(f.path);
      if (a.startsWith(b + "/") || b.startsWith(a + "/")) {
        throw new Error(`"${abs}" overlaps the pinned folder "${f.path}". Unpin it first.`);
      }
    }
    const folder = {
      id,
      path: abs,
      label: opts.label ?? path7.basename(abs) ?? abs,
      icon: opts.icon,
      addedAt: Date.now(),
      order: this.index.getFolders().length
    };
    this.index.upsertFolder(folder);
    void this.rescan(id);
    this.watch(folder);
    return folder;
  }
  async unpinFolder(folderId) {
    this.scanAborts.get(folderId)?.abort();
    const w = this.watchers.get(folderId);
    if (w) {
      await w.stop();
      this.watchers.delete(folderId);
    }
    for (const rec of this.index.inFolder(folderId)) {
      this.search.remove(rec.id);
      this.planCache.delete(rec.id);
    }
    this.index.removeFolder(folderId);
    this.scanStatus.delete(folderId);
  }
  updateFolder(folderId, patch) {
    const f = this.index.getFolder(folderId);
    if (!f) return void 0;
    const next = { ...f, ...patch };
    this.index.upsertFolder(next);
    if (patch.label !== void 0) for (const rec of this.index.inFolder(folderId)) this.indexForSearch(rec);
    return next;
  }
  getFolders() {
    return this.index.getFolders().map((f) => ({
      ...f,
      count: this.index.countInFolder(f.id),
      status: this.scanStatus.get(f.id) ?? { folderId: f.id, state: "idle" }
    }));
  }
  getScanStatus(folderId) {
    return this.scanStatus.get(folderId) ?? { folderId, state: "idle" };
  }
  // ---------------------------------------------------------------------------------------------
  // Scanning / watching
  // ---------------------------------------------------------------------------------------------
  async rescan(folderId) {
    const folder = this.index.getFolder(folderId);
    if (!folder) return;
    this.scanAborts.get(folderId)?.abort();
    const ac = new AbortController();
    this.scanAborts.set(folderId, ac);
    this.setStatus(folderId, { state: "scanning" });
    const t0 = Date.now();
    try {
      const res = await scanFolder(folder.path, folderId, {
        signal: ac.signal,
        onProgress: (p) => this.setStatus(folderId, { state: "scanning", progress: p })
      });
      if (ac.signal.aborted) return;
      const seen = /* @__PURE__ */ new Set();
      let added = 0;
      let updated = 0;
      let removed = 0;
      const liveIds = /* @__PURE__ */ new Set();
      for (const rec of res.records) liveIds.add(rec.id);
      for (const rec of res.records) {
        seen.add(rec.id);
        const r = this.index.upsert(rec, { silent: true });
        if (r === "added") {
          added++;
          this.relinkMeta(rec, liveIds);
        } else if (r === "updated") updated++;
        this.indexForSearch(this.index.get(rec.id));
      }
      for (const rec of this.index.inFolder(folderId)) {
        if (!seen.has(rec.id)) {
          this.index.remove(rec.id, { silent: true });
          this.search.remove(rec.id);
          this.planCache.delete(rec.id);
          removed++;
        }
      }
      this.index.emitBulk(added, updated, removed);
      this.setStatus(folderId, { state: "idle", lastScanAt: Date.now(), progress: { dirs: res.dirs, files: res.files, presets: res.records.length } });
      this.log.info(`scanned "${folder.label}" in ${Date.now() - t0}ms: ${res.records.length} presets (+${added} ~${updated} -${removed})`, {
        errors: res.errors.length
      });
    } catch (e) {
      this.setStatus(folderId, { state: "error", error: e.message });
      this.log.error(`scan failed for "${folder.label}"`, { error: e.message });
    } finally {
      if (this.scanAborts.get(folderId) === ac) this.scanAborts.delete(folderId);
    }
  }
  watch(folder) {
    if (this.watchers.has(folder.id)) return;
    const w = new FolderWatcher(folder.path);
    w.on("event", (ev) => void this.onWatchEvent(folder, ev));
    w.on("reconcile", () => void this.rescan(folder.id));
    w.start();
    this.watchers.set(folder.id, w);
  }
  async onWatchEvent(folder, ev) {
    switch (ev.type) {
      case "add":
      case "change": {
        const rec = await statRecord(ev.path, folder.path, folder.id);
        if (!rec) return;
        const liveIds = new Set([...this.index.all()].map((r2) => r2.id));
        const r = this.index.upsert(rec);
        if (r === "added") this.relinkMeta(rec, liveIds);
        if (r !== "unchanged") {
          this.planCache.delete(rec.id);
          this.indexForSearch(this.index.get(rec.id));
        }
        break;
      }
      case "unlink": {
        const id = [...this.index.inFolder(folder.id)].find((r) => normalizePath(r.path) === normalizePath(ev.path))?.id;
        if (id) {
          this.index.remove(id);
          this.search.remove(id);
          this.planCache.delete(id);
        }
        break;
      }
      case "unlinkDir": {
        const prefix = normalizePath(ev.path) + "/";
        for (const rec of this.index.inFolder(folder.id)) {
          if (normalizePath(rec.path).startsWith(prefix)) {
            this.index.remove(rec.id);
            this.search.remove(rec.id);
            this.planCache.delete(rec.id);
          }
        }
        break;
      }
      case "error":
        this.log.warn(`watcher error on "${folder.label}", falling back to periodic rescan`, { error: ev.error.message });
        break;
    }
  }
  setStatus(folderId, patch) {
    const prev = this.scanStatus.get(folderId) ?? { folderId, state: "idle" };
    const next = { ...prev, ...patch, folderId };
    this.scanStatus.set(folderId, next);
    this.emit("scan", next);
  }
  onIndexChange(c) {
    this.emit("change", c);
  }
  indexForSearch(rec) {
    const folder = this.index.getFolder(rec.folderId);
    const m = this.meta.get(rec.id);
    this.search.upsert(this.search.fromRecord(rec, folder?.label ?? "", !!m?.favorite, m?.lastUsed ?? 0));
  }
  /** When a new file appears, try to inherit ★/lastUsed from a vanished file with the same fingerprint (rename/move). */
  relinkMeta(rec, liveIds) {
    if (this.meta.get(rec.id)) return;
    const orphan = this.meta.findOrphanByFingerprint(rec.size, rec.mtimeMs, liveIds);
    if (orphan && this.meta.relink(orphan, rec.id)) {
      this.log.debug(`re-linked metadata ${orphan} \u2192 ${rec.id} (${rec.name})`);
      try { process.emit("azy:preset-relink", { from: orphan, to: rec.id, name: rec.name }); } catch {} // Dagger pins follow (v1.19)
    }
  }
  // ---------------------------------------------------------------------------------------------
  // Browsing
  // ---------------------------------------------------------------------------------------------
  browse(folderId, relDir = "") {
    const folder = this.index.getFolder(folderId);
    if (!folder) return void 0;
    const rel = relDir.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const all = this.index.inFolder(folderId);
    const prefix = rel ? rel + "/" : "";
    const direct = [];
    const subCounts = /* @__PURE__ */ new Map();
    let totalInScope = 0;
    for (const rec of all) {
      const inScope = rel === "" ? true : rec.relDir === rel || rec.relDir.startsWith(prefix);
      if (!inScope) continue;
      totalInScope++;
      if (rec.relDir === rel) direct.push(this.view(rec, folder));
      else {
        const rest = rec.relDir.slice(prefix.length);
        const first = rest.split("/")[0];
        subCounts.set(first, (subCounts.get(first) ?? 0) + 1);
      }
    }
    direct.sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" }));
    const subfolders = [...subCounts.entries()].map(([name, count]) => ({ name, relDir: prefix + name, count })).sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" }));
    const crumbs = [{ label: folder.label, relDir: "" }];
    if (rel) {
      const parts = rel.split("/");
      for (let i = 0; i < parts.length; i++) crumbs.push({ label: parts[i], relDir: parts.slice(0, i + 1).join("/") });
    }
    return { folder, relDir: rel, breadcrumb: crumbs, subfolders, presets: direct, totalInScope };
  }
  view(rec, folder = this.index.getFolder(rec.folderId)) {
    const m = this.meta.get(rec.id);
    const label = folder?.label ?? "";
    return {
      ...rec,
      favorite: !!m?.favorite,
      lastUsed: m?.lastUsed,
      folderLabel: label,
      displayPath: rec.relDir ? `${label} / ${rec.relDir.split("/").join(" / ")}` : label
    };
  }
  get(id) {
    const rec = this.index.get(id);
    return rec ? this.view(rec) : void 0;
  }
  searchPresets(query, scope = {}, limit = 200) {
    let within;
    if (scope.folderId || scope.favoritesOnly) {
      within = /* @__PURE__ */ new Set();
      const pool = scope.folderId ? this.index.inFolder(scope.folderId) : [...this.index.all()];
      const rel = (scope.relDir ?? "").replace(/^\/+|\/+$/g, "");
      for (const rec of pool) {
        if (rel && !(rec.relDir === rel || rec.relDir.startsWith(rel + "/"))) continue;
        if (scope.favoritesOnly && !this.meta.isFavorite(rec.id)) continue;
        within.add(rec.id);
      }
    }
    return this.search.search(query, { limit, within }).map((h) => this.index.get(h.id)).filter((r) => !!r).map((r) => this.view(r));
  }
  favorites() {
    return this.meta.favorites().map((id) => this.index.get(id)).filter((r) => !!r).map((r) => this.view(r));
  }
  recent(limit = 20) {
    return this.meta.recent(limit).map(({ id }) => this.index.get(id)).filter((r) => !!r).map((r) => this.view(r));
  }
  setFavorite(id, favorite) {
    const rec = this.index.get(id);
    if (!rec) return void 0;
    this.meta.setFavorite(id, favorite, { name: rec.name, size: rec.size, mtimeMs: rec.mtimeMs });
    this.indexForSearch(rec);
    const v = this.view(rec);
    this.emit("change", { type: "updated", preset: rec, previous: rec });
    return v;
  }
  markUsed(id) {
    const rec = this.index.get(id);
    if (!rec) return;
    this.meta.markUsed(id, { name: rec.name, size: rec.size, mtimeMs: rec.mtimeMs });
    this.indexForSearch(rec);
  }
  // ---------------------------------------------------------------------------------------------
  // Plans (lazy parse)
  // ---------------------------------------------------------------------------------------------
  async getPlan(id) {
    const rec = this.index.get(id);
    if (!rec) throw new Error("Unknown preset");
    const cached = this.planCache.get(id);
    if (cached && cached.mtimeMs === rec.mtimeMs) return cached.plan;
    try {
      const plan = await parsePrfpsetFile(rec.path, rec.id);
      this.planCache.set(id, { mtimeMs: rec.mtimeMs, plan });
      if (this.planCache.size > this.planCacheSize) {
        const first = this.planCache.keys().next().value;
        if (first) this.planCache.delete(first);
      }
      const medias = new Set(plan.effects.map((e) => e.media));
      this.index.setParsed(id, {
        at: Date.now(),
        mtimeMs: rec.mtimeMs,
        effectCount: plan.effects.length,
        effectNames: plan.effects.map((e) => e.displayName),
        media: medias.size > 1 ? "mixed" : medias.has("audio") ? "audio" : "video",
        valid: true
      });
      return plan;
    } catch (e) {
      const msg = e instanceof PrfpsetParseError ? e.message : e.message;
      this.index.setParsed(id, { at: Date.now(), mtimeMs: rec.mtimeMs, effectCount: 0, effectNames: [], media: "video", valid: false, error: msg });
      throw e;
    }
  }
  // ---------------------------------------------------------------------------------------------
  // File operations (explicit, confirmed by the UI layer)
  // ---------------------------------------------------------------------------------------------
  /** Rename the actual file. Caller must have confirmed with the user. */
  async renameFile(id, newBaseName) {
    const rec = this.index.get(id);
    if (!rec) throw new Error("Unknown preset");
    let name = newBaseName.trim();
    if (!name) throw new Error("Empty name");
    if (/[<>:"/\\|?*\u0000-\u001f]/.test(name)) throw new Error("Name contains characters that aren't allowed in file names");
    if (!isPrfpsetName(name)) name += ".prfpset";
    const dest = path7.join(path7.dirname(rec.path), name);
    if (normalizePath(dest) === normalizePath(rec.path)) return this.view(rec);
    try {
      await fsp4.access(dest);
      throw new Error("A preset with that name already exists");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    await fsp4.rename(rec.path, dest);
    const folder = this.index.getFolder(rec.folderId);
    const fresh = await statRecord(dest, folder.path, folder.id);
    if (!fresh) throw new Error("Rename succeeded but the file could not be read back");
    this.meta.relink(rec.id, fresh.id);
    try { process.emit("azy:preset-relink", { from: rec.id, to: fresh.id, name: fresh.name }); } catch {} // Dagger pins follow the rename (v1.19)
    this.index.remove(rec.id);
    this.search.remove(rec.id);
    this.planCache.delete(rec.id);
    this.index.upsert(fresh);
    this.indexForSearch(fresh);
    return this.view(fresh);
  }
  /** Remove a single preset from Azy's index only. It will re-appear on the next rescan unless the file is gone. */
  removeFromIndex(id) {
    const rec = this.index.remove(id);
    if (!rec) return false;
    this.search.remove(id);
    this.planCache.delete(id);
    return true;
  }
  /** Permanently delete the file. Caller MUST have shown an explicit confirmation. Prefer moving to trash in Electron (shell.trashItem). */
  async deleteFile(id, deleter = (p) => fsp4.unlink(p)) {
    const rec = this.index.get(id);
    if (!rec) throw new Error("Unknown preset");
    await deleter(rec.path);
    this.removeFromIndex(id);
  }
  /** Utility for "Copy path" / "Show in Explorer". */
  pathOf(id) {
    return this.index.get(id)?.path;
  }
  relDirOfPath(folderId, absPath) {
    const f = this.index.getFolder(folderId);
    return f ? toRel(f.path, path7.dirname(absPath)) : void 0;
  }
};

// packages/core/src/presets/premiere-presets.ts
var fsp5 = __toESM(require("node:fs/promises"));
var fs5 = __toESM(require("node:fs"));
var os = __toESM(require("node:os"));
var path8 = __toESM(require("node:path"));
var import_node_events3 = require("node:events");
var PREMIERE_PRESETS_FILE = "Effect Presets and Custom Items.prfpset";
var PremierePresetsSource = class _PremierePresetsSource extends import_node_events3.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("ppro-presets");
    this.stateFile = path8.join(opts.dataDir, "premiere-sources.json");
  }
  opts;
  loaded = /* @__PURE__ */ new Map();
  watchers = /* @__PURE__ */ new Map();
  reloadTimers = /* @__PURE__ */ new Map();
  pinnedIds = /* @__PURE__ */ new Set();
  log;
  stateFile;
  // ---- lifecycle --------------------------------------------------------------------------------
  async start() {
    await fsp5.mkdir(this.opts.dataDir, { recursive: true });
    try {
      const st = JSON.parse(await fsp5.readFile(this.stateFile, "utf8"));
      for (const id of st.pinned ?? []) this.pinnedIds.add(id);
    } catch {
    }
    await this.discover();
  }
  async stop() {
    for (const w of this.watchers.values()) w.close();
    this.watchers.clear();
    for (const t of this.reloadTimers.values()) clearTimeout(t);
  }
  persist() {
    fs5.writeFileSync(this.stateFile, JSON.stringify({ pinned: [...this.pinnedIds] }, null, 2));
  }
  // ---- discovery --------------------------------------------------------------------------------
  /** Candidate "Documents" folders (Windows may redirect Documents to OneDrive). */
  static documentsDirs() {
    const home = os.homedir();
    const c = [path8.join(home, "Documents"), path8.join(home, "OneDrive", "Documents"), path8.join(home, "OneDrive - Personal", "Documents")];
    if (process.env.OneDrive) c.push(path8.join(process.env.OneDrive, "Documents"));
    return [...new Set(c)];
  }
  /** Find every profile presets file on this machine. Cheap: a few readdirs. */
  async discover() {
    const roots = this.opts.documentsDirs ?? _PremierePresetsSource.documentsDirs();
    const found = [];
    for (const docs of roots) {
      const base = path8.join(docs, "Adobe", "Premiere Pro");
      let versions = [];
      try {
        versions = (await fsp5.readdir(base, { withFileTypes: true })).filter((d) => d.isDirectory() && /^\d+(\.\d+)?$/.test(d.name)).map((d) => d.name);
      } catch {
        continue;
      }
      for (const v of versions) {
        let profiles = [];
        try {
          profiles = (await fsp5.readdir(path8.join(base, v), { withFileTypes: true })).filter((d) => d.isDirectory() && d.name.startsWith("Profile-")).map((d) => d.name);
        } catch {
          continue;
        }
        for (const p of profiles) {
          const f = path8.join(base, v, p, PREMIERE_PRESETS_FILE);
          try {
            await fsp5.access(f);
            found.push(f);
          } catch {
          }
        }
      }
    }
    found.sort((a, b) => versionOf(b).localeCompare(versionOf(a), void 0, { numeric: true }));
    for (const f of found) await this.load(f);
    for (const [id, l] of this.loaded) if (!found.includes(l.source.path)) this.forget(id);
    this.emit("change");
    return this.sources();
  }
  /** Add a presets file by explicit path (e.g. picked from a dialog or a non-standard Documents location). */
  async addFile(filePath) {
    const abs = path8.resolve(filePath);
    const l = await this.load(abs);
    this.pinnedIds.add(l.source.id);
    this.persist();
    this.emit("change");
    return l.source;
  }
  async load(filePath) {
    const id = "ppro_" + folderIdForPath(filePath);
    const stat5 = await fsp5.stat(filePath);
    const src = {
      id,
      path: filePath,
      version: versionOf(filePath),
      profile: profileOf(filePath),
      label: `${versionOf(filePath)} \xB7 ${profileOf(filePath).replace(/^Profile-/, "")}`,
      mtimeMs: stat5.mtimeMs,
      count: 0,
      pinned: this.pinnedIds.has(id)
    };
    let entries = [];
    if (stat5.size > MAX_PRFPSET_BYTES) src.error = `File too large (${Math.round(stat5.size / 1e6)} MB)`;
    else {
      try {
        const xml = await fsp5.readFile(filePath, "utf8");
        const r = parsePrfpsetAll(xml, id);
        entries = r.entries;
        src.count = entries.length;
        if (r.errors.length) this.log.warn(`${r.errors.length} preset(s) skipped in ${path8.basename(path8.dirname(filePath))}`, { errors: r.errors.slice(0, 5) });
      } catch (e) {
        src.error = e.message;
        this.log.warn(`cannot read Premiere presets: ${src.error}`, { path: filePath });
      }
    }
    this.loaded.set(id, { source: src, entries });
    this.watch(id, filePath);
    this.log.info(`Premiere presets: ${src.label} \u2192 ${src.count} preset(s)`);
    return this.loaded.get(id);
  }
  watch(id, filePath) {
    if (this.watchers.has(id)) return;
    try {
      const w = fs5.watch(path8.dirname(filePath), (_ev, name) => {
        if (name && name !== PREMIERE_PRESETS_FILE) return;
        clearTimeout(this.reloadTimers.get(id));
        this.reloadTimers.set(id, setTimeout(() => void this.reload(id), 800));
      });
      w.on("error", () => this.watchers.delete(id));
      this.watchers.set(id, w);
    } catch (e) {
      this.log.debug("watch failed", { error: e.message });
    }
  }
  async reload(id) {
    const l = this.loaded.get(id);
    if (!l) return;
    try {
      const st = await fsp5.stat(l.source.path);
      if (st.mtimeMs === l.source.mtimeMs) return;
      await this.load(l.source.path);
      this.emit("change");
      this.log.info(`Premiere presets reloaded (${l.source.label})`);
    } catch {
      this.forget(id);
      this.emit("change");
    }
  }
  forget(id) {
    this.loaded.delete(id);
    this.watchers.get(id)?.close();
    this.watchers.delete(id);
  }
  // ---- queries ----------------------------------------------------------------------------------
  sources() {
    return [...this.loaded.values()].map((l) => ({ ...l.source, pinned: this.pinnedIds.has(l.source.id) }));
  }
  setPinned(sourceId, pinned) {
    if (!this.loaded.has(sourceId)) return void 0;
    if (pinned) this.pinnedIds.add(sourceId);
    else this.pinnedIds.delete(sourceId);
    this.persist();
    this.emit("change");
    return this.sources().find((s) => s.id === sourceId);
  }
  browse(sourceId, binPath = []) {
    const l = this.loaded.get(sourceId);
    if (!l) return void 0;
    const inScope = l.entries.filter((e) => startsWith(e.binPath, binPath));
    const direct = inScope.filter((e) => e.binPath.length === binPath.length);
    const bins = /* @__PURE__ */ new Map();
    for (const e of inScope) if (e.binPath.length > binPath.length) bins.set(e.binPath[binPath.length], (bins.get(e.binPath[binPath.length]) ?? 0) + 1);
    return {
      source: { ...l.source, pinned: this.pinnedIds.has(sourceId) },
      binPath,
      bins: [...bins].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
      presets: direct.map((e) => this.view(l, e)).sort((a, b) => a.name.localeCompare(b.name)),
      total: inScope.length
    };
  }
  search(query, sourceId, limit = 200) {
    const q = query.trim().toLowerCase();
    const out = [];
    for (const l of this.loaded.values()) {
      if (sourceId && l.source.id !== sourceId) continue;
      for (const e of l.entries) {
        if (!q || e.name.toLowerCase().includes(q) || e.binPath.some((b) => b.toLowerCase().includes(q)) || e.plan.effects.some((f) => f.displayName.toLowerCase().includes(q))) {
          out.push(this.view(l, e));
          if (out.length >= limit) return out;
        }
      }
    }
    return out;
  }
  get(id) {
    const hit = this.locate(id);
    return hit ? this.view(hit.l, hit.e) : void 0;
  }
  getPlan(id) {
    return this.locate(id)?.e.plan;
  }
  static isPremiereId(id) {
    return id.startsWith("ppro_") && id.includes("#");
  }
  locate(id) {
    const hash = id.indexOf("#");
    if (hash < 0) return void 0;
    const l = this.loaded.get(id.slice(0, hash));
    const e = l?.entries[Number(id.slice(hash + 1))];
    return l && e ? { l, e } : void 0;
  }
  view(l, e) {
    const id = e.plan.presetId;
    const medias = new Set(e.plan.effects.map((f) => f.media));
    return {
      id,
      sourceId: l.source.id,
      index: e.index,
      name: e.name,
      binPath: e.binPath,
      effectCount: e.plan.effects.length,
      effectNames: e.plan.effects.map((f) => f.displayName),
      media: medias.size > 1 ? "mixed" : medias.values().next().value ?? "video",
      favorite: this.opts.isFavorite?.(id) ?? false,
      lastUsed: this.opts.lastUsed?.(id),
      warnings: e.plan.warnings.length
    };
  }
};
function versionOf(p) {
  const m = p.replace(/\\/g, "/").match(/Premiere Pro\/(\d+(?:\.\d+)?)\//);
  return m?.[1] ?? "?";
}
function profileOf(p) {
  return path8.basename(path8.dirname(p));
}
function startsWith(a, prefix) {
  return prefix.every((s, i) => a[i] === s);
}

// packages/core/src/bridge/server.ts
var http = __toESM(require("node:http"));
var fs6 = __toESM(require("node:fs"));
var fsp6 = __toESM(require("node:fs/promises"));
var path9 = __toESM(require("node:path"));
var net = __toESM(require("node:net"));
var import_node_crypto2 = require("node:crypto");
var import_node_events4 = require("node:events");

// node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);

// packages/core/src/bridge/server.ts
var BridgeServer = class extends import_node_events4.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("bridge");
    this.requestTimeoutMs = opts.requestTimeoutMs ?? 15e3;
  }
  opts;
  wss;
  httpServers = [];
  socket;
  peer;
  pending = /* @__PURE__ */ new Map();
  tokens = /* @__PURE__ */ new Set();
  // sha256 hex of accepted tokens
  pairing;
  heartbeat;
  log;
  requestTimeoutMs;
  port = 0;
  inbound = {};
  /**
   * Optional plain-HTTP handler on the same loopback port (used to serve Azy's panel UI to the
   * Premiere WebView). Return true when the request was handled; otherwise 426 is sent.
   */
  httpHandler;
  /**
   * Zero-code pairing. When this returns true (e.g. Azy's own panel is currently open inside
   * Premiere, which proves the user has both apps in front of them), a connector on loopback may
   * pair with the literal code "auto" instead of a typed 6-digit code.
   */
  autoPairAllowed;
  /**
   * Zero-code pairing #2: a connector that can read Azy's per-user, user-only bridge files (the CEP
   * extension runs as the same OS user) presents the per-run local secret from panel.json instead of
   * a typed code. Installed by the panel host, which owns that secret.
   */
  localPairSecretValid;
  // ---------------------------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------------------------
  async start() {
    await fsp6.mkdir(this.opts.dataDir, { recursive: true });
    await this.loadTokens();
    const range = this.opts.portRange ?? DEFAULT_PORT_RANGE;
    this.port = await findFreePort(range.start, range.end);
    this.wss = new import_websocket_server.default({
      noServer: true,
      maxPayload: MAX_FRAME_BYTES,
      perMessageDeflate: false,
      // UXP's WebSocket constructor requires a sub-protocol; accept ours (or none).
      handleProtocols: (protocols) => protocols.has(WS_SUBPROTOCOL) ? WS_SUBPROTOCOL : protocols.values().next().value ?? false
    });
    const wss = this.wss;
    const onUpgrade = (req, socket, head) => {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
    };
    const makeHttp = () => {
      const h = http.createServer((req, res) => {
        const fallback = () => {
          if (!res.headersSent) {
            res.writeHead(426, { "content-type": "text/plain" });
            res.end("Azy bridge: WebSocket upgrade required");
          }
        };
        if (!this.httpHandler || !isLoopback(req.socket.remoteAddress ?? "")) return fallback();
        Promise.resolve().then(() => this.httpHandler(req, res)).then((handled) => {
          if (!handled) fallback();
        }).catch((e) => {
          this.log.warn("http handler failed", { error: e.message });
          if (!res.headersSent) {
            res.writeHead(500);
            res.end("error");
          }
        });
      });
      h.on("upgrade", onUpgrade);
      return h;
    };
    this.httpServers = [];
    for (const host of ["127.0.0.1", "::1"]) {
      const h = makeHttp();
      try {
        await new Promise((resolve5, reject) => {
          h.once("error", reject);
          h.listen({ host, port: this.port, exclusive: true }, () => resolve5());
        });
        this.httpServers.push(h);
      } catch (e) {
        if (host === "127.0.0.1") throw e;
        this.log.debug("IPv6 loopback listener unavailable", { error: e.message });
      }
    }
    this.wss.on("connection", (ws, req) => {
      const remote = req.socket.remoteAddress ?? "";
      if (!isLoopback(remote)) {
        this.log.warn("rejected non-loopback connection", { remote });
        ws.close(1008, "loopback only");
        return;
      }
      this.handleSocket(ws);
    });
    this.wss.on("error", (e) => this.log.error("server error", { error: e.message }));
    await this.writeDiscovery();
    this.heartbeat = setInterval(() => this.tick(), 5e3);
    this.heartbeat.unref?.();
    this.log.info(`listening on ws://127.0.0.1:${this.port}`);
    return this.port;
  }
  async stop() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = void 0;
    try {
      this.sendEvt("shutdown", { reason: "azy-quit" });
    } catch {
    }
    this.socket?.close(1001, "shutdown");
    this.socket = void 0;
    this.peer = void 0;
    for (const [id, p] of this.pending) {
      clearTimeout(p.timer);
      p.reject(new Error("bridge stopped"));
      this.pending.delete(id);
    }
    await new Promise((r) => this.wss ? this.wss.close(() => r()) : r());
    this.wss = void 0;
    await Promise.all(this.httpServers.map((h) => new Promise((r) => h.close(() => r()))));
    this.httpServers = [];
    await fsp6.rm(this.discoveryPath, { force: true }).catch(() => void 0);
  }
  get connected() {
    return !!this.socket && this.socket.readyState === import_websocket.default.OPEN && !!this.peer;
  }
  get connectedPeer() {
    return this.peer;
  }
  /** Active pairing code (if any) for UI display. */
  get activePairing() {
    if (this.pairing && this.pairing.expiresAt > Date.now()) return this.pairing;
    return void 0;
  }
  // ---------------------------------------------------------------------------------------------
  // Pairing
  // ---------------------------------------------------------------------------------------------
  /** Returns the current (or a fresh) pairing code for the UI to display. */
  beginPairing() {
    const ttl = this.opts.pairingTtlMs ?? 10 * 6e4;
    const fixed = this.opts.devPairingCode ?? process.env.AZY_BRIDGE_PAIR_CODE;
    if (!this.pairing || this.pairing.expiresAt < Date.now()) {
      this.pairing = { code: fixed ?? newPairingCode(), expiresAt: Date.now() + ttl };
      this.emit("pairing", { ...this.pairing, port: this.port });
    }
    return { ...this.pairing, port: this.port };
  }
  cancelPairing() {
    this.pairing = void 0;
  }
  async forgetAllTokens() {
    this.tokens.clear();
    await this.saveTokens();
    this.socket?.close(1008, "tokens revoked");
  }
  // ---------------------------------------------------------------------------------------------
  // Outbound requests / events
  // ---------------------------------------------------------------------------------------------
  async request(type, payload, timeoutMs = this.requestTimeoutMs) {
    if (!this.connected || !this.socket) {
      throw structured(ErrorCodes.CONNECTOR_NOT_CONNECTED);
    }
    const id = newRequestId();
    const frame = makeReq(id, type, payload);
    return new Promise((resolve5, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(structured(ErrorCodes.IPC_TIMEOUT, `Premiere didn't respond to "${type}" within ${timeoutMs}ms`));
      }, timeoutMs);
      timer.unref?.();
      this.pending.set(id, { resolve: resolve5, reject, timer, type });
      this.socket.send(JSON.stringify(frame), (err2) => {
        if (err2) {
          clearTimeout(timer);
          this.pending.delete(id);
          reject(structured(ErrorCodes.CONNECTION_LOST, err2.message));
        }
      });
      this.log.debug(`\u2192 ${type}`, redactPayload(type, payload));
    });
  }
  /** True when `token` is one of the paired connector tokens (used by the HTTP panel endpoints). */
  hasToken(token) {
    return !!token && this.tokens.has(hashToken(token));
  }
  sendEvt(name, payload) {
    if (!this.connected || !this.socket) return false;
    this.socket.send(JSON.stringify(makeEvt(name, payload)));
    return true;
  }
  // ---------------------------------------------------------------------------------------------
  // Socket handling
  // ---------------------------------------------------------------------------------------------
  /**
   * Reverse link: Azy dialled INTO the panel (see connector/src/reverse-link.ts). The socket is
   * driven exactly like an inbound one — same auth timer, hello/pair, heartbeat, replacement.
   */
  adoptOutboundSocket(ws) {
    this.handleSocket(ws);
  }
  handleSocket(ws) {
    let authed = false;
    // Azy v1.22: sockets still in their hello/pair handshake. The reverse dialer waits while one is in
    // flight instead of opening a second link that would replace it a moment later (link churn).
    let counted = true;
    this.authPending = (this.authPending || 0) + 1;
    const settle = () => { if (counted) { counted = false; this.authPending = Math.max(0, (this.authPending || 1) - 1); } };
    const authTimer = setTimeout(() => {
      if (!authed) ws.close(1008, "auth timeout");
    }, 1e4);
    authTimer.unref?.();
    ws.on("message", (data, isBinary) => {
      if (isBinary) return;
      let frame;
      try {
        frame = JSON.parse(data.toString("utf8"));
      } catch {
        ws.close(1003, "invalid json");
        return;
      }
      if (!isFrame(frame)) {
        ws.close(1003, "invalid frame");
        return;
      }
      if (!authed) {
        this.log.debug(`auth frame: ${frame.kind}`);
        authed = this.handleAuth(ws, frame);
        if (authed) { clearTimeout(authTimer); settle(); }
        return;
      }
      if (ws !== this.socket) return;
      void this.handleFrame(frame);
    });
    ws.on("close", (code, reason) => {
      clearTimeout(authTimer);
      settle();
      if (ws === this.socket) {
        const peer = this.peer;
        this.socket = void 0;
        this.peer = void 0;
        for (const [id, p] of this.pending) {
          clearTimeout(p.timer);
          p.reject(structured(ErrorCodes.CONNECTION_LOST, `connection closed during "${p.type}"`));
          this.pending.delete(id);
        }
        this.log.info("connector disconnected", { code, reason: reason.toString() });
        this.emit("disconnected", { code, reason: reason.toString(), peer });
      }
    });
    ws.on("error", (e) => this.log.debug("socket error", { error: e.message }));
  }
  handleAuth(ws, frame) {
    if (frame.kind === "hello") {
      if (!this.tokens.has(hashToken(frame.token))) {
        this.sendRaw(ws, { protocol: PROTOCOL_VERSION, kind: "reject", error: structuredObj(ErrorCodes.UNAUTHORIZED, "Unknown token \u2014 pair again from the Azy panel") });
        ws.close(1008, "unauthorized");
        return false;
      }
      this.acceptPeer(ws, frame.connector, frame.host, frame.capabilities);
      return true;
    }
    if (frame.kind === "pair") {
      const p = this.pairing;
      const code = String(frame.code ?? "");
      const auto = code === "auto" && !!this.autoPairAllowed?.();
      const local = !auto && code.length >= 20 && !!this.localPairSecretValid?.(code);
      const ok = auto || local || p && p.expiresAt > Date.now() && safeEqual(p.code, code);
      if (!ok) {
        this.sendRaw(ws, { protocol: PROTOCOL_VERSION, kind: "reject", error: structuredObj(ErrorCodes.UNAUTHORIZED, "Invalid or expired pairing code") });
        ws.close(1008, "bad pairing code");
        return false;
      }
      const token = newToken();
      this.tokens.add(hashToken(token));
      void this.saveTokens();
      if (auto) this.log.info("auto-paired connector (Azy panel open in Premiere)");
      if (local) this.log.info("auto-paired connector (local per-user secret)");
      defaultLogger.addRedaction(token);
      this.sendRaw(ws, { protocol: PROTOCOL_VERSION, kind: "paired", token });
      this.log.info("paired new connector", { pluginId: frame.connector?.pluginId, host: frame.host?.version });
      this.emit("paired", { connector: frame.connector, host: frame.host });
      return false;
    }
    this.sendRaw(ws, { protocol: PROTOCOL_VERSION, kind: "reject", error: structuredObj(ErrorCodes.UNAUTHORIZED, "Expected hello or pair") });
    ws.close(1008, "expected auth");
    return false;
  }
  acceptPeer(ws, connector, host, capabilities) {
    this.pairing = void 0;
    if (this.socket && this.socket !== ws) {
      this.log.info("replacing existing connector session");
      this.socket.close(1e3, "replaced by newer connection");
    }
    this.socket = ws;
    this.peer = {
      sessionId: newRequestId(),
      connector,
      host,
      capabilities,
      connectedAt: Date.now(),
      lastSeen: Date.now()
    };
    this.sendRaw(ws, {
      protocol: PROTOCOL_VERSION,
      kind: "welcome",
      sessionId: this.peer.sessionId,
      azy: { version: this.opts.azyVersion, name: "Azy" },
      serverTime: Date.now()
    });
    this.log.info("connector connected", { host: `${host.app} ${host.version}`, connector: connector.version, flavor: connector.flavor });
    this.emit("connected", this.peer);
  }
  async handleFrame(frame) {
    if (this.peer) this.peer.lastSeen = Date.now();
    switch (frame.kind) {
      case "res": {
        const p = this.pending.get(frame.id);
        if (!p) return;
        clearTimeout(p.timer);
        this.pending.delete(frame.id);
        if (frame.ok) {
          this.log.debug(`\u2190 ${p.type} ok`);
          p.resolve(frame.result);
        } else {
          this.log.debug(`\u2190 ${p.type} error`, frame.error);
          p.reject(structuredFrom(frame.error));
        }
        return;
      }
      case "req": {
        await this.handleInbound(frame);
        return;
      }
      case "evt": {
        this.emit("event", frame.name, frame.payload);
        this.emit(`evt:${frame.name}`, frame.payload);
        return;
      }
      default:
        return;
    }
  }
  async handleInbound(frame) {
    const handler = this.inbound[frame.type];
    if (frame.type === "ping") {
      this.sendRaw(this.socket, makeRes(frame.id, { t: frame.payload.t, rt: Date.now() }));
      return;
    }
    if (!handler || !this.peer) {
      this.sendRaw(this.socket, makeErrRes(frame.id, structuredObj(ErrorCodes.UNSUPPORTED_COMMAND, `Azy does not handle "${frame.type}"`)));
      return;
    }
    try {
      const result = await handler(frame.payload, this.peer);
      this.sendRaw(this.socket, makeRes(frame.id, result));
    } catch (e) {
      this.sendRaw(this.socket, makeErrRes(frame.id, structuredFrom(e).toStructured()));
    }
  }
  tick() {
    if (!this.connected) return;
    this.request("ping", { t: Date.now() }, 4e3).catch(() => {
      this.log.warn("heartbeat failed, dropping connector");
      this.socket?.terminate();
    });
  }
  sendRaw(ws, obj) {
    if (ws.readyState === import_websocket.default.OPEN) ws.send(JSON.stringify(obj));
  }
  // ---------------------------------------------------------------------------------------------
  // Discovery + tokens
  // ---------------------------------------------------------------------------------------------
  get discoveryPath() {
    return path9.join(this.opts.dataDir, "bridge.json");
  }
  get tokensPath() {
    return path9.join(this.opts.dataDir, "tokens.json");
  }
  async writeDiscovery() {
    const info = { protocol: PROTOCOL_VERSION, port: this.port, pid: process.pid, startedAt: Date.now(), azyVersion: this.opts.azyVersion };
    await fsp6.writeFile(this.discoveryPath, JSON.stringify(info, null, 2), "utf8");
  }
  async loadTokens() {
    try {
      const raw = await fsp6.readFile(this.tokensPath, "utf8");
      const arr = JSON.parse(raw);
      for (const h of arr) if (typeof h === "string" && h.length === 64) this.tokens.add(h);
    } catch {
    }
  }
  async saveTokens() {
    const tmp = this.tokensPath + ".tmp";
    await fsp6.writeFile(tmp, JSON.stringify([...this.tokens]), "utf8");
    await fsp6.rename(tmp, this.tokensPath);
  }
};
var BridgeError = class extends Error {
  constructor(structured2) {
    super(structured2.message);
    this.structured = structured2;
    this.name = "BridgeError";
  }
  structured;
  get code() {
    return this.structured.code;
  }
  toStructured() {
    return this.structured;
  }
};
function structuredObj(code, message) {
  return { code, message: message ?? DefaultErrorMessages[code] };
}
function structured(code, message) {
  return new BridgeError(structuredObj(code, message));
}
function structuredFrom(e) {
  if (e instanceof BridgeError) return e;
  if (e && typeof e === "object" && typeof e.code === "string") {
    const s = e;
    return new BridgeError({ code: s.code, message: s.message, details: s.details });
  }
  return structured(ErrorCodes.INTERNAL_ERROR, e instanceof Error ? e.message : String(e));
}
function hashToken(t) {
  return (0, import_node_crypto2.createHash)("sha256").update(t).digest("hex");
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function isLoopback(addr) {
  return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1" || addr.startsWith("127.");
}
function redactPayload(type, payload) {
  if (type === "applyPreset") {
    const p = payload;
    return { operationId: p.operationId, preset: p.plan?.name, effects: p.plan?.effects?.length, target: p.target };
  }
  return payload;
}
async function findFreePort(start, end) {
  for (let port = start; port <= end; port++) {
    const free = await new Promise((resolve5) => {
      const srv = net.createServer();
      srv.once("error", () => resolve5(false));
      srv.listen({ host: "127.0.0.1", port, exclusive: true }, () => srv.close(() => resolve5(true)));
    });
    if (free) return port;
  }
  throw new Error(`No free port in ${start}-${end}`);
}
function readDiscovery(dataDir) {
  try {
    return JSON.parse(fs6.readFileSync(path9.join(dataDir, "bridge.json"), "utf8"));
  } catch {
    return void 0;
  }
}

// packages/core/src/bridge/connector.ts
var import_node_events5 = require("node:events");

// packages/core/src/bridge/premiere-process.ts
var import_node_child_process = require("node:child_process");
var path10 = __toESM(require("node:path"));
var import_node_util = require("node:util");
var execFileP = (0, import_node_util.promisify)(import_node_child_process.execFile);
var WIN_IMAGE_RE = /^"(Adobe Premiere Pro( \(Beta\))?\.exe)","(\d+)"/i;
function parseTasklistCsv(stdout) {
  const out = [];
  for (const raw of stdout.split(/\r?\n/)) {
    const m = WIN_IMAGE_RE.exec(raw.trim());
    if (m) out.push({ imageName: m[1], pid: Number(m[3]), beta: Boolean(m[2]) });
  }
  return out;
}
function versionFromExePath(exePath) {
  const m = /Adobe Premiere Pro(?: \(Beta\))? (\d{4})/i.exec(exePath);
  return m ? `${Number(m[1]) - 2e3}.x` : void 0;
}
async function detectPremiere() {
  if (process.platform === "win32") return detectWindows();
  if (process.platform === "darwin") return detectMac();
  return { running: false, pids: [] };
}
var exePathCache = /* @__PURE__ */ new Map();
function tasklistPath() {
  const root = process.env.SystemRoot ?? process.env.windir;
  return root ? path10.join(root, "System32", "tasklist.exe") : "tasklist";
}
async function detectWindows() {
  let stdout;
  try {
    ({ stdout } = await execFileP(tasklistPath(), ["/FO", "CSV", "/NH"], { windowsHide: true, timeout: 8e3, maxBuffer: 8 * 1024 * 1024 }));
  } catch (e) {
    try {
      ({ stdout } = await execFileP("tasklist", ["/FO", "CSV", "/NH"], { windowsHide: true, timeout: 8e3, maxBuffer: 8 * 1024 * 1024 }));
    } catch (e2) {
      return { running: false, pids: [], error: `tasklist failed: ${e2.message || e.message}` };
    }
  }
  const procs = parseTasklistCsv(stdout);
  if (procs.length === 0) return { running: false, pids: [] };
  procs.sort((a, b) => Number(a.beta) - Number(b.beta));
  const primary = procs[0];
  const info = { running: true, pids: procs.map((p) => p.pid), imageName: primary.imageName, beta: primary.beta };
  if (!exePathCache.has(primary.pid)) {
    exePathCache.set(primary.pid, null);
    try {
      const ps = `(Get-Process -Id ${primary.pid} -ErrorAction Stop).Path`;
      const { stdout: p } = await execFileP("powershell", ["-NoProfile", "-NonInteractive", "-Command", ps], { windowsHide: true, timeout: 8e3 });
      const exePath2 = p.trim();
      if (exePath2) exePathCache.set(primary.pid, exePath2);
    } catch {
    }
    if (exePathCache.size > 32) exePathCache.delete(exePathCache.keys().next().value);
  }
  const exePath = exePathCache.get(primary.pid);
  if (exePath) {
    info.exePath = exePath;
    info.version = versionFromExePath(exePath);
  }
  return info;
}
async function detectMac() {
  try {
    const { stdout } = await execFileP("pgrep", ["-f", "Adobe Premiere Pro"], { timeout: 4e3 });
    const pids = stdout.split(/\n/).map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
    return { running: pids.length > 0, pids };
  } catch {
    return { running: false, pids: [] };
  }
}
var PremiereProcessMonitor = class {
  constructor(intervalMs = 5e3, detect = detectPremiere) {
    this.intervalMs = intervalMs;
    this.detect = detect;
  }
  intervalMs;
  detect;
  timer;
  last;
  polling = false;
  listeners = /* @__PURE__ */ new Set();
  start() {
    if (this.timer) return;
    void this.poll();
    this.timer = setInterval(() => void this.poll(), this.intervalMs);
    this.timer.unref?.();
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
  }
  /** Force a poll now (e.g. right after the user says "but it IS running"). */
  async refresh() {
    await this.poll();
    return this.last ?? { running: false, pids: [] };
  }
  get current() {
    return this.last;
  }
  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  async poll() {
    if (this.polling) return;
    this.polling = true;
    try {
      const info = await this.detect();
      const prev = this.last;
      const changed = !prev || info.running !== prev.running || info.pids.join(",") !== prev.pids.join(",") || info.version !== prev.version || info.error !== prev.error;
      this.last = info;
      if (changed) for (const l of this.listeners) l(info);
    } catch (e) {
      const info = { running: false, pids: [], error: e.message };
      const changed = !this.last || this.last.error !== info.error || this.last.running;
      this.last = info;
      if (changed) for (const l of this.listeners) l(info);
    } finally {
      this.polling = false;
    }
  }
};

// packages/core/src/bridge/connector.ts
var BridgeConnector = class extends import_node_events5.EventEmitter {
  _status = {
    phase: "premiere-not-running",
    label: "Premiere Pro",
    detail: "Premiere Pro isn't running. Open Premiere Pro to apply presets.",
    canApply: false
  };
  lastState;
  inflight = /* @__PURE__ */ new Map();
  log;
  server;
  proc;
  applyTimeoutMs;
  constructor(opts) {
    super();
    this.server = opts.server;
    this.proc = opts.processMonitor ?? new PremiereProcessMonitor();
    this.log = opts.logger ?? defaultLogger.child("connector");
    this.applyTimeoutMs = opts.applyTimeoutMs ?? 6e4;
    this.server.on("connected", (peer) => this.onPeer(peer));
    this.server.on("disconnected", () => this.recompute());
    this.server.on("pairing", () => this.recompute());
    this.server.on("evt:hostState", (s) => {
      this.lastState = s;
      this.recompute();
    });
    this.server.on("evt:selectionChanged", (p) => {
      if (this.lastState) this.lastState.selectionCount = p.count;
      this.emit("selectionChanged", p);
      this.recompute();
    });
    this.server.on("evt:effectDrop", (p) => this.emit("effectDrop", p));
    this.proc.onChange(() => this.recompute());
    this.proc.start();
    this.recompute();
    if (this.server.connected) {
      this.server.request("getState", {}).then((s) => {
        this.lastState = s;
        this.recompute();
      }).catch(() => void 0);
    }
  }
  get status() {
    return this._status;
  }
  /** Re-run process detection now and return the fresh status (UI "Refresh" / CLI `status --refresh`). */
  async refreshStatus() {
    await this.proc.refresh();
    this.recompute();
    return this._status;
  }
  onPeer(peer) {
    this.lastState = void 0;
    this.recompute();
    this.server.request("getState", {}).then((s) => {
      this.lastState = s;
      this.recompute();
    }).catch((e) => this.log.warn("getState after connect failed", { error: e.message }));
    void peer;
  }
  recompute() {
    const peer = this.server.connectedPeer;
    const proc = this.proc.current;
    let next;
    if (peer) {
      const gen = classifyPremiere(peer.host.version);
      const year = 2e3 + Number(peer.host.version.split(".")[0]);
      const label = `Premiere Pro ${Number.isFinite(year) ? year : ""}`.trim();
      if (gen === "unsupported" || !peer.capabilities.uxpDom) {
        next = { phase: "unsupported-version", label, detail: `Premiere ${peer.host.version} isn't supported (Azy needs Premiere Pro 2023 or newer).`, host: peer.host, capabilities: peer.capabilities, canApply: false };
      } else {
        const can = canApplyPresets(peer.capabilities);
        const st = this.lastState;
        let detail = "Connected";
        if (st) {
          if (!st.hasProject) detail = "Connected \u2014 no project open";
          else if (!st.hasSequence) detail = "Connected \u2014 open a sequence";
          else if (st.selectionCount === 0) detail = `Connected \u2014 ${st.sequence?.name ?? "sequence"} (no clip selected)`;
          else detail = `Connected \u2014 ${st.sequence?.name ?? "sequence"} (${st.selectionCount} selected)`;
        }
        next = { phase: "connected", label, detail, host: peer.host, runtime: peer.connector, capabilities: peer.capabilities, canApply: can, premiereState: st };
      }
    } else if (proc?.running) {
      const pairing = this.server.activePairing;
      const year = proc.version ? 2e3 + Number(proc.version.split(".")[0]) : void 0;
      const label = `Premiere Pro${year ? " " + year : ""}${proc.beta ? " (Beta)" : ""}`;
      next = {
        phase: "premiere-running-no-connector",
        label,
        detail: `${label} is running but Azy inside Premiere hasn't linked yet. It starts with Premiere; if it doesn't appear, open Window \u2192 Extensions \u2192 Azy${pairing ? ` and enter code ${pairing.code}` : ""}.`,
        canApply: false,
        pairing,
        process: { pids: proc.pids, exePath: proc.exePath }
      };
    } else if (proc?.error) {
      next = { phase: "premiere-not-running", label: "Premiere Pro", detail: `Couldn't check whether Premiere Pro is running (${proc.error}). Open the Azy panel in Premiere to connect.`, canApply: false, process: { error: proc.error } };
    } else {
      next = { phase: "premiere-not-running", label: "Premiere Pro", detail: proc ? "Premiere Pro isn't running. Open Premiere Pro to apply presets." : "Checking whether Premiere Pro is running\u2026", canApply: false };
    }
    const changed = JSON.stringify(next) !== JSON.stringify(this._status);
    this._status = next;
    if (changed) this.emit("status", next);
  }
  // ---------------------------------------------------------------------------------------------
  async getState() {
    const s = await this.server.request("getState", {});
    this.lastState = s;
    this.recompute();
    return s;
  }
  async getSelection() {
    return this.server.request("getSelection", {});
  }
  async setDragState(state) {
    if (!this.server.connected) return;
    this.server.sendEvt("dragState", { ...state, startedAt: state.active ? Date.now() : void 0 });
  }
  /**
   * Apply a plan. Idempotent per operationId: if called twice with the same id while in flight,
   * the same promise is returned (protects against double drops / retries).
   */
  async applyPreset(plan, target, options = {}, operationId = newOperationId()) {
    const existing = this.inflight.get(operationId);
    if (existing) return existing;
    const p = this.doApply({ operationId, plan, target, options }).finally(() => this.inflight.delete(operationId));
    this.inflight.set(operationId, p);
    return p;
  }
  async doApply(req) {
    const st = this._status;
    if (st.phase === "premiere-not-running") throw new BridgeError(err(ErrorCodes.PREMIERE_NOT_RUNNING));
    if (st.phase === "premiere-running-no-connector") throw new BridgeError(err(ErrorCodes.CONNECTOR_NOT_CONNECTED));
    if (st.phase === "unsupported-version") throw new BridgeError(err(ErrorCodes.UNSUPPORTED_PREMIERE_VERSION));
    if (!st.canApply) throw new BridgeError(err(ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, "The connected Premiere build doesn't expose the effect APIs Azy needs."));
    const t0 = Date.now();
    this.log.info(`applyPreset "${req.plan.name}" (${req.plan.effects.length} effects) \u2192 ${describeTarget(req.target)}`, { operationId: req.operationId });
    this.operation({ operationId: req.operationId, kind: "preset", name: req.plan.name, state: "started", cancellable: true });
    let outcome = "failed";
    try {
      const res = await this.server.request("applyPreset", req, this.applyTimeoutMs);
      outcome = res.state === "CANCELLED" ? "cancelled" : "finished";
      this.log.info(`applyPreset ${res.state} in ${Date.now() - t0}ms`, {
        operationId: req.operationId,
        targets: res.targets.length,
        warnings: res.warnings.length
      });
      return res;
    } catch (e) {
      const be = e instanceof BridgeError ? e : new BridgeError(err(ErrorCodes.PRESET_APPLICATION_FAILED, e.message));
      if (be.code === ErrorCodes.IPC_TIMEOUT || be.code === ErrorCodes.CONNECTION_LOST) {
        this.log.warn(`applyPreset outcome UNKNOWN (${be.code}); not retrying automatically`, { operationId: req.operationId });
        be.structured.details = { ...be.structured.details ?? {}, outcome: "unknown", operationId: req.operationId };
      }
      throw be;
    } finally {
      this.operation({ operationId: req.operationId, kind: "preset", name: req.plan.name, state: outcome, cancellable: false });
    }
  }
  /** Tell every Azy surface (windows + the Premiere panel) that an operation started/ended. */
  operation(st) {
    this.emit("operation", st);
    this.server.sendEvt("operationState", st);
  }
};
function describeTarget(t) {
  switch (t.mode) {
    case "selection":
      return "selection";
    case "playhead":
      return `playhead(${t.tracks})`;
    case "selectionThenPlayhead":
      return `selection\u2192playhead(${t.tracks})`;
    case "refs":
      return `${t.refs.length} refs`;
  }
}
function err(code, message) {
  return structuredObj(code, message);
}

// packages/core/src/drag/drag-session.ts
var import_node_events6 = require("node:events");
var DragSession = class extends import_node_events6.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("drag");
    this.maxDurationMs = opts.maxDurationMs ?? 5 * 6e4;
    this.defaultTarget = opts.defaultTarget ?? { mode: "selection" };
    opts.connector.on("selectionChanged", (p) => this.onSelectionChanged(p.count));
    opts.connector.on("status", (s) => {
      if (this.state.phase === "idle") return;
      if (s.phase !== "connected") {
        this.update({ hint: s.detail });
      } else {
        this.onSelectionChanged(s.premiereState?.selectionCount ?? this.state.selectionCount);
      }
    });
  }
  opts;
  state = { phase: "idle", selectionCount: 0, hint: "" };
  timer;
  log;
  maxDurationMs;
  defaultTarget;
  get current() {
    return this.state;
  }
  /** Renderer: user started dragging a preset tile. */
  async begin(presetId) {
    if (this.state.phase !== "idle") this.cancel("restarted");
    const rec = this.opts.library.get(presetId);
    if (!rec) throw new Error(`Unknown preset ${presetId}`);
    const operationId = newOperationId();
    this.timer = setTimeout(() => this.cancel("timeout"), this.maxDurationMs);
    this.timer.unref?.();
    const st = this.opts.connector.status;
    this.update({
      phase: "dragging",
      presetId,
      presetName: rec.name,
      operationId,
      startedAt: Date.now(),
      selectionCount: st.premiereState?.selectionCount ?? 0,
      hint: st.phase === "connected" ? st.premiereState?.selectionCount ? "Release to apply to the selected clip" : "Select a clip in Premiere, then release" : st.detail
    });
    this.opts.connector.setDragState({ active: true, presetId, presetName: rec.name }).catch(() => void 0);
    this.log.debug(`drag begin ${rec.name}`, { operationId });
    this.opts.library.getPlan(presetId).catch(() => void 0);
    return this.state;
  }
  /**
   * Renderer / panel: user confirmed ("drop"). Applies to the current Premiere selection (or the
   * given target) using the session's operationId, so a double confirm can't apply twice.
   */
  async confirm(target = this.defaultTarget) {
    const { presetId, operationId } = this.state;
    if (this.state.phase === "idle" || !presetId || !operationId) throw new Error("No active drag session");
    if (this.state.phase === "applying") throw new Error("Already applying");
    this.update({ phase: "applying", hint: "Applying\u2026" });
    try {
      const plan = await this.opts.library.getPlan(presetId);
      const result = await this.opts.connector.applyPreset(plan, target, {}, operationId);
      if (result.state === "SUCCESS" || result.state === "PARTIAL") this.opts.library.markUsed(presetId);
      this.emit("applied", { presetId, result });
      return result;
    } finally {
      this.finish("confirmed");
    }
  }
  /** Renderer: drag ended without confirming (Escape, released elsewhere). */
  cancel(reason = "cancelled") {
    if (this.state.phase === "idle") return;
    this.log.debug(`drag ${reason}`, { operationId: this.state.operationId });
    this.finish(reason);
  }
  onSelectionChanged(count) {
    if (this.state.phase === "idle" || this.state.phase === "applying") return;
    this.update({
      phase: count > 0 ? "armed" : "dragging",
      selectionCount: count,
      hint: count > 0 ? `Release to apply to ${count} selected clip${count === 1 ? "" : "s"}` : "Select a clip in Premiere, then release"
    });
  }
  finish(reason) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = void 0;
    this.opts.connector.setDragState({ active: false }).catch(() => void 0);
    this.update({ phase: "idle", presetId: void 0, presetName: void 0, operationId: void 0, startedAt: void 0, hint: "" });
    this.emit("ended", { reason });
  }
  update(patch) {
    this.state = { ...this.state, ...patch };
    this.emit("state", this.state);
  }
};

// packages/core/src/electron/ipc-contract.ts
var IPC = {
  // Folders
  pinFolder: "azy:presets:pinFolder",
  unpinFolder: "azy:presets:unpinFolder",
  updateFolder: "azy:presets:updateFolder",
  getFolders: "azy:presets:getFolders",
  rescan: "azy:presets:rescan",
  // Browse / search
  browse: "azy:presets:browse",
  search: "azy:presets:search",
  favorites: "azy:presets:favorites",
  recent: "azy:presets:recent",
  get: "azy:presets:get",
  setFavorite: "azy:presets:setFavorite",
  getPlan: "azy:presets:getPlan",
  renameFile: "azy:presets:renameFile",
  removeFromIndex: "azy:presets:removeFromIndex",
  deleteFile: "azy:presets:deleteFile",
  revealInFolder: "azy:presets:revealInFolder",
  // Premiere bridge
  getConnection: "azy:presets:getConnection",
  beginPairing: "azy:presets:beginPairing",
  forgetTokens: "azy:presets:forgetTokens",
  premiereState: "azy:presets:premiereState",
  premiereSelection: "azy:presets:premiereSelection",
  applyPreset: "azy:presets:applyPreset",
  // Drag session
  dragBegin: "azy:presets:dragBegin",
  dragConfirm: "azy:presets:dragConfirm",
  dragCancel: "azy:presets:dragCancel",
  dragState: "azy:presets:dragState",
  // Presets that live inside Premiere (Effects panel › Presets)
  pproSources: "azy:presets:ppro:sources",
  pproDiscover: "azy:presets:ppro:discover",
  pproAddFile: "azy:presets:ppro:addFile",
  pproSetPinned: "azy:presets:ppro:setPinned",
  pproBrowse: "azy:presets:ppro:browse",
  pproSearch: "azy:presets:ppro:search",
  pproGet: "azy:presets:ppro:get",
  pproSetFavorite: "azy:presets:ppro:setFavorite",
  // Snap Action (Premiere-native effects + presets)
  snapStatus: "azy:presets:snap:status",
  snapSync: "azy:presets:snap:sync",
  snapSearch: "azy:presets:snap:search",
  snapGet: "azy:presets:snap:get",
  snapSetFavorite: "azy:presets:snap:setFavorite",
  snapApply: "azy:presets:snap:apply",
  // SFX dagger: drop an audio file at the playhead on a free audio track
  placeAudio: "azy:presets:placeAudio",
  // Files → Apply: a video / image at the playhead on a free track, optional isolated auto-cut
  placeMedia: "azy:presets:placeMedia",
  // Flow (keyframe easing)
  flowStatus: "azy:presets:flow:status",
  flowList: "azy:presets:flow:list",
  flowGet: "azy:presets:flow:get",
  flowSetFavorite: "azy:presets:flow:setFavorite",
  flowCreate: "azy:presets:flow:create",
  flowUpdate: "azy:presets:flow:update",
  flowDelete: "azy:presets:flow:delete",
  flowDuplicate: "azy:presets:flow:duplicate",
  flowKeyframes: "azy:presets:flow:keyframes",
  flowApply: "azy:presets:flow:apply",
  cancelOperation: "azy:presets:cancelOperation",
  // Azy platform: modules + command bus
  azyStatus: "azy:presets:azyStatus",
  azyCommand: "azy:presets:azyCommand",
  moduleRepair: "azy:presets:moduleRepair",
  moduleRefresh: "azy:presets:moduleRefresh",
  // Diagnostics
  getLog: "azy:presets:getLog",
  setDebug: "azy:presets:setDebug"
};
var IPC_EVENTS = {
  indexChange: "azy:presets:evt:indexChange",
  scan: "azy:presets:evt:scan",
  connection: "azy:presets:evt:connection",
  drag: "azy:presets:evt:drag",
  pairing: "azy:presets:evt:pairing",
  pproChange: "azy:presets:evt:pproChange",
  snapChange: "azy:presets:evt:snapChange",
  flowChange: "azy:presets:evt:flowChange",
  flowApplied: "azy:presets:evt:flowApplied",
  operationProgress: "azy:presets:evt:operationProgress",
  operationState: "azy:presets:evt:operationState",
  azyStatus: "azy:presets:evt:azyStatus"
};

// packages/core/src/electron/main.ts
var path16 = __toESM(require("node:path"));

// packages/core/src/bridge/reverse-dialer.ts
var fs7 = __toESM(require("node:fs"));
var path11 = __toESM(require("node:path"));
var ReverseDialer = class {
  constructor(opts) {
    this.opts = opts;
  }
  opts;
  timer;
  dialing = false;
  lastKey = "";
  failures = 0;
  get infoFile() {
    return path11.join(this.opts.bridgeDir, "premiere.json");
  }
  start() {
    if (this.timer) return;
    const tick = () => void this.tick();
    this.timer = setInterval(tick, this.opts.intervalMs ?? 2e3);
    this.timer.unref?.();
    tick();
  }
  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = void 0;
  }
  /** "Reconnect now" — used by the status-bar action and after a code was typed. */
  kick() {
    this.failures = 0;
    this.lastDialAt = 0;
    void this.tick();
  }
  read() {
    try {
      const j = JSON.parse(fs7.readFileSync(this.infoFile, "utf8"));
      if (!j.port || !j.secret) return void 0;
      const seen = j.beatAt ?? j.startedAt ?? 0;
      if (Date.now() - seen > (this.opts.staleMs ?? 9e4)) return void 0;
      return { port: j.port, secret: j.secret, startedAt: j.startedAt ?? 0, beatAt: j.beatAt };
    } catch {
      return void 0;
    }
  }
  lastDialAt = 0;
  async tick() {
    if (this.dialing || this.opts.server.connected || this.opts.server.authPending > 0) return;
    if (Date.now() - this.lastDialAt < 4e3) return;
    const info = this.read();
    if (!info) return;
    const key = `${info.port}:${info.secret}`;
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.failures = 0;
    }
    if (this.failures && Date.now() % ((1 << Math.min(this.failures, 4)) * 2e3) > 2e3) return;
    this.dialing = true;
    this.lastDialAt = Date.now();
    const url = `ws://127.0.0.1:${info.port}`;
    try {
      const ws = await new Promise((resolve5, reject) => {
        const sock = new import_websocket.default(url, [WS_SUBPROTOCOL, `azy-${info.secret}`], { handshakeTimeout: 3e3, perMessageDeflate: false });
        sock.once("open", () => {
          sock.pause();
          resolve5(sock);
        });
        sock.once("error", reject);
      });
      this.failures = 0;
      this.opts.logger?.info(`reverse link: connected to the Azy panel in Premiere at ${url}`);
      this.opts.server.adoptOutboundSocket(ws);
      ws.resume();
    } catch (e) {
      this.failures++;
      this.opts.logger?.debug(`reverse link: ${url} not reachable`, { error: e.message, failures: this.failures });
    } finally {
      this.dialing = false;
    }
  }
};

// packages/core/src/snap/snap-action.ts
var fsp7 = __toESM(require("node:fs/promises"));
var path12 = __toESM(require("node:path"));
var import_node_events7 = require("node:events");
var FAV_PREFIX = { video: "effect:video:", audio: "effect:audio:", transition: "transition:video:" };
var SnapAction = class extends import_node_events7.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("snap");
    this.cacheFile = path12.join(opts.dataDir, "snap-effects-cache.json");
  }
  opts;
  log;
  cacheFile;
  effects = [];
  transitions = [];
  effectsSyncedAt = 0;
  effectsFromCache = false;
  syncing = false;
  lastError;
  hostVersion;
  syncTimer;
  nameIndex = [];
  async start() {
    await this.loadCache();
    this.opts.connector.on("status", (s) => {
      if (s.phase === "connected" && (s.host?.version !== this.hostVersion || !this.effectsSyncedAt)) this.scheduleSync("connected");
    });
    this.opts.premierePresets.on("change", () => this.emit("change"));
    if (this.opts.connector.status.phase === "connected") this.scheduleSync("start");
    this.rebuildIndex();
  }
  stop() {
    clearTimeout(this.syncTimer);
  }
  // ---- status -------------------------------------------------------------------------------------
  status() {
    const st = this.opts.connector.status;
    const caps = st.capabilities;
    const connected = st.phase === "connected";
    return {
      effects: this.effects.length,
      transitions: this.transitions.length,
      presets: this.presetItems().length,
      favorites: this.favoriteIds().size,
      effectsSyncedAt: this.effectsSyncedAt,
      effectsFromCache: this.effectsFromCache,
      syncing: this.syncing,
      lastError: this.lastError,
      capabilities: {
        canGetEffects: connected && !!(caps?.addVideoEffects || caps?.addAudioEffects),
        canGetPresets: this.opts.premierePresets.sources().length > 0,
        canApplyEffects: connected && !!caps?.addVideoEffects,
        canApplyTransitions: connected && !!caps?.addTransitions,
        canApplyPresets: connected && st.canApply
      }
    };
  }
  // ---- sync ---------------------------------------------------------------------------------------
  scheduleSync(reason) {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => void this.sync(reason).catch(() => {
    }), 400);
  }
  /** Fetch effects from the live connector. Throws if not connected (the cached list stays). */
  async sync(reason = "manual") {
    const st = this.opts.connector.status;
    if (st.phase !== "connected") throw new BridgeError({ code: ErrorCodes.CONNECTOR_NOT_CONNECTED, message: "Premiere's Azy panel isn't connected." });
    if (this.syncing) return this.status();
    this.syncing = true;
    this.emit("change");
    try {
      const [v, a, tr] = await Promise.all([
        st.capabilities?.addVideoEffects ? this.opts.server.request("listEffects", { kind: "video" }) : { matchNames: [], displayNames: [] },
        st.capabilities?.addAudioEffects ? this.opts.server.request("listEffects", { kind: "audio" }).catch(() => ({ matchNames: [], displayNames: [] })) : { matchNames: [], displayNames: [] },
        st.capabilities?.addTransitions ? this.opts.server.request("listTransitions", {}).catch(() => ({ matchNames: [] })) : { matchNames: [] }
      ]);
      const video = v.matchNames.map((m, i) => ({ matchName: m, displayName: v.displayNames[i] || stripPrefix(m) }));
      this.hostVersion = st.host?.version;
      this.setEffects(video, a.displayNames, tr.matchNames);
      this.effectsSyncedAt = Date.now();
      this.effectsFromCache = false;
      this.lastError = void 0;
      await this.saveCache({ version: 1, savedAt: this.effectsSyncedAt, hostVersion: this.hostVersion, video, audio: a.displayNames, transitions: tr.matchNames });
      this.log.info(`effects synchronized (${reason}): ${video.length} video, ${a.displayNames.length} audio, ${tr.matchNames.length} transitions; presets: ${this.presetItems().length}`);
    } catch (e) {
      this.lastError = e.message;
      this.log.warn(`effect sync failed: ${this.lastError}`);
      throw e;
    } finally {
      this.syncing = false;
      this.emit("change");
    }
    return this.status();
  }
  setEffects(video, audio, transitions = []) {
    const items = [];
    const seen = /* @__PURE__ */ new Set();
    for (const e of video) {
      if (!e.matchName || INTRINSIC_VIDEO_MATCH_NAMES.has(e.matchName) || seen.has(e.matchName)) continue;
      seen.add(e.matchName);
      items.push({ id: FAV_PREFIX.video + e.matchName, type: "effect", name: e.displayName, mediaType: "video", matchName: e.matchName, favorite: false });
    }
    for (const name of audio) {
      if (!name || seen.has("a:" + name)) continue;
      seen.add("a:" + name);
      items.push({ id: FAV_PREFIX.audio + name, type: "effect", name, mediaType: "audio", favorite: false });
    }
    items.sort((x, y) => x.name.localeCompare(y.name));
    this.effects = items;
    const trs = [];
    for (const m of transitions) {
      if (!m || seen.has("t:" + m)) continue;
      seen.add("t:" + m);
      trs.push({ id: FAV_PREFIX.transition + m, type: "transition", name: transitionDisplayName(m), mediaType: "video", matchName: m, favorite: false });
    }
    trs.sort((x, y) => x.name.localeCompare(y.name));
    this.transitions = trs;
    this.rebuildIndex();
  }
  async loadCache() {
    try {
      const c = JSON.parse(await fsp7.readFile(this.cacheFile, "utf8"));
      if (c?.version === 1 && Array.isArray(c.video)) {
        this.hostVersion = c.hostVersion;
        this.setEffects(c.video, c.audio ?? [], c.transitions ?? []);
        this.effectsFromCache = true;
        this.log.info(`effects restored from cache: ${this.effects.length} (Premiere ${c.hostVersion ?? "?"})`);
      }
    } catch {
    }
  }
  async saveCache(c) {
    try {
      await fsp7.mkdir(path12.dirname(this.cacheFile), { recursive: true });
      const tmp = this.cacheFile + ".tmp";
      await fsp7.writeFile(tmp, JSON.stringify(c));
      await fsp7.rename(tmp, this.cacheFile);
    } catch (e) {
      this.log.warn(`cannot write effect cache: ${e.message}`);
    }
  }
  // ---- catalogue ----------------------------------------------------------------------------------
  presetItems() {
    const out = [];
    for (const src of this.opts.premierePresets.sources()) {
      if (src.error) continue;
      for (const p of this.opts.premierePresets.search("", src.id, 1e5)) {
        out.push({
          id: p.id,
          type: "preset",
          name: p.name,
          mediaType: p.media,
          binPath: p.binPath,
          effectNames: p.effectNames,
          favorite: false
        });
      }
    }
    return out;
  }
  favoriteIds() {
    const s = /* @__PURE__ */ new Set();
    for (const id of this.opts.meta.favorites()) if (id.startsWith("effect:") || id.startsWith("transition:") || id.startsWith("ppro_")) s.add(id);
    return s;
  }
  decorate(item, favs) {
    const m = this.opts.meta.get(item.id);
    return { ...item, favorite: favs.has(item.id), lastUsed: m?.lastUsed, useCount: m?.useCount };
  }
  rebuildIndex() {
    this.nameIndex = [];
  }
  ensureIndex() {
    if (this.nameIndex.length) return;
    const all = [...this.effects, ...this.transitions, ...this.presetItems()];
    this.nameIndex = all.map((item) => {
      const lc = item.name.toLowerCase();
      return { item, lc, words: lc.split(/[^a-z0-9]+/).filter(Boolean) };
    });
  }
  /** Every item (favorite flags applied), sorted by name. */
  all(filter = {}) {
    this.ensureIndex();
    const favs = this.favoriteIds();
    return this.nameIndex.map((e) => this.decorate(e.item, favs)).filter((i) => matches(i, filter));
  }
  /**
   * Local search. Ranking: exact name > prefix > word prefix > substring > effect-content match
   * (for presets, the names of the effects they contain). Favorites and recently used win ties.
   */
  search(query, filter = {}, limit = 200) {
    this.ensureIndex();
    if (this.nameIndex.some((e) => e.item.type === "preset") !== this.presetItems().length > 0) this.nameIndex = [];
    this.ensureIndex();
    const q = query.trim().toLowerCase();
    const favs = this.favoriteIds();
    const scored = [];
    for (const e of this.nameIndex) {
      let score;
      if (!q) score = 1;
      else if (e.lc === q) score = 100;
      else if (e.lc.startsWith(q)) score = 80;
      else if (e.words.some((w) => w.startsWith(q))) score = 60;
      else if (e.lc.includes(q)) score = 40;
      else if (e.item.effectNames?.some((n) => n.toLowerCase().includes(q))) score = 20;
      else if (e.item.matchName?.toLowerCase().includes(q)) score = 10;
      else continue;
      const item = this.decorate(e.item, favs);
      if (!matches(item, filter)) continue;
      if (item.favorite) score += 5;
      if (item.useCount) score += Math.min(4, item.useCount);
      scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
    return scored.slice(0, limit).map((s) => s.item);
  }
  get(id) {
    this.ensureIndex();
    const hit = this.nameIndex.find((e) => e.item.id === id);
    return hit ? this.decorate(hit.item, this.favoriteIds()) : void 0;
  }
  // ---- favorites ----------------------------------------------------------------------------------
  setFavorite(id, favorite) {
    const item = this.get(id);
    if (!item) return void 0;
    const fp = item.type === "preset" ? { name: item.name, bin: (item.binPath ?? []).join("/") } : void 0;
    this.opts.meta.setFavorite(id, favorite, fp);
    this.log.info(`favorite ${favorite ? "added" : "removed"}: ${item.type} "${item.name}"`);
    this.emit("change");
    return this.get(id);
  }
  // ---- apply --------------------------------------------------------------------------------------
  /**
   * Apply an item to the clips currently selected in Premiere. Effects go through the connector's
   * `applyEffect` (factory + append, default parameters); presets through the existing `applyPreset`
   * with the parsed plan. Both resolve with the connector's OperationComplete-backed result.
   */
  async apply(id, target = { mode: "selection" }, operationId = newOperationId(), options = {}) {
    const item = this.get(id);
    if (!item) throw new BridgeError({ code: ErrorCodes.INVALID_PRESET, message: "That effect or preset is no longer available." });
    const st = this.opts.connector.status;
    if (st.phase === "premiere-not-running") throw new BridgeError({ code: ErrorCodes.PREMIERE_NOT_RUNNING, message: "Premiere Pro isn't running." });
    if (st.phase === "premiere-running-no-connector") throw new BridgeError({ code: ErrorCodes.CONNECTOR_NOT_CONNECTED, message: "Premiere's Azy panel isn't connected." });
    if (st.phase === "unsupported-version") throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: st.detail });
    const live = await this.opts.connector.getState().catch(() => st.premiereState);
    if (!live?.hasProject) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_PROJECT, message: "Open a project in Premiere." });
    if (!live.hasSequence) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_SEQUENCE, message: "Open a sequence in Premiere." });
    if (target.mode === "selection" && !live.selectionCount) throw new BridgeError({ code: ErrorCodes.NO_TARGET_CLIP, message: "No clips selected in Premiere." });
    const t0 = Date.now();
    let res;
    if (item.type === "transition") {
      if (!st.capabilities?.addTransitions) throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: "This Premiere build can't add transitions (QE scripting unavailable)." });
      this.log.info(`applyTransition "${item.name}" \u2192 ${target.mode}`, { operationId });
      try {
        res = await this.opts.server.request(
          "applyTransition",
          { operationId, transition: { matchName: item.matchName ?? "", displayName: item.name }, target, edges: options.edges ?? "both", durationSeconds: options.durationSeconds },
          this.opts.applyTimeoutMs ?? 6e4
        );
      } catch (e) {
        const be = e instanceof BridgeError ? e : new BridgeError({ code: ErrorCodes.PRESET_APPLICATION_FAILED, message: e.message });
        this.log.warn(`applyTransition failed: ${be.code} ${be.message}`, { operationId });
        throw be;
      }
    } else if (item.type === "effect") {
      if (item.mediaType === "video" && !st.capabilities?.addVideoEffects) throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: "This Premiere build can't add video effects (QE scripting unavailable)." });
      if (item.mediaType === "audio" && !st.capabilities?.addAudioEffects) throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: "This Premiere build can't add audio effects (QE scripting unavailable)." });
      this.log.info(`applyEffect "${item.name}" (${item.mediaType}) \u2192 ${target.mode}`, { operationId });
      try {
        res = await this.opts.server.request(
          "applyEffect",
          { operationId, effect: { media: item.mediaType === "audio" ? "audio" : "video", matchName: item.matchName, displayName: item.name }, target },
          this.opts.applyTimeoutMs ?? 6e4
        );
      } catch (e) {
        const be = e instanceof BridgeError ? e : new BridgeError({ code: ErrorCodes.PRESET_APPLICATION_FAILED, message: e.message });
        this.log.warn(`applyEffect failed: ${be.code} ${be.message}`, { operationId });
        throw be;
      }
    } else {
      const plan = this.opts.premierePresets.getPlan(id);
      if (!plan) throw new BridgeError({ code: ErrorCodes.INVALID_PRESET, message: "Preset no longer exists in Premiere's presets file." });
      res = await this.opts.connector.applyPreset(plan, target, {}, operationId);
    }
    this.opts.meta.markUsed(id);
    this.log.info(`${item.type} "${item.name}" ${res.state} in ${Date.now() - t0}ms`, { operationId, targets: res.targets.length, warnings: res.warnings.length });
    this.emit("change");
    return res;
  }
};
function matches(i, f) {
  if (f.type && i.type !== f.type) return false;
  if (f.media && i.mediaType !== f.media && i.mediaType !== "mixed") return false;
  if (f.favoritesOnly && !i.favorite) return false;
  return true;
}
function transitionDisplayName(matchName) {
  return matchName.replace(/^(AE|PR)\.ADBE /, "").replace(/^ADBE /, "").replace(/ \d+$/, "").trim() || matchName;
}
function stripPrefix(matchName) {
  return matchName.replace(/^(AE|PR)\.ADBE /, "").replace(/ \d+$/, "");
}

// packages/core/src/flow/flow.ts
var fsp8 = __toESM(require("node:fs/promises"));
var path13 = __toESM(require("node:path"));
var import_node_events8 = require("node:events");
var Flow = class extends import_node_events8.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.log = opts.logger ?? defaultLogger.child("flow");
    this.file = path13.join(opts.dataDir, "flow-presets.json");
  }
  opts;
  log;
  file;
  custom = [];
  saveTimer;
  async start() {
    try {
      const raw = JSON.parse(await fsp8.readFile(this.file, "utf8"));
      if (raw?.version === 1 && Array.isArray(raw.presets)) {
        this.custom = raw.presets.filter((p) => p && typeof p.id === "string" && p.id.startsWith("flow:custom:") && validateEasing(p.easing).length === 0);
      }
    } catch {
      this.custom = [];
    }
    this.opts.connector.on("status", () => this.emit("change"));
    this.opts.server.inbound.flowSync = () => this.presetList();
    this.opts.server.inbound.flowUsed = ({ presetId, presetName, result }) => {
      if (this.get(presetId)) this.opts.meta.markUsed(presetId);
      this.log.info(`panel applied "${presetName}" ${result.state}: ${result.params} params, ${result.keyframesChanged} changed, ${result.keyframesAdded} added`);
      this.emit("applied", { presetId, presetName, result, source: "panel" });
      this.emit("change");
      return { ok: true };
    };
    this.opts.server.on("connected", () => this.pushPresets());
    this.on("change", () => this.pushPresets());
    this.log.info(`flow ready: ${FLOW_BUILTIN_PRESETS.length} built-in, ${this.custom.length} custom`);
  }
  stop() {
    clearTimeout(this.saveTimer);
    clearTimeout(this.pushTimer);
  }
  /** Wire shape shared with the panel. */
  presetList() {
    return { presets: this.all().map((p) => ({ ...p, useCount: p.useCount ?? 0 })), at: Date.now() };
  }
  pushTimer;
  pushPresets() {
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      if (this.opts.connector.status.phase === "connected") this.opts.server.sendEvt("flowPresets", this.presetList());
    }, 50);
  }
  // ---- status -------------------------------------------------------------------------------------
  status() {
    const st = this.opts.connector.status;
    let phase;
    switch (st.phase) {
      case "connected":
        phase = "connected";
        break;
      case "premiere-running-no-connector":
        phase = "connecting";
        break;
      case "premiere-not-running":
        phase = "premiere-not-running";
        break;
      case "unsupported-version":
        phase = "unsupported";
        break;
      case "incompatible-connector":
        phase = "error";
        break;
      default:
        phase = "disconnected";
    }
    const caps = st.capabilities;
    return {
      phase,
      detail: st.detail,
      hostVersion: st.host?.version,
      hasSequence: !!st.premiereState?.hasSequence,
      selectionCount: st.premiereState?.selectionCount ?? 0,
      canApply: phase === "connected" && !!caps?.setInterpolation && !!caps?.readKeyframes,
      builtin: FLOW_BUILTIN_PRESETS.length,
      custom: this.custom.length,
      favorites: this.favoriteIds().size
    };
  }
  // ---- presets ------------------------------------------------------------------------------------
  favoriteIds() {
    return new Set(this.opts.meta.favorites().filter((id) => id.startsWith("flow:")));
  }
  view(p, favs = this.favoriteIds()) {
    const m = this.opts.meta.get(p.id);
    return { ...p, favorite: favs.has(p.id), lastUsed: m?.lastUsed, useCount: m?.useCount };
  }
  all() {
    const favs = this.favoriteIds();
    return [...FLOW_BUILTIN_PRESETS.filter((p) => !p.easing.keep), ...this.custom].map((p) => this.view(p, favs));
  }
  get(id) {
    const p = FLOW_BUILTIN_PRESETS.find((b) => b.id === id) ?? this.custom.find((c) => c.id === id);
    return p ? this.view(p) : void 0;
  }
  /** Local search; exact > prefix > word > substring; favorites and recently used win ties. */
  search(query, opts = {}) {
    const q = query.trim().toLowerCase();
    const out = [];
    for (const p of this.all()) {
      if (opts.type && p.type !== opts.type) continue;
      if (opts.favoritesOnly && !p.favorite) continue;
      const lc = p.name.toLowerCase();
      let score;
      if (!q) score = 1;
      else if (lc === q) score = 100;
      else if (lc.startsWith(q)) score = 80;
      else if (lc.split(/[^a-z0-9&]+/).some((w) => w.startsWith(q))) score = 60;
      else if (lc.includes(q)) score = 40;
      else if ((p.description ?? "").toLowerCase().includes(q)) score = 10;
      else continue;
      if (p.favorite) score += 5;
      if (p.useCount) score += Math.min(4, p.useCount);
      out.push({ p, score });
    }
    const order = (p) => p.type === "builtin" ? FLOW_BUILTIN_PRESETS.findIndex((b) => b.id === p.id) : 1e3;
    out.sort((a, b) => b.score - a.score || order(a.p) - order(b.p) || a.p.name.localeCompare(b.p.name));
    return out.map((o) => o.p);
  }
  setFavorite(id, favorite) {
    if (!this.get(id)) return void 0;
    this.opts.meta.setFavorite(id, favorite);
    this.emit("change");
    return this.get(id);
  }
  // ---- custom presets -----------------------------------------------------------------------------
  createPreset(input) {
    const name = (input.name ?? "").trim();
    if (!name) throw new BridgeError({ code: ErrorCodes.INVALID_EASING, message: "Give the preset a name." });
    const errs = validateEasing(input.easing);
    if (errs.length) throw new BridgeError({ code: ErrorCodes.INVALID_EASING, message: errs.join("; ") });
    const id = `flow:custom:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const p = { id, name, type: "custom", easing: cloneEasing(input.easing), description: input.description?.trim() || void 0, createdAt: now, updatedAt: now };
    this.custom.push(p);
    this.persist();
    this.log.info(`custom preset created: "${name}"`, { id, easing: p.easing });
    this.emit("change");
    return this.view(p);
  }
  updatePreset(id, patch) {
    const p = this.custom.find((c) => c.id === id);
    if (!p) throw new BridgeError({ code: ErrorCodes.INVALID_PRESET, message: "Built-in presets can't be edited \u2014 duplicate it instead." });
    if (patch.name !== void 0) {
      const n = patch.name.trim();
      if (!n) throw new BridgeError({ code: ErrorCodes.INVALID_EASING, message: "Give the preset a name." });
      p.name = n;
    }
    if (patch.easing !== void 0) {
      const errs = validateEasing(patch.easing);
      if (errs.length) throw new BridgeError({ code: ErrorCodes.INVALID_EASING, message: errs.join("; ") });
      p.easing = cloneEasing(patch.easing);
    }
    if (patch.description !== void 0) p.description = patch.description.trim() || void 0;
    p.updatedAt = Date.now();
    this.persist();
    this.emit("change");
    return this.view(p);
  }
  deletePreset(id) {
    const i = this.custom.findIndex((c) => c.id === id);
    if (i < 0) return false;
    const [p] = this.custom.splice(i, 1);
    this.opts.meta.setFavorite(id, false);
    this.persist();
    this.log.info(`custom preset deleted: "${p.name}"`, { id });
    this.emit("change");
    return true;
  }
  /** Copy a built-in (or custom) preset into a new editable custom preset. */
  duplicatePreset(id, name) {
    const src = this.get(id);
    if (!src) throw new BridgeError({ code: ErrorCodes.INVALID_PRESET, message: "Preset not found." });
    return this.createPreset({ name: name ?? `${src.name} copy`, easing: src.easing, description: src.description });
  }
  persist() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.save(), 150);
  }
  async save() {
    const data = { version: 1, presets: this.custom };
    try {
      await fsp8.mkdir(path13.dirname(this.file), { recursive: true });
      const tmp = this.file + ".tmp";
      await fsp8.writeFile(tmp, JSON.stringify(data, null, 2));
      await fsp8.rename(tmp, this.file);
    } catch (e) {
      this.log.warn(`cannot save flow presets: ${e.message}`);
    }
  }
  /** Flush pending writes (shutdown). */
  async flush() {
    clearTimeout(this.saveTimer);
    await this.save();
  }
  // ---- Premiere -----------------------------------------------------------------------------------
  gate() {
    const st = this.opts.connector.status;
    if (st.phase === "premiere-not-running") throw new BridgeError({ code: ErrorCodes.PREMIERE_NOT_RUNNING, message: "Premiere Pro is not running. Open Premiere Pro to use Flow." });
    if (st.phase === "premiere-running-no-connector") throw new BridgeError({ code: ErrorCodes.CONNECTOR_NOT_CONNECTED, message: "Premiere's Azy panel isn't connected." });
    if (st.phase === "unsupported-version") throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: st.detail ?? "This Premiere version isn't supported." });
    if (st.phase !== "connected") throw new BridgeError({ code: ErrorCodes.CONNECTOR_NOT_CONNECTED, message: "Not connected to Premiere." });
    if (!st.capabilities?.setInterpolation || !st.capabilities?.readKeyframes) throw new BridgeError({ code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: "This Premiere build can't edit keyframes through its scripting engine." });
  }
  /** What Premiere would ease right now (for the "3 params · 9 keyframes on 2 clips" line). */
  async keyframes(scope = { range: "all" }) {
    this.gate();
    const live = await this.opts.connector.getState().catch(() => this.opts.connector.status.premiereState);
    if (!live?.hasProject) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_PROJECT, message: "Open a project in Premiere." });
    if (!live.hasSequence) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_SEQUENCE, message: "Open a sequence in Premiere." });
    if (!live.selectionCount) throw new BridgeError({ code: ErrorCodes.NO_TARGET_CLIP, message: "Select the clip(s) whose keyframes you want to ease." });
    return this.opts.server.request("flowKeyframes", { scope }, 15e3);
  }
  /** Ask the runtime to stop a running apply; what was already written stays undoable with one Ctrl+Z. */
  async cancel(operationId) {
    try {
      return await this.opts.server.request("cancelOperation", { operationId }, 5e3);
    } catch {
      return { cancelled: false };
    }
  }
  async apply(id, scope = { range: "all" }, operationId = newOperationId(), speed = 1, boundaries) {
    if (!operationId) operationId = newOperationId();
    const preset = this.get(id);
    if (!preset) throw new BridgeError({ code: ErrorCodes.INVALID_PRESET, message: "That easing preset no longer exists." });
    this.gate();
    const live = await this.opts.connector.getState().catch(() => this.opts.connector.status.premiereState);
    if (!live?.hasProject) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_PROJECT, message: "Open a project in Premiere." });
    if (!live.hasSequence) throw new BridgeError({ code: ErrorCodes.NO_ACTIVE_SEQUENCE, message: "Open a sequence in Premiere." });
    if (!live.selectionCount) throw new BridgeError({ code: ErrorCodes.NO_TARGET_CLIP, message: "Select the clip(s) whose keyframes you want to ease." });
    const t0 = Date.now();
    this.log.info(`applyEasing "${preset.name}"`, { operationId, scope, speed, boundaries, easing: preset.easing });
    this.emit("operationStarted", { operationId, kind: "flow", presetName: preset.name });
    const kind = speed !== 1 ? "speed" : "flow";
    this.opts.connector.operation({ operationId, kind, name: preset.name, state: "started", cancellable: true });
    let outcome = "failed";
    try {
      const res = await this.opts.server.request("applyEasing", { operationId, presetName: preset.name, easing: preset.easing, scope, speed, ...boundaries ? { boundaries } : {} }, this.opts.applyTimeoutMs ?? 12e4);
      outcome = res.state === "CANCELLED" ? "cancelled" : "finished";
      this.opts.meta.markUsed(id);
      this.opts.server.sendEvt("flowApplied", { presetId: id, presetName: preset.name, result: res });
      this.emit("applied", { presetId: id, presetName: preset.name, result: res, source: "azy" });
      this.log.info(`applyEasing ${res.state}: ${res.params} params, ${res.keyframesChanged} changed, ${res.keyframesAdded} added in ${Date.now() - t0}ms`, { operationId });
      this.emit("change");
      return { ...res, presetName: preset.name };
    } catch (e) {
      const be = e instanceof BridgeError ? e : new BridgeError({ code: ErrorCodes.PRESET_APPLICATION_FAILED, message: e.message });
      this.log.warn(`applyEasing failed: ${be.code} ${be.message}`, { operationId });
      throw be;
    } finally {
      this.opts.connector.operation({ operationId, kind, name: preset.name, state: outcome, cancellable: false });
    }
  }
};
function cloneEasing(e) {
  return { first: e.first, middle: e.middle, last: e.last, ...e.curve ? { curve: { x1: e.curve.x1, y1: e.curve.y1, x2: e.curve.x2, y2: e.curve.y2, steps: e.curve.steps } } : {} };
}

// packages/core/src/commands/command-bus.ts
var import_node_events9 = require("node:events");
var CommandBus = class extends import_node_events9.EventEmitter {
  handlers = /* @__PURE__ */ new Map();
  gates = /* @__PURE__ */ new Map();
  register(capability, action, handler) {
    const key = `${capability}.${action}`;
    if (this.handlers.has(key)) throw new Error(`Azy command already registered: ${key}`);
    this.handlers.set(key, handler);
    return () => void this.handlers.delete(key);
  }
  /** A host module tells the bus when its target may be used (Premiere running + module connected …). */
  gateTarget(target, gate) {
    this.gates.set(target, gate);
  }
  /** Everything a surface can ask for, e.g. to build menus or check feature availability. */
  list() {
    return [...this.handlers.keys()].map((k) => {
      const [capability, action] = k.split(".");
      return { capability, action };
    });
  }
  has(capability, action) {
    return this.handlers.has(`${capability}.${action}`);
  }
  async dispatch(cmd) {
    const t0 = Date.now();
    const base = { requestId: cmd.requestId, capability: cmd.capability, action: cmd.action, target: cmd.target };
    const handler = this.handlers.get(`${cmd.capability}.${cmd.action}`);
    if (!handler) {
      return { ...base, ok: false, ms: 0, error: { code: ErrorCodes.UNSUPPORTED_COMMAND, message: `Azy doesn't know the command ${cmd.capability}.${cmd.action}` } };
    }
    if (cmd.target && cmd.target !== "azy") {
      const blocked = this.gates.get(cmd.target)?.(cmd.target);
      if (blocked) {
        this.emit("blocked", { cmd, error: blocked });
        return { ...base, ok: false, ms: Date.now() - t0, error: blocked };
      }
    }
    this.emit("dispatch", cmd);
    try {
      const result = await handler(cmd.params, cmd);
      const out = { ...base, ok: true, result, ms: Date.now() - t0 };
      this.emit("result", out);
      return out;
    } catch (e) {
      const error = AzyError.from(e).toStructured();
      const out = { ...base, ok: false, error, ms: Date.now() - t0 };
      this.emit("result", out);
      return out;
    }
  }
};

// packages/core/src/modules/module-manager.ts
var import_node_events10 = require("node:events");
var fs8 = __toESM(require("node:fs"));
var path14 = __toESM(require("node:path"));
var ModuleManager = class extends import_node_events10.EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  opts;
  hostProbes = /* @__PURE__ */ new Map();
  modules = /* @__PURE__ */ new Map();
  hosts = /* @__PURE__ */ new Map();
  busy = /* @__PURE__ */ new Set();
  lastErrors = /* @__PURE__ */ new Map();
  restartNeeded = /* @__PURE__ */ new Set();
  registerHost(id, label, minVersion, probe) {
    this.hostProbes.set(id, { label, probe, minVersion });
  }
  registerModule(m) {
    this.modules.set(m.id, m);
  }
  /** Re-probe hosts; auto-install if configured; emit "status". */
  async refresh() {
    for (const [id, h] of this.hostProbes) {
      try {
        const r = await h.probe();
        const supported = !r.installed || !r.version ? true : gte(r.version, h.minVersion);
        this.hosts.set(id, { id, label: h.label, installed: r.installed, running: r.running, version: r.version, beta: r.beta, supported, reason: supported ? void 0 : `${h.label} ${r.version} is older than ${h.minVersion}` });
      } catch (e) {
        this.hosts.set(id, { id, label: h.label, installed: false, running: false, supported: true, reason: e.message });
      }
    }
    if (this.opts.autoInstall !== false) {
      for (const m of this.modules.values()) {
        const host = this.hosts.get(m.host);
        if (!host?.installed || !host.supported) continue;
        const st = this.partStates(m);
        const stale = (m.retire?.() ?? []).some((p) => !!safe(() => p.installedVersion(p.target)));
        if (stale || st.some((p) => p.state === "not-installed" || p.state === "outdated")) await this.ensureInstalled(m.id);
      }
    }
    const status = this.status();
    this.emit("status", status);
    return status;
  }
  /** Install or update every installable part of a module. Safe to call repeatedly. */
  async ensureInstalled(moduleId) {
    const m = this.modules.get(moduleId);
    if (!m) throw new Error(`unknown Azy module ${moduleId}`);
    if (this.busy.has(moduleId)) return this.moduleStatus(m);
    this.busy.add(moduleId);
    this.emit("status", this.status());
    try {
      for (const stale of m.retire?.() ?? []) {
        if (stale.installedVersion(stale.target)) {
          this.log?.info(`removing superseded ${stale.label} from ${stale.target}`);
          try {
            fs8.rmSync(stale.target, { recursive: true, force: true });
          } catch (e) {
            this.log?.warn(`could not remove ${stale.label}`, { error: e.message });
          }
          if (this.hosts.get(m.host)?.running) this.restartNeeded.add(`${m.id}/${stale.id}`);
        }
      }
      for (const part of partsOf(m)) {
        const key = `${moduleId}/${part.id}`;
        const installed = part.installedVersion(part.target);
        if (installed && gte(installed, part.bundledVersion) && installed === part.bundledVersion) continue;
        if (!fs8.existsSync(part.source)) continue;
        try {
          this.log?.info(`installing ${part.label} ${part.bundledVersion} \u2192 ${part.target}`, { was: installed });
          fs8.rmSync(part.target, { recursive: true, force: true });
          fs8.mkdirSync(path14.dirname(part.target), { recursive: true });
          fs8.cpSync(part.source, part.target, { recursive: true, filter: (p) => !/install\.js$/.test(p) });
          await part.postInstall?.();
          this.lastErrors.delete(key);
          if (part.requiresHostRestart && this.hosts.get(m.host)?.running) this.restartNeeded.add(key);
        } catch (e) {
          this.lastErrors.set(key, e.message);
          this.log?.warn(`install of ${part.label} failed`, { error: e.message });
        }
      }
    } finally {
      this.busy.delete(moduleId);
    }
    const st = this.moduleStatus(m);
    this.emit("status", this.status());
    return st;
  }
  /** The connected runtime reported in → a pending "restart host" flag for that part is cleared. */
  noteRuntimeConnected(moduleId) {
    for (const k of [...this.restartNeeded]) if (k.startsWith(moduleId + "/")) this.restartNeeded.delete(k);
    this.emit("status", this.status());
  }
  status() {
    return { azyVersion: this.opts.azyVersion, hosts: [...this.hosts.values()], modules: [...this.modules.values()].map((m) => this.moduleStatus(m)), updatedAt: Date.now() };
  }
  moduleStatus(m) {
    const parts = this.partStates(m);
    const host = this.hosts.get(m.host);
    const busy = this.busy.has(m.id);
    const install = parts.some((p) => p.state === "error") ? "error" : parts.some((p) => p.state === "manual-required") ? "manual-required" : parts.some((p) => p.state === "not-installed") ? "not-installed" : parts.some((p) => p.state === "outdated") ? "outdated" : "installed";
    let connection = m.connection();
    const needsRestart = [...this.restartNeeded].some((k) => k.startsWith(m.id + "/"));
    if (connection !== "connected" && needsRestart) connection = "restart-host";
    const hostLabel = host ? `${host.label}${host.version ? " " + hostYear(host.version) : ""}` : m.label;
    let summary;
    let next;
    if (busy) {
      summary = `Setting up Azy in ${host?.label ?? m.label}\u2026`;
    } else if (host && !host.installed) {
      summary = `${host.label} not found on this computer`;
    } else if (host && !host.supported) {
      summary = `${hostLabel} isn't supported`;
      next = host.reason;
    } else if (install === "error") {
      summary = `Azy couldn't set up ${host?.label ?? m.label}`;
      next = parts.find((p) => p.error)?.error;
    } else if (install === "manual-required") {
      summary = `One more step to finish Azy in ${host?.label ?? m.label}`;
      next = parts.find((p) => p.manualInstallHint)?.manualInstallHint;
    } else if (install === "outdated" && connection === "connected") {
      summary = `Azy is running in ${hostLabel}`;
      next = `An update is ready \u2014 restart ${host?.label ?? m.label} when convenient.`;
    } else if (install !== "installed") {
      summary = `Azy in ${host?.label ?? m.label} needs ${install === "outdated" ? "an update" : "to be installed"}`;
      next = parts.find((p) => p.state !== "installed" && p.manualInstallHint)?.manualInstallHint ?? "Azy will do this automatically.";
    } else if (!host?.running) {
      summary = `Ready \u2014 open ${host?.label ?? m.label} to use Azy there`;
    } else if (connection === "restart-host") {
      summary = `Restart ${host.label} to finish updating Azy`;
      next = `Azy updated its ${host.label} module; ${host.label} loads it on next start.`;
    } else if (connection === "connected") {
      summary = `Azy is running in ${hostLabel}`;
    } else {
      summary = `${hostLabel} is open \u2014 Azy is starting inside it\u2026`;
      next = `If this takes more than a few seconds, open ${m.openHint?.() ?? "Azy"} in ${host.label}.`;
    }
    return { id: m.id, host: m.host, label: m.label, parts, install, connection, runtimeVersion: m.runtimeVersion?.(), summary, next, busy };
  }
  partStates(m) {
    return partsOf(m).map((p) => {
      const key = `${m.id}/${p.id}`;
      const installedVersion = safe(() => p.installedVersion(p.target));
      const error = this.lastErrors.get(key);
      let state;
      if (error) state = "error";
      else if (!installedVersion) state = p.manualInstallHint ? "manual-required" : "not-installed";
      else if (installedVersion !== p.bundledVersion) state = "outdated";
      else state = "installed";
      return { id: p.id, label: p.label, state, installedVersion, bundledVersion: p.bundledVersion, target: p.target, error, manualInstallHint: state === "manual-required" || state === "outdated" && !fs8.existsSync(p.source) ? p.manualInstallHint : void 0 };
    });
  }
  get log() {
    return this.opts.logger;
  }
};
function partsOf(m) {
  return typeof m.parts === "function" ? m.parts() : m.parts;
}
function safe(fn) {
  try {
    return fn();
  } catch {
    return void 0;
  }
}
function hostYear(version) {
  const major = Number(version.split(".")[0]);
  return Number.isFinite(major) && major > 20 ? String(2e3 + major) : version;
}
function readJsonVersion(file, key = "version") {
  try {
    const j = JSON.parse(fs8.readFileSync(file, "utf8"));
    return typeof j[key] === "string" ? j[key] : void 0;
  } catch {
    return void 0;
  }
}
function readCepManifestVersion(file) {
  try {
    const m = /ExtensionBundleVersion="([^"]+)"/.exec(fs8.readFileSync(file, "utf8"));
    return m?.[1];
  } catch {
    return void 0;
  }
}

// packages/core/src/modules/premiere-module.ts
var fs9 = __toESM(require("node:fs"));
var os2 = __toESM(require("node:os"));
var path15 = __toESM(require("node:path"));
var import_node_child_process2 = require("node:child_process");
var import_node_util2 = require("node:util");
var execFileP2 = (0, import_node_util2.promisify)(import_node_child_process2.execFile);
var PREMIERE_MODULE_ID = "premiere";
var PREMIERE_MIN_VERSION = "23.0.0";
var LEGACY_CEP_BUNDLE_ID = "com.azy.panel";
var CEP_EXTENSION_ID = "com.azy.premiere.connector";
var CSXS_VERSIONS = [9, 10, 11, 12];
function cepExtensionsDir(platform = process.platform) {
  if (platform === "win32") return path15.join(process.env.APPDATA ?? path15.join(os2.homedir(), "AppData", "Roaming"), "Adobe", "CEP", "extensions");
  if (platform === "darwin") return path15.join(os2.homedir(), "Library", "Application Support", "Adobe", "CEP", "extensions");
  return path15.join(os2.homedir(), ".config", "Adobe", "CEP", "extensions");
}
function uxpPluginsDir(platform = process.platform) {
  if (platform === "win32") return path15.join(process.env.APPDATA ?? path15.join(os2.homedir(), "AppData", "Roaming"), "Adobe", "UXP", "Plugins", "External");
  if (platform === "darwin") return path15.join(os2.homedir(), "Library", "Application Support", "Adobe", "UXP", "Plugins", "External");
  return path15.join(os2.homedir(), ".config", "Adobe", "UXP", "Plugins", "External");
}
function sameFile(a, b) {
  try {
    const sa = fs9.statSync(a), sb = fs9.statSync(b);
    if (sa.size !== sb.size) return false;
    return fs9.readFileSync(a).equals(fs9.readFileSync(b));
  } catch {
    return true;
  }
}
function premiereInstalledVersion(platform = process.platform) {
  const dirs = [];
  if (platform === "win32") {
    for (const root of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]].filter(Boolean)) dirs.push(path15.join(root, "Adobe"));
  } else if (platform === "darwin") dirs.push("/Applications");
  const years = [];
  for (const d of dirs) {
    try {
      for (const name of fs9.readdirSync(d)) {
        const m = /^Adobe Premiere Pro( \(Beta\))?(?: (\d{4}))?(\.app)?$/.exec(name);
        if (m && m[2]) years.push(Number(m[2]));
      }
    } catch {
    }
  }
  if (!years.length) return void 0;
  return `${Math.max(...years) - 2e3}.0.0`;
}
async function setPlayerDebugMode(enable, platform = process.platform) {
  const value = enable ? "1" : "0";
  if (platform === "win32") {
    for (const v of CSXS_VERSIONS) {
      await execFileP2("reg", ["add", `HKCU\\Software\\Adobe\\CSXS.${v}`, "/v", "PlayerDebugMode", "/t", "REG_SZ", "/d", value, "/f"], { windowsHide: true, timeout: 1e4 });
    }
  } else if (platform === "darwin") {
    for (const v of CSXS_VERSIONS) await execFileP2("defaults", ["write", `com.adobe.CSXS.${v}`, "PlayerDebugMode", value], { timeout: 1e4 });
  }
}
async function playerDebugModeEnabled(platform = process.platform) {
  try {
    if (platform === "win32") {
      const { stdout } = await execFileP2("reg", ["query", "HKCU\\Software\\Adobe\\CSXS.11", "/v", "PlayerDebugMode"], { windowsHide: true, timeout: 1e4 });
      return /PlayerDebugMode\s+REG_SZ\s+1/.test(stdout);
    }
    if (platform === "darwin") {
      const { stdout } = await execFileP2("defaults", ["read", "com.adobe.CSXS.11", "PlayerDebugMode"], { timeout: 1e4 });
      return stdout.trim() === "1";
    }
  } catch {
  }
  return false;
}
function registerPremiereModule(o) {
  const platform = o.platform ?? process.platform;
  const cepDir = o.cepExtensionsDir ?? cepExtensionsDir(platform);
  const uxpDir = o.uxpInstallDir ?? uxpPluginsDir(platform);
  const source = path15.join(o.bundleDir, "connector");
  const setDebug = o.setPlayerDebugMode ?? ((enable) => setPlayerDebugMode(enable, platform));
  let lastHostVersion;
  const legacyCep = {
    id: "ui",
    label: "Azy panel (legacy extension)",
    source: path15.join(o.bundleDir, "__legacy_cep__"),
    target: path15.join(cepDir, LEGACY_CEP_BUNDLE_ID),
    bundledVersion: "0.0.0",
    installedVersion: (t) => readCepManifestVersion(path15.join(t, "CSXS", "manifest.xml")),
    requiresHostRestart: true
  };
  const legacyUxp = {
    id: "uxp",
    label: "Azy runtime (legacy UXP plugin)",
    source: path15.join(o.bundleDir, "__legacy_uxp__"),
    target: path15.join(uxpDir, CEP_EXTENSION_ID),
    bundledVersion: "0.0.0",
    installedVersion: (t) => readJsonVersion(path15.join(t, "manifest.json")) ?? readJsonVersion(path15.join(t, "PluginInfo", "manifest.json")),
    requiresHostRestart: true
  };
  o.manager.registerHost(PREMIERE_MODULE_ID, "Premiere Pro", PREMIERE_MIN_VERSION, async () => {
    const proc = o.processMonitor.current ?? await detectPremiere();
    const installed = (o.installedVersion ?? (() => premiereInstalledVersion(platform)))();
    const live = o.connector.status.phase === "connected" ? o.connector.status.host : void 0;
    const running = proc.running || !!live;
    lastHostVersion = live?.version ?? proc.version ?? installed;
    const unknown = !!proc.error && !installed && !running;
    return { installed: !!installed || running || unknown, running, version: lastHostVersion, beta: proc.beta };
  });
  const runtime = {
    id: "runtime",
    label: "Azy for Premiere Pro (extension)",
    source,
    target: path15.join(cepDir, CEP_EXTENSION_ID),
    bundledVersion: readCepManifestVersion(path15.join(source, "CSXS", "manifest.xml")) ?? "0.0.0",
    installedVersion: (t) => {
      const live = o.connector.status.runtime?.version;
      if (live) return live;
      const v = readCepManifestVersion(path15.join(t, "CSXS", "manifest.xml"));
      if (!v) return void 0;
      if (!fs9.existsSync(path15.join(t, "index.js")) || !fs9.existsSync(path15.join(t, "host", "azy.jsx"))) return void 0;
      for (const f of ["index.js", "index.html", path15.join("host", "azy.jsx")]) {
        if (!sameFile(path15.join(source, f), path15.join(t, f))) return `${v}-stale`;
      }
      return v;
    },
    postInstall: async () => {
      try {
        await setDebug(true);
      } catch (e) {
        throw new Error(`Premiere's extension flag could not be set: ${e.message}`);
      }
    },
    requiresHostRestart: true
  };
  o.manager.registerModule({
    id: PREMIERE_MODULE_ID,
    host: "premiere",
    label: "Azy in Premiere Pro",
    parts: () => [runtime],
    minHostVersion: PREMIERE_MIN_VERSION,
    openHint: () => "Window \u203A Extensions \u203A Azy",
    retire: () => [legacyCep, legacyUxp],
    connection: () => {
      const s = o.connector.status;
      if (s.phase === "connected") return "connected";
      if (s.phase === "premiere-not-running") return "host-not-running";
      return "connecting";
    },
    runtimeVersion: () => o.connector.status.runtime?.version
  });
  o.connector.on("status", (s) => {
    if (s.phase === "connected") o.manager.noteRuntimeConnected(PREMIERE_MODULE_ID);
    void o.manager.refresh();
  });
  o.processMonitor.onChange(() => void o.manager.refresh());
}

// packages/core/src/electron/main.ts
async function createPresetsRuntime(opts) {
  const logger = opts.logger ?? defaultLogger;
  if (opts.debug) logger.setLevel("debug");
  const library = new PresetLibrary({ dataDir: path16.join(opts.dataDir, "presets"), logger: logger.child("library") });
  const premierePresets = new PremierePresetsSource({
    dataDir: path16.join(opts.dataDir, "presets"),
    documentsDirs: opts.premiereDocumentsDirs,
    logger: logger.child("ppro-presets"),
    isFavorite: (id) => library.meta.isFavorite(id),
    lastUsed: (id) => library.meta.lastUsedOf(id)
  });
  const server = new BridgeServer({ dataDir: path16.join(opts.dataDir, "bridge"), azyVersion: opts.azyVersion, logger: logger.child("bridge"), devPairingCode: opts.devPairingCode });
  const processMonitor = new PremiereProcessMonitor();
  const connector = new BridgeConnector({ server, processMonitor, logger: logger.child("connector") });
  const drag = new DragSession({ library, connector, logger: logger.child("drag") });
  server.inbound.log = ({ level, message, data }) => {
    logger.log(level, "premiere", message, data);
    return { ok: true };
  };
  server.inbound.getDragState = () => {
    const s = drag.current;
    return { active: s.phase !== "idle", presetId: s.presetId, presetName: s.presetName, startedAt: s.startedAt };
  };
  server.inbound.confirmDrag = ({ target }) => drag.confirm(target);
  await library.start();
  await premierePresets.start();
  await server.start();
  const reverse = new ReverseDialer({ bridgeDir: opts.reverseBridgeDir ?? path16.join(opts.dataDir, "bridge"), server, logger: logger.child("bridge") });
  reverse.start();
  const snap = new SnapAction({ dataDir: path16.join(opts.dataDir, "presets"), connector, server, premierePresets, meta: library.meta, logger: logger.child("snap") });
  await snap.start();
  const flow = new Flow({ dataDir: path16.join(opts.dataDir, "presets"), connector, server, meta: library.meta, logger: logger.child("flow") });
  await flow.start();
  const modules = new ModuleManager({ azyVersion: opts.azyVersion, logger: logger.child("modules"), autoInstall: opts.autoInstallModules ?? !!opts.moduleBundleDir });
  if (opts.moduleBundleDir) {
    registerPremiereModule({ manager: modules, connector, processMonitor, bundleDir: opts.moduleBundleDir, logger: logger.child("premiere-module"), cepExtensionsDir: opts.moduleInstallDirs?.cep, uxpInstallDir: opts.moduleInstallDirs?.uxp });
    void modules.refresh().catch((e) => logger.log("warn", "modules", "initial refresh failed", { error: e.message }));
  }
  const commands = new CommandBus();
  commands.gateTarget("premiere", () => {
    const st = connector.status;
    if (st.phase === "connected") return void 0;
    if (st.phase === "premiere-not-running") return { code: ErrorCodes.PREMIERE_NOT_RUNNING, message: "Premiere Pro is not running. Open Premiere Pro to use this." };
    if (st.phase === "unsupported-version") return { code: ErrorCodes.UNSUPPORTED_PREMIERE_VERSION, message: st.detail };
    return { code: ErrorCodes.CONNECTOR_NOT_CONNECTED, message: "Azy is still starting inside Premiere Pro \u2014 try again in a moment." };
  });
  commands.register("flow", "list", (p = {}) => flow.search(p.query ?? "", p.opts ?? {}));
  commands.register("flow", "get", (p) => flow.get(p.id));
  commands.register("flow", "status", () => flow.status());
  commands.register("flow", "keyframes", (p = {}) => flow.keyframes(p.scope));
  commands.register("flow", "apply", (p) => flow.apply(p.id, p.scope, void 0, p.speed, p.boundaries));
  commands.register("flow", "setFavorite", (p) => flow.setFavorite(p.id, p.favorite));
  commands.register("presets", "apply", async (p) => {
    const plan = await resolvePlan({ library, premierePresets }, p.id);
    return connector.applyPreset(plan, p.target ?? { mode: "selection" }, p.options ?? {});
  });
  commands.register("sfx", "place", (p) => placeAudio({ server, connector, library }, p.path, p.name ?? p.path));
  commands.register("snap", "apply", (p) => snap.apply(p.id, p.target, void 0, p.options));
  commands.register("snap", "search", (p = {}) => snap.search(p.query ?? "", p.filter ?? {}, p.limit));
  commands.register("host", "state", () => connector.getState());
  commands.register("host", "selection", () => connector.getSelection());
  commands.register("modules", "status", () => modules.status());
  commands.register("modules", "refresh", () => modules.refresh());
  commands.register("link", "reconnect", async () => {
    reverse.kick();
    await processMonitor.refresh().catch(() => void 0);
    return { ok: true, connected: server.connected };
  });
  commands.register("modules", "repair", (p = {}) => modules.ensureInstalled(p.id ?? PREMIERE_MODULE_ID));
  return {
    library,
    premierePresets,
    server,
    reverse,
    connector,
    drag,
    snap,
    flow,
    processMonitor,
    modules,
    commands,
    logger,
    async shutdown() {
      snap.stop();
      await flow.flush();
      flow.stop();
      drag.cancel("shutdown");
      processMonitor.stop();
      reverse.stop();
      await server.stop();
      await premierePresets.stop();
      await library.stop();
    }
  };
}
function registerPresetIpc(ipcMain, rt, targets, shell = {}) {
  const api = {
    pinFolder: (p, o) => rt.library.pinFolder(p, o),
    unpinFolder: (id) => rt.library.unpinFolder(id),
    updateFolder: async (id, patch) => rt.library.updateFolder(id, patch),
    getFolders: async () => rt.library.getFolders(),
    rescan: (id) => rt.library.rescan(id),
    browse: async (folderId, relDir) => rt.library.browse(folderId, relDir),
    search: async (q, scope, limit) => rt.library.searchPresets(q, scope, limit),
    favorites: async () => rt.library.favorites(),
    recent: async (limit) => rt.library.recent(limit),
    get: async (id) => rt.library.get(id),
    setFavorite: async (id, fav) => rt.library.setFavorite(id, fav),
    getPlan: (id) => resolvePlan(rt, id),
    renameFile: (id, name) => rt.library.renameFile(id, name),
    removeFromIndex: async (id) => rt.library.removeFromIndex(id),
    deleteFile: (id) => rt.library.deleteFile(id, shell.trashItem ? (p) => shell.trashItem(p) : void 0),
    revealInFolder: async (id) => {
      const p = rt.library.pathOf(id);
      if (p && shell.revealItemInFolder) shell.revealItemInFolder(p);
    },
    getConnection: async () => rt.connector.status,
    beginPairing: async () => rt.server.beginPairing(),
    forgetTokens: () => rt.server.forgetAllTokens(),
    premiereState: () => rt.connector.getState(),
    premiereSelection: () => rt.connector.getSelection(),
    applyPreset: async (presetId, target = { mode: "selection" }, options = {}) => {
      const plan = await resolvePlan(rt, presetId);
      const { operationId, ...rest } = options ?? {};
      const res = await rt.connector.applyPreset(plan, target, rest, operationId || void 0);
      if (res.state === "SUCCESS" || res.state === "PARTIAL") {
        if (PremierePresetsSource.isPremiereId(presetId)) rt.library.meta.markUsed(presetId);
        else rt.library.markUsed(presetId);
      }
      return res;
    },
    pproSources: async () => rt.premierePresets.sources(),
    pproDiscover: () => rt.premierePresets.discover(),
    pproAddFile: (p) => rt.premierePresets.addFile(p),
    pproSetPinned: async (id, pinned) => rt.premierePresets.setPinned(id, pinned),
    pproBrowse: async (id, bin) => rt.premierePresets.browse(id, bin),
    pproSearch: async (q, id, limit) => rt.premierePresets.search(q, id, limit),
    pproGet: async (id) => rt.premierePresets.get(id),
    pproSetFavorite: async (id, fav) => {
      rt.library.meta.setFavorite(id, fav);
      return rt.premierePresets.get(id);
    },
    dragBegin: (id) => rt.drag.begin(id),
    dragConfirm: (target) => rt.drag.confirm(target),
    dragCancel: async (reason) => rt.drag.cancel(reason),
    dragState: async () => rt.drag.current,
    snapStatus: async () => rt.snap.status(),
    snapSync: () => rt.snap.sync("manual"),
    snapSearch: async (q, filter, limit) => rt.snap.search(q ?? "", filter ?? {}, limit),
    snapGet: async (id) => rt.snap.get(id),
    snapSetFavorite: async (id, fav) => rt.snap.setFavorite(id, fav),
    snapApply: (id, target, options) => rt.snap.apply(id, target, void 0, options),
    placeAudio: (p, name) => placeAudio(rt, p, name),
    placeMedia: (p, name, opts) => placeMedia(rt, p, name, opts),
    flowStatus: async () => rt.flow.status(),
    flowList: async (q, o) => rt.flow.search(q ?? "", o ?? {}),
    flowGet: async (id) => rt.flow.get(id),
    flowSetFavorite: async (id, fav) => rt.flow.setFavorite(id, fav),
    flowCreate: async (input) => rt.flow.createPreset(input),
    flowUpdate: async (id, patch) => rt.flow.updatePreset(id, patch),
    flowDelete: async (id) => rt.flow.deletePreset(id),
    flowDuplicate: async (id, name) => rt.flow.duplicatePreset(id, name),
    flowKeyframes: (scope) => rt.flow.keyframes(scope),
    flowApply: (id, scope, speed, boundaries, operationId) => rt.flow.apply(id, scope, operationId || void 0, speed, boundaries),
    cancelOperation: (operationId) => rt.flow.cancel(String(operationId || "")),
    azyStatus: async () => rt.modules.status(),
    azyCommand: (cmd) => rt.commands.dispatch(cmd),
    moduleRepair: (id) => rt.modules.ensureInstalled(id ?? PREMIERE_MODULE_ID),
    moduleRefresh: () => rt.modules.refresh(),
    getLog: async (limit = 500) => rt.logger.entries().slice(-limit),
    setDebug: async (enabled) => rt.logger.setLevel(enabled ? "debug" : "info")
  };
  const channels = Object.keys(api).map((k) => [IPC[k], api[k]]);
  for (const [ch, fn] of channels) ipcMain.handle(ch, (_e, ...args) => fn(...args));
  const broadcast = (channel, payload) => {
    for (const wc of targets()) {
      if (wc.isDestroyed?.()) continue;
      try {
        wc.send(channel, payload);
      } catch {
      }
    }
  };
  const offs = [];
  const sub = (emitter, ev, ch) => {
    const f = (payload) => broadcast(ch, payload);
    emitter.on(ev, f);
    offs.push(() => emitter.off?.(ev, f));
  };
  sub(rt.library, "change", IPC_EVENTS.indexChange);
  sub(rt.library, "scan", IPC_EVENTS.scan);
  sub(rt.connector, "status", IPC_EVENTS.connection);
  sub(rt.drag, "state", IPC_EVENTS.drag);
  sub(rt.server, "pairing", IPC_EVENTS.pairing);
  sub(rt.premierePresets, "change", IPC_EVENTS.pproChange);
  sub(rt.snap, "change", IPC_EVENTS.snapChange);
  sub(rt.flow, "change", IPC_EVENTS.flowChange);
  sub(rt.flow, "applied", IPC_EVENTS.flowApplied);
  sub(rt.server, "evt:operationProgress", IPC_EVENTS.operationProgress);
  sub(rt.connector, "operation", IPC_EVENTS.operationState);
  sub(rt.modules, "status", IPC_EVENTS.azyStatus);
  return () => {
    for (const [ch] of channels) ipcMain.removeHandler(ch);
    for (const off of offs) off();
  };
}
async function resolvePlan(rt, presetId) {
  if (PremierePresetsSource.isPremiereId(presetId)) {
    const plan = rt.premierePresets.getPlan(presetId);
    if (!plan) throw Object.assign(new Error("Preset no longer exists in Premiere's presets file"), { code: "INVALID_PRESET" });
    return plan;
  }
  return rt.library.getPlan(presetId);
}
async function placeMedia(rt, filePath, name, opts = {}) {
  const st = rt.connector.status;
  if (st.phase !== "connected") {
    const code = st.phase === "premiere-not-running" ? ErrorCodes.PREMIERE_NOT_RUNNING : ErrorCodes.CONNECTOR_NOT_CONNECTED;
    throw new AzyError(code, code === ErrorCodes.PREMIERE_NOT_RUNNING ? "Premiere Pro is not running." : "Azy is still starting inside Premiere Pro \u2014 try again in a moment.");
  }
  const kind = opts && opts.kind === "image" ? "image" : "video";
  // v1.18 Auto-Cut: keep the first keepSeconds as one section (the old equal-pieces cutSeconds is retired;
  // it is always sent as 0 so a not-yet-updated Premiere extension places the full clip, never pieces).
  const keep = Number(opts && opts.keepSeconds);
  const keepSeconds = Number.isFinite(keep) && keep > 0 ? Math.min(600, Math.max(0.5, keep)) : 0;
  const sc = Number(opts && opts.scale);
  // Auto Scale: the NEW clip only, and VIDEO only (v1.19) — an image/unknown kind is never scaled.
  const scale = opts && opts.kind === "video" && Number.isFinite(sc) && sc > 0 ? Math.min(10000, sc) : 0;
  try {
    return await rt.server.request("placeMedia", { operationId: newOperationId(), path: filePath, name, kind, cutSeconds: 0, keepSeconds, scale }, 12e4);
  } catch (err) {
    // A connector from before v1.17 has no placeMedia: say what to do instead of a raw protocol error.
    if (err && err.code === "UNSUPPORTED_COMMAND" || /does not implement|unknown op/i.test(String(err && err.message))) {
      throw new AzyError(ErrorCodes.CONNECTOR_NOT_CONNECTED, "Restart Premiere Pro once so Azy can update its Premiere extension (needed for Apply on video and images).");
    }
    throw err;
  }
}
async function placeAudio(rt, filePath, name) {
  const st = rt.connector.status;
  if (st.phase !== "connected") {
    const code = st.phase === "premiere-not-running" ? ErrorCodes.PREMIERE_NOT_RUNNING : ErrorCodes.CONNECTOR_NOT_CONNECTED;
    throw new AzyError(code, code === ErrorCodes.PREMIERE_NOT_RUNNING ? "Premiere Pro is not running." : "Azy is still starting inside Premiere Pro \u2014 try again in a moment.");
  }
  const operationId = newOperationId();
  const res = await rt.server.request("placeAudio", { operationId, path: filePath, name }, 6e4);
  rt.library.meta.markUsed("sfx:" + filePath);
  return res;
}

// packages/core/src/electron/preload.ts
function buildPresetPreloadApi(ipcRenderer) {
  const api = {};
  for (const key of Object.keys(IPC)) {
    api[key] = (...args) => ipcRenderer.invoke(IPC[key], ...args);
  }
  api.on = (event, fn) => {
    const channel = IPC_EVENTS[event];
    const listener = (_e, payload) => fn(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  };
  return api;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BridgeConnector,
  BridgeError,
  BridgeServer,
  CEP_EXTENSION_ID,
  CSXS_VERSIONS,
  CommandBus,
  DragSession,
  Flow,
  FolderWatcher,
  IPC,
  IPC_EVENTS,
  LEGACY_CEP_BUNDLE_ID,
  Logger,
  MAX_PRFPSET_BYTES,
  MetadataStore,
  ModuleManager,
  PREMIERE_MIN_VERSION,
  PREMIERE_MODULE_ID,
  PREMIERE_PRESETS_FILE,
  PremierePresetsSource,
  PremiereProcessMonitor,
  PresetIndex,
  PresetLibrary,
  PresetSearch,
  PrfpsetParseError,
  START_KEYFRAME_SENTINEL_TICKS,
  ScopedLogger,
  SnapAction,
  buildPresetPreloadApi,
  cepExtensionsDir,
  createPresetsRuntime,
  defaultLogger,
  defaultNameFromPath,
  detectPremiere,
  findFreePort,
  folderIdForPath,
  hostYear,
  isPrfpsetName,
  looksLikePrfpset,
  makeRecord,
  newOperationId,
  newPairingCode,
  newRequestId,
  newToken,
  normalizePath,
  parseKeyframeTuple,
  parsePackedColor,
  parsePrfpsetAll,
  parsePrfpsetFile,
  parsePrfpsetXml,
  parseTasklistCsv,
  parseValue,
  placeAudio,
  playerDebugModeEnabled,
  premiereInstalledVersion,
  presetIdForPath,
  readCepManifestVersion,
  readDiscovery,
  readJsonVersion,
  registerPremiereModule,
  registerPresetIpc,
  scanFolder,
  setPlayerDebugMode,
  statRecord,
  structuredObj,
  subsequenceScore,
  toRel,
  uxpPluginsDir,
  versionFromExePath
});
/*! Bundled license information:

normalize-path/index.js:
  (*!
   * normalize-path <https://github.com/jonschlinkert/normalize-path>
   *
   * Copyright (c) 2014-2018, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-extglob/index.js:
  (*!
   * is-extglob <https://github.com/jonschlinkert/is-extglob>
   *
   * Copyright (c) 2014-2016, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

is-glob/index.js:
  (*!
   * is-glob <https://github.com/jonschlinkert/is-glob>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-number/index.js:
  (*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

to-regex-range/index.js:
  (*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

fill-range/index.js:
  (*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   *)
*/
