#!/usr/bin/env python
"""Replace skeleton lesson blocks with real, rich, interactive content.

For each lesson it (re)creates a set of student-facing blocks: an explanation
(HTML + examples), vocabulary, an interactive quiz, and a speaking prompt.
Idempotent: clears a lesson's blocks + its seeded quizzes before reinserting.

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


def V(*pairs):
    return [{"term": t, "es": e} for t, e in pairs]


def mc(prompt, options, answer, expl=""):
    return ("multiple_choice", prompt, {"options": options, "answer": answer}, expl)


def fb(prompt, text, answers, expl=""):
    return ("fill_blank", prompt, {"text": text, "answers": answers}, expl)


def order(prompt, items, expl=""):
    return ("ordering", prompt, {"items": items}, expl)


def match(prompt, pairs, expl=""):
    return ("matching", prompt, {"pairs": [{"left": a, "right": b} for a, b in pairs]}, expl)


# Each lesson: list of blocks. A block is a dict with kind/title + content fields.
# content fields: guide, html, examples, vocab, reading, speaking, quiz, tip
CONTENT = {
 # ───────────────────────────── A1 ─────────────────────────────
 "Greetings & the alphabet": [
   {"kind":"presentation","title":"Saying hello","guide":"Saludá a cada alumno y pediles que se presenten. Practicá deletreo en voz alta.",
    "html":"<p>We greet people differently depending on the time of day. We also use <strong>'How are you?'</strong> to ask how someone feels.</p>",
    "examples":["<strong>Hello!</strong> / <strong>Hi!</strong>","<strong>Good morning</strong> (before 12pm)","<strong>Good afternoon</strong> (12–6pm)","<strong>Good evening</strong> (after 6pm)","A: How are you? — B: I'm fine, thanks!"],
    "tip":"'Hi' is informal; 'Hello' works in every situation."},
   {"kind":"practice","title":"The alphabet & spelling","html":"<p>Spelling your name is a key first skill. Listen to the letters and practise: <em>How do you spell it?</em></p>",
    "vocab":V(("Hello","Hola"),("Goodbye","Adiós"),("Please","Por favor"),("Thank you","Gracias"),("Sorry","Perdón"),("Yes / No","Sí / No")),
    "quiz":[mc("Which greeting do we use at 9 a.m.?",["Good evening","Good morning","Good night"],1,"Morning = la mañana."),
            mc("Someone says 'Thank you'. You answer:",["Sorry","You're welcome","Goodbye"],1),
            fb("Complete the greeting","Good ___, see you tomorrow! (after 6pm)",["evening"],"Evening = la tarde/noche."),
            order("Put the conversation in order",["Hi!","How are you?","I'm fine, thanks!"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Greet your teacher and say your name.","Spell your first name letter by letter.","Ask 'How are you?' and answer."]},
 ],
 "Personal information": [
   {"kind":"presentation","title":"Talking about yourself","guide":"Modelá las preguntas y que las respondan sobre sí mismos.",
    "html":"<p>Use the verb <strong>to be</strong> to give personal information.</p><ul><li>My name <strong>is</strong> Ana.</li><li>I <strong>am</strong> from Argentina.</li><li>I <strong>am</strong> 25 years old.</li></ul>",
    "examples":["What's your name? — My name is Sofía.","Where are you from? — I'm from Córdoba.","How old are you? — I'm twenty."],
    "tip":"'I'm' = 'I am'. We use contractions when we speak."},
   {"kind":"practice","title":"Practice: to be","vocab":V(("name","nombre"),("age","edad"),("from","de"),("city","ciudad"),("country","país"),("phone number","número de teléfono")),
    "quiz":[fb("Complete with 'to be'","My name ___ Mateo.",["is"]),
            fb("Complete with 'to be'","I ___ from Argentina.",["am","'m"]),
            mc("Choose the correct question",["How old you are?","How old are you?","How you are old?"],1),
            mc("'Where are you from?' asks about your…",["age","country/city","name"],1)]},
   {"kind":"speaking","title":"Your turn","speaking":["Introduce yourself: name, age, city.","Ask your partner three personal questions."]},
 ],
 "Numbers 0–100": [
   {"kind":"presentation","title":"Numbers","html":"<p>Numbers are essential for age, prices and phone numbers. Watch the tens: <strong>twenty, thirty, forty…</strong></p>",
    "examples":["13 = thirteen, 30 = thirty (careful!)","21 = twenty-one","100 = one hundred","It's $50 — fifty dollars."],
    "tip":"-teen (13–19) vs -ty (20, 30…). The stress changes: thir<strong>TEEN</strong> / <strong>THIR</strong>ty."},
   {"kind":"practice","title":"Practice numbers","vocab":V(("zero","cero"),("eleven","once"),("twelve","doce"),("thirteen","trece"),("twenty","veinte"),("hundred","cien")),
    "quiz":[mc("How do you write 40?",["fourty","forty","fourteen"],1,"40 = forty (no u)."),
            fb("Write the number in words","15 = ___",["fifteen"]),
            mc("Which is 'thirty'?",["13","30","3"],1),
            order("Order from small to big",["nine","nineteen","ninety"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Say your phone number.","Count from 10 to 20.","Tell a price: 'It's … pesos.'"]},
 ],
 "Countries & nationalities": [
   {"kind":"presentation","title":"Countries & nationalities","html":"<p>Every country has a <strong>nationality</strong> adjective.</p><ul><li>Argentina → Argentin<strong>ian</strong></li><li>Brazil → Brazil<strong>ian</strong></li><li>Spain → Span<strong>ish</strong></li></ul>",
    "examples":["I'm from France. I'm French.","She's from Italy. She's Italian.","They're from the USA. They're American."],
    "tip":"Nationalities are written with a capital letter: English, Spanish, Italian."},
   {"kind":"practice","title":"Match the nationalities","vocab":V(("Argentina","argentino/a"),("England","Inglaterra"),("Japan","Japón"),("Mexico","México"),("Germany","Alemania"),("Italy","Italia")),
    "quiz":[match("Match country and nationality",[("Brazil","Brazilian"),("Spain","Spanish"),("Japan","Japanese"),("France","French")]),
            mc("She is from Italy. She is…",["Italish","Italian","Italyan"],1),
            fb("Complete","He's from England. He's ___.",["English"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Say your nationality.","Name three countries and their nationalities."]},
 ],
 "Family & possessives": [
   {"kind":"presentation","title":"My family","html":"<p>Possessive adjectives show who something belongs to: <strong>my, your, his, her, our, their</strong>.</p>",
    "examples":["This is <strong>my</strong> mother.","<strong>His</strong> name is Tom (a boy).","<strong>Her</strong> name is Ana (a girl).","These are <strong>our</strong> parents."],
    "tip":"'his' for boys/men, 'her' for girls/women."},
   {"kind":"practice","title":"Family vocabulary","vocab":V(("mother / mum","madre"),("father / dad","padre"),("brother","hermano"),("sister","hermana"),("son / daughter","hijo / hija"),("grandparents","abuelos")),
    "quiz":[mc("Tom is a boy. ___ name is Tom.",["Her","His","Their"],1),
            fb("Complete","Ana and I are sisters. ___ mum is a teacher.",["Our"]),
            match("Match the family words",[("mother","madre"),("brother","hermano"),("son","hijo"),("grandfather","abuelo")]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Describe your family: who they are and their names.","Use my/his/her at least three times."]},
 ],
 "This/that, these/those": [
   {"kind":"presentation","title":"Demonstratives","html":"<p>Use <strong>this/these</strong> for things near you, and <strong>that/those</strong> for things far away.</p><ul><li>this (1, near) / these (many, near)</li><li>that (1, far) / those (many, far)</li></ul>",
    "examples":["<strong>This</strong> is my pen. (here)","<strong>That</strong> is your book. (there)","<strong>These</strong> are my keys.","<strong>Those</strong> are nice shoes."]},
   {"kind":"practice","title":"Practice","vocab":V(("pen","lapicera"),("book","libro"),("bag","bolso"),("key","llave"),("table","mesa"),("chair","silla")),
    "quiz":[mc("___ is my phone (in my hand).",["That","This","Those"],1),
            mc("___ are your shoes (over there).",["These","This","Those"],2),
            fb("Complete (near, plural)","___ are my friends.",["These"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Point to 3 objects near you and 3 far away using this/that/these/those."]},
 ],
 "There is / there are": [
   {"kind":"presentation","title":"There is / There are","html":"<p>Use <strong>there is</strong> for one thing and <strong>there are</strong> for many.</p>",
    "examples":["<strong>There is</strong> a sofa in the room.","<strong>There are</strong> two windows.","Is there a TV? — Yes, there is.","Are there any chairs? — No, there aren't."],
    "tip":"Negative: there isn't / there aren't."},
   {"kind":"practice","title":"My house","vocab":V(("kitchen","cocina"),("bedroom","dormitorio"),("bathroom","baño"),("window","ventana"),("door","puerta"),("sofa","sillón")),
    "quiz":[fb("Complete","___ a big window in my room.",["There is","There's"]),
            fb("Complete","___ three chairs in the kitchen.",["There are"]),
            mc("Is there a TV? Yes, ___.",["there is","there are","it is"],0) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Describe your bedroom using there is / there are."]},
 ],
 "Adjectives & colours": [
   {"kind":"presentation","title":"Describing things","html":"<p>Adjectives describe nouns. In English the adjective goes <strong>before</strong> the noun.</p>",
    "examples":["a <strong>red</strong> car (not 'a car red')","a <strong>big</strong> house","a <strong>beautiful</strong> day","She is <strong>tall</strong> and <strong>friendly</strong>."]},
   {"kind":"practice","title":"Colours & adjectives","vocab":V(("red","rojo"),("blue","azul"),("green","verde"),("big / small","grande / pequeño"),("new / old","nuevo / viejo"),("happy","feliz")),
    "quiz":[order("Order the words",["a","blue","beautiful","car"],"Adjective before noun: a beautiful blue car."),
            mc("Choose the correct order",["a car red","a red car","red a car"],1),
            fb("Complete with a colour","The sky is ___.",["blue"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Describe 3 objects with a colour and an adjective.","Describe a friend (tall, friendly, etc.)."]},
 ],
 "Present simple: routines": [
   {"kind":"presentation","title":"Daily routines","guide":"Repasá la -s de la tercera persona; es el error más común.",
    "html":"<p>The <strong>present simple</strong> describes habits and routines. Add <strong>-s</strong> for he/she/it.</p><ul><li>I/you/we/they <strong>work</strong></li><li>he/she/it <strong>works</strong></li></ul>",
    "examples":["I <strong>get up</strong> at 7.","She <strong>works</strong> in a hospital.","We <strong>have</strong> lunch at 1.","He <strong>watches</strong> TV at night."],
    "tip":"Negatives/questions use do/does: I don't… / Does she…?"},
   {"kind":"practice","title":"Practice routines","vocab":V(("get up","levantarse"),("have breakfast","desayunar"),("go to work","ir al trabajo"),("study","estudiar"),("sleep","dormir"),("every day","todos los días")),
    "quiz":[fb("Add the correct verb form","She ___ (work) in an office.",["works"]),
            mc("Choose the correct sentence",["He go to school.","He goes to school.","He goeses to school."],1),
            fb("Make it negative","I ___ (not / like) coffee.",["don't like","do not like"]),
            mc("___ you live in Buenos Aires?",["Do","Does","Are"],0) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Describe your typical day with 5 routine verbs.","Ask your partner: What time do you get up?"]},
 ],
 "Telling the time": [
   {"kind":"presentation","title":"What time is it?","html":"<p>Use <strong>o'clock</strong>, <strong>past</strong> and <strong>to</strong>.</p><ul><li>3:00 — three o'clock</li><li>3:15 — quarter past three</li><li>3:30 — half past three</li><li>3:45 — quarter to four</li></ul>",
    "examples":["It's seven o'clock.","It's ten past nine.","It's twenty to six.","The class starts at half past four."]},
   {"kind":"practice","title":"Practice the time","vocab":V(("o'clock","en punto"),("quarter","cuarto"),("half","media"),("past","pasada(s)"),("to","para/menos"),("midnight","medianoche")),
    "quiz":[mc("3:30 is…",["half past three","three thirty past","half to three"],0),
            mc("9:45 is…",["quarter past nine","quarter to ten","nine forty-five to"],1),
            fb("Complete","It's ___ past two. (2:15)",["quarter"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Say what time you do 4 daily activities.","Ask: What time is it?"]},
 ],
 "Likes & dislikes": [
   {"kind":"presentation","title":"I like / I don't like","html":"<p>After <strong>like, love, hate</strong> we use the <strong>-ing</strong> form of the verb.</p>",
    "examples":["I <strong>like</strong> read<strong>ing</strong>.","She <strong>loves</strong> danc<strong>ing</strong>.","They <strong>don't like</strong> cook<strong>ing</strong>.","Do you like swimming? — Yes, I do."]},
   {"kind":"practice","title":"Practice","vocab":V(("like","gustar"),("love","encantar"),("hate","odiar"),("enjoy","disfrutar"),("reading","leer"),("cooking","cocinar")),
    "quiz":[fb("Complete with -ing","I love ___ (listen) to music.",["listening"]),
            mc("Choose the correct sentence",["She likes to dancing.","She likes dancing.","She like dancing."],1),
            mc("Do you like swimming? — ___",["Yes, I like.","Yes, I do.","Yes, I am."],1) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Say 3 things you like and 2 you don't like (+ -ing)."]},
 ],
 "Food & drink": [
   {"kind":"presentation","title":"Food & ordering","html":"<p>Some nouns are <strong>countable</strong> (an apple, two apples) and some <strong>uncountable</strong> (water, rice). Use <strong>some</strong> in positives and <strong>any</strong> in questions/negatives.</p>",
    "examples":["I'd like <strong>a</strong> coffee, please.","There is <strong>some</strong> bread.","Is there <strong>any</strong> milk?","Can I have the menu, please?"]},
   {"kind":"practice","title":"At a café","vocab":V(("water","agua"),("bread","pan"),("apple","manzana"),("coffee","café"),("menu","menú"),("the bill","la cuenta")),
    "quiz":[mc("Water is…",["countable","uncountable"],1),
            fb("some / any?","Is there ___ sugar?",["any"]),
            mc("How do you order politely?",["Give me a coffee.","I'd like a coffee, please.","Coffee."],1) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Order a meal and a drink politely.","Ask for the bill."]},
 ],
 # ───────────────────────────── A2 ─────────────────────────────
 "Past simple: irregular": [
   {"kind":"presentation","title":"Irregular past verbs","html":"<p>Many common verbs are <strong>irregular</strong> in the past — they don't take -ed. You must memorise them.</p><ul><li>go → <strong>went</strong></li><li>have → <strong>had</strong></li><li>see → <strong>saw</strong></li><li>buy → <strong>bought</strong></li></ul>",
    "examples":["Yesterday I <strong>went</strong> to the cinema.","We <strong>had</strong> a great time.","She <strong>saw</strong> her friends.","They <strong>bought</strong> a new car."],
    "tip":"Negatives & questions use 'did' + base verb: I didn't go / Did you go?"},
   {"kind":"practice","title":"Practice irregulars","vocab":V(("went","fui/fue"),("had","tuve/tenía"),("saw","vi"),("made","hice"),("took","tomé"),("came","vine")),
    "quiz":[fb("Past of 'go'","Last week we ___ to the beach.",["went"]),
            mc("Choose the correct past form",["He buyed a car.","He bought a car.","He buy a car."],1),
            fb("Question","___ you see the film? (past)",["Did"]),
            match("Match present and past",[("go","went"),("see","saw"),("have","had"),("make","made")]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Tell a partner what you did last weekend (5 irregular verbs)."]},
 ],
 "Present continuous": [
   {"kind":"presentation","title":"Actions happening now","html":"<p>The <strong>present continuous</strong> = am/is/are + verb-<strong>ing</strong>. It describes actions happening <strong>now</strong>.</p>",
    "examples":["I <strong>am working</strong> right now.","She <strong>is reading</strong> a book.","They <strong>are playing</strong> football.","What are you doing? — I'm studying."],
    "tip":"Present simple = routines; present continuous = now."},
   {"kind":"practice","title":"Now vs. usually","vocab":V(("now","ahora"),("at the moment","en este momento"),("right now","justo ahora"),("today","hoy"),("look!","¡mirá!"),("listen!","¡escuchá!")),
    "quiz":[fb("Complete (now)","Be quiet! The baby ___ (sleep).",["is sleeping"]),
            mc("Choose: routine or now? 'I usually walk to work.'",["now","routine"],1),
            fb("Make the -ing form","write → ___",["writing"],"Drop the final -e: writing.") ]},
   {"kind":"speaking","title":"Your turn","speaking":["Describe what people around you are doing right now."]},
 ],
 "Comparatives": [
   {"kind":"presentation","title":"Comparing things","html":"<p>Short adjectives add <strong>-er + than</strong>; long adjectives use <strong>more … than</strong>.</p><ul><li>tall → tall<strong>er than</strong></li><li>big → big<strong>ger than</strong> (double g)</li><li>expensive → <strong>more</strong> expensive <strong>than</strong></li></ul>",
    "examples":["A car is <strong>faster than</strong> a bike.","This book is <strong>more interesting than</strong> that one.","She's <strong>taller than</strong> me.","Buenos Aires is <strong>bigger than</strong> Córdoba."],
    "tip":"Irregular: good → better, bad → worse."},
   {"kind":"practice","title":"Practice comparatives","vocab":V(("big","grande"),("small","pequeño"),("cheap","barato"),("expensive","caro"),("fast","rápido"),("better","mejor")),
    "quiz":[fb("Comparative of 'big'","An elephant is ___ than a dog.",["bigger"]),
            mc("Correct comparative of 'expensive'",["expensiver","more expensive","most expensive"],1),
            fb("Irregular","This film is ___ than that one. (good)",["better"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Compare two cities, two foods and two people you know."]},
 ],
 "Going to: future plans": [
   {"kind":"presentation","title":"Future plans","html":"<p>Use <strong>be going to + verb</strong> for plans and intentions.</p>",
    "examples":["I <strong>am going to</strong> study tonight.","We <strong>are going to</strong> travel in summer.","She <strong>isn't going to</strong> come.","What are you going to do?"]},
   {"kind":"practice","title":"Practice plans","vocab":V(("tonight","esta noche"),("tomorrow","mañana"),("next week","la semana que viene"),("plan","plan"),("holiday","vacaciones"),("visit","visitar")),
    "quiz":[fb("Complete","I ___ ___ ___ visit my family next week.",["am going to","'m going to"]),
            mc("Choose the plan sentence",["I going to study.","I'm going to study.","I'm go to study."],1),
            order("Order the question",["are","what","going to","you","do","?"]) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Tell 3 plans for next weekend with 'going to'."]},
 ],
 "Present perfect: ever/never": [
   {"kind":"presentation","title":"Life experiences","html":"<p>The <strong>present perfect</strong> (have/has + past participle) talks about experiences in your life, without saying when.</p>",
    "examples":["<strong>Have</strong> you <strong>ever been</strong> to London?","I <strong>have never eaten</strong> sushi.","She <strong>has visited</strong> ten countries.","We <strong>have seen</strong> that film."],
    "tip":"Use 'ever' in questions and 'never' in negatives."},
   {"kind":"practice","title":"Practice experiences","vocab":V(("ever","alguna vez"),("never","nunca"),("been","estado"),("tried","probado"),("met","conocido"),("travelled","viajado")),
    "quiz":[fb("Complete","Have you ever ___ (be) to Brazil?",["been"]),
            mc("Choose the correct sentence",["I never have eaten octopus.","I have never eaten octopus.","I have ever eaten octopus."],1),
            mc("'Have you ever…' is used for…",["future plans","life experiences","daily routines"],1) ]},
   {"kind":"speaking","title":"Your turn","speaking":["Ask and answer 3 'Have you ever…?' questions."]},
 ],
}

# Default 3-block structure for lessons without bespoke content yet.
def baseline(title, objective):
    obj = objective or f"learn about {title}"
    return [
      {"kind":"presentation","title":"Explanation",
       "html":f"<p>In this lesson you will <strong>{obj[0].lower()+obj[1:]}</strong></p>"
              f"<p>Read the examples carefully and notice the structure of <em>{title}</em>.</p>",
       "examples":[f"Key point of <strong>{title}</strong> — your teacher will add more examples here.",
                   "Notice the word order and the verb forms.",
                   "Practise saying each example out loud."],
       "guide":f"Tema: {title}. Presentá la estructura con ejemplos y guiá la práctica."},
      {"kind":"practice","title":"Quick check",
       "quiz":[mc(f"This lesson is about…",["greetings",title,"numbers"],1),
               ("fill_blank","Complete the idea",{"text":f"The topic of this lesson is ___.","answers":[title.lower()]},"")]},
      {"kind":"speaking","title":"Speaking",
       "speaking":[f"Talk about \"{title}\" using two example sentences.","Ask your partner a question about the topic."]},
    ]


def build_block_values(lesson_id, idx, b):
    content = {}
    for k in ("guide","html","examples","vocab","reading","speaking","tip","videoUrl","kahootUrl","phonetics"):
        if k in b and b[k] is not None:
            content[k] = b[k]
    quiz_questions = b.get("quiz")
    return content, quiz_questions


def main():
    lessons = query("select l.id, l.title, l.objective, lv.code from public.lessons l "
                    "join public.levels lv on lv.id=l.level_id order by lv.sort_order, l.sort_order")
    # wipe seeded content quizzes (keep the 4 hand-made A2 example quizzes intact? we re-create per lesson)
    query("delete from public.quizzes where title like 'L· %'")

    done = 0
    for les in lessons:
        title = les["title"]; lid = les["id"]
        blocks = CONTENT.get(title) or baseline(title, les.get("objective"))
        # clear existing blocks for this lesson
        query(f"delete from public.lesson_blocks where lesson_id='{lid}'")
        for idx, b in enumerate(blocks):
            content, quiz_qs = build_block_values(lid, idx, b)
            if quiz_qs:
                qid = query(
                    f"insert into public.quizzes (title, description, is_shared) "
                    f"values ('L· {q(title[:40])}', '{q(b.get('title',''))}', true) returning id"
                )[0]["id"]
                vals = []
                for i,(kind,prompt,data,expl) in enumerate(quiz_qs):
                    vals.append(f"('{qid}','{kind}','{q(prompt)}','{jq(data)}'::jsonb,'{q(expl)}',1,{i})")
                query("insert into public.quiz_questions (quiz_id, kind, prompt, data, explanation, points, sort_order) values "+", ".join(vals))
                content["quizId"] = qid
            dur = {"warmup":5,"presentation":15,"practice":20,"speaking":15,"review":5,"wrapup":5}.get(b["kind"],10)
            query("insert into public.lesson_blocks (lesson_id, kind, title, duration_min, sort_order, content) values "
                  f"('{lid}','{b['kind']}','{q(b['title'])}',{dur},{idx},'{jq(content)}'::jsonb)")
        done += 1
    print(f"Rebuilt content for {done} lessons.")


if __name__ == "__main__":
    main()
