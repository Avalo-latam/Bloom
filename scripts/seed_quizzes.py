#!/usr/bin/env python
"""Seed example interactive content into an A2 lesson (idempotent-ish).

Attaches quizzes + a Kahoot link to the blocks of "Past simple: regular".
Run with SUPABASE_PAT and SUPABASE_REF set.
"""
import json
import os
import urllib.request

PAT = os.environ["SUPABASE_PAT"]
REF = os.environ["SUPABASE_REF"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"


def query(sql):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {PAT}",
                 "Content-Type": "application/json", "User-Agent": UA},
    )
    return json.load(urllib.request.urlopen(req))


def q(s):
    return s.replace("'", "''")


def jq(obj):
    return q(json.dumps(obj, ensure_ascii=False))


# Resolve the target lesson + its blocks.
lesson = query(
    "select l.id from public.lessons l join public.levels lv on lv.id=l.level_id "
    "where lv.code='A2' and l.title='Past simple: regular' limit 1"
)[0]["id"]
blocks = {b["kind"]: b["id"] for b in query(
    f"select id, kind from public.lesson_blocks where lesson_id='{lesson}'")}

# Clean prior seeded quizzes for this lesson to stay idempotent.
query("delete from public.quizzes where title in ("
      "'Past simple — regular verbs','Complete the song','Match present & past','Order the sentence')")

QUIZZES = [
    ("Past simple — regular verbs", "Practicá los verbos regulares en pasado.", "practice", [
        ("multiple_choice", "Yesterday I ___ to the park.",
         {"options": ["walk", "walked", "walking", "walks"], "answer": 1},
         "Los verbos regulares agregan -ed en pasado."),
        ("fill_blank", "Completá con el pasado simple:",
         {"text": "She ___ tennis last weekend. (play)", "answers": ["played"]},
         "play → played"),
        ("multiple_choice", "¿Cuál oración es correcta?",
         {"options": ["He studyed English.", "He studied English.", "He study English."], "answer": 1},
         "study → studied (y → ied)."),
        ("fill_blank", "Completá los dos verbos:",
         {"text": "They ___ a movie and ___ dinner. (watch / cook)", "answers": ["watched", "cooked"]},
         "watch → watched, cook → cooked"),
    ]),
    ("Complete the song", "Completá la letra de la canción 🎵", "review", [
        ("lyrics_complete", "Escuchá y completá la letra:",
         {"text": "When the sun ___ up,\nI open my ___\nand start to ___.",
          "answers": ["comes", "eyes", "sing"]},
         "Riman: eyes / sing."),
    ]),
    ("Match present & past", "Uní cada verbo con su pasado.", "speaking", [
        ("matching", "Uní presente y pasado:",
         {"pairs": [{"left": "go", "right": "went"}, {"left": "eat", "right": "ate"},
                    {"left": "see", "right": "saw"}, {"left": "buy", "right": "bought"}]},
         "Son verbos irregulares."),
    ]),
    ("Order the sentence", "Ordená las palabras.", "warmup", [
        ("ordering", "Ordená para formar la oración:",
         {"items": ["I", "watched", "a", "movie", "yesterday"]},
         "Sujeto + verbo + objeto + tiempo."),
    ]),
]

for title, desc, block_kind, questions in QUIZZES:
    qid = query(
        f"insert into public.quizzes (title, description, is_shared) "
        f"values ('{q(title)}', '{q(desc)}', true) returning id"
    )[0]["id"]
    values = []
    for i, (kind, prompt, data, expl) in enumerate(questions):
        values.append(
            f"('{qid}','{kind}','{q(prompt)}','{jq(data)}'::jsonb,'{q(expl)}',1,{i})"
        )
    query(
        "insert into public.quiz_questions (quiz_id, kind, prompt, data, explanation, points, sort_order) "
        "values " + ", ".join(values)
    )
    if block_kind in blocks:
        query(
            f"update public.lesson_blocks set content = content || '{jq({'quizId': qid})}'::jsonb "
            f"where id='{blocks[block_kind]}'"
        )

# A Kahoot button on the presentation block.
if "presentation" in blocks:
    query(
        "update public.lesson_blocks set content = content || "
        f"'{jq({'kahootUrl': 'https://kahoot.it'})}'::jsonb where id='{blocks['presentation']}'"
    )

print("Seeded 4 quizzes + Kahoot into A2 'Past simple: regular'.")
