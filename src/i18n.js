// SoulSurf – i18n Internationalization (Sprint 28 – Complete)
import { useState, useCallback } from "react";

const STORAGE_KEY = "soulsurf_lang";

const T = {
  // ══════════════════════════════════════════
  // NAV
  // ══════════════════════════════════════════
  "nav.home": { de: "Home", en: "Home", pt: "Início" },
  "nav.lessons": { de: "Lektionen", en: "Lessons", pt: "Aulas" },
  "nav.forecast": { de: "Forecast", en: "Forecast", pt: "Previsão" },
  "nav.schools": { de: "Surfschulen", en: "Surf Schools", pt: "Escolas" },
  "nav.trip": { de: "Trip", en: "Trip", pt: "Viagem" },
  "nav.diary": { de: "Tagebuch", en: "Diary", pt: "Diário" },
  "nav.progress": { de: "Fortschritt", en: "Progress", pt: "Progresso" },
  "nav.equipment": { de: "Equipment", en: "Equipment", pt: "Equipamento" },
  "nav.instructor": { de: "Instructor", en: "Instructor", pt: "Instrutor" },
  "nav.community": { de: "Community", en: "Community", pt: "Comunidade" },

  // ══════════════════════════════════════════
  // GENERAL
  // ══════════════════════════════════════════
  "g.delete": { de: "Löschen", en: "Delete", pt: "Excluir" },
  "g.cancel": { de: "Abbrechen", en: "Cancel", pt: "Cancelar" },
  "g.save": { de: "Speichern", en: "Save", pt: "Salvar" },
  "g.loading": { de: "Wird geladen...", en: "Loading...", pt: "Carregando..." },
  "g.back": { de: "← Zurück", en: "← Back", pt: "← Voltar" },
  "g.days": { de: "Tage", en: "days", pt: "dias" },
  "g.day": { de: "Tag", en: "day", pt: "dia" },
  "g.done": { de: "erledigt", en: "done", pt: "feito" },
  "g.all": { de: "Alle", en: "All", pt: "Todos" },
  "g.noWetsuit": { de: "Kein Neo", en: "No wetsuit", pt: "Sem roupa" },
  "g.comingSoon": { de: "Kommt bald!", en: "Coming soon!", pt: "Em breve!" },

  // ══════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════
  "auth.login": { de: "Anmelden", en: "Sign in", pt: "Entrar" },
  "auth.logout": { de: "Abmelden", en: "Sign out", pt: "Sair" },
  "auth.register": { de: "Registrieren", en: "Register", pt: "Cadastrar" },
  "auth.welcomeBack": { de: "Willkommen zurück!", en: "Welcome back!", pt: "Bem-vindo de volta!" },
  "auth.createAccount": { de: "Account erstellen", en: "Create account", pt: "Criar conta" },
  "auth.resetPassword": { de: "Passwort zurücksetzen", en: "Reset password", pt: "Redefinir senha" },
  "auth.loginDesc": { de: "Logge dich ein um deine Daten zu synchronisieren.", en: "Sign in to sync your data.", pt: "Entre para sincronizar seus dados." },
  "auth.registerDesc": { de: "Kostenlos registrieren und auf allen Geräten surfen.", en: "Register for free and surf on all devices.", pt: "Cadastre-se grátis e surfe em todos os dispositivos." },
  "auth.resetDesc": { de: "Wir senden dir einen Reset-Link per E-Mail.", en: "We'll send you a reset link by email.", pt: "Enviaremos um link de redefinição por e-mail." },
  "auth.email": { de: "E-Mail", en: "Email", pt: "E-mail" },
  "auth.password": { de: "Passwort", en: "Password", pt: "Senha" },
  "auth.moment": { de: "⏳ Moment...", en: "⏳ Just a moment...", pt: "⏳ Um momento..." },
  "auth.sendReset": { de: "Reset-Link senden", en: "Send reset link", pt: "Enviar link" },
  "auth.confirmSent": { de: "Bestätigungs-E-Mail gesendet! Checke deinen Posteingang.", en: "Confirmation email sent! Check your inbox.", pt: "E-mail de confirmação enviado! Verifique sua caixa de entrada." },
  "auth.backToLogin": { de: "← Zurück zum Login", en: "← Back to login", pt: "← Voltar ao login" },
  "auth.noAccount": { de: "Noch kein Account?", en: "No account yet?", pt: "Ainda não tem conta?" },
  "auth.haveAccount": { de: "Schon registriert?", en: "Already registered?", pt: "Já tem conta?" },
  "auth.forgotPassword": { de: "Passwort vergessen?", en: "Forgot password?", pt: "Esqueceu a senha?" },

  // ══════════════════════════════════════════
  // HOME – Onboarding
  // ══════════════════════════════════════════
  "home.welcome": { de: "Willkommen bei", en: "Welcome to", pt: "Bem-vindo ao" },
  "home.subtitle": { de: "Dein persönlicher Surf-Coach – lerne Surfen, plane Trips und tracke deinen Fortschritt.", en: "Your personal surf coach – learn to surf, plan trips and track your progress.", pt: "Seu coach pessoal de surf – aprenda a surfar, planeje viagens e acompanhe seu progresso." },
  "home.getStarted": { de: "Los geht's 🤙", en: "Let's go 🤙", pt: "Vamos lá 🤙" },
  "home.whatToDo": { de: "Was willst du machen?", en: "What do you want to do?", pt: "O que você quer fazer?" },
  "home.chooseEntry": { de: "Wähle deinen Einstieg – du kannst jederzeit alles nutzen.", en: "Choose your entry – you can use everything anytime.", pt: "Escolha por onde começar – você pode usar tudo a qualquer momento." },
  "home.learnSurf": { de: "Surfen lernen", en: "Learn to surf", pt: "Aprender a surfar" },
  "home.learnSurfDesc": { de: "Personalisiertes Programm mit Lektionen & Videos", en: "Personalized program with lessons & videos", pt: "Programa personalizado com aulas e vídeos" },
  "home.checkForecast": { de: "Forecast checken", en: "Check forecast", pt: "Ver previsão" },
  "home.checkForecastDesc": { de: "Surf-Bedingungen für deinen Spot", en: "Surf conditions for your spot", pt: "Condições de surf do seu pico" },
  "home.planTrip": { de: "Trip planen", en: "Plan a trip", pt: "Planejar viagem" },
  "home.planTripDesc": { de: "Spots entdecken, Wetter, Packliste", en: "Discover spots, weather, packing list", pt: "Descubra picos, clima, lista de bagagem" },
  "home.findBoard": { de: "Board finden", en: "Find a board", pt: "Encontrar prancha" },
  "home.findBoardDesc": { de: "Board-Berater für dein Level", en: "Board advisor for your level", pt: "Consultor de prancha para seu nível" },
  "home.ready": { de: "Bereit?", en: "Ready?", pt: "Pronto?" },
  "home.readyDesc": { de: "Starte mit deinem persönlichen Programm oder erkunde die App frei.", en: "Start with your personal program or explore the app freely.", pt: "Comece com seu programa pessoal ou explore o app livremente." },
  "home.startNow": { de: "Jetzt starten 🚀", en: "Start now 🚀", pt: "Começar agora 🚀" },
  "home.exploreFree": { de: "Erstmal frei erkunden 🏖️", en: "Explore freely first 🏖️", pt: "Explorar livremente primeiro 🏖️" },
  // Features carousel
  "home.feat1": { de: "63 Surf-Lektionen", en: "63 Surf Lessons", pt: "63 Aulas de Surf" },
  "home.feat1d": { de: "Pop-Up bis Barrel", en: "Pop-up to barrel", pt: "Pop-up até tubo" },
  "home.feat2": { de: "Live Forecast", en: "Live Forecast", pt: "Previsão ao Vivo" },
  "home.feat2d": { de: "Stündliche Bedingungen", en: "Hourly conditions", pt: "Condições por hora" },
  "home.feat3": { de: "XP & Levels", en: "XP & Levels", pt: "XP & Níveis" },
  "home.feat3d": { de: "Gamifiziertes Lernen", en: "Gamified learning", pt: "Aprendizado gamificado" },
  "home.feat4": { de: "Cloud Sync", en: "Cloud Sync", pt: "Cloud Sync" },
  "home.feat4d": { de: "Alle Geräte synchron", en: "All devices in sync", pt: "Todos os dispositivos sincronizados" },

  // Home – Dashboard
  "home.morning": { de: "Guten Morgen! ☀️", en: "Good morning! ☀️", pt: "Bom dia! ☀️" },
  "home.midday": { de: "Moin! 🤙", en: "Hey! 🤙", pt: "E aí! 🤙" },
  "home.afternoon": { de: "Hey! 🌊", en: "Hey! 🌊", pt: "Oi! 🌊" },
  "home.evening": { de: "Guten Abend! 🌅", en: "Good evening! 🌅", pt: "Boa noite! 🌅" },
  "home.onFire": { de: "Du bist on fire! 🔥", en: "You're on fire! 🔥", pt: "Você tá pegando fogo! 🔥" },
  "home.almostDone": { de: "Fast geschafft! 💪", en: "Almost there! 💪", pt: "Quase lá! 💪" },
  "home.keepGoing": { de: "Weiter so! 🤙", en: "Keep going! 🤙", pt: "Continue assim! 🤙" },
  "home.continueSurf": { de: "▶ Weiter surfen", en: "▶ Continue surfing", pt: "▶ Continuar surfando" },
  "home.surfedToday": { de: "Heute gesurft! ✓", en: "Surfed today! ✓", pt: "Surfou hoje! ✓" },
  "home.surfedTodayQ": { de: "Heute gesurft?", en: "Surfed today?", pt: "Surfou hoje?" },
  "home.tapToLog": { de: "Tippe um deinen Surf-Tag zu loggen", en: "Tap to log your surf day", pt: "Toque para registrar seu dia de surf" },
  "home.streak": { de: "Streak", en: "Streak", pt: "Sequência" },
  "home.entries": { de: "Einträge", en: "Entries", pt: "Entradas" },
  "home.open": { de: "Offen", en: "Open", pt: "Aberto" },
  "home.createProgram": { de: "Programm erstellen 🤙", en: "Create program 🤙", pt: "Criar programa 🤙" },
  "home.noProgram": { de: "Noch kein Programm", en: "No program yet", pt: "Nenhum programa ainda" },
  "home.dailyGoals": { de: "🎯 Tages-Ziele", en: "🎯 Daily Goals", pt: "🎯 Metas Diárias" },
  "home.weeklyChallenge": { de: "🏆 Wochen-Challenge", en: "🏆 Weekly Challenge", pt: "🏆 Desafio Semanal" },
  "home.nextLevel": { de: "Nächstes Level", en: "Next Level", pt: "Próximo Nível" },
  "home.bonusXP": { de: "Bonus-XP", en: "Bonus XP", pt: "XP Bônus" },
  "home.coachTip": { de: "Coach-Tipp", en: "Coach Tip", pt: "Dica do Coach" },
  "home.nextBadge": { de: "Nächstes Badge", en: "Next Badge", pt: "Próximo Badge" },

  // Home – Milestones
  "home.ms.first": { de: "Erste Lektion geschafft! Weiter so!", en: "First lesson done! Keep it up!", pt: "Primeira aula concluída! Continue assim!" },
  "home.ms.10": { de: "10 Lektionen! Du hast den Paddler-Badge!", en: "10 lessons! You earned the Paddler badge!", pt: "10 aulas! Você ganhou o badge Paddler!" },
  "home.ms.25": { de: "25 Lektionen – Wave Catcher! Stark!", en: "25 lessons – Wave Catcher! Awesome!", pt: "25 aulas – Wave Catcher! Incrível!" },
  "home.ms.streak3": { de: "3-Tage Streak! Dranbleiben zahlt sich aus!", en: "3-day streak! Consistency pays off!", pt: "3 dias seguidos! Consistência compensa!" },
  "home.ms.streak7": { de: "7-Tage Streak! Du bist eine Surf-Maschine!", en: "7-day streak! You're a surf machine!", pt: "7 dias seguidos! Você é uma máquina de surf!" },
  "home.ms.diary1": { de: "Erster Tagebuch-Eintrag! Reflexion macht dich besser.", en: "First diary entry! Reflection makes you better.", pt: "Primeira entrada no diário! Reflexão te torna melhor." },
  "home.ms.half": { de: "Halbzeit! 50% deines Programms geschafft!", en: "Halfway! 50% of your program done!", pt: "Metade! 50% do seu programa concluído!" },
  "home.ms.complete": { de: "PROGRAMM KOMPLETT! Du bist bereit fürs Wasser!", en: "PROGRAM COMPLETE! You're ready for the water!", pt: "PROGRAMA COMPLETO! Você está pronto para a água!" },

  // ══════════════════════════════════════════
  // BUILDER
  // ══════════════════════════════════════════
  "builder.title": { de: "Bau dein Programm", en: "Build Your Program", pt: "Monte Seu Programa" },
  "builder.board": { de: "🏄 Dein Surfboard", en: "🏄 Your Surfboard", pt: "🏄 Sua Prancha" },
  "builder.experience": { de: "🌿 Deine Erfahrung", en: "🌿 Your Experience", pt: "🌿 Sua Experiência" },
  "builder.howManyDays": { de: "📅 Wie viele Tage?", en: "📅 How many days?", pt: "📅 Quantos dias?" },
  "builder.goal": { de: "🎯 Was ist dein Ziel?", en: "🎯 What's your goal?", pt: "🎯 Qual é seu objetivo?" },
  "builder.spot": { de: "🌍 Wo surfst du?", en: "🌍 Where do you surf?", pt: "🌍 Onde você surfa?" },
  "builder.searchSpot": { de: "🔍 Spot suchen...", en: "🔍 Search spot...", pt: "🔍 Buscar pico..." },
  "builder.generate": { de: "🏄 Programm generieren", en: "🏄 Generate Program", pt: "🏄 Gerar Programa" },

  // ══════════════════════════════════════════
  // LESSONS
  // ══════════════════════════════════════════
  "lessons.noProgram": { de: "Noch kein Programm", en: "No program yet", pt: "Nenhum programa ainda" },
  "lessons.noProgramDesc": { de: "Erstelle dein persönliches Surf-Programm um Lektionen freizuschalten.", en: "Create your personal surf program to unlock lessons.", pt: "Crie seu programa pessoal de surf para desbloquear aulas." },
  "lessons.createProgram": { de: "Programm erstellen 🤙", en: "Create program 🤙", pt: "Criar programa 🤙" },
  "lessons.yourProgram": { de: "Dein Surf-Programm", en: "Your Surf Program", pt: "Seu Programa de Surf" },
  "lessons.surfedToday": { de: "🏄 Heute gesurft! ✓", en: "🏄 Surfed today! ✓", pt: "🏄 Surfou hoje! ✓" },
  "lessons.surfedTodayQ": { de: "🏄 Heute gesurft?", en: "🏄 Surfed today?", pt: "🏄 Surfou hoje?" },
  "lessons.streakDays": { de: "Tage Streak", en: "day streak", pt: "dias seguidos" },
  "lessons.allDone": { de: "Gnarly! Alle Lektionen abgeschlossen! 🎉", en: "Gnarly! All lessons completed! 🎉", pt: "Radical! Todas as aulas concluídas! 🎉" },
  "lessons.keepPaddling": { de: "Keep paddling, die perfekte Welle kommt!", en: "Keep paddling, the perfect wave is coming!", pt: "Continue remando, a onda perfeita vem!" },
  "lessons.equipment": { de: "Equipment", en: "Equipment", pt: "Equipamento" },
  "lessons.warmup": { de: "Warm-Up", en: "Warm-Up", pt: "Aquecimento" },
  "lessons.theory": { de: "Theorie", en: "Theory", pt: "Teoria" },
  "lessons.practice": { de: "Praxis", en: "Practice", pt: "Prática" },

  // ══════════════════════════════════════════
  // FORECAST
  // ══════════════════════════════════════════
  "fc.title": { de: "🌊 Surf-Forecast", en: "🌊 Surf Forecast", pt: "🌊 Previsão de Surf" },
  "fc.subtitle": { de: "Stündliche Bedingungen & beste Surf-Zeiten.", en: "Hourly conditions & best surf times.", pt: "Condições por hora & melhores horários para surfar." },
  "fc.loading": { de: "⏳ Forecast wird geladen...", en: "⏳ Loading forecast...", pt: "⏳ Carregando previsão..." },
  "fc.offline": { de: "Forecast nicht verfügbar", en: "Forecast not available", pt: "Previsão não disponível" },
  "fc.offlineDesc": { de: "Prüfe deine Internetverbindung.", en: "Check your internet connection.", pt: "Verifique sua conexão com a internet." },
  "fc.bestTimes": { de: "🏄 Beste Surf-Zeiten", en: "🏄 Best Surf Times", pt: "🏄 Melhores Horários" },
  "fc.bestToday": { de: "heute", en: "today", pt: "hoje" },
  "fc.noGood": { de: "Keine guten Surf-Fenster", en: "No good surf windows", pt: "Sem boas janelas de surf" },
  "fc.noGoodToday": { de: "heute", en: "today", pt: "hoje" },
  "fc.noGoodDay": { de: "an diesem Tag", en: "on this day", pt: "neste dia" },
  "fc.noGoodDesc": { de: "Zu viel Wind, zu kleine oder zu große Wellen. Probiere einen anderen Tag.", en: "Too much wind, waves too small or too big. Try another day.", pt: "Muito vento, ondas muito pequenas ou grandes demais. Tente outro dia." },
  "fc.hourly": { de: "📊 Stündlicher Forecast", en: "📊 Hourly Forecast", pt: "📊 Previsão por Hora" },
  "fc.wind": { de: "💨 Wind", en: "💨 Wind", pt: "💨 Vento" },
  "fc.waves": { de: "🌊 Wellen", en: "🌊 Waves", pt: "🌊 Ondas" },
  "fc.today": { de: "Heute", en: "Today", pt: "Hoje" },
  "fc.tomorrow": { de: "Morgen", en: "Tomorrow", pt: "Amanhã" },
  "fc.gusts": { de: "Böen bis", en: "Gusts up to", pt: "Rajadas até" },
  "fc.period": { de: "Periode", en: "Period", pt: "Período" },
  "fc.legend": { de: "📖 Score-Legende", en: "📖 Score Legend", pt: "📖 Legenda do Score" },
  "fc.perfect": { de: "80+ Perfekt", en: "80+ Perfect", pt: "80+ Perfeito" },
  "fc.perfectD": { de: "Go!", en: "Go!", pt: "Vai!" },
  "fc.good": { de: "60-79 Gut", en: "60-79 Good", pt: "60-79 Bom" },
  "fc.goodD": { de: "Lohnt sich", en: "Worth it", pt: "Vale a pena" },
  "fc.okay": { de: "40-59 Okay", en: "40-59 Okay", pt: "40-59 Ok" },
  "fc.okayD": { de: "Einschränkungen", en: "Limitations", pt: "Limitações" },
  "fc.hard": { de: "0-39 Schwierig", en: "0-39 Difficult", pt: "0-39 Difícil" },
  "fc.hardD": { de: "Skip it", en: "Skip it", pt: "Pule" },

  // ══════════════════════════════════════════
  // SCHOOLS
  // ══════════════════════════════════════════
  "schools.title": { de: "🏫 Surfschulen", en: "🏫 Surf Schools", pt: "🏫 Escolas de Surf" },
  "schools.subtitle": { de: "Finde und buche Surfschulen an deinem Spot.", en: "Find and book surf schools at your spot.", pt: "Encontre e reserve escolas de surf no seu pico." },
  "schools.noSchools": { de: "Noch keine Surfschulen", en: "No surf schools yet", pt: "Nenhuma escola ainda" },
  "schools.about": { de: "Über uns", en: "About us", pt: "Sobre nós" },
  "schools.courses": { de: "🏄 Kursangebote", en: "🏄 Courses", pt: "🏄 Cursos" },
  "schools.contact": { de: "📞 Kontakt", en: "📞 Contact", pt: "📞 Contato" },
  "schools.allSchools": { de: "← Alle Surfschulen", en: "← All surf schools", pt: "← Todas as escolas" },
  "schools.book": { de: "Buchen →", en: "Book →", pt: "Reservar →" },
  "schools.verified": { de: "✓ Verifiziert", en: "✓ Verified", pt: "✓ Verificado" },
  "schools.bookingRequest": { de: "📋 Buchungsanfrage", en: "📋 Booking Request", pt: "📋 Solicitação de Reserva" },
  "schools.name": { de: "Name", en: "Name", pt: "Nome" },
  "schools.email": { de: "E-Mail", en: "Email", pt: "E-mail" },
  "schools.date": { de: "Wunschdatum", en: "Preferred date", pt: "Data desejada" },
  "schools.people": { de: "Personen", en: "People", pt: "Pessoas" },
  "schools.message": { de: "Nachricht (optional)", en: "Message (optional)", pt: "Mensagem (opcional)" },
  "schools.sendRequest": { de: "Anfrage senden 📨", en: "Send request 📨", pt: "Enviar solicitação 📨" },
  "schools.requestSent": { de: "Anfrage gesendet!", en: "Request sent!", pt: "Solicitação enviada!" },
  "schools.payOnSite": { de: "Unverbindliche Anfrage – Bezahlung vor Ort", en: "Non-binding request – pay on site", pt: "Sem compromisso – pague no local" },
  "schools.backToProfile": { de: "← Zurück zum Profil", en: "← Back to profile", pt: "← Voltar ao perfil" },
  "schools.schoolsAtSpot": { de: "🏫 Surfschulen an diesem Spot", en: "🏫 Surf schools at this spot", pt: "🏫 Escolas de surf neste pico" },

  // ══════════════════════════════════════════
  // DIARY
  // ══════════════════════════════════════════
  "diary.title": { de: "📓 Surf-Tagebuch", en: "📓 Surf Diary", pt: "📓 Diário de Surf" },
  "diary.entries": { de: "Einträge", en: "Entries", pt: "Entradas" },
  "diary.avgMood": { de: "Ø Mood", en: "Ø Mood", pt: "Ø Humor" },
  "diary.topWave": { de: "Top Welle", en: "Top Wave", pt: "Melhor Onda" },
  "diary.photos": { de: "Fotos", en: "Photos", pt: "Fotos" },
  "diary.filled": { de: "Ausgefüllt", en: "Filled", pt: "Preenchido" },
  "diary.withPhotos": { de: "📷 Mit Fotos", en: "📷 With Photos", pt: "📷 Com Fotos" },
  "diary.whatWorked": { de: "Was hat gut geklappt?", en: "What worked well?", pt: "O que funcionou bem?" },
  "diary.whatFailed": { de: "Was hat nicht geklappt?", en: "What didn't work?", pt: "O que não funcionou?" },
  "diary.focusTomorrow": { de: "Fokus für morgen", en: "Focus for tomorrow", pt: "Foco para amanhã" },
  "diary.notes": { de: "Notizen", en: "Notes", pt: "Notas" },
  "diary.phWorked": { de: "Pop-Up, Wellen lesen...", en: "Pop-up, reading waves...", pt: "Pop-up, leitura de ondas..." },
  "diary.phFailed": { de: "Timing, Balance...", en: "Timing, balance...", pt: "Timing, equilíbrio..." },
  "diary.phFocus": { de: "Worauf achten...", en: "What to focus on...", pt: "No que focar..." },
  "diary.phNotes": { de: "Wellen, Stimmung...", en: "Waves, vibes...", pt: "Ondas, clima..." },
  "diary.chooseBoard": { de: "🏄 Board wählen", en: "🏄 Choose board", pt: "🏄 Escolher prancha" },
  "diary.addPhoto": { de: "+ Foto hinzufügen", en: "+ Add photo", pt: "+ Adicionar foto" },
  "diary.noPhotos": { de: "📷 Noch keine Fotos – halte deine Sessions fest!", en: "📷 No photos yet – capture your sessions!", pt: "📷 Sem fotos – registre suas sessões!" },

  // ══════════════════════════════════════════
  // PROGRESS
  // ══════════════════════════════════════════
  "prog.title": { de: "📊 Fortschritt", en: "📊 Progress", pt: "📊 Progresso" },
  "prog.lessonsN": { de: "Lektionen", en: "lessons", pt: "aulas" },
  "prog.entriesN": { de: "Einträge", en: "entries", pt: "entradas" },
  "prog.xpLessons": { de: "Lektionen", en: "Lessons", pt: "Aulas" },
  "prog.xpDiary": { de: "Tagebuch", en: "Diary", pt: "Diário" },
  "prog.xpSurfDays": { de: "Surf-Tage", en: "Surf Days", pt: "Dias de Surf" },
  "prog.xpStreak": { de: "Streak", en: "Streak", pt: "Sequência" },
  "prog.badges": { de: "🏆 Badges", en: "🏆 Badges", pt: "🏆 Badges" },
  "prog.earned": { de: "✓ Verdient", en: "✓ Earned", pt: "✓ Conquistado" },
  "prog.next": { de: "Nächstes", en: "Next", pt: "Próximo" },
  "prog.moreLessons": { de: "Lektionen", en: "lessons", pt: "aulas" },
  "prog.moreEntries": { de: "Einträge", en: "entries", pt: "entradas" },
  "prog.still": { de: "noch", en: "more", pt: "mais" },
  "prog.coach": { de: "🧠 Dein persönlicher Coach", en: "🧠 Your Personal Coach", pt: "🧠 Seu Coach Pessoal" },
  "prog.skillTree": { de: "🌳 Skill Tree", en: "🌳 Skill Tree", pt: "🌳 Árvore de Habilidades" },
  "prog.basics": { de: "🌱 Grundlagen", en: "🌱 Basics", pt: "🌱 Fundamentos" },
  "prog.buildup": { de: "🌿 Aufbau", en: "🌿 Build-up", pt: "🌿 Construção" },
  "prog.intermediate": { de: "🌳 Intermediate", en: "🌳 Intermediate", pt: "🌳 Intermediário" },
  "prog.advanced": { de: "🏔 Advanced", en: "🏔 Advanced", pt: "🏔 Avançado" },

  // ══════════════════════════════════════════
  // EQUIPMENT
  // ══════════════════════════════════════════
  "equip.title": { de: "🏄 Board-Berater", en: "🏄 Board Advisor", pt: "🏄 Consultor de Prancha" },
  "equip.subtitle": { de: "Finde das perfekte Board für dein Level und Gewicht.", en: "Find the perfect board for your level and weight.", pt: "Encontre a prancha perfeita para seu nível e peso." },
  "equip.beginnerTip": { de: "Als Anfänger brauchst du ein großes, stabiles Board. Softboards (8'0+) sind ideal – sicher, günstig und verzeihend bei Fehlern. Stelle oben dein Level ein für genauere Empfehlungen!", en: "As a beginner you need a big, stable board. Softboards (8'0+) are ideal – safe, affordable and forgiving. Set your level above for better recommendations!", pt: "Como iniciante, você precisa de uma prancha grande e estável. Softboards (8'0+) são ideais – seguras, baratas e perdoam erros. Defina seu nível acima para recomendações melhores!" },
  "equip.finSetup": { de: "🦈 Fin-Setup Empfehlung", en: "🦈 Fin Setup Recommendation", pt: "🦈 Recomendação de Quilhas" },
  "equip.fromDiary": { de: "🧠 Aus deinem Tagebuch", en: "🧠 From your diary", pt: "🧠 Do seu diário" },

  // ══════════════════════════════════════════
  // COMMUNITY
  // ══════════════════════════════════════════
  "comm.title": { de: "🤝 Community", en: "🤝 Community", pt: "🤝 Comunidade" },
  "comm.board": { de: "💬 Board", en: "💬 Board", pt: "💬 Board" },
  "comm.post": { de: "📢 Posten", en: "📢 Post", pt: "📢 Postar" },
  "comm.allSpots": { de: "🌍 Alle Spots", en: "🌍 All Spots", pt: "🌍 Todos os Picos" },
  "comm.noPosts": { de: "Noch keine Posts", en: "No posts yet", pt: "Nenhum post ainda" },
  "comm.beFirst": { de: "Sei der Erste!", en: "Be the first!", pt: "Seja o primeiro!" },
  "comm.forSpot": { de: "für diesen Spot", en: "for this spot", pt: "para este pico" },
  "comm.newPost": { de: "💬 Neuer Post", en: "💬 New Post", pt: "💬 Novo Post" },
  "comm.chooseSpot": { de: "🌍 Spot wählen...", en: "🌍 Choose spot...", pt: "🌍 Escolher pico..." },
  "comm.placeholder": { de: "Wie waren die Wellen? Tipps für andere Surfer? 🌊", en: "How were the waves? Tips for other surfers? 🌊", pt: "Como estavam as ondas? Dicas para outros surfistas? 🌊" },
  "comm.posting": { de: "⏳ Wird gepostet...", en: "⏳ Posting...", pt: "⏳ Postando..." },
  "comm.postBtn": { de: "💬 Posten", en: "💬 Post", pt: "💬 Postar" },

  // ══════════════════════════════════════════
  // TRIP
  // ══════════════════════════════════════════
  "trip.title": { de: "✈️ Trip planen", en: "✈️ Plan a Trip", pt: "✈️ Planejar Viagem" },
  "trip.newTrip": { de: "✨ Neuer Trip", en: "✨ New Trip", pt: "✨ Nova Viagem" },
  "trip.planFirst": { de: "Ersten Trip planen ✈️", en: "Plan your first trip ✈️", pt: "Planejar primeira viagem ✈️" },
  "trip.running": { de: "Läuft gerade!", en: "Happening now!", pt: "Acontecendo agora!" },
  "trip.todayStart": { de: "Heute geht's los!", en: "Starts today!", pt: "Começa hoje!" },
  "trip.daysLeft": { de: "Noch", en: "", pt: "Faltam" },
  "trip.details": { de: "📋 Details", en: "📋 Details", pt: "📋 Detalhes" },
  "trip.weather": { de: "🌤️ Wetter", en: "🌤️ Weather", pt: "🌤️ Clima" },
  "trip.packing": { de: "🎒 Packliste", en: "🎒 Packing List", pt: "🎒 Lista de Bagagem" },
  "trip.changeSpot": { de: "🌍 Spot wechseln", en: "🌍 Change Spot", pt: "🌍 Trocar Pico" },
  "trip.searchSpot": { de: "🔍 Spot suchen...", en: "🔍 Search spot...", pt: "🔍 Buscar pico..." },
  "trip.dates": { de: "🗓️ Reisedaten", en: "🗓️ Travel Dates", pt: "🗓️ Datas de Viagem" },
  "trip.returnFlight": { de: "Rückflug", en: "Return flight", pt: "Voo de volta" },
  "trip.budget": { de: "💰 Budget (€)", en: "💰 Budget (€)", pt: "💰 Orçamento (€)" },
  "trip.notesLabel": { de: "📝 Notizen", en: "📝 Notes", pt: "📝 Notas" },

  // ══════════════════════════════════════════
  // INSTRUCTOR
  // ══════════════════════════════════════════
  "inst.title": { de: "👨‍🏫 Instructor Mode", en: "👨‍🏫 Instructor Mode", pt: "👨‍🏫 Modo Instrutor" },
  "inst.upcoming": { de: "📅 Anstehend", en: "📅 Upcoming", pt: "📅 Próximas" },
  "inst.active": { de: "🏄 Aktiv", en: "🏄 Active", pt: "🏄 Ativa" },
  "inst.completed": { de: "✅ Fertig", en: "✅ Done", pt: "✅ Concluída" },
  "inst.total": { de: "Gesamt", en: "Total", pt: "Total" },
  "inst.openSessions": { de: "Offen", en: "Open", pt: "Aberto" },
  "inst.certificates": { de: "Zertifikate", en: "Certificates", pt: "Certificados" },
  "inst.sessionNotes": { de: "📝 Session-Notizen", en: "📝 Session Notes", pt: "📝 Notas da Sessão" },
  "inst.notesPlaceholder": { de: "Notizen zur Session... (in deiner Sprache – wird automatisch übersetzt)", en: "Session notes... (in your language – auto-translated)", pt: "Notas da sessão... (no seu idioma – tradução automática)" },
  "inst.autoTranslation": { de: "🌐 Auto-Übersetzung (DE)", en: "🌐 Auto-translation (EN)", pt: "🌐 Tradução automática (PT)" },
  "inst.video": { de: "🎬 Video", en: "🎬 Video", pt: "🎬 Vídeo" },
  "inst.videoPlaceholder": { de: "YouTube/Vimeo Link einfügen...", en: "Paste YouTube/Vimeo link...", pt: "Cole link do YouTube/Vimeo..." },
  "inst.rating": { de: "⭐ Bewertung des Schülers", en: "⭐ Student Rating", pt: "⭐ Avaliação do Aluno" },
  "inst.beginner": { de: "Anfänger", en: "Beginner", pt: "Iniciante" },

  // ══════════════════════════════════════════
  // TOOLTIPS
  // ══════════════════════════════════════════
  "tip.dashboardTitle": { de: "💡 Tipp: Dein Dashboard", en: "💡 Tip: Your Dashboard", pt: "💡 Dica: Seu Painel" },
  "tip.dashboard": { de: "Hier siehst du deinen Fortschritt, tägliche Ziele und Wochen-Challenges. Logge jeden Surf-Tag für XP und Streak-Boni!", en: "Here you see your progress, daily goals and weekly challenges. Log every surf day for XP and streak bonuses!", pt: "Aqui você vê seu progresso, metas diárias e desafios semanais. Registre cada dia de surf para XP e bônus de sequência!" },
  "tip.forecastTitle": { de: "💡 So liest du den Forecast", en: "💡 How to read the forecast", pt: "💡 Como ler a previsão" },
  "tip.forecast": { de: "Score 80+ = Perfekte Bedingungen. Scrolle durch die Stunden und finde das beste Zeitfenster. Offshore-Wind (🟢) macht die besten Wellen!", en: "Score 80+ = Perfect conditions. Scroll through hours to find the best window. Offshore wind (🟢) makes the best waves!", pt: "Score 80+ = Condições perfeitas. Role pelas horas para encontrar a melhor janela. Vento offshore (🟢) faz as melhores ondas!" },
  "tip.diaryTitle": { de: "💡 Tipp: Dein Tagebuch", en: "💡 Tip: Your Diary", pt: "💡 Dica: Seu Diário" },
  "tip.diary": { de: "Notiere nach jeder Session was funktioniert hat und was nicht. Du kannst Fotos anhängen und sogar per Spracheingabe 🎤 diktieren.", en: "Note after each session what worked and what didn't. You can attach photos and even dictate via voice 🎤.", pt: "Anote após cada sessão o que funcionou e o que não. Você pode anexar fotos e até ditar por voz 🎤." },
  "tip.schoolsTitle": { de: "💡 Surfschule buchen", en: "💡 Book a surf school", pt: "💡 Reserve uma escola" },
  "tip.schools": { de: "Wähle deinen Spot, vergleiche Schulen und buche direkt über die App. Alle Schulen sind von uns geprüft.", en: "Choose your spot, compare schools and book directly via the app. All schools are verified by us.", pt: "Escolha seu pico, compare escolas e reserve direto pelo app. Todas verificadas por nós." },
  "tip.beginnerTitle": { de: "💡 Anfänger-Tipp", en: "💡 Beginner Tip", pt: "💡 Dica para Iniciantes" },

  // ══════════════════════════════════════════
  // APP SHELL
  // ══════════════════════════════════════════
  "app.syncing": { de: "⏳ Synchronisiere...", en: "⏳ Syncing...", pt: "⏳ Sincronizando..." },
  "app.syncError": { de: "⚠️ Sync-Fehler", en: "⚠️ Sync error", pt: "⚠️ Erro de sincronização" },
  "app.syncActive": { de: "☁️ Cloud Sync aktiv", en: "☁️ Cloud Sync active", pt: "☁️ Cloud Sync ativo" },
  "app.backup": { de: "💾 Backup", en: "💾 Backup", pt: "💾 Backup" },
  "app.noLessons": { de: "Noch keine Lektionen", en: "No lessons yet", pt: "Nenhuma aula ainda" },
  "app.noDiary": { de: "Noch kein Tagebuch", en: "No diary yet", pt: "Nenhum diário ainda" },
  "app.noProgress": { de: "Noch kein Fortschritt", en: "No progress yet", pt: "Nenhum progresso ainda" },
  "app.emptyDesc": { de: "Erstelle zuerst ein Surf-Programm, um loszulegen.", en: "Create a surf program first to get started.", pt: "Crie um programa de surf primeiro para começar." },
  "app.emptyProgDesc": { de: "Starte ein Programm und schließe Lektionen ab, um Badges zu verdienen.", en: "Start a program and complete lessons to earn badges.", pt: "Inicie um programa e conclua aulas para ganhar badges." },
  "app.createProgram": { de: "Programm erstellen", en: "Create program", pt: "Criar programa" },
};

export const LANGUAGES = [
  { code: "de", label: "🇩🇪 Deutsch", short: "DE" },
  { code: "en", label: "🇬🇧 English", short: "EN" },
  { code: "pt", label: "🇧🇷 Português", short: "PT" },
];

export function useI18n() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "de"; } catch { return "de"; }
  });
  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  }, []);
  const t = useCallback((key, fallback) => {
    const entry = T[key];
    if (!entry) return fallback || key;
    return entry[lang] || entry.de || fallback || key;
  }, [lang]);
  return { lang, setLang, t, LANGUAGES };
}
