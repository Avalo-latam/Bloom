#!/usr/bin/env python
"""Deep content for A2 (remaining), B1 and B2. Only touches lessons listed in
CONTENT — leaves A1 (already authored) and others as they are.
Run with SUPABASE_PAT and SUPABASE_REF set."""
import json, os, urllib.request

PAT = os.environ["SUPABASE_PAT"]; REF = os.environ["SUPABASE_REF"]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36"

def query(sql):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {PAT}", "Content-Type": "application/json", "User-Agent": UA})
    return json.load(urllib.request.urlopen(req))

def q(s): return s.replace("'", "''")
def jq(o): return q(json.dumps(o, ensure_ascii=False))
def V(*p): return [{"term": t, "es": e} for t, e in p]
def mc(p, o, a, e=""): return ("multiple_choice", p, {"options": o, "answer": a}, e)
def fb(p, t, a, e=""): return ("fill_blank", p, {"text": t, "answers": a}, e)
def order(p, i, e=""): return ("ordering", p, {"items": i}, e)
def match(p, pr, e=""): return ("matching", p, {"pairs": [{"left": a, "right": b} for a, b in pr]}, e)

def L(html, examples, vocab, quiz, speaking, video, guide=""):
    """Build the standard 3 blocks for a lesson."""
    return [
      {"kind":"presentation","title":"Explanation","guide":guide,"html":html,"examples":examples,"videoSearch":video},
      {"kind":"practice","title":"Vocabulary & practice","vocab":vocab,"quiz":quiz},
      {"kind":"speaking","title":"Your turn","speaking":speaking},
    ]

