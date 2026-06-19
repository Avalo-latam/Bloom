-- Bloom English — seed the level catalogue (CEFR ladder + tracks).
-- Units, lessons and blocks are seeded by the curriculum migration.

insert into public.levels (code, title, subtitle, description, accent, is_track, sort_order, cefr_can_do)
values
  ('A1', 'A1', 'Principiante', 'Primeros pasos: saludos, presentaciones y frases de uso cotidiano.', 'brand-mint', false, 1,
    array[
      'Puede presentarse y presentar a otros.',
      'Puede hacer y responder preguntas sobre datos personales.',
      'Puede comprender frases y vocabulario muy básico.'
    ]),
  ('A2', 'A2', 'Elemental', 'Comunicación simple sobre temas familiares y rutinas.', 'brand-sky', false, 2,
    array[
      'Puede comunicarse en tareas simples y cotidianas.',
      'Puede describir su entorno y necesidades inmediatas.',
      'Puede leer textos cortos y sencillos.'
    ]),
  ('B1', 'B1', 'Intermedio', 'Autonomía para viajar, opinar y narrar experiencias.', 'brand-lila', false, 3,
    array[
      'Puede desenvolverse en la mayoría de situaciones de viaje.',
      'Puede narrar experiencias, planes y opiniones.',
      'Puede comprender las ideas principales de textos claros.'
    ]),
  ('B2', 'B2', 'Intermedio alto', 'Fluidez y naturalidad en una amplia gama de temas.', 'brand-peach', false, 4,
    array[
      'Puede interactuar con fluidez y naturalidad con hablantes nativos.',
      'Puede producir textos claros y detallados sobre diversos temas.',
      'Puede defender un punto de vista sobre temas de actualidad.'
    ]),
  ('C1', 'C1', 'Avanzado', 'Uso flexible y eficaz del idioma para fines sociales y profesionales.', 'brand-rose', false, 5,
    array[
      'Puede expresarse con fluidez y espontaneidad.',
      'Puede utilizar el idioma de forma flexible en ámbitos sociales y profesionales.',
      'Puede comprender una amplia variedad de textos extensos y exigentes.'
    ]),
  ('FCE', 'FCE', 'Preparación First Certificate', 'Entrenamiento específico para el examen Cambridge B2 First (FCE).', 'brand-lemon', true, 6,
    array[
      'Domina las 4 partes del examen: Reading & Use of English, Writing, Listening y Speaking.',
      'Maneja estrategias de examen y administración del tiempo.',
      'Produce escritos del formato esperado (essay, email, review, report).'
    ]),
  ('PHONETICS', 'Fonética', 'Pronunciación y entonación', 'Práctica del alfabeto fonético, sonidos difíciles, pares mínimos y entonación.', 'brand-leaf', true, 7,
    array[
      'Reconoce y produce los sonidos del inglés (IPA).',
      'Distingue pares mínimos y sonidos problemáticos.',
      'Mejora el ritmo, la acentuación y la entonación.'
    ])
on conflict (code) do nothing;
