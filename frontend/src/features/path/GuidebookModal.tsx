"use client";

import React, { useEffect } from "react";
import { X, Volume2, BookOpen, Lightbulb, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

export interface GuidebookData {
  unitPosition: number;
  unitTitle: string;
  unitDescription: string;
  unitColor: string;
}

interface PhraseItem {
  spanish: string;
  english: string;
  category?: string;
}

interface GrammarTip {
  title: string;
  summary: string;
  examples: { spanish: string; english: string; note?: string }[];
}

const UNIT_GUIDEBOOK_CONTENT: Record<
  number,
  {
    keyPhrases: PhraseItem[];
    grammarTips: GrammarTip[];
  }
> = {
  1: {
    keyPhrases: [
      { spanish: "¡Hola! ¿Cómo estás?", english: "Hello! How are you?", category: "Greetings" },
      { spanish: "Mucho gusto.", english: "Nice to meet you.", category: "Greetings" },
      { spanish: "Buenos días / Buenas tardes", english: "Good morning / Good afternoon", category: "Greetings" },
      { spanish: "Por favor y gracias", english: "Please and thank you", category: "Politeness" },
      { spanish: "Yo soy una mujer.", english: "I am a woman.", category: "Identity" },
      { spanish: "El niño come una manzana.", english: "The boy eats an apple.", category: "Actions" },
      { spanish: "Un hombre bebe agua.", english: "A man drinks water.", category: "Actions" },
      { spanish: "Adiós, ¡hasta luego!", english: "Goodbye, see you later!", category: "Farewells" },
    ],
    grammarTips: [
      {
        title: "Gender & Articles (El vs. La)",
        summary:
          "In Spanish, all nouns have a grammatical gender: masculine or feminine. Most nouns ending in -o are masculine, while nouns ending in -a are feminine.",
        examples: [
          { spanish: "el niño", english: "the boy", note: "Masculine singular" },
          { spanish: "la niña", english: "the girl", note: "Feminine singular" },
          { spanish: "un hombre", english: "a man", note: "Indefinite masculine" },
          { spanish: "una mujer", english: "a woman", note: "Indefinite feminine" },
        ],
      },
      {
        title: "Subject Pronouns & Verb Conjugations",
        summary:
          "Spanish verbs change their endings depending on who is performing the action. Because the ending reveals the subject, pronouns like 'yo' or 'tú' are often omitted.",
        examples: [
          { spanish: "Yo como pan.", english: "I eat bread.", note: "yo = I (-o ending)" },
          { spanish: "Tú comes manzanas.", english: "You eat apples.", note: "tú = you (-es ending)" },
          { spanish: "Él / Ella come.", english: "He / She eats.", note: "él/ella = he/she (-e ending)" },
        ],
      },
      {
        title: "Accent Marks & Inverted Punctuation",
        summary:
          "Questions and exclamations in Spanish always start with inverted punctuation marks (¿ and ¡). Accent marks (tildes) indicate which syllable to emphasize.",
        examples: [
          { spanish: "¿Cómo te llamas?", english: "What is your name?", note: "Starts with ¿" },
          { spanish: "¡Mucho gusto!", english: "Nice to meet you!", note: "Starts with ¡" },
          { spanish: "tú (you) vs. tu (your)", english: "Accent changes the meaning!", note: "Crucial spelling rule" },
        ],
      },
    ],
  },
  2: {
    keyPhrases: [
      { spanish: "¿Dónde está el baño?", english: "Where is the bathroom?", category: "Navigation" },
      { spanish: "Una mesa para dos, por favor.", english: "A table for two, please.", category: "Dining" },
      { spanish: "La cuenta, por favor.", english: "The check, please.", category: "Dining" },
      { spanish: "Yo quiero café con leche.", english: "I want coffee with milk.", category: "Ordering" },
      { spanish: "¿Cuánto cuesta esto?", english: "How much does this cost?", category: "Shopping" },
      { spanish: "El taxi está a la derecha.", english: "The taxi is on the right.", category: "Directions" },
      { spanish: "Un boleto de tren a Madrid.", english: "A train ticket to Madrid.", category: "Travel" },
    ],
    grammarTips: [
      {
        title: "Ser vs. Estar (To Be)",
        summary:
          "Spanish has two verbs that mean 'to be': 'Ser' is used for permanent characteristics and identity, while 'Estar' is used for temporary states and physical locations.",
        examples: [
          { spanish: "El café está caliente.", english: "The coffee is hot.", note: "Temporary state (Estar)" },
          { spanish: "¿Dónde está el hotel?", english: "Where is the hotel?", note: "Location (Estar)" },
          { spanish: "Ella es médica.", english: "She is a doctor.", note: "Permanent profession (Ser)" },
        ],
      },
      {
        title: "Polite Requests with 'Quisiera' and 'Por favor'",
        summary:
          "When ordering food or asking for assistance, use 'Quisiera' (I would like) or 'Por favor' to sound polite and natural.",
        examples: [
          { spanish: "Quisiera un vaso de agua.", english: "I would like a glass of water." },
          { spanish: "¿Tiene una mesa disponible?", english: "Do you have an available table?" },
        ],
      },
    ],
  },
  3: {
    keyPhrases: [
      { spanish: "Me gusta la música latina.", english: "I like Latin music.", category: "Hobbies" },
      { spanish: "¿A qué hora te levantas?", english: "What time do you wake up?", category: "Routines" },
      { spanish: "Juego al fútbol con amigos.", english: "I play soccer with friends.", category: "Sports" },
      { spanish: "Tengo que estudiar hoy.", english: "I have to study today.", category: "Obligations" },
      { spanish: "Nosotros vivimos en Barcelona.", english: "We live in Barcelona.", category: "Living" },
    ],
    grammarTips: [
      {
        title: "Using the Verb 'Gustar'",
        summary:
          "The verb 'gustar' literally means 'to be pleasing to'. What you like is the subject of the sentence, so the verb agrees with the thing you like.",
        examples: [
          { spanish: "Me gusta el libro.", english: "I like the book. (Singular)", note: "gusta" },
          { spanish: "Me gustan los libros.", english: "I like the books. (Plural)", note: "gustan" },
        ],
      },
      {
        title: "Daily Reflexive Actions",
        summary:
          "When an action is done to oneself (e.g. waking up, washing hands), Spanish uses reflexive pronouns (me, te, se, nos).",
        examples: [
          { spanish: "Yo me levanto temprano.", english: "I wake up early." },
          { spanish: "Ella se llama Sofia.", english: "Her name is Sofia (She calls herself Sofia)." },
        ],
      },
    ],
  },
};

export default function GuidebookModal({
  isOpen,
  onClose,
  unit,
}: {
  isOpen: boolean;
  onClose: () => void;
  unit: GuidebookData;
}) {
  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Speak Spanish phrase aloud
  const playAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const content = UNIT_GUIDEBOOK_CONTENT[unit.unitPosition] || UNIT_GUIDEBOOK_CONTENT[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-snow rounded-3xl border-2 border-swan shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Unit Guidebook Header Banner */}
        <div
          style={{ backgroundColor: unit.unitColor || "#58CC02" }}
          className="p-6 sm:p-8 text-white relative flex items-center justify-between border-b-4 border-black/15 shrink-0"
        >
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-black/20 text-xs font-black uppercase tracking-wider">
                Unit {unit.unitPosition} Guidebook
              </span>
              <span className="flex items-center gap-1 text-xs font-extrabold text-white/90">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                Key Phrases & Grammar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{unit.unitTitle}</h2>
            <p className="text-xs sm:text-sm font-bold text-white/95 max-w-md">
              {unit.unitDescription}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close guidebook"
            className="absolute top-5 right-5 p-2 rounded-2xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* 1. Key Phrases Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-selectedCardBg text-macaw">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-eel">Key Phrases</h3>
                <p className="text-xs font-bold text-wolf">
                  Essential Spanish sentences you master in this unit. Tap speaker to hear audio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {content.keyPhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-polar rounded-2xl border-2 border-swan flex items-center justify-between gap-3 hover:border-macaw/40 transition group shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-black text-sm sm:text-base text-eel leading-snug truncate">
                      {phrase.spanish}
                    </p>
                    <p className="text-xs font-bold text-wolf truncate">{phrase.english}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => playAudio(phrase.spanish)}
                    className="p-2.5 rounded-xl bg-snow border border-swan text-macaw hover:bg-selectedCardBg active:scale-90 transition shadow-xs shrink-0 cursor-pointer"
                    title={`Listen: "${phrase.spanish}"`}
                  >
                    <Volume2 className="w-4 h-4 fill-macaw" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Grammar Tips & Rules */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-bee/15 text-bee">
                <Lightbulb className="w-5 h-5 fill-bee" />
              </div>
              <div>
                <h3 className="text-lg font-black text-eel">Grammar Tips & Explanations</h3>
                <p className="text-xs font-bold text-wolf">
                  Simple breakdowns of core language concepts.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {content.grammarTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-polar rounded-3xl border-2 border-swan space-y-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-featherGreen stroke-[3]" />
                    <h4 className="font-black text-base text-eel">{tip.title}</h4>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-wolf leading-relaxed">
                    {tip.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {tip.examples.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3 bg-snow rounded-xl border border-swan text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-eel">{ex.spanish}</span>
                          {ex.note && (
                            <span className="text-[10px] font-bold text-wolf uppercase tracking-wider">
                              {ex.note}
                            </span>
                          )}
                        </div>
                        <p className="text-wolf font-bold">{ex.english}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-polar border-t-2 border-swan flex justify-end shrink-0">
          <Button3D variant="green" size="md" onClick={onClose} className="px-8">
            Got it!
          </Button3D>
        </div>
      </div>
    </div>
  );
}