CONTENT = {
 # ── A2 remaining ──
 "Past simple: regular": L(
   "<p>Regular verbs form the past by adding <strong>-ed</strong>. Questions and negatives use <strong>did/didn't</strong> + base verb.</p>",
   ["I work<strong>ed</strong> yesterday.","She studi<strong>ed</strong> for the test.","We <strong>didn't</strong> watch TV.","<strong>Did</strong> you call him?"],
   V(("work → worked","trabajar"),("play → played","jugar"),("study → studied","estudiar"),("stop → stopped","parar"),("yesterday","ayer"),("last night","anoche")),
   [fb("Past simple","Last weekend I ___ (visit) my aunt.",["visited"]),
    mc("Spelling: study →",["studyed","studied","studyied"],1,"y → ied"),
    fb("Negative","She ___ (not / like) the film.",["didn't like","did not like"]),
    mc("Question word order",["Did you played?","Did you play?","You did play?"],1)],
   ["Tell me 4 things you did last weekend (regular verbs).","Ask a partner what they did yesterday."],
   "past simple regular verbs"),
 "Directions & prepositions": L(
   "<p>To give directions we use the imperative (<strong>go, turn, take</strong>) and prepositions of place.</p>",
   ["<strong>Go straight</strong> ahead.","<strong>Turn left</strong> at the corner.","It's <strong>next to</strong> the bank.","It's <strong>on the corner</strong> of Main St."],
   V(("turn left/right","doblar izq/der"),("go straight","seguir derecho"),("next to","al lado de"),("opposite","enfrente de"),("between","entre"),("on the corner","en la esquina")),
   [mc("How do you tell someone to go straight?",["Go straight ahead.","Straight you go.","You straight."],0),
    fb("Preposition","The bank is ___ to the café. (al lado)",["next"]),
    match("Match",[("turn left","doblar a la izquierda"),("opposite","enfrente"),("between","entre")])],
   ["Give directions from the school to your house.","Ask: How do I get to…?"],
   "asking for and giving directions"),
 "Superlatives": L(
   "<p>Superlatives compare 3+ things: short adjectives add <strong>-est</strong>, long ones use <strong>the most</strong>. Always with <strong>the</strong>.</p>",
   ["It's <strong>the biggest</strong> city.","She's <strong>the most intelligent</strong> student.","the best / the worst (irregular)","Everest is <strong>the highest</strong> mountain."],
   V(("big → the biggest","el más grande"),("good → the best","el mejor"),("bad → the worst","el peor"),("expensive","caro"),("interesting","interesante"),("popular","popular")),
   [fb("Superlative of 'tall'","He's ___ boy in the class.",["the tallest"]),
    mc("Superlative of 'beautiful'",["the beautifulest","the most beautiful","most beautiful"],1),
    fb("Irregular","This is ___ pizza in town! (good)",["the best"])],
   ["What's the best film you've seen? Why?","Describe the biggest/most beautiful place you know."],
   "superlative adjectives"),
 "Travel & transport": L(
   "<p>Talk about travel with transport vocabulary and useful phrases for tickets and journeys.</p>",
   ["I go to work <strong>by bus</strong>.","A <strong>return ticket</strong>, please.","The train <strong>leaves</strong> at 9.","How long does the <strong>journey</strong> take?"],
   V(("by bus/train/car","en bus/tren/auto"),("ticket","boleto"),("return ticket","ida y vuelta"),("platform","andén"),("luggage","equipaje"),("journey","viaje")),
   [mc("'A return ticket' means…",["one way","round trip","free ticket"],1),
    fb("Preposition","I travel ___ train.",["by"]),
    mc("Where do you wait for a train?",["the platform","the runway","the gate"],0)],
   ["Describe how you travel to work/school.","Buy a ticket: role-play at the station."],
   "travel and transport vocabulary"),
 "Quantifiers": L(
   "<p>Use <strong>some/any</strong>, <strong>much/many</strong> and <strong>a lot of</strong> to talk about quantity. <em>Much</em> = uncountable, <em>many</em> = countable.</p>",
   ["There isn't <strong>much</strong> milk.","There aren't <strong>many</strong> people.","We have <strong>a lot of</strong> homework.","Is there <strong>any</strong> sugar?"],
   V(("much","mucho (incont.)"),("many","muchos (cont.)"),("a lot of","mucho/s"),("a few","unos pocos"),("a little","un poco"),("some/any","algo de")),
   [mc("___ people came to the party.",["Much","Many","A little"],1),
    fb("much/many","How ___ water do you drink?",["much"]),
    mc("There isn't ___ time.",["many","much","a few"],1)],
   ["Say how much/many of 4 things you have.","Ask your partner about quantities."],
   "quantifiers much many a lot of"),
 "Adverbs of manner": L(
   "<p>Adverbs of manner say <strong>how</strong> we do things. Usually adjective + <strong>-ly</strong>. Some are irregular (good → well).</p>",
   ["She sings <strong>beautifully</strong>.","He drives <strong>carefully</strong>.","They work <strong>hard</strong>. (irregular)","I speak English <strong>well</strong>."],
   V(("quick → quickly","rápidamente"),("careful → carefully","cuidadosamente"),("good → well","bien"),("hard","duro/mucho"),("slowly","lentamente"),("happily","felizmente")),
   [fb("Adverb of 'slow'","Please drive ___.",["slowly"]),
    mc("Adverb of 'good'",["goodly","well","goodly"],1),
    fb("Adverb of 'happy'","She smiled ___.",["happily"])],
   ["Describe how you do 3 activities (use adverbs).","How do you speak English? (well / slowly…)"],
   "adverbs of manner -ly"),
 "Health & the body": L(
   "<p>Talk about health problems and give advice with <strong>should</strong>.</p>",
   ["I've got <strong>a headache</strong>.","My <strong>throat</strong> hurts.","You <strong>should</strong> see a doctor.","You <strong>shouldn't</strong> eat so much sugar."],
   V(("headache","dolor de cabeza"),("stomachache","dolor de panza"),("a cold","resfrío"),("a fever","fiebre"),("should","debería"),("medicine","remedio")),
   [mc("Advice: I have a cold.",["You should rest.","You rest should.","Rest you should."],0),
    fb("Health problem","I can't talk, I have a sore ___.",["throat"]),
    mc("'shouldn't' is used to…",["give advice not to do","ask questions","talk about the past"],0)],
   ["Describe a health problem and give advice with should.","Role-play: patient and doctor."],
   "health problems and giving advice should"),
 # ── B1 ──
 "Past continuous vs. past simple": L(
   "<p>The <strong>past continuous</strong> (was/were + -ing) sets the scene; the <strong>past simple</strong> is the action that interrupts it. Often joined by <strong>when</strong> / <strong>while</strong>.</p>",
   ["I <strong>was watching</strong> TV <strong>when</strong> she <strong>called</strong>.","<strong>While</strong> we <strong>were eating</strong>, it started to rain.","They <strong>were sleeping</strong> at midnight.","What <strong>were</strong> you <strong>doing</strong> at 8?"],
   V(("was/were + -ing","estaba haciendo"),("when","cuando"),("while","mientras"),("suddenly","de repente"),("at that moment","en ese momento"),("interrupt","interrumpir")),
   [fb("Past continuous","I ___ (read) when the lights went out.",["was reading"]),
    mc("Choose: 'While I was cooking, I ___ my finger.'",["cut","was cutting","cutting"],0),
    order("Order","I was sleeping when the phone rang".split())],
   ["Tell a short story: what were you doing when something happened?","Use 'when' and 'while'."],
   "past continuous vs past simple"),
 "Used to": L(
   "<p><strong>Used to + base verb</strong> describes past habits or states that are no longer true.</p>",
   ["I <strong>used to</strong> play football.","She <strong>used to</strong> live in Spain.","We <strong>didn't use to</strong> have phones.","<strong>Did</strong> you <strong>use to</strong> like vegetables?"],
   V(("used to","solía"),("habit","hábito"),("no longer","ya no"),("as a child","de niño/a"),("in the past","en el pasado"),("change","cambio")),
   [fb("Past habit","I ___ ___ smoke, but I stopped.",["used to"]),
    mc("Negative form",["didn't used to","didn't use to","didn't use"],1),
    mc("'used to' talks about…",["the future","past habits","present routines"],1)],
   ["Say 3 things you used to do as a child but don't do now."],
   "used to past habits"),
 "Relative clauses": L(
   "<p>Relative pronouns add information: <strong>who</strong> (people), <strong>which</strong> (things), <strong>that</strong> (both), <strong>where</strong> (places).</p>",
   ["The man <strong>who</strong> lives next door is a doctor.","The book <strong>which</strong> I read was great.","That's the café <strong>where</strong> we met.","A vet is a person <strong>who</strong> helps animals."],
   V(("who","que/quien (personas)"),("which","que (cosas)"),("that","que"),("where","donde"),("whose","cuyo"),("relative clause","oración de relativo")),
   [mc("The phone ___ I bought is broken.",["who","which","where"],1),
    fb("Relative pronoun","She's the teacher ___ helped me.",["who","that"]),
    mc("This is the city ___ I was born.",["which","who","where"],2)],
   ["Define 3 jobs using 'who': A doctor is a person who…"],
   "relative clauses who which that where"),
 "First conditional": L(
   "<p>The <strong>first conditional</strong> talks about real future possibilities: <strong>If + present simple, will + base verb</strong>.</p>",
   ["<strong>If</strong> it <strong>rains</strong>, we<strong>'ll stay</strong> home.","She<strong>'ll pass if</strong> she studies.","<strong>If</strong> you <strong>don't hurry</strong>, you'll miss the bus.","What will you do <strong>if</strong> it snows?"],
   V(("if","si"),("will / 'll","futuro"),("won't","no + futuro"),("unless","a menos que"),("possible","posible"),("result","resultado")),
   [fb("First conditional","If you heat ice, it ___ (melt).",["will melt","'ll melt"]),
    mc("Choose the correct sentence",["If it will rain, I stay.","If it rains, I'll stay.","If it rains, I stay will."],1),
    fb("Complete","I'll call you if I ___ (have) time.",["have"])],
   ["Finish 3 sentences: 'If I have time tomorrow, I'll…'"],
   "first conditional"),
 "Will vs. going to": L(
   "<p>Use <strong>will</strong> for instant decisions, predictions and promises; <strong>going to</strong> for plans and evidence-based predictions.</p>",
   ["I think it <strong>will</strong> rain. (prediction)","Look at those clouds — it<strong>'s going to</strong> rain. (evidence)","I<strong>'ll</strong> help you! (decision now)","We<strong>'re going to</strong> travel. (plan)"],
   V(("will","instantáneo/predicción"),("going to","plan/evidencia"),("prediction","predicción"),("decision","decisión"),("promise","promesa"),("plan","plan")),
   [mc("The phone is ringing. I ___ answer it.",["'m going to","'ll","going to"],1,"Instant decision = will."),
    mc("We've bought tickets — we ___ travel.",["'ll","are going to"],1),
    fb("Prediction with evidence","Look! He ___ ___ ___ fall!",["is going to"])],
   ["Make 2 predictions and 2 plans about next year."],
   "will vs going to"),
 "Modals of obligation": L(
   "<p><strong>Must / have to</strong> = obligation; <strong>mustn't</strong> = prohibition; <strong>should</strong> = advice; <strong>don't have to</strong> = no obligation.</p>",
   ["You <strong>must</strong> wear a seatbelt.","I <strong>have to</strong> work tomorrow.","You <strong>mustn't</strong> smoke here.","You <strong>don't have to</strong> come if you're tired."],
   V(("must","deber (obligación)"),("have to","tener que"),("mustn't","no deber"),("should","debería"),("don't have to","no hace falta"),("allowed","permitido")),
   [mc("Prohibition: You ___ park here.",["don't have to","mustn't","should"],1),
    fb("Obligation","I ___ ___ finish this today. (tener que)",["have to"]),
    mc("'don't have to' means…",["it's prohibited","it's not necessary","it's advice"],1)],
   ["Say 3 rules at your work/school using must/mustn't/have to."],
   "modals of obligation must have to should"),
 "Work & careers": L(
   "<p>Talk about jobs, skills and the workplace.</p>",
   ["I <strong>work as</strong> a nurse.","She's <strong>in charge of</strong> sales.","He's <strong>good at</strong> solving problems.","I'd like to <strong>apply for</strong> the job."],
   V(("job / career","trabajo / carrera"),("skills","habilidades"),("salary","sueldo"),("colleague","colega"),("apply for","postularse"),("be in charge of","estar a cargo de")),
   [match("Match",[("salary","sueldo"),("colleague","colega"),("skills","habilidades")]),
    fb("Collocation","I want to ___ for a new job.",["apply"]),
    mc("'in charge of' means…",["responsible for","tired of","afraid of"],0)],
   ["Describe your dream job and the skills you need."],
   "jobs careers and skills vocabulary"),
 "Second conditional": L(
   "<p>The <strong>second conditional</strong> talks about hypothetical / unreal situations: <strong>If + past simple, would + base verb</strong>.</p>",
   ["<strong>If</strong> I <strong>had</strong> money, I<strong>'d travel</strong>.","What <strong>would</strong> you do <strong>if</strong> you <strong>won</strong> the lottery?","<strong>If</strong> I <strong>were</strong> you, I'd rest.","She'd be happier <strong>if</strong> she <strong>had</strong> a dog."],
   V(("would / 'd","haría"),("if + past","si + pasado"),("imaginary","imaginario"),("were (all persons)","fuera"),("advice (If I were you)","si yo fuera vos"),("hypothetical","hipotético")),
   [fb("Second conditional","If I ___ (be) rich, I'd help people.",["were","was"]),
    mc("Choose the correct sentence",["If I would have time, I'd go.","If I had time, I'd go.","If I have time, I'd go."],1),
    fb("Advice","If I ___ you, I'd apologise.",["were"])],
   ["Answer: What would you do if you could live anywhere?"],
   "second conditional"),
 "Present perfect vs. past simple": L(
   "<p>Use <strong>past simple</strong> for finished time (yesterday, in 2010); <strong>present perfect</strong> for life experience or unfinished time (ever, never, this week).</p>",
   ["I <strong>visited</strong> Rome <strong>in 2019</strong>. (finished)","I <strong>have visited</strong> Rome. (experience)","She <strong>has lived</strong> here <strong>for</strong> 5 years.","Did you see it <strong>yesterday</strong>?"],
   V(("for","durante (período)"),("since","desde (punto)"),("already","ya"),("yet","todavía"),("ever/never","alguna vez/nunca"),("just","recién")),
   [mc("Choose: 'I ___ my keys. I can't find them.'",["lost","have lost"],1),
    fb("for/since","I've lived here ___ 2020.",["since"]),
    mc("'Yesterday' goes with…",["present perfect","past simple"],1)],
   ["Tell one finished past action and one life experience."],
   "present perfect vs past simple for since"),
 "Expressing opinions": L(
   "<p>Agree, disagree and give reasons politely.</p>",
   ["<strong>In my opinion</strong>, …","<strong>I think</strong> that …","<strong>I agree</strong> with you.","<strong>I'm not sure</strong> I agree, because …"],
   V(("in my opinion","en mi opinión"),("I agree","estoy de acuerdo"),("I disagree","no estoy de acuerdo"),("point of view","punto de vista"),("because","porque"),("on the other hand","por otro lado")),
   [mc("Which phrase agrees?",["I disagree.","You're right.","I'm not sure."],1),
    fb("Give a reason","I like it ___ it's useful.",["because"]),
    match("Match",[("I agree","de acuerdo"),("in my opinion","en mi opinión")])],
   ["Give your opinion on social media. Agree/disagree with a partner."],
   "expressing opinions agreeing disagreeing"),
 "The environment": L(
   "<p>Discuss environmental problems and solutions.</p>",
   ["We must <strong>reduce</strong> plastic.","<strong>Climate change</strong> is a big problem.","We should <strong>recycle</strong> more.","<strong>Renewable energy</strong> is the future."],
   V(("pollution","contaminación"),("climate change","cambio climático"),("recycle","reciclar"),("waste","residuos"),("renewable energy","energía renovable"),("global warming","calentamiento global")),
   [match("Match",[("recycle","reciclar"),("pollution","contaminación"),("waste","residuos")]),
    mc("A solution to pollution is to…",["drive more","recycle and reduce","waste energy"],1),
    fb("Vocabulary","Solar and wind are ___ energy.",["renewable"])],
   ["Suggest 3 things people should do to help the planet."],
   "the environment climate change vocabulary"),
}

