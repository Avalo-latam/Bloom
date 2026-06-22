#!/usr/bin/env python
"""Add a record-and-compare phonetics block to each PHONETICS lesson.

Run AFTER seed_content.py. Idempotent: removes prior phonetics blocks first.
"""
import json, os, urllib.request

PAT = os.environ["SUPABASE_PAT"]; REF = os.environ["SUPABASE_REF"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"

def query(sql):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {PAT}", "Content-Type": "application/json", "User-Agent": UA})
    return json.load(urllib.request.urlopen(req))

def jq(o): return json.dumps(o, ensure_ascii=False).replace("'", "''")

# title-keyword -> word/IPA pairs to practise
SETS = {
  "Short vs. long vowels": [("ship","/ʃɪp/"),("sheep","/ʃiːp/"),("full","/fʊl/"),("fool","/fuːl/")],
  "Diphthongs": [("day","/deɪ/"),("my","/maɪ/"),("go","/ɡəʊ/"),("now","/naʊ/")],
  "schwa": [("about","/əˈbaʊt/"),("teacher","/ˈtiːtʃər/"),("banana","/bəˈnɑːnə/")],
  "th": [("think","/θɪŋk/"),("three","/θriː/"),("this","/ðɪs/"),("mother","/ˈmʌðər/")],
  "/v/": [("very","/ˈveri/"),("berry","/ˈberi/"),("west","/west/"),("vest","/vest/")],
  "Final consonants": [("dogs","/dɒɡz/"),("cats","/kæts/"),("asked","/ɑːskt/"),("text","/tekst/")],
  "Ship vs. sheep": [("ship","/ʃɪp/"),("sheep","/ʃiːp/"),("bit","/bɪt/"),("beat","/biːt/")],
  "Beach": [("beach","/biːtʃ/"),("live","/lɪv/"),("leave","/liːv/")],
  "Voiced vs. voiceless": [("pen","/pen/"),("Ben","/ben/"),("zip","/zɪp/"),("sip","/sɪp/")],
  "Word & sentence stress": [("PHOtograph","/ˈfəʊtəɡrɑːf/"),("phoTOGrapher","/fəˈtɒɡrəfər/")],
  "Linking": [("an apple","/ən ˈæpəl/"),("turn it off","/tɜːrn ɪt ɒf/")],
  "Intonation": [("Really?","/ˈrɪəli/ ↗"),("Sit down.","/sɪt daʊn/ ↘")],
}

lessons = query("select l.id, l.title from public.lessons l join public.levels lv on lv.id=l.level_id where lv.code='PHONETICS' order by l.sort_order")
n = 0
for les in lessons:
    title, lid = les["title"], les["id"]
    items = None
    for key, words in SETS.items():
        if key.lower() in title.lower():
            items = [{"word": w, "ipa": i} for w, i in words]; break
    if not items:
        items = [{"word": "English", "ipa": "/ˈɪŋɡlɪʃ/"}, {"word": "pronounce", "ipa": "/prəˈnaʊns/"}]
    # remove any existing phonetics block, then add a fresh one at the end
    query(f"delete from public.lesson_blocks where lesson_id='{lid}' and content ? 'phonetics'")
    nxt = query(f"select coalesce(max(sort_order),0)+1 as n from public.lesson_blocks where lesson_id='{lid}'")[0]["n"]
    content = {"guide": "Modelá cada sonido y que graben y comparen.",
               "html": "<p>Listen, then <strong>record your voice</strong> and compare. Repeat until it feels natural.</p>",
               "phonetics": items}
    query("insert into public.lesson_blocks (lesson_id, kind, title, duration_min, sort_order, content) values "
          f"('{lid}','practice','Record & compare',15,{nxt},'{jq(content)}'::jsonb)")
    n += 1
print(f"Added phonetics practice to {n} lessons.")
