#!/usr/bin/env python
"""Seed the Bloom English base curriculum (units, lessons, timed blocks).

Idempotent: clears existing base curriculum (units cascade to lessons/blocks)
and re-inserts. Run with SUPABASE_PAT and SUPABASE_REF in the environment.

  SUPABASE_PAT=sbp_... SUPABASE_REF=ref python scripts/seed_curriculum.py
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


# 60-minute choreography shared by every lesson.
# (kind, title, minutes, teacher guide template)
CHOREO = [
    ("warmup", "Warm-up", 5,
     "Break the ice and activate prior knowledge about “{t}”. Quick question round or a picture prompt."),
    ("review", "Review homework", 10,
     "Go over last week's homework and recycle vocabulary. Clear up doubts before new input."),
    ("presentation", "Presentation", 15,
     "Introduce the target language for “{t}”. Use the board, examples and a short video clip."),
    ("practice", "Guided practice", 15,
     "Controlled practice: drills, gap-fill or a quick interactive quiz on “{t}”."),
    ("speaking", "Speaking", 10,
     "Freer production: pair/role-play so students use “{t}” to communicate."),
    ("wrapup", "Wrap-up & homework", 5,
     "Recap key points, answer questions and assign homework on “{t}”."),
]

# Curated curriculum. level_code -> [ (unit_title, [ (lesson_title, objective) ... ]) ]
CURRICULUM = {
    "A1": [
        ("Unit 1 · Hello!", [
            ("Greetings & the alphabet", "Greet people, spell names and use the alphabet."),
            ("Personal information", "Ask and give personal information (name, age, origin)."),
            ("Numbers 0–100", "Use numbers for age, prices and phone numbers."),
            ("Countries & nationalities", "Talk about countries and nationalities with to be."),
        ]),
        ("Unit 2 · My world", [
            ("Family & possessives", "Describe your family using possessive adjectives."),
            ("This/that, these/those", "Identify everyday objects and use demonstratives."),
            ("There is / there are", "Describe a room and say what there is."),
            ("Adjectives & colours", "Describe people and things with common adjectives."),
        ]),
        ("Unit 3 · Everyday life", [
            ("Present simple: routines", "Talk about daily routines and habits."),
            ("Telling the time", "Ask and tell the time and talk about schedules."),
            ("Likes & dislikes", "Express likes and dislikes with verb + -ing."),
            ("Food & drink", "Order food and talk about meals (countable/uncountable)."),
        ]),
    ],
    "A2": [
        ("Unit 1 · Past & present", [
            ("Past simple: regular", "Talk about past events with regular verbs."),
            ("Past simple: irregular", "Narrate a past experience with irregular verbs."),
            ("Present continuous", "Describe actions happening now vs. routines."),
            ("Comparatives", "Compare people, places and things."),
        ]),
        ("Unit 2 · Plans & places", [
            ("Going to: future plans", "Talk about plans and intentions with going to."),
            ("Directions & prepositions", "Ask for and give directions in a city."),
            ("Superlatives", "Talk about the best/worst with superlatives."),
            ("Travel & transport", "Buy tickets and talk about travel."),
        ]),
        ("Unit 3 · Experiences", [
            ("Present perfect: ever/never", "Talk about life experiences."),
            ("Quantifiers", "Use some, any, much, many, a lot of."),
            ("Adverbs of manner", "Describe how people do things."),
            ("Health & the body", "Talk about health problems and advice."),
        ]),
    ],
    "B1": [
        ("Unit 1 · Telling stories", [
            ("Past continuous vs. past simple", "Set the scene and narrate interrupted actions."),
            ("Used to", "Talk about past habits and states."),
            ("Relative clauses", "Add information with who, which, that, where."),
            ("Phrasal verbs (everyday)", "Use common phrasal verbs in context."),
        ]),
        ("Unit 2 · Looking ahead", [
            ("First conditional", "Talk about real future possibilities."),
            ("Will vs. going to", "Make predictions, decisions and plans."),
            ("Modals of obligation", "Express rules with must, have to, should."),
            ("Work & careers", "Talk about jobs, skills and the workplace."),
        ]),
        ("Unit 3 · Opinions", [
            ("Second conditional", "Talk about hypothetical situations."),
            ("Present perfect vs. past simple", "Connect past and present correctly."),
            ("Expressing opinions", "Agree, disagree and give reasons."),
            ("The environment", "Discuss environmental issues and solutions."),
        ]),
    ],
    "B2": [
        ("Unit 1 · Fluent narration", [
            ("Narrative tenses", "Combine past tenses for rich storytelling."),
            ("Reported speech", "Report what others said accurately."),
            ("The passive voice", "Use the passive across tenses."),
            ("Collocations & word formation", "Sound natural with collocations."),
        ]),
        ("Unit 2 · Hypotheticals", [
            ("Third conditional", "Talk about unreal past and regrets."),
            ("Wish & regrets", "Express wishes and regrets naturally."),
            ("Mixed conditionals", "Combine time references in conditionals."),
            ("Media & technology", "Discuss media, fake news and tech trends."),
        ]),
        ("Unit 3 · Persuasion", [
            ("Linking & discourse markers", "Structure arguments cohesively."),
            ("Modals of deduction", "Speculate about the present and past."),
            ("Formal vs. informal register", "Adapt language to the situation."),
            ("Society & culture", "Debate cultural and social topics."),
        ]),
    ],
    "C1": [
        ("Unit 1 · Sophistication", [
            ("Advanced tense review", "Use the full tense system precisely."),
            ("Inversion & emphasis", "Add emphasis with inversion structures."),
            ("Cleft sentences", "Highlight information with cleft sentences."),
            ("Idiomatic language", "Use idioms and fixed expressions."),
        ]),
        ("Unit 2 · Nuance", [
            ("Hedging & vague language", "Soften statements and sound diplomatic."),
            ("Nominalisation", "Write in a more academic, formal style."),
            ("Advanced collocations", "Use precise, natural word partnerships."),
            ("Art & literature", "Analyse and discuss art and literature."),
        ]),
        ("Unit 3 · Mastery", [
            ("Discourse & cohesion", "Produce extended, well-organised discourse."),
            ("Connotation & tone", "Choose words for precise effect."),
            ("Debating complex issues", "Argue nuanced positions fluently."),
            ("Global affairs", "Discuss politics, economics and ethics."),
        ]),
    ],
    "FCE": [
        ("Paper 1 · Reading & Use of English", [
            ("Multiple-choice cloze (Part 1)", "Strategies for vocabulary and collocation."),
            ("Open cloze & word formation", "Master Parts 2 and 3."),
            ("Key word transformations", "Practise Part 4 transformations."),
        ]),
        ("Paper 2 · Writing", [
            ("The essay", "Plan and write a balanced B2 essay."),
            ("Email & review", "Write emails and reviews to brief."),
            ("Report & article", "Structure reports and engaging articles."),
        ]),
        ("Paper 3 · Listening", [
            ("Listening Parts 1–2", "Multiple choice and sentence completion."),
            ("Listening Parts 3–4", "Multiple matching and long interviews."),
            ("Exam-day listening strategies", "Time management and prediction."),
        ]),
        ("Paper 4 · Speaking", [
            ("Interview & long turn", "Parts 1 and 2 with a partner."),
            ("Collaborative task", "Part 3 negotiation and decisions."),
            ("Discussion & fluency", "Part 4 opinions and fluency boosters."),
        ]),
    ],
    "PHONETICS": [
        ("Vowel sounds", [
            ("Short vs. long vowels", "Distinguish /ɪ/–/iː/, /ʊ/–/uː/ and more."),
            ("Diphthongs", "Produce gliding vowels like /eɪ/, /aɪ/, /əʊ/."),
            ("The schwa /ə/", "Use the most common English vowel naturally."),
        ]),
        ("Consonant sounds", [
            ("/θ/ and /ð/ (th)", "Master the tricky 'th' sounds."),
            ("/v/ vs. /b/ and /w/", "Fix common Spanish-speaker confusions."),
            ("Final consonants & clusters", "Pronounce endings and clusters clearly."),
        ]),
        ("Minimal pairs", [
            ("Ship vs. sheep", "Hear and produce contrasting vowels."),
            ("Beach vs. … other tricky pairs", "Avoid embarrassing minimal-pair mix-ups."),
            ("Voiced vs. voiceless", "Contrast pairs like /s/–/z/, /p/–/b/."),
        ]),
        ("Connected speech & intonation", [
            ("Word & sentence stress", "Place stress for natural rhythm."),
            ("Linking & weak forms", "Connect words like a native speaker."),
            ("Intonation patterns", "Use rising/falling tone for meaning."),
        ]),
    ],
}


def main():
    levels = {l["code"]: l["id"] for l in query("select id, code from public.levels")}

    # Clear base curriculum (cascades to lessons + blocks).
    query("delete from public.units;")

    total_lessons = 0
    for code, units in CURRICULUM.items():
        level_id = levels[code]
        for u_idx, (utitle, lessons) in enumerate(units, start=1):
            unit = query(
                f"insert into public.units (level_id, title, sort_order) "
                f"values ('{level_id}', '{q(utitle)}', {u_idx}) returning id;"
            )[0]["id"]

            for l_idx, (ltitle, objective) in enumerate(lessons, start=1):
                lesson = query(
                    "insert into public.lessons (unit_id, level_id, title, objective, sort_order) "
                    f"values ('{unit}', '{level_id}', '{q(ltitle)}', '{q(objective)}', {l_idx}) returning id;"
                )[0]["id"]

                values = []
                for b_idx, (kind, btitle, mins, guide) in enumerate(CHOREO, start=1):
                    content = json.dumps({"type": "text", "guide": guide.format(t=ltitle)})
                    values.append(
                        f"('{lesson}', '{kind}', '{q(btitle)}', {mins}, {b_idx}, '{q(content)}'::jsonb)"
                    )
                query(
                    "insert into public.lesson_blocks (lesson_id, kind, title, duration_min, sort_order, content) values "
                    + ", ".join(values) + ";"
                )
                total_lessons += 1
        print(f"  {code}: {len(units)} units")

    print(f"Done. {total_lessons} lessons, {total_lessons * len(CHOREO)} blocks.")


if __name__ == "__main__":
    main()