def main():
    titles = list(CONTENT.keys())
    inlist = ",".join(f"'{q(t)}'" for t in titles)
    lessons = {r["title"]: r["id"] for r in query(f"select id, title from public.lessons where title in ({inlist})")}
    done = 0
    for title, blocks in CONTENT.items():
        lid = lessons.get(title)
        if not lid:
            print("MISSING lesson:", title); continue
        query(f"delete from public.lesson_blocks where lesson_id='{lid}'")
        query(f"delete from public.quizzes where title='L· {q(title[:40])}'")
        for idx, b in enumerate(blocks):
            content = {k: b[k] for k in ("guide","html","examples","vocab","reading","speaking","tip","videoSearch","videoUrl","kahootUrl","phonetics") if b.get(k)}
            if b.get("quiz"):
                qid = query(f"insert into public.quizzes (title, description, is_shared) values ('L· {q(title[:40])}', '{q(b.get('title',''))}', true) returning id")[0]["id"]
                vals = [f"('{qid}','{k}','{q(p)}','{jq(d)}'::jsonb,'{q(e)}',1,{i})" for i,(k,p,d,e) in enumerate(b["quiz"])]
                query("insert into public.quiz_questions (quiz_id, kind, prompt, data, explanation, points, sort_order) values "+", ".join(vals))
                content["quizId"] = qid
            dur = {"presentation":15,"practice":20,"speaking":15}.get(b["kind"],10)
            query("insert into public.lesson_blocks (lesson_id, kind, title, duration_min, sort_order, content) values "
                  f"('{lid}','{b['kind']}','{q(b['title'])}',{dur},{idx},'{jq(content)}'::jsonb)")
        done += 1
    print(f"Deep content written for {done} lessons.")

if __name__ == "__main__":
    main()
