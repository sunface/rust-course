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

local function fix_link(el)
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

-- Some cross-references point at anchors that don't exist (they are broken on
-- the website too, which then just shows the top of the page). Do the same
-- here: send them to the beginning of the target chapter instead of leaving a
-- dead link. With pandoc's file-scope, ids look like `<chapter path>.md__<id>`.
local function fix_dangling_links(doc)
  local ids, chapter_start = {}, {}
  local function record(el)
    local id = el.identifier
    if id and id ~= '' then
      ids[id] = true
      local chapter = id:match('^(.*%.md__)')
      if chapter and el.t == 'Header' and not chapter_start[chapter] then
        chapter_start[chapter] = id
      end
    end
  end
  doc:walk({ Header = record, Div = record, Span = record, Link = record,
             Image = record, CodeBlock = record, Code = record })
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

-- Inline handlers run first, then blocks, then `Pandoc` on the whole document.
Link = fix_link
Pandoc = fix_dangling_links

if is_latex then
  Str = function(el) return normalize_whitespace(el) or breakable_url(el) end
  Code = breakable_code
  Image = fit_image
  Para = split_images
  Plain = split_images
else
  Str = normalize_whitespace
end
