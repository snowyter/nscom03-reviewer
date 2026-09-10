/* math.js — a small, dependency-free LaTeX subset renderer.
 *
 * The site must work offline and deploy with no build step, so pulling in a
 * full math library is not an option. This covers exactly the constructs the
 * content actually uses (verified: \frac, \dfrac, \tfrac, \sum, \log, \times,
 * sub/superscripts, \sqrt, \overline, \underbrace, \text, and spacing macros)
 * and renders them as styled HTML with real fraction bars.
 *
 * Anything it cannot parse is left as readable text rather than dropped, so an
 * unsupported macro degrades to something a student can still read.
 */

(function (w) {
  "use strict";

  var SUBS = { "0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7",
               "8":"8","9":"9","+":"+","−":"−","-":"-","=":"=","(":"(",")":")",
               "n":"n","i":"i","j":"j","k":"k","m":"m","c":"c","a":"a","b":"b",
               "d":"d","e":"e","f":"f","g":"g","r":"r","s":"s","t":"t","x":"x",
               "L":"L","N":"N","B":"B","S":"S","C":"C","T":"T","G":"G","R":"R",
               "M":"M","P":"P","A":"A","V":"V","I":"I","K":"K","D":"D","F":"F" };

  // Words that should be upright rather than italic (operators, units, labels).
  var UPRIGHT = /^(max|min|bit|rate|data|signal|channel|total|prop|line|burst|link|frame|slot|sync|stat|chip|spread|mitigated|received|sent|of|and|or|is|the|with|per|plus|minus)$/i;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Consume one balanced {...} group starting at index i (which must be '{').
     Returns [content, nextIndex] or null. */
  function grab(s, i) {
    if (s[i] !== "{") return null;
    var depth = 0;
    for (var j = i; j < s.length; j++) {
      if (s[j] === "{") depth++;
      else if (s[j] === "}") {
        depth--;
        if (depth === 0) return [s.slice(i + 1, j), j + 1];
      }
    }
    return null;
  }

  /* Render a sequence of simple symbols. */
  function simp(s) {
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "\\") {
        // a macro inside a simple run: pass it through as text
        var m = /^\\([A-Za-z]+)/.exec(s.slice(i));
        if (m) { out += esc("\\" + m[1]); i += m[1].length; continue; }
      }
      if (/[A-Za-z]/.test(c)) {
        out += '<i class="mx-i">' + esc(c) + "</i>";
      } else if (c === "*") {
        out += '<span class="mx-op">×</span>';
      } else if (c === "-") {
        out += '<span class="mx-op">−</span>';
      } else if (c === " ") {
        out += "";
      } else {
        out += '<span class="mx-n">' + esc(c) + "</span>";
      }
    }
    return out;
  }

  /* Render with sub/superscript, \frac, \sqrt, \text, \overline, \underbrace. */
  function render(s) {
    var out = "";
    var i = 0;
    while (i < s.length) {
      var c = s[i];

      if (c === "{") {                     // bare group
        var g = grab(s, i);
        if (g) { out += render(g[0]); i = g[1]; continue; }
        i++; continue;
      }

      if (c === "\\") {
        var rest = s.slice(i);

        // text / mathrm / operatornames
        var tm = /^\\(text|mathrm|operatorname|mbox)\s*/.exec(rest);
        if (tm) {
          var tg = grab(s, i + tm[0].length);
          if (tg) {
            out += '<span class="mx-t">' + esc(tg[0]) + "</span>";
            i = tg[1]; continue;
          }
        }

        // fractions
        var fm = /^\\(frac|dfrac|tfrac)\s*/.exec(rest);
        if (fm) {
          var a = grab(s, i + fm[0].length);
          if (a) {
            var b = grab(s, a[1]);
            if (b) {
              out += '<span class="mx-frac"><span class="mx-num">' + render(a[0]) +
                     '</span><span class="mx-den">' + render(b[0]) + "</span></span>";
              i = b[1]; continue;
            }
          }
        }

        // sqrt
        var sm = /^\\sqrt\s*/.exec(rest);
        if (sm) {
          var sa = grab(s, i + sm[0].length);
          if (sa) {
            out += '<span class="mx-sqrt">√<span class="mx-rad">' + render(sa[0]) +
                   "</span></span>";
            i = sa[1]; continue;
          }
        }

        // overline / overbrace / underbrace with optional label
        var om = /^\\(overline|underbrace|overbrace|hat|bar)\s*/.exec(rest);
        if (om) {
          var oa = grab(s, i + om[0].length);
          if (oa) {
            var lbl = null, ni = oa[1];
            var lb = grab(s, ni);
            if (lb) { lbl = lb[0]; ni = lb[1]; }
            var cls = om[1] === "underbrace" ? "mx-under"
                    : om[1] === "overbrace" ? "mx-over" : "mx-bar";
            out += '<span class="' + cls + '">' + render(oa[0]) + "</span>";
            if (lbl) out += '<span class="mx-lbl">' + render(lbl) + "</span>";
            i = ni; continue;
          }
        }

        // spacing and punctuation macros
        var sp = /^\\(qquad|quad|,|;|:|!|\s)/.exec(rest);
        if (sp) {
          out += sp[1] === "qquad" ? '<span class="mx-sp2"></span>'
               : (sp[1] === "quad" ? '<span class="mx-sp"></span>' : '<span class="mx-thin"></span>');
          i += sp[0].length; continue;
        }

        // \begin{cases} a & cond \\ b & cond \end{cases} — piecewise definitions
        var bg = /^\\begin\s*/.exec(rest);
        if (bg) {
          var envG = grab(s, i + bg[0].length);
          if (envG && envG[0] === "cases") {
            var endIdx = s.indexOf("\\end{cases}", envG[1]);
            if (endIdx === -1) endIdx = s.length;
            var body = s.slice(envG[1], endIdx);
            var rows = body.split("\\\\").map(function (r) { return r.trim(); })
                           .filter(function (r) { return r.length; });
            var rowsHtml = rows.map(function (r) {
              var parts = r.split("&");
              var val = (parts[0] || "").trim();
              var cond = (parts[1] || "").trim();
              return '<span class="mx-case"><span class="mx-case-v">' + render(val) +
                     '</span><span class="mx-case-c">' + render(cond) + "</span></span>";
            }).join("");
            out += '<span class="mx-cases">' + rowsHtml + "</span>";
            i = s.indexOf("}", endIdx) === -1 ? s.length : s.indexOf("}", endIdx) + 1;
            continue;
          }
          // any other environment: skip its opener, render its body plainly
          var anyG = grab(s, i + bg[0].length);
          if (anyG) {
            var close = "\\end{" + anyG[0] + "}";
            var ci = s.indexOf(close, anyG[1]);
            var inner = ci === -1 ? s.slice(anyG[1]) : s.slice(anyG[1], ci);
            out += render(inner.replace(/\\\\/g, " ").replace(/&/g, " "));
            i = ci === -1 ? s.length : ci + close.length;
            continue;
          }
        }

        // sizing delimiters: \left( \right) etc. — the glyph itself is enough
        var lr = /^\\(left|right|big|Big|bigg|Bigg)\s*/.exec(rest);
        if (lr) {
          i += lr[0].length;
          var delim = s[i];
          if (delim && "()[]{}|.".indexOf(delim) >= 0) {
            if (delim === ".") { i++; continue; }   // invisible delimiter
            out += '<span class="mx-n">' + esc(delim) + "</span>";
            i++;
          }
          continue;
        }

        // symbol macros
        var SYMS = {
          times: "×", cdot: "·", approx: "≈", ge: "≥", le: "≤", ne: "≠",
          neq: "≠", geq: "≥", leq: "≤", pm: "±", to: "→", Rightarrow: "⟹",
          Longleftrightarrow: "⟺", Longrightarrow: "⟹", Longleftarrow: "⟸",
          infty: "∞", in: "∈", sum: "∑", prod: "∏", int: "∫",
          log: "log", ln: "ln", sin: "sin", cos: "cos", tan: "tan",
          max: "max", min: "min", mod: " mod ", bmod: "mod",
          deg: "deg", ldots: "…", dots: "…", cdots: "⋯",
          div: "÷", ll: "≪", gg: "≫",
          boxplus: "⊕", oplus: "⊕", otimes: "⊗", equiv: "≡",
          lambda: "λ", pi: "π", phi: "φ", varphi: "φ", Delta: "Δ",
          delta: "δ", sigma: "σ", omega: "ω", mu: "µ", eta: "η",
          tau: "τ", rho: "ρ", alpha: "α", beta: "β", gamma: "γ",
          theta: "θ", epsilon: "ε", varepsilon: "ε", Psi: "Ψ", psi: "ψ"
        };
        var mm2 = /^\\([A-Za-z]+)/.exec(rest);
        if (mm2) {
          var name = mm2[1];
          if (Object.prototype.hasOwnProperty.call(SYMS, name)) {
            var v = SYMS[name];
            if (v) {
              var isWord = /^(log|ln|sin|cos|tan|max|min|mod|bmod|deg)$/.test(name);
              out += isWord ? '<span class="mx-t">' + esc(v) + "</span>"
                            : '<span class="mx-op">' + esc(v) + "</span>";
            }
            i += mm2[0].length;
            continue;
          }
          // unknown macro: keep it visible so nothing silently disappears
          out += '<span class="mx-t">' + esc("\\" + name) + "</span>";
          i += mm2[0].length;
          continue;
        }

        // escaped characters, line breaks
        if (rest[1] === "\\") {
          out += '<span class="mx-br"></span>';
          i += 2; continue;
        }
        if (rest[1] === "%" || rest[1] === "&" || rest[1] === "#" ||
            rest[1] === "_" || rest[1] === "$" || rest[1] === "{") {
          out += '<span class="mx-n">' + esc(rest[1]) + "</span>";
          i += 2; continue;
        }
        i++; continue;
      }

      // sub / superscript
      if (c === "^" || c === "_") {
        var tag = c === "^" ? "mx-sup" : "mx-sub";
        var arg = grab(s, i + 1);
        if (arg) {
          out += '<span class="' + tag + '">' + render(arg[0]) + "</span>";
          i = arg[1]; continue;
        }
        // single-token argument
        var nx = s[i + 1];
        if (nx !== undefined) {
          out += '<span class="' + tag + '">' +
                 (/([A-Za-z0-9])/.test(nx) ? simp(nx) : esc(nx)) + "</span>";
          i += 2; continue;
        }
        i++; continue;
      }

      // plain symbol handling
      out += simp(c);
      i++;
    }
    return out;
  }

  w.MATH = {
    toHtml: function (tex) {
      try {
        var h = render(String(tex || ""));
        // collapse stray empty spacing spans
        return h.replace(/(<span class="mx-thin"><\/span>)+$/, "");
      } catch (e) {
        return '<span class="mx-t">' + esc(tex) + "</span>";
      }
    }
  };
})(window);
