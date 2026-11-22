-- Pandoc Lua filter for the EPUB/PDF builds (see book.toml in this directory).

local is_latex = FORMAT:match('latex') ~= nil

local function is_blank(el)
  return el.t == 'Space' or el.t == 'SoftBreak' or el.t == 'LineBreak'
end

-- mdbook-pandoc keeps whitespace between raw HTML tags as `Str` nodes that
-- contain literal newlines. LaTeX turns a blank line inside a macro argument
-- (e.g. the contributor table's `<a><img/><br/>...</a>` -> `\href{..}{..}`)
-- into `\par` and aborts, so normalise such whitespace to ordinary spaces.
local function normalize_whitespace(el)
  if not el.text:find('\n', 1, true) then return nil end
  if el.text:match('^%s*$') then return pandoc.Space() end
  local out = pandoc.List()
  for word in el.text:gmatch('%S+') do
    if #out > 0 then out:insert(pandoc.Space()) end
    out:insert(pandoc.Str(word))
  end
  if el.text:match('^%s') then out:insert(1, pandoc.Space()) end
  if el.text:match('%s$') then out:insert(pandoc.Space()) end
  return out
end

-- LaTeX: bare URLs written as plain text have no break points and run into
-- the margin.
local function breakable_url(el)
  if not el.text:match('^https?://') or #el.text < 30 then return nil end
  local tex = pandoc.write(pandoc.Pandoc({ pandoc.Plain({ el }) }), 'latex')
  tex = tex:gsub('%s+$', ''):gsub('([/%.])', '%1\\allowbreak{}')
  return pandoc.RawInline('latex', tex)
end

-- LaTeX: same for long inline code (paths, URLs, `a::b::c`). Allow breaks
-- after a few separator characters.
local function breakable_code(el)
  if #el.text < 16 then return nil end
  local tex = pandoc.write(pandoc.Pandoc({ pandoc.Plain({ el }) }), 'latex')
  tex = tex:gsub('%s+$', '')
  if not tex:match('^\\texttt{') then return nil end
  tex = tex:gsub('([/%.,;@=])', '%1\\allowbreak{}')
           :gsub('::', '::\\allowbreak{}')
           :gsub('\\_', '\\_\\allowbreak{}')
           :gsub('\\&', '\\&\\allowbreak{}')
  return pandoc.RawInline('latex', tex)
end

-- LaTeX: raw HTML images often carry pixel sizes (e.g. width="2452"), which
-- become absolute lengths and overflow the page. Drop sizes wider than the
-- text block and let pandoc scale the image to fit (\pandocbounded).
local MAX_PX = 640 -- ~ A4 text width at 96 dpi

local function px(v)
  local n = v and v:match('^%s*([%d%.]+)%s*p?x?%s*$')
  return n and tonumber(n)
end

local function fit_image(el)
  local w = px(el.attributes.width)
  if w and w > MAX_PX then
    el.attributes.width = nil
    el.attributes.height = nil
    return el
  end
end

-- LaTeX: an image in the middle of a paragraph (or next to another image) is
-- scaled to the full line width but starts after the preceding content, so
-- it sticks out of the page. Give auto-sized images a paragraph of their own.
local function is_block_image(el)
  return el.t == 'Image' and not el.attributes.width and not el.attributes.height
end

local function split_images(blk)
  local n_img, has_other = 0, false
  for _, el in ipairs(blk.content) do
    if is_block_image(el) then
      n_img = n_img + 1
    elseif not is_blank(el) then
      has_other = true
    end
  end
  if n_img == 0 or (n_img == 1 and not has_other) then return nil end

  local out, cur = pandoc.List(), pandoc.List()
  local function flush()
    while #cur > 0 and is_blank(cur[#cur]) do cur:remove() end
    if #cur > 0 then
      out:insert(blk.t == 'Para' and pandoc.Para(cur) or pandoc.Plain(cur))
    end
    cur = pandoc.List()
  end
  for _, el in ipairs(blk.content) do
    if is_block_image(el) then
      flush()
      out:insert(pandoc.Para({ el }))
    elseif not (#cur == 0 and is_blank(el)) then
      cur:insert(el)
    end
  end
  flush()
  return out
end

-- Links to Markdown files that exist in src/ but are not chapters (not in
-- SUMMARY.md) end up pointing at the absolute path of mdbook-pandoc's
-- preprocessed copy on the build machine. Point them at GitHub instead.
local SOURCE_URL = 'https://github.com/sunface/rust-course/'

-- The contributor lists in about-book.md are HTML tables of
-- `<a href><img/><br/><sub><b>name</b></sub></a>`. The table itself is lost in
-- the conversion, which leaves avatars and names scattered across lines, so
-- turn every such link into a small fixed-width "card" (avatar above name)
-- that flows into a grid.
local function avatar_card(el)
  local img, name_inlines, broke = nil, pandoc.List(), false
  for _, x in ipairs(el.content) do
    if x.t == 'Image' and not img then
      img = x
    elseif x.t == 'LineBreak' then
      broke = broke or img ~= nil
    elseif not (is_blank(x) or x.t == 'RawInline'
                or (x.t == 'Str' and x.text:match('^%s*$'))) then
      if not img then return nil end
      name_inlines:insert(x)
    end
  end
  if not (img and broke and #name_inlines > 0) then return nil end
  -- For HTML-based output mdbook-pandoc keeps the name as raw HTML text,
  -- which pandoc.utils.stringify ignores.
  local parts = {}
  pandoc.Inlines(name_inlines):walk({
    Str = function(x) table.insert(parts, x.text) end,
    Space = function() table.insert(parts, ' ') end,
    RawInline = function(x) table.insert(parts, (x.text:gsub('<[^>]*>', ''))) end,
  })
  local name = table.concat(parts):gsub('%s+', ' '):gsub('^ ', ''):gsub(' $', '')
  if name == '' then return nil end
  local url = el.target
  img.attributes.height = nil
  if is_latex then
    img.attributes.width = '2cm'
    return {
      pandoc.RawInline('latex', '\\parbox[t]{2.6cm}{\\centering '),
      pandoc.Link({ img }, url),
      pandoc.RawInline('latex', '\\\\[2pt]{\\footnotesize '),
      pandoc.Link({ pandoc.Str(name) }, url),
      pandoc.RawInline('latex', '}}\\hspace{0.8em}'),
    }
  end
  img.attributes.width = '100px'
  return pandoc.Span(
    { pandoc.Link({ img }, url), pandoc.LineBreak(), pandoc.Link({ pandoc.Str(name) }, url) },
    { style = 'display: inline-block; width: 120px; margin: 0 0.5em 1em 0; '
              .. 'text-align: center; vertical-align: top;' })
end

-- What is left of those HTML tables (`<table>`, `<tbody>`, whitespace) after
-- mdbook-pandoc dropped the rows and cells; keeping it would wrap the cards in
-- a broken table in the EPUB.
local TABLE_TAGS = { table = true, thead = true, tbody = true, tfoot = true,
                     tr = true, td = true, th = true }

local function is_table_leftover(el)
  if not el.format:match('html') then return false end
  if el.text:match('^%s*$') then return true end
  local tag = el.text:match('^%s*</?(%a+)[^>]*>%s*$')
  return tag ~= nil and TABLE_TAGS[tag:lower()] == true
end

local function drop_table_leftover(el)
  if is_table_leftover(el) then return {} end
end

local function fix_link(el)
  local card = avatar_card(el)
  if card then return card end
  -- Raw HTML `<a href>` keeps `href` as an attribute as well, which would be
  -- written twice (invalid XHTML in the EPUB).
  el.attributes.href = nil
  local t = el.target
  if not t:match('^%a[%w+.-]*:') and not t:match('^#') then
    local path, frag = t:match('^.*/src/([^#]+)(#?.*)$')
    if path then
      local kind = path:match('%.%w+$') and 'blob' or 'tree'
      el.target = SOURCE_URL .. kind .. '/main/src/' .. path .. frag
    end
  end
  return el
end

-- Index the headings: every chapter file's first heading, and all ids.
-- With pandoc's file-scope, ids look like `<chapter path>.md__<id>`.
local function index_ids(doc)
  local ids, chapter_start, first_headers = {}, {}, {}
  local function record(el)
    local id = el.identifier
    if id and id ~= '' then
      ids[id] = true
      local chapter = id:match('^(.*%.md__)')
      if chapter and el.t == 'Header' and not chapter_start[chapter] then
        chapter_start[chapter] = id
        first_headers[id] = true
      end
    end
  end
  doc:walk({ Header = record, Div = record, Span = record, Link = record,
             Image = record, CodeBlock = record, Code = record })
  return ids, chapter_start, first_headers
end

-- Some cross-references point at anchors that don't exist (they are broken on
-- the website too, which then just shows the top of the page). Do the same
-- here: send them to the beginning of the target chapter instead of leaving a
-- dead link.
local function fix_dangling_links(doc, ids, chapter_start)
  return doc:walk({
    Link = function(el)
      local id = el.target:match('^#(.+)$')
      if not id or ids[id] then return nil end
      local chapter = id:match('^(.*%.md__)')
      local start = chapter and chapter_start[chapter]
      if start then
        el.target = '#' .. start
        return el
      end
    end,
  })
end

-- Start every chapter of SUMMARY.md (i.e. every source file, including
-- sub-chapters such as "2.1 变量绑定与解构") on a new page.
local PAGE_BREAK_CSS = 'break-before: page; page-break-before: always;'

local function chapter_page_breaks(doc, first_headers)
  return doc:walk({
    Blocks = function(blocks)
      local out = pandoc.Blocks({})
      for _, b in ipairs(blocks) do
        if b.t == 'Header' and first_headers[b.identifier] then
          if is_latex then
            out:insert(pandoc.RawBlock('latex', '\\clearpage'))
          else
            b.attributes.style = PAGE_BREAK_CSS
          end
        end
        out:insert(b)
      end
      return out
    end,
  })
end

-- "电子书信息" page between the title page and the table of contents: which
-- commit the e-book was built from, when, and with what.
local REPO = os.getenv('GITHUB_REPOSITORY') or 'sunface/rust-course'
local REPO_URL = 'https://github.com/' .. REPO

local function sh(cmd)
  local p = io.popen(cmd .. ' 2>/dev/null')
  if not p then return nil end
  local out = p:read('a') or ''
  p:close()
  out = out:gsub('%s+$', '')
  return out ~= '' and out or nil
end

local function truncate(text, max_chars)
  if utf8.len(text) and utf8.len(text) > max_chars then
    return text:sub(1, utf8.offset(text, max_chars + 1) - 1) .. '…'
  end
  return text
end

local function info_blocks(doc)
  local S, L = pandoc.Str, pandoc.Link
  local function text(t) return { S(t) } end
  local function link(label, url) return { L({ S(label) }, url) } end

  local rows = {
    { '书名', text(pandoc.utils.stringify(doc.meta.title or '')) },
    { '作者', text('sunface 及本书所有贡献者') },
    { '在线阅读', link('https://course.rs', 'https://course.rs') },
    { '源码仓库', link(REPO_URL:gsub('^https://', ''), REPO_URL) },
  }

  local log = sh("git log -1 --date='format:%Y-%m-%d %H:%M:%S %z' --format='%H%x1f%h%x1f%cd%x1f%s'")
  if log then
    local full, short, date, subject = log:match('^(.-)\31(.-)\31(.-)\31(.*)$')
    local commit = link(short, REPO_URL .. '/commit/' .. full)
    if sh('git status --porcelain --untracked-files=no') then
      table.insert(commit, S('（含未提交的修改）'))
    end
    table.insert(rows, { '对应提交', commit })
    table.insert(rows, { '提交说明', text(truncate(subject, 60)) })
    table.insert(rows, { '提交时间', text(date) })
  end

  table.insert(rows, { '构建时间', text(os.date('!%Y-%m-%d %H:%M:%S UTC')) })
  local run_id = os.getenv('GITHUB_RUN_ID')
  if run_id then
    local server = os.getenv('GITHUB_SERVER_URL') or 'https://github.com'
    table.insert(rows, { '构建环境', link('GitHub Actions #' .. (os.getenv('GITHUB_RUN_NUMBER') or run_id),
                                         server .. '/' .. REPO .. '/actions/runs/' .. run_id) })
  else
    table.insert(rows, { '构建环境', text('本地构建') })
  end

  local tools = { (sh('mdbook --version') or 'mdBook'):gsub('^mdbook v?', 'mdBook '), 'mdbook-pandoc',
                  'pandoc ' .. tostring(PANDOC_VERSION) }
  if is_latex then table.insert(tools, 'LuaLaTeX') end
  table.insert(rows, { '生成工具', text(table.concat(tools, ' · ')) })
  table.insert(rows, { '电子书制作', link('SnowballXueQiu', 'https://github.com/SnowballXueQiu') })

  local cells = {}
  for _, r in ipairs(rows) do
    table.insert(cells, { { pandoc.Plain({ pandoc.Strong(text(r[1])) }) }, { pandoc.Plain(r[2]) } })
  end
  local tbl = pandoc.utils.from_simple_table(pandoc.SimpleTable(
    {}, { pandoc.AlignRight, pandoc.AlignLeft }, { 0, 0 }, {}, cells))
  return tbl, log and log:match('\31.-\31(%d+%-%d+%-%d+)')
end

local function add_info_page(doc)
  local tbl, commit_date = info_blocks(doc)
  if commit_date and not doc.meta.date then
    doc.meta.date = commit_date
  end
  if is_latex then
    doc.meta['include-before'] = pandoc.MetaBlocks({
      pandoc.RawBlock('latex', '\\clearpage\\thispagestyle{empty}\\vspace*{3cm}\n'
        .. '{\\centering\\Large\\bfseries 电子书信息\\par}\\vspace{2em}'),
      tbl,
      pandoc.RawBlock('latex', '\\clearpage'),
    })
  else
    -- Shown on the EPUB title page, i.e. also before the table of contents.
    doc.meta['abstract-title'] = '电子书信息'
    doc.meta.abstract = pandoc.MetaBlocks({ tbl })
  end
  return doc
end

-- mdbook-pandoc hands pandoc absolute paths, so ids start with the build
-- machine's path (`home__user__...__src__basic__variable.md__...`). Keep only
-- the part relative to src/.
local function short_id(id)
  return (id:gsub('^.*__src__', ''))
end

local function strip_id_prefixes(doc)
  local function attr(el)
    if el.identifier and el.identifier:find('__src__', 1, true) then
      el.identifier = short_id(el.identifier)
      return el
    end
  end
  return doc:walk({
    Header = attr, Div = attr, Span = attr, CodeBlock = attr, Code = attr,
    Image = attr, Table = attr, Figure = attr,
    Link = function(el)
      attr(el)
      if el.target:match('^#') then el.target = '#' .. short_id(el.target:sub(2)) end
      return el
    end,
  })
end

local function finalize(doc)
  local ids, chapter_start, first_headers = index_ids(doc)
  doc = fix_dangling_links(doc, ids, chapter_start)
  doc = chapter_page_breaks(doc, first_headers)
  doc = strip_id_prefixes(doc)
  return add_info_page(doc)
end

-- Inline handlers run first, then blocks, then `Pandoc` on the whole document.
Link = fix_link
Pandoc = finalize

if is_latex then
  Str = function(el) return normalize_whitespace(el) or breakable_url(el) end
  Code = breakable_code
  Image = fit_image
  Para = split_images
  Plain = split_images
else
  Str = normalize_whitespace
  RawBlock = drop_table_leftover
  RawInline = drop_table_leftover
end
