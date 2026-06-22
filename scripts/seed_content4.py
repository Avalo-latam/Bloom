#!/usr/bin/env python
"""Finish remaining lessons: B1 phrasal verbs + all 12 PHONETICS lessons."""
import json, os, urllib.request
PAT=os.environ["SUPABASE_PAT"]; REF=os.environ["SUPABASE_REF"]
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"
def query(sql):
    body=json.dumps({"query":sql}).encode()
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{REF}/database/query",data=body,method="POST",
        headers={"Authorization":f"Bearer {PAT}","Content-Type":"application/json","User-Agent":UA})
    return json.load(urllib.request.urlopen(req))
def q(s): return s.replace("'","''")
def jq(o): return q(json.dumps(o,ensure_ascii=False))
def V(*p): return [{"term":t,"es":e} for t,e in p]
def mc(p,o,a,e=""): return ("multiple_choice",p,{"options":o,"answer":a},e)
def fb(p,t,a,e=""): return ("fill_blank",p,{"text":t,"answers":a},e)

def phon(html, examples, pairs_words, quiz, video):
    items=[{"word":w,"ipa":i} for w,i in pairs_words]
    return [
      {"kind":"presentation","title":"The sound","html":html,"examples":examples,"videoSearch":video,
       "guide":"Modelá el sonido exageradamente y que repitan antes de grabar."},
      {"kind":"practice","title":"Listen & choose","quiz":quiz},
      {"kind":"practice","title":"Record & compare","html":"<p>Now <strong>record your voice</strong> and compare with the model. Repeat until it feels natural.</p>","phonetics":items},
    ]

