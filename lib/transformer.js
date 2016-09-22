const fs = require('fs-extra-promise')
const cheerio = require('cheerio')
const commonmark = require('commonmark')
const reader = new commonmark.Parser()
const writer = new commonmark.HtmlRenderer();
const markdown2html = text => writer.render(reader.parse(text))
const stages = {
  adopt: 1,
  trial: 2,
  assess: 3,
  hold: 4
}
const stageOrdinal = st=>stages[Object.keys(stages).find(k=>st.indexOf(k) !== -1)]


const flatMap = (arr, lambda) => Array.prototype.concat.apply([], arr.map(lambda))

const extract = text => {
  const $ = cheerio.load(markdown2html(text))
  const res = $('h2').map((_, h2)=>{
    // skip issue, then take all until next h2
    const desc = $(h2).next().nextUntil('h2').map((_,e)=>$(e).html()).get().join('\n')
    return {label: $(h2).text(), issue: $(h2).next().text(), desc: desc}
  })
  return res.get()
}
const read = f => fs.readFileAsync(f).then(content=>({name: f, content: content.toString()}))


module.exports = (loc, issue)=>fs.readdirAsync(loc)
                          .then(ls=>ls.map(f=>`${loc}/${f}`))
                          .then(ls=>Promise.all(ls.map(read)))
                          .then(files=> files.map(f=>({source: f.name, stage: stageOrdinal(f.name), items: extract(f.content).filter(i=>i.issue == issue)} )))
                          .then(info=> flatMap(info, x=>x.items.map( item=>Object.assign({size: 5, stage: x.stage, source: x.source },item) )))
                          .then(data=>({[loc]:data}))

