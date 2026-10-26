function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

type TokenRule = {
  regex: RegExp
  render: (match: string) => string
}

function tokenizeHighlight(code: string, rules: TokenRule[]): string {
  const combinedSource = rules.map((r) => `(${r.regex.source})`).join('|')
  const masterRegex = new RegExp(combinedSource, 'g')

  let result = ''
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = masterRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, match.index))
    }

    const fullMatch = match[0]
    let rendered = escapeHtml(fullMatch)

    for (let i = 0; i < rules.length; i++) {
      if (match[i + 1] !== undefined) {
        rendered = rules[i].render(fullMatch)
        break
      }
    }

    result += rendered
    lastIndex = masterRegex.lastIndex
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex))
  }

  return result
}

export function highlightJson(code: string): string {
  return tokenizeHighlight(code, [
    {
      regex: /\/\/.*/,
      render: (m) => `<span class="text-slate-500 italic">${escapeHtml(m)}</span>`
    },
    {
      regex: /"(?:\\.|[^"\\])*"(?=\s*:)/,
      render: (m) => `<span class="text-sky-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /"(?:\\.|[^"\\])*"/,
      render: (m) => `<span class="text-emerald-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /\b(?:true|false|null)\b/,
      render: (m) => `<span class="text-amber-400 font-semibold">${escapeHtml(m)}</span>`
    },
    {
      regex: /-?\b\d+(?:\.\d+)?\b/,
      render: (m) => `<span class="text-purple-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /[{}\[\]:,]/,
      render: (m) => `<span class="text-slate-400">${escapeHtml(m)}</span>`
    }
  ])
}

export function highlightCode(
  code: string,
  lang: 'cURL' | 'JavaScript' | 'Python' | 'Go'
): string {
  if (lang === 'cURL') {
    return tokenizeHighlight(code, [
      {
        regex: /\bcurl\b/,
        render: (m) => `<span class="text-pink-400 font-semibold">${escapeHtml(m)}</span>`
      },
      {
        regex: /--[a-zA-Z-]+/,
        render: (m) => `<span class="text-sky-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:GET|POST|PUT|DELETE|PATCH)\b/,
        render: (m) => `<span class="text-amber-300 font-bold">${escapeHtml(m)}</span>`
      },
      {
        regex: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/,
        render: (m) => `<span class="text-emerald-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\\/,
        render: (m) => `<span class="text-slate-500">${escapeHtml(m)}</span>`
      }
    ])
  }

  if (lang === 'JavaScript') {
    return tokenizeHighlight(code, [
      {
        regex: /\/\/.*/,
        render: (m) => `<span class="text-slate-500 italic">${escapeHtml(m)}</span>`
      },
      {
        regex: /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/,
        render: (m) => `<span class="text-emerald-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:const|let|var|await|async|function|return)\b/,
        render: (m) => `<span class="text-purple-400 font-medium">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:fetch|console)\b/,
        render: (m) => `<span class="text-sky-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:json|log)\b(?=\s*\()/,
        render: (m) => `<span class="text-amber-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b[a-zA-Z_]\w*(?=\s*:)/,
        render: (m) => `<span class="text-indigo-300">${escapeHtml(m)}</span>`
      }
    ])
  }

  if (lang === 'Python') {
    return tokenizeHighlight(code, [
      {
        regex: /#.*/,
        render: (m) => `<span class="text-slate-500 italic">${escapeHtml(m)}</span>`
      },
      {
        regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
        render: (m) => `<span class="text-emerald-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:import|from|as|def|return)\b/,
        render: (m) => `<span class="text-purple-400 font-medium">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:print|request|json)\b(?=\s*\()/,
        render: (m) => `<span class="text-amber-300">${escapeHtml(m)}</span>`
      },
      {
        regex: /\b(?:requests|url|headers|response)\b/,
        render: (m) => `<span class="text-sky-300">${escapeHtml(m)}</span>`
      }
    ])
  }

  // Go
  return tokenizeHighlight(code, [
    {
      regex: /\/\/.*/,
      render: (m) => `<span class="text-slate-500 italic">${escapeHtml(m)}</span>`
    },
    {
      regex: /"(?:\\.|[^"\\])*"/,
      render: (m) => `<span class="text-emerald-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /\b(?:package|import|func|var|const|defer|return|if)\b/,
      render: (m) => `<span class="text-purple-400 font-medium">${escapeHtml(m)}</span>`
    },
    {
      regex: /\b(?:nil|string|error|main)\b/,
      render: (m) => `<span class="text-amber-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /\b(?:NewRequest|Add|Do|Close|ReadAll|Println)\b(?=\s*\()/,
      render: (m) => `<span class="text-indigo-300">${escapeHtml(m)}</span>`
    },
    {
      regex: /\b(?:http|io|fmt|DefaultClient|req|res|body)\b/,
      render: (m) => `<span class="text-sky-300">${escapeHtml(m)}</span>`
    }
  ])
}
