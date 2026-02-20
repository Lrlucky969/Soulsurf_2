// SoulSurf – i18n Internationalization (Sprint 28)
import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "soulsurf_lang";

// All UI translations: key → { de, en, pt }
const TRANSLATIONS = {
  // === NAV ===
  "nav.home": { de: "Home", en: "Home", pt: "Início" },
  "nav.lessons": { de: "Lektionen", en: "Lessons", pt: "Aulas" },
  "nav.forecast": { de: "Forecast", en: "Forecast", pt: "Previsão" },
  "nav.schools": { de: "Surfschulen", en: "Surf Schools", pt: "Escolas de Surf" },
  "nav.trip": { de: "Trip", en: "Trip", pt: "Viagem" },
  "nav.diary": { de: "Tagebuch", en: "Diary", pt: "Diário" },
  "nav.progress": { de: "Fortschritt", en: "Progress", pt: "Progresso" },
  "nav.equipment": { de: "Equipment", en: "Equipment", pt: "Equipamento" },
  "nav.instructor": { de: "Instructor", en: "Instructor", pt: "Instrutor" },
  "nav.community": { de: "Community", en: "Community", pt: "Comunidade" },

  // === HOME – Onboarding ===
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
  "home.back": { de: "← Zurück", en: "← Back", pt: "← Voltar" },

  // === HOME – Dashboard ===
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

  // === HOME – Gamification ===
  "home.dailyGoals": { de: "🎯 Tages-Ziele", en: "🎯 Daily Goals", pt: "🎯 Metas Diárias" },
  "home.weeklyChallenge": { de: "🏆 Wochen-Challenge", en: "🏆 Weekly Challenge", pt: "🏆 Desafio Semanal" },
  "home.nextLevel": { de: "Nächstes Level", en: "Next Level", pt: "Próximo Nível" },
  "home.bonusXP": { de: "Bonus-XP", en: "Bonus XP", pt: "XP Bônus" },
  "home.coachTip": { de: "Coach-Tipp", en: "Coach Tip", pt: "Dica do Coach" },
  "home.nextBadge": { de: "Nächstes Badge", en: "Next Badge", pt: "Próximo Badge" },

  // === HOME – Tooltips ===
  "tip.dashboard": { de: "Hier siehst du deinen Fortschritt, tägliche Ziele und Wochen-Challenges. Logge jeden Surf-Tag für XP und Streak-Boni!", en: "Here you see your progress, daily goals and weekly challenges. Log every surf day for XP and streak bonuses!", pt: "Aqui você vê seu progresso, metas diárias e desafios semanais. Registre cada dia de surf para XP e bônus de sequência!" },
  "tip.dashboardTitle": { de: "💡 Tipp: Dein Dashboard", en: "💡 Tip: Your Dashboard", pt: "💡 Dica: Seu Painel" },
  "tip.forecast": { de: "Score 80+ = Perfekte Bedingungen. Scrolle durch die Stunden und finde das beste Zeitfenster. Offshore-Wind (🟢) macht die besten Wellen!", en: "Score 80+ = Perfect conditions. Scroll through hours to find the best window. Offshore wind (🟢) makes the best waves!", pt: "Score 80+ = Condições perfeitas. Role pelas horas para encontrar a melhor janela. Vento offshore (🟢) faz as melhores ondas!" },
  "tip.forecastTitle": { de: "💡 So liest du den Forecast", en: "💡 How to read the forecast", pt: "💡 Como ler a previsão" },
  "tip.diary": { de: "Notiere nach jeder Session was funktioniert hat und was nicht. Du kannst Fotos anhängen und sogar per Spracheingabe 🎤 diktieren.", en: "Note after each session what worked and what didn't. You can attach photos and even dictate via voice 🎤.", pt: "Anote após cada sessão o que funcionou e o que não funcionou. Você pode anexar fotos e até ditar por voz 🎤." },
  "tip.diaryTitle": { de: "💡 Tipp: Dein Tagebuch", en: "💡 Tip: Your Diary", pt: "💡 Dica: Seu Diário" },
  "tip.schools": { de: "Wähle deinen Spot, vergleiche Schulen und buche direkt über die App. Alle Schulen sind von uns geprüft.", en: "Choose your spot, compare schools and book directly via the app. All schools are verified by us.", pt: "Escolha seu pico, compare escolas e reserve direto pelo app. Todas as escolas são verificadas por nós." },
  "tip.schoolsTitle": { de: "💡 Surfschule buchen", en: "💡 Book a surf school", pt: "💡 Reserve uma escola de surf" },

  // === FORECAST ===
  "forecast.title": { de: "🌊 Surf-Forecast", en: "🌊 Surf Forecast", pt: "🌊 Previsão de Surf" },
  "forecast.subtitle": { de: "Stündliche Bedingungen & beste Surf-Zeiten.", en: "Hourly conditions & best surf times.", pt: "Condições por hora & melhores horários para surfar." },
  "forecast.loading": { de: "⏳ Forecast wird geladen...", en: "⏳ Loading forecast...", pt: "⏳ Carregando previsão..." },
  "forecast.offline": { de: "Forecast nicht verfügbar", en: "Forecast not available", pt: "Previsão não disponível" },
  "forecast.offlineDesc": { de: "Prüfe deine Internetverbindung.", en: "Check your internet connection.", pt: "Verifique sua conexão com a internet." },
  "forecast.bestTimes": { de: "🏄 Beste Surf-Zeiten", en: "🏄 Best Surf Times", pt: "🏄 Melhores Horários" },
  "forecast.noGoodWindows": { de: "Keine guten Surf-Fenster", en: "No good surf windows", pt: "Sem boas janelas de surf" },
  "forecast.hourly": { de: "📊 Stündlicher Forecast", en: "📊 Hourly Forecast", pt: "📊 Previsão por Hora" },
  "forecast.wind": { de: "💨 Wind", en: "💨 Wind", pt: "💨 Vento" },
  "forecast.waves": { de: "🌊 Wellen", en: "🌊 Waves", pt: "🌊 Ondas" },
  "forecast.today": { de: "Heute", en: "Today", pt: "Hoje" },
  "forecast.tomorrow": { de: "Morgen", en: "Tomorrow", pt: "Amanhã" },
  "forecast.gusts": { de: "Böen bis", en: "Gusts up to", pt: "Rajadas até" },
  "forecast.period": { de: "Periode", en: "Period", pt: "Período" },
  "forecast.scoreLegend": { de: "📖 Score-Legende", en: "📖 Score Legend", pt: "📖 Legenda do Score" },
  "forecast.perfect": { de: "Perfekt", en: "Perfect", pt: "Perfeito" },
  "forecast.good": { de: "Gut", en: "Good", pt: "Bom" },
  "forecast.okay": { de: "Okay", en: "Okay", pt: "Ok" },
  "forecast.hard": { de: "Schwierig", en: "Difficult", pt: "Difícil" },

  // === SCHOOLS ===
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
  "schools.payOnSite": { de: "Unverbindliche Anfrage – Bezahlung vor Ort", en: "Non-binding request – pay on site", pt: "Solicitação sem compromisso – pague no local" },
  "schools.backToProfile": { de: "← Zurück zum Profil", en: "← Back to profile", pt: "← Voltar ao perfil" },
  "schools.schoolsAtSpot": { de: "🏫 Surfschulen an diesem Spot", en: "🏫 Surf schools at this spot", pt: "🏫 Escolas de surf neste pico" },

  // === DIARY ===
  "diary.title": { de: "📓 Surf-Tagebuch", en: "📓 Surf Diary", pt: "📓 Diário de Surf" },

  // === PROGRESS ===
  "progress.title": { de: "📊 Fortschritt", en: "📊 Progress", pt: "📊 Progresso" },
  "progress.yourLevel": { de: "Dein Level", en: "Your Level", pt: "Seu Nível" },
  "progress.xpTotal": { de: "XP total", en: "XP total", pt: "XP total" },
  "progress.badges": { de: "🏆 Badges", en: "🏆 Badges", pt: "🏆 Badges" },
  "progress.earned": { de: "✓ Verdient", en: "✓ Earned", pt: "✓ Conquistado" },
  "progress.skillTree": { de: "🌳 Skill Tree", en: "🌳 Skill Tree", pt: "🌳 Árvore de Habilidades" },

  // === LESSONS ===
  "lessons.noProgram": { de: "Noch kein Programm", en: "No program yet", pt: "Nenhum programa ainda" },
  "lessons.noProgramDesc": { de: "Erstelle dein persönliches Surf-Programm um Lektionen freizuschalten.", en: "Create your personal surf program to unlock lessons.", pt: "Crie seu programa pessoal de surf para desbloquear aulas." },
  "lessons.createProgram": { de: "Programm erstellen 🤙", en: "Create program 🤙", pt: "Criar programa 🤙" },
  "lessons.yourProgram": { de: "Dein Surf-Programm", en: "Your Surf Program", pt: "Seu Programa de Surf" },
  "lessons.surfedToday": { de: "🏄 Heute gesurft! ✓", en: "🏄 Surfed today! ✓", pt: "🏄 Surfou hoje! ✓" },
  "lessons.surfedTodayQ": { de: "🏄 Heute gesurft?", en: "🏄 Surfed today?", pt: "🏄 Surfou hoje?" },

  // === EQUIPMENT ===
  "equipment.title": { de: "🏄 Board-Berater", en: "🏄 Board Advisor", pt: "🏄 Consultor de Prancha" },
  "equipment.subtitle": { de: "Finde das perfekte Board für dein Level und Gewicht.", en: "Find the perfect board for your level and weight.", pt: "Encontre a prancha perfeita para seu nível e peso." },
  "equipment.beginnerTip": { de: "Als Anfänger brauchst du ein großes, stabiles Board. Softboards (8'0+) sind ideal.", en: "As a beginner you need a big, stable board. Softboards (8'0+) are ideal.", pt: "Como iniciante, você precisa de uma prancha grande e estável. Softboards (8'0+) são ideais." },

  // === AUTH ===
  "auth.login": { de: "Anmelden", en: "Sign in", pt: "Entrar" },
  "auth.logout": { de: "Abmelden", en: "Sign out", pt: "Sair" },
  "auth.loginWith": { de: "Anmelden mit", en: "Sign in with", pt: "Entrar com" },
  "auth.orEmail": { de: "oder mit E-Mail", en: "or with email", pt: "ou com e-mail" },
  "auth.password": { de: "Passwort", en: "Password", pt: "Senha" },

  // === GENERAL ===
  "general.delete": { de: "Löschen", en: "Delete", pt: "Excluir" },
  "general.cancel": { de: "Abbrechen", en: "Cancel", pt: "Cancelar" },
  "general.save": { de: "Speichern", en: "Save", pt: "Salvar" },
  "general.loading": { de: "Wird geladen...", en: "Loading...", pt: "Carregando..." },
  "general.settings": { de: "Einstellungen", en: "Settings", pt: "Configurações" },
  "general.language": { de: "Sprache", en: "Language", pt: "Idioma" },
  "general.darkMode": { de: "Dark Mode", en: "Dark Mode", pt: "Modo Escuro" },
  "general.version": { de: "Version", en: "Version", pt: "Versão" },
  "general.days": { de: "Tage", en: "days", pt: "dias" },
  "general.day": { de: "Tag", en: "day", pt: "dia" },
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
    const entry = TRANSLATIONS[key];
    if (!entry) return fallback || key;
    return entry[lang] || entry.de || fallback || key;
  }, [lang]);

  return { lang, setLang, t, LANGUAGES };
}