C = {
 "Phrasal verbs (everyday)": [
   {"kind":"presentation","title":"Everyday phrasal verbs","html":"<p>Phrasal verbs = verb + particle, with a new meaning. Very common in speech.</p>",
    "examples":["<strong>get up</strong> = levantarse","<strong>turn on/off</strong> = encender/apagar","<strong>look for</strong> = buscar","<strong>give up</strong> = rendirse"],
    "videoSearch":"common english phrasal verbs"},
   {"kind":"practice","title":"Practice","vocab":V(("get up","levantarse"),("turn on","encender"),("look for","buscar"),("give up","rendirse"),("find out","averiguar"),("look after","cuidar")),
    "quiz":[mc("Please ___ the light, it's dark.",["turn off","turn on","give up"],1),
            fb("Phrasal verb","I can't ___ my keys. (buscar/encontrar)",["find"]),
            mc("'give up' means…",["start","quit","continue"],1)]},
   {"kind":"speaking","title":"Your turn","speaking":["Use 4 phrasal verbs to describe your morning."]},
 ],
 "Short vs. long vowels": phon(
   "<p>English contrasts <strong>short</strong> and <strong>long</strong> vowels. The length changes the word: <em>ship</em> /ɪ/ vs <em>sheep</em> /iː/.</p>",
   ["<strong>/ɪ/</strong> ship, bit, full","<strong>/iː/</strong> sheep, beat, fool","Stretch long vowels clearly."],
   [("ship","/ʃɪp/"),("sheep","/ʃiːp/"),("full","/fʊl/"),("fool","/fuːl/")],
   [mc("Which has the LONG /iː/?",["ship","sheep"],1),mc("Which has the SHORT /ɪ/?",["bit","beat"],0)],
   "english long and short vowels pronunciation"),
 "Diphthongs": phon(
   "<p>Diphthongs are <strong>gliding vowels</strong> — two sounds in one: /eɪ/, /aɪ/, /əʊ/, /aʊ/.</p>",
   ["<strong>/eɪ/</strong> day, play","<strong>/aɪ/</strong> my, time","<strong>/əʊ/</strong> go, no","<strong>/aʊ/</strong> now, how"],
   [("day","/deɪ/"),("my","/maɪ/"),("go","/ɡəʊ/"),("now","/naʊ/")],
   [mc("'go' contains…",["/əʊ/","/aʊ/"],0),mc("'time' contains…",["/aɪ/","/eɪ/"],0)],
   "english diphthongs pronunciation"),
 "The schwa /ə/": phon(
   "<p>The <strong>schwa /ə/</strong> is the most common English sound — a relaxed, unstressed 'uh' in weak syllables.</p>",
   ["ab<strong>ou</strong>t /əˈbaʊt/","teach<strong>er</strong> /ˈtiːtʃər/","ban<strong>a</strong>n<strong>a</strong> /bəˈnɑːnə/"],
   [("about","/əˈbaʊt/"),("teacher","/ˈtiːtʃər/"),("banana","/bəˈnɑːnə/")],
   [mc("The schwa appears in…",["stressed syllables","unstressed syllables"],1)],
   "schwa sound english pronunciation"),
 "/θ/ and /ð/ (th)": phon(
   "<p>Put your tongue between your teeth: <strong>/θ/</strong> is voiceless (<em>think</em>), <strong>/ð/</strong> is voiced (<em>this</em>).</p>",
   ["<strong>/θ/</strong> think, three, bath","<strong>/ð/</strong> this, mother, they","Don't replace with /t/ or /d/!"],
   [("think","/θɪŋk/"),("three","/θriː/"),("this","/ðɪs/"),("mother","/ˈmʌðər/")],
   [mc("'this' uses the VOICED…",["/θ/","/ð/"],1),mc("'think' uses the VOICELESS…",["/θ/","/ð/"],0)],
   "th sound pronunciation english"),
 "/v/ vs. /b/ and /w/": phon(
   "<p>Spanish speakers often mix these. <strong>/v/</strong> = top teeth on bottom lip; <strong>/b/</strong> = both lips; <strong>/w/</strong> = rounded lips, no teeth.</p>",
   ["<strong>/v/</strong> very, vest","<strong>/b/</strong> berry, best","<strong>/w/</strong> west, wine"],
   [("very","/ˈveri/"),("berry","/ˈberi/"),("west","/west/"),("vest","/vest/")],
   [mc("Top teeth touch bottom lip for…",["/b/","/v/","/w/"],1),mc("'west' starts with…",["/v/","/w/"],1)],
   "v b w pronunciation english"),
 "Final consonants & clusters": phon(
   "<p>Pronounce <strong>final consonants</strong> and clusters clearly — don't drop them. They carry grammar (plurals, past -ed).</p>",
   ["dog<strong>s</strong> /dɒɡz/","ask<strong>ed</strong> /ɑːskt/","te<strong>xt</strong> /tekst/"],
   [("dogs","/dɒɡz/"),("cats","/kæts/"),("asked","/ɑːskt/"),("text","/tekst/")],
   [mc("'asked' ends in…",["/t/","/d/"],0,"After /k/, -ed = /t/.")],
   "final consonant clusters english pronunciation"),
 "Ship vs. sheep": phon(
   "<p>The classic minimal pair: short <strong>/ɪ/</strong> (ship) vs long <strong>/iː/</strong> (sheep). Mixing them changes meaning!</p>",
   ["bit /ɪ/ — beat /iː/","sit /ɪ/ — seat /iː/","Smile for /iː/."],
   [("ship","/ʃɪp/"),("sheep","/ʃiːp/"),("bit","/bɪt/"),("beat","/biːt/")],
   [mc("'sheep' has…",["/ɪ/","/iː/"],1),mc("'bit' has…",["/ɪ/","/iː/"],0)],
   "ship sheep minimal pairs pronunciation"),
 "Beach vs. … other tricky pairs": phon(
   "<p>Some minimal pairs can be embarrassing! Master <em>live/leave</em>, <em>bitch/beach</em> by controlling vowel length.</p>",
   ["live /lɪv/ — leave /liːv/","it /ɪt/ — eat /iːt/"],
   [("beach","/biːtʃ/"),("live","/lɪv/"),("leave","/liːv/"),("eat","/iːt/")],
   [mc("'leave' has the LONG vowel…",["/ɪ/","/iː/"],1)],
   "tricky minimal pairs english pronunciation"),
 "Voiced vs. voiceless": phon(
   "<p>Many consonants come in pairs — same mouth shape, but <strong>voiced</strong> (vocal cords vibrate) or <strong>voiceless</strong>: /p/–/b/, /s/–/z/, /t/–/d/.</p>",
   ["/p/ pen — /b/ Ben","/s/ sip — /z/ zip","Touch your throat to feel the vibration."],
   [("pen","/pen/"),("Ben","/ben/"),("sip","/sɪp/"),("zip","/zɪp/")],
   [mc("Which is VOICED?",["/s/","/z/"],1),mc("Which is VOICELESS?",["/b/","/p/"],1)],
   "voiced voiceless consonants english"),
 "Word & sentence stress": phon(
   "<p>English has strong and weak syllables. Stress the right syllable or the word changes: <em>PHOtograph</em> vs <em>phoTOgrapher</em>.</p>",
   ["<strong>PHO</strong>tograph","pho<strong>TO</strong>grapher","In sentences, stress the key (content) words."],
   [("photograph","/ˈfəʊtəɡrɑːf/"),("photographer","/fəˈtɒɡrəfər/")],
   [mc("Stress in 'photographer' is on…",["1st syllable","2nd syllable"],1)],
   "word and sentence stress english"),
 "Linking & weak forms": phon(
   "<p>Native speakers <strong>link</strong> words and use <strong>weak forms</strong> (schwa) for small words: <em>an apple</em> → /ənˈæpəl/, <em>cup of tea</em> → /kʌpə tiː/.</p>",
   ["an_apple","turn_it_off","fish_and_chips → fish'n'chips"],
   [("an apple","/ənˈæpəl/"),("turn it off","/tɜːrn ɪt ɒf/")],
   [mc("Linking makes speech sound…",["robotic","natural and connected"],1)],
   "linking and weak forms english connected speech"),
 "Intonation patterns": phon(
   "<p>Intonation (the music of speech) carries meaning: <strong>rising ↗</strong> for yes/no questions and surprise, <strong>falling ↘</strong> for statements and wh-questions.</p>",
   ["Really? ↗ (surprise)","Sit down. ↘ (statement)","Where do you live? ↘"],
   [("Really?","/ˈrɪəli/ ↗"),("Sit down.","/sɪt daʊn/ ↘")],
   [mc("Yes/no questions usually…",["fall ↘","rise ↗"],1)],
   "english intonation patterns rising falling"),
}
def main():
    titles=list(C.keys()); inlist=",".join(f"'{q(t)}'" for t in titles)
    lessons={r["title"]:r["id"] for r in query(f"select id,title from public.lessons where title in ({inlist})")}
    done=0
    for title,blocks in C.items():
        lid=lessons.get(title)
        if not lid: print("MISSING:",title); continue
        query(f"delete from public.lesson_blocks where lesson_id='{lid}'")
        query(f"delete from public.quizzes where title='L· {q(title[:40])}'")
        for idx,b in enumerate(blocks):
            content={k:b[k] for k in ("guide","html","examples","vocab","speaking","tip","videoSearch","phonetics") if b.get(k)}
            if b.get("quiz"):
                qid=query(f"insert into public.quizzes (title,description,is_shared) values ('L· {q(title[:40])}','{q(b.get('title',''))}',true) returning id")[0]["id"]
                vals=[f"('{qid}','{k}','{q(p)}','{jq(d)}'::jsonb,'{q(e)}',1,{i})" for i,(k,p,d,e) in enumerate(b["quiz"])]
                query("insert into public.quiz_questions (quiz_id,kind,prompt,data,explanation,points,sort_order) values "+", ".join(vals))
                content["quizId"]=qid
            dur={"presentation":15,"practice":15,"speaking":15}.get(b["kind"],10)
            query(f"insert into public.lesson_blocks (lesson_id,kind,title,duration_min,sort_order,content) values ('{lid}','{b['kind']}','{q(b['title'])}',{dur},{idx},'{jq(content)}'::jsonb)")
        done+=1
    print(f"Finished {done} lessons.")
if __name__=="__main__": main()
