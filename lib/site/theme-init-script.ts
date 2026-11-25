/**
 * The synchronous theme-boot script.
 *
 * This runs in `<head>` before first paint so the correct theme is
 * already applied when the page renders — there is no flash of the
 * wrong theme. It must therefore be plain ES5-compatible JavaScript
 * with no imports, no template-literal interpolation of code, and no
 * `//` comments (the script is emitted on a single line, where a line
 * comment would swallow the rest of the statement).
 *
 * It is kept in its own module rather than inline in `app/layout.tsx`
 * because the layout used to minify it with a whitespace collapse,
 * which silently broke the `try`/`catch` pairing and left the theme
 * unapplied.
 *
 * The `defaultTheme` value is the only variable input; it is
 * interpolated as a JSON string literal, so it is safe to inline.
 */

/**
 * Build the boot script.
 *
 * @param defaultTheme — the site default: "dark", "light" or "system".
 */
export function buildThemeInitScript(defaultTheme: string): string {
  return [
    '(function(){',
    'var root=document.documentElement;',
    'var resolved="dark";',
    'try{',
    'var stored=null;',
    'try{stored=window.localStorage.getItem("salekin-dev-theme")||window.localStorage.getItem("theme");}catch(e){}',
    'var pref=' + JSON.stringify(defaultTheme) + ';',
    'if(stored==="light"||stored==="dark"){resolved=stored;}',
    'else if(stored==="system"||(stored==null&&pref==="system")){',
    'resolved=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark";',
    '}',
    'else{resolved=(pref==="light"||pref==="dark")?pref:"dark";}',
    '}catch(e){resolved="dark";}',
    'root.setAttribute("data-theme",resolved);',
    'root.classList.toggle("dark",resolved==="dark");',
    'root.classList.toggle("light",resolved==="light");',
    'root.classList.add("js");',
    'try{',
    'var els=document.querySelectorAll(".reveal:not(.is-visible),.reveal-stagger:not(.is-visible)");',
    'var vh=window.innerHeight||document.documentElement.clientHeight;',
    'for(var i=0;i<els.length;i++){',
    'var r=els[i].getBoundingClientRect();',
    'if(r.top<vh&&r.bottom>0){els[i].setAttribute("data-reveal-shown","");}',
    '}',
    '}catch(e){}',
    'try{',
    'var hash=window.location.hash.replace(/^#/,"");',
    'var known=["hero","services","work","blog","experience","reviews","contact"];',
    'if(known.indexOf(hash)>=0){',
    'window.__specmdActive=hash;',
    'window.dispatchEvent(new CustomEvent("specmd:active-section",{detail:hash}));',
    '}',
    '}catch(e){}',
    '})();',
  ].join('');
}
