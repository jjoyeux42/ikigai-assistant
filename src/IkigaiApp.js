import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ================ Storage Service ================
const StorageService = {
  getProgress() {
    try {
      const data = localStorage.getItem('ikigai_progress');
      return data ? JSON.parse(data) : {
        totalPoints: 0,
        streak: 3,
        wellnessScore: 65,
        completedModules: {},
        badges: [],
        islandProgress: {},
        moduleResponses: {}
      };
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      return {
        totalPoints: 0,
        streak: 3,
        wellnessScore: 65,
        completedModules: {},
        badges: [],
        islandProgress: {},
        moduleResponses: {}
      };
    }
  },
  
  saveProgress(progress) {
    try {
      localStorage.setItem('ikigai_progress', JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données:", error);
      return false;
    }
  },
  
  saveModuleResponses(moduleId, responses) {
    const progress = this.getProgress();
    
    if (!progress.moduleResponses) {
      progress.moduleResponses = {};
    }
    
    progress.moduleResponses[moduleId] = {
      responses,
      completedAt: new Date().toISOString()
    };
    
    this.saveProgress(progress);
    return progress;
  },
  
  completeModule(moduleId, islandId) {
    const progress = this.getProgress();
    
    if (!progress.completedModules[moduleId]) {
      // Mark as completed
      progress.completedModules[moduleId] = {
        completedAt: new Date().toISOString(),
        islandId
      };
      
      // Award points
      progress.totalPoints += 100;
      
      // Update island progress
      if (!progress.islandProgress[islandId]) {
        progress.islandProgress[islandId] = {
          progress: 0,
          completedModules: 0
        };
      }
      
      // Count completed modules for island
      const modulesForIsland = Object.values(progress.completedModules)
        .filter(mod => mod.islandId === islandId)
        .length;
      
      progress.islandProgress[islandId].completedModules = modulesForIsland;
      progress.islandProgress[islandId].progress = Math.min(100, Math.round((modulesForIsland / 3) * 100));
      
      // Add badge if not already present
      const moduleInfo = MODULES.find(m => m.id === moduleId);
      if (moduleInfo && moduleInfo.badgeId) {
        const island = ISLANDS.find(i => i.id === islandId);
        if (island && island.badges[moduleInfo.badgeId]) {
          const badge = island.badges[moduleInfo.badgeId];
          if (!progress.badges.some(b => b.id === badge.id)) {
            progress.badges.push({
              id: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              earnedAt: new Date().toISOString()
            });
            
            // Extra points for badge
            progress.totalPoints += 50;
          }
        }
      }
      
      this.saveProgress(progress);
    }
    
    return this.getProgress();
  },
  
  completeChallenge(challengeId) {
    const progress = this.getProgress();
    
    if (!progress.completedChallenges) {
      progress.completedChallenges = [];
    }
    
    if (!progress.completedChallenges.includes(challengeId)) {
      progress.completedChallenges.push(challengeId);
      progress.totalPoints += 50;
      this.saveProgress(progress);
    }
    
    return this.getProgress();
  },
  
  resetAllData() {
    try {
      localStorage.removeItem('ikigai_progress');
      return true;
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      return false;
    }
  }
};

// ================ Data ================

// Islands with modules
const ISLANDS = [
  {
    id: 'equilibre',
    name: "Équilibre Vie Pro-Perso",
    description: "Trouvez l'harmonie entre vie professionnelle et personnelle",
    color: "#41D185", // Green for balance
    icon: "🌱",
    modules: 3,
    mascot: "🧘",
    badges: {
      explorer_equilibre: {
        id: "explorer_equilibre",
        name: "Explorateur d'équilibre",
        description: "A complété le module sur l'équilibre vie pro-perso",
        icon: "⚖️"
      },
      chercheur_sens: {
        id: "chercheur_sens",
        name: "Chercheur de sens",
        description: "A complété le module sur la satisfaction et le sens au travail",
        icon: "🔍"
      },
      maitre_temps: {
        id: "maitre_temps",
        name: "Maître du temps",
        description: "A complété le module sur l'organisation du temps de travail",
        icon: "⏱️"
      }
    }
  },
  {
    id: 'pleine_conscience',
    name: "Pleine Conscience",
    description: "Pratiquez la mindfulness et la présence au quotidien",
    color: "#4EAAF0", // Calming blue
    icon: "🧠",
    modules: 3,
    mascot: "🦋",
    badges: {
      meditant: {
        id: "meditant",
        name: "Méditant",
        description: "A complété les exercices de méditation",
        icon: "🧘‍♀️"
      },
      observateur: {
        id: "observateur",
        name: "Observateur",
        description: "A développé la capacité d'observation sans jugement",
        icon: "👁️"
      },
      present: {
        id: "present",
        name: "Présent",
        description: "Maîtrise la pratique de la pleine conscience",
        icon: "🔮"
      }
    }
  },
  {
    id: 'resilience',
    name: "Résilience & Stress",
    description: "Développez votre résilience face aux situations stressantes",
    color: "#FF8747", // Warm orange
    icon: "🛡️",
    modules: 3,
    mascot: "🦁",
    badges: {
      zen: {
        id: "zen",
        name: "Zen",
        description: "A complété le module sur la gestion du stress",
        icon: "😌"
      },
      resilient: {
        id: "resilient",
        name: "Résilient",
        description: "A complété le module sur la résilience",
        icon: "🛡️"
      },
      equilibre: {
        id: "equilibre",
        name: "Équilibré",
        description: "A complété le module sur l'équilibre émotionnel",
        icon: "⚖️"
      }
    }
  },
  {
    id: 'relations',
    name: "Relations Saines",
    description: "Cultivez des relations professionnelles épanouissantes",
    color: "#B069F8", // Friendly purple
    icon: "👥",
    modules: 3,
    mascot: "🦊",
    badges: {
      communicateur: {
        id: "communicateur",
        name: "Communicateur",
        description: "A complété le module sur la communication authentique",
        icon: "🗣️"
      },
      empathique: {
        id: "empathique",
        name: "Empathique",
        description: "A développé son empathie et sa compréhension des autres",
        icon: "❤️"
      },
      collaborateur: {
        id: "collaborateur",
        name: "Collaborateur",
        description: "A maîtrisé l'art de la collaboration positive",
        icon: "🤝"
      }
    }
  },
  {
    id: 'vitalite',
    name: "Vitalité & Énergie",
    description: "Optimisez votre énergie et votre vitalité au quotidien",
    color: "#FF5252", // Energetic red
    icon: "⚡",
    modules: 3,
    mascot: "🐯",
    badges: {
      energique: {
        id: "energique",
        name: "Énergique",
        description: "A complété le module sur la gestion de l'énergie",
        icon: "⚡"
      },
      vitalite: {
        id: "vitalite",
        name: "Vitalité",
        description: "A intégré des pratiques pour maintenir sa vitalité",
        icon: "💪"
      },
      equilibre_global: {
        id: "equilibre_global",
        name: "Équilibre Global",
        description: "A atteint un équilibre corps-esprit optimal",
        icon: "🌟"
      }
    }
  }
];

// Module data with questions
const MODULES = [
    // Équilibre Vie Pro-Perso Modules
    {
      id: 'equilibre_module1',
      islandId: 'equilibre',
      title: "Comprendre son équilibre",
      description: "Comprendre et évaluer votre équilibre actuel entre vie professionnelle et personnelle",
      icon: "⚖️",
      duration: "15 min",
      level: 1,
      points: 100,
      badgeId: "explorer_equilibre",
      content: `
        <div>
          <h3>Comprendre l'équilibre vie pro-perso</h3>
          <p>L'équilibre entre vie professionnelle et personnelle est essentiel pour votre bien-être global et votre santé mentale.</p>
          
          <h4>Qu'est-ce que l'équilibre vie pro-perso ?</h4>
          <p>C'est la répartition harmonieuse de votre temps et de votre énergie entre :</p>
          <ul>
            <li>Vos responsabilités professionnelles</li>
            <li>Votre vie personnelle (famille, loisirs, repos)</li>
            <li>Votre développement personnel</li>
          </ul>
          
          <h4>Les signes de déséquilibre</h4>
          <ul>
            <li>Fatigue persistante</li>
            <li>Difficulté à déconnecter du travail</li>
            <li>Sentiment d'être dépassé(e)</li>
            <li>Réduction du temps consacré aux relations et loisirs</li>
          </ul>
          
          <h4>Exercice pratique : La roue de l'équilibre</h4>
          <p>Évaluez votre satisfaction sur une échelle de 0 à 10 pour chaque domaine :</p>
          <ol>
            <li>Travail/Carrière</li>
            <li>Famille/Relations</li>
            <li>Santé/Bien-être</li>
            <li>Loisirs/Détente</li>
            <li>Développement personnel</li>
            <li>Environnement/Cadre de vie</li>
          </ol>
        </div>
      `,
      questions: [
        {
          id: 'equilibre_module1_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre équilibre actuel entre vie professionnelle et personnelle ?',
          min: 1,
          max: 5,
          labels: ['Très déséquilibré', 'Plutôt déséquilibré', 'Neutre', 'Plutôt équilibré', 'Très équilibré'],
          required: true
        },
        {
          id: 'equilibre_module1_q2',
          type: 'multiple_choice',
          question: 'Combien d\'heures travaillez-vous en moyenne par semaine ?',
          options: [
            { id: 'less_35', label: 'Moins de 35 heures' },
            { id: '35_40', label: '35 à 40 heures' },
            { id: '40_45', label: '40 à 45 heures' },
            { id: '45_50', label: '45 à 50 heures' },
            { id: 'more_50', label: 'Plus de 50 heures' }
          ],
          required: true
        },
        {
          id: 'equilibre_module1_q3',
          type: 'checkbox',
          question: 'Quels signes de déséquilibre ressentez-vous actuellement ? (Plusieurs réponses possibles)',
          options: [
            { id: 'fatigue', label: 'Fatigue persistante' },
            { id: 'deconnexion', label: 'Difficulté à déconnecter du travail' },
            { id: 'depasse', label: 'Sentiment d\'être dépassé(e)' },
            { id: 'reduction', label: 'Réduction du temps pour les loisirs et relations' },
            { id: 'stress', label: 'Stress chronique' },
            { id: 'sommeil', label: 'Troubles du sommeil' },
            { id: 'aucun', label: 'Aucun signe particulier' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'equilibre_module2',
      islandId: 'equilibre',
      title: "Gérer son temps efficacement",
      description: "Méthodes et techniques pour mieux gérer votre temps et créer des frontières saines",
      icon: "⏱️",
      duration: "20 min",
      level: 2,
      points: 100,
      badgeId: "maitre_temps",
      content: `
        <div>
          <h3>Gestion efficace du temps</h3>
          <p>La gestion efficace du temps est essentielle pour maintenir un bon équilibre entre vie professionnelle et personnelle.</p>
          
          <h4>Techniques efficaces</h4>
          <ul>
            <li><strong>La technique Pomodoro</strong> : Travaillez 25 minutes, puis prenez 5 minutes de pause</li>
            <li><strong>La matrice d'Eisenhower</strong> : Classez vos tâches selon leur urgence et importance</li>
            <li><strong>La règle des 2 minutes</strong> : Si une tâche prend moins de 2 minutes, faites-la immédiatement</li>
          </ul>
          
          <h4>Créer des frontières saines</h4>
          <ul>
            <li>Définissez des heures précises de début et fin de travail</li>
            <li>Créez un espace de travail séparé de votre espace de vie</li>
            <li>Établissez des rituels de transition entre travail et vie personnelle</li>
            <li>Désactivez les notifications professionnelles pendant votre temps personnel</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'equilibre_module2_q1',
          type: 'multiple_choice',
          question: 'Quelle technique de gestion du temps vous semble la plus adaptée à votre situation ?',
          options: [
            { id: 'pomodoro', label: 'La technique Pomodoro (25 min de travail, 5 min de pause)' },
            { id: 'eisenhower', label: 'La matrice d\'Eisenhower (Urgent/Important)' },
            { id: 'timeblocking', label: 'Le time-blocking (bloquer des plages horaires dédiées)' },
            { id: 'rule2min', label: 'La règle des 2 minutes' },
            { id: 'other', label: 'Une autre technique' }
          ],
          required: true
        },
        {
          id: 'equilibre_module2_q2',
          type: 'scale',
          question: 'À quel point arrivez-vous à établir des frontières claires entre votre vie professionnelle et personnelle ?',
          min: 1,
          max: 5,
          labels: ['Pas du tout', 'Difficilement', 'Moyennement', 'Plutôt bien', 'Très bien'],
          required: true
        },
        {
          id: 'equilibre_module2_q3',
          type: 'checkbox',
          question: 'Quelles frontières saines allez-vous mettre en place ? (Plusieurs réponses possibles)',
          options: [
            { id: 'horaires', label: 'Définir des heures précises de début et fin de travail' },
            { id: 'espace', label: 'Créer un espace de travail séparé' },
            { id: 'rituel', label: 'Établir un rituel de transition entre travail et vie perso' },
            { id: 'notif', label: 'Désactiver les notifications professionnelles hors travail' },
            { id: 'pause', label: 'Planifier des pauses régulières' },
            { id: 'agenda', label: 'Bloquer du temps dans l\'agenda pour la vie personnelle' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'equilibre_module3',
      islandId: 'equilibre',
      title: "Cultiver le sens et la satisfaction",
      description: "Découvrez comment trouver davantage de sens et de satisfaction dans votre vie professionnelle et personnelle",
      icon: "🔍",
      duration: "25 min",
      level: 3,
      points: 100,
      badgeId: "chercheur_sens",
      content: `
        <div>
          <h3>Trouver du sens dans sa vie professionnelle</h3>
          <p>Le sens au travail est un élément clé de l'équilibre et du bien-être global.</p>
          
          <h4>Le concept d'Ikigai</h4>
          <p>L'Ikigai est un concept japonais qui représente l'intersection de quatre éléments :</p>
          <ul>
            <li>Ce que vous aimez faire (passion)</li>
            <li>Ce pour quoi vous êtes doué(e) (talent)</li>
            <li>Ce dont le monde a besoin (mission)</li>
            <li>Ce pour quoi vous pouvez être rémunéré(e) (profession)</li>
          </ul>
          
          <h4>Aligner travail et valeurs personnelles</h4>
          <ul>
            <li>Réfléchissez aux principes qui guident vos décisions importantes</li>
            <li>Pensez à ce qui vous met en colère ou vous inspire</li>
            <li>Considérez les qualités que vous admirez chez les autres</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'equilibre_module3_q1',
          type: 'scale',
          question: 'À quel point trouvez-vous du sens dans votre travail actuel ?',
          min: 1,
          max: 5,
          labels: ['Pas du tout', 'Un peu', 'Modérément', 'Beaucoup', 'Énormément'],
          required: true
        },
        {
          id: 'equilibre_module3_q2',
          type: 'text',
          question: 'Quelle est votre passion ? Qu\'aimez-vous faire qui vous procure de la joie ?',
          placeholder: 'Vos activités, intérêts ou domaines qui vous passionnent',
          required: true
        },
        {
          id: 'equilibre_module3_q3',
          type: 'checkbox',
          question: 'Quelles valeurs personnelles sont les plus importantes pour vous ? (Sélectionnez-en 3)',
          options: [
            { id: 'authenticite', label: 'Authenticité' },
            { id: 'creativite', label: 'Créativité' },
            { id: 'liberte', label: 'Liberté' },
            { id: 'impact', label: 'Impact positif' },
            { id: 'apprentissage', label: 'Apprentissage continu' },
            { id: 'relations', label: 'Relations humaines' },
            { id: 'securite', label: 'Sécurité' },
            { id: 'reconnaissance', label: 'Reconnaissance' }
          ],
          required: true,
          maxSelect: 3
        }
      ]
    },
    
    // Pleine Conscience Modules
    {
      id: 'pleine_conscience_module1',
      islandId: 'pleine_conscience',
      title: "Initiation à la pleine conscience",
      description: "Découvrez les fondamentaux de la pleine conscience et ses bienfaits",
      icon: "🧘‍♀️",
      duration: "15 min",
      level: 1,
      points: 100,
      badgeId: "meditant",
      content: `
        <div>
          <h3>Les bases de la pleine conscience</h3>
          <p>La pleine conscience consiste à porter délibérément son attention sur le moment présent, sans jugement.</p>
          
          <h4>Bienfaits de la pleine conscience</h4>
          <ul>
            <li>Réduction du stress et de l'anxiété</li>
            <li>Amélioration de la concentration et de la clarté mentale</li>
            <li>Meilleure gestion des émotions</li>
            <li>Développement de la créativité et de l'intuition</li>
          </ul>
          
          <h4>Exercice pratique : Respiration consciente</h4>
          <ol>
            <li>Installez-vous confortablement, le dos droit</li>
            <li>Respirez naturellement, en portant attention à votre souffle</li>
            <li>Observez les sensations de l'air qui entre et sort de vos narines</li>
            <li>Lorsque votre esprit vagabonde, ramenez doucement votre attention à votre respiration</li>
            <li>Pratiquez pendant 5 minutes</li>
          </ol>
        </div>
      `,
      questions: [
        {
          id: 'pleine_conscience_module1_q1',
          type: 'scale',
          question: 'À quelle fréquence pratiquez-vous déjà des activités de pleine conscience ?',
          min: 1,
          max: 5,
          labels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Quotidiennement'],
          required: true
        },
        {
          id: 'pleine_conscience_module1_q2',
          type: 'checkbox',
          question: 'Quels bienfaits de la pleine conscience vous intéressent particulièrement ? (Plusieurs réponses possibles)',
          options: [
            { id: 'stress', label: 'Réduction du stress' },
            { id: 'concentration', label: 'Amélioration de la concentration' },
            { id: 'emotions', label: 'Meilleure gestion des émotions' },
            { id: 'sommeil', label: 'Amélioration du sommeil' },
            { id: 'creativite', label: 'Développement de la créativité' },
            { id: 'relations', label: 'Amélioration des relations' }
          ],
          required: true
        },
        {
          id: 'pleine_conscience_module1_q3',
          type: 'scale',
          question: 'Comment vous êtes-vous senti(e) pendant l\'exercice de respiration consciente ?',
          min: 1,
          max: 5,
          labels: ['Très inconfortable', 'Inconfortable', 'Neutre', 'Confortable', 'Très confortable'],
          required: true
        }
      ]
    },
    {
      id: 'pleine_conscience_module2',
      islandId: 'pleine_conscience',
      title: "Observation sans jugement",
      description: "Développez votre capacité à observer vos pensées et émotions sans les juger",
      icon: "👁️",
      duration: "20 min",
      level: 2,
      points: 100,
      badgeId: "observateur",
      content: `
        <div>
          <h3>L'observation sans jugement</h3>
          <p>Observer sans juger consiste à être témoin de nos pensées, émotions et sensations, sans chercher à les qualifier de bonnes ou mauvaises.</p>
          
          <h4>Pourquoi est-ce important ?</h4>
          <ul>
            <li>Réduit la réactivité émotionnelle</li>
            <li>Crée un espace entre le stimulus et la réponse</li>
            <li>Diminue l'auto-critique et améliore l'auto-compassion</li>
            <li>Permet une meilleure compréhension de soi</li>
          </ul>
          
          <h4>Exercice pratique : Le nuage de pensées</h4>
          <ol>
            <li>Asseyez-vous confortablement et fermez les yeux</li>
            <li>Imaginez vos pensées comme des nuages dans le ciel</li>
            <li>Observez-les passer sans vous y attacher</li>
            <li>Ne cherchez ni à les retenir, ni à les repousser</li>
            <li>Notez simplement leur présence sans jugement</li>
          </ol>
        </div>
      `,
      questions: [
        {
          id: 'pleine_conscience_module2_q1',
          type: 'scale',
          question: 'À quel point avez-vous tendance à juger vos pensées et émotions ?',
          min: 1,
          max: 5,
          labels: ['Jamais', 'Rarement', 'Parfois', 'Souvent', 'Constamment'],
          required: true
        },
        {
          id: 'pleine_conscience_module2_q2',
          type: 'multiple_choice',
          question: 'Quelle est votre réaction habituelle face à une émotion difficile ?',
          options: [
            { id: 'evitement', label: 'J\'essaie de l\'éviter ou de la supprimer' },
            { id: 'rumination', label: 'Je rumine et m\'inquiète' },
            { id: 'expression', label: 'Je l\'exprime immédiatement' },
            { id: 'distraction', label: 'Je me distrais avec autre chose' },
            { id: 'observation', label: 'J\'observe et j\'accepte l\'émotion' }
          ],
          required: true
        },
        {
          id: 'pleine_conscience_module2_q3',
          type: 'text',
          question: 'Décrivez une situation récente où vous avez jugé vos émotions ou celles d\'autrui',
          placeholder: 'Situation, jugement porté, et effet de ce jugement',
          required: true
        }
      ]
    },
    {
      id: 'pleine_conscience_module3',
      islandId: 'pleine_conscience',
      title: "Pleine conscience au quotidien",
      description: "Intégrez la pleine conscience dans vos activités journalières",
      icon: "🔮",
      duration: "25 min",
      level: 3,
      points: 100,
      badgeId: "present",
      content: `
        <div>
          <h3>La pleine conscience au quotidien</h3>
          <p>Intégrer la pleine conscience dans votre quotidien transforme les activités ordinaires en opportunités de présence et de conscience.</p>
          
          <h4>Moments pour pratiquer</h4>
          <ul>
            <li><strong>Alimentation consciente</strong> : Savourez chaque bouchée, notez les textures, saveurs, odeurs</li>
            <li><strong>Marche consciente</strong> : Ressentez chaque pas, le contact avec le sol, les mouvements du corps</li>
            <li><strong>Communication consciente</strong> : Écoutez pleinement, sans préparer votre réponse</li>
            <li><strong>Transitions conscientes</strong> : Utilisez les moments de transition (trajet, attente) pour vous recentrer</li>
          </ul>
          
          <h4>Exercice pratique : Une activité routinière en pleine conscience</h4>
          <p>Choisissez une activité quotidienne (se brosser les dents, prendre une douche, boire un café) et pratiquez-la en pleine conscience pendant 7 jours.</p>
        </div>
      `,
      questions: [
        {
          id: 'pleine_conscience_module3_q1',
          type: 'checkbox',
          question: 'Quelles activités quotidiennes aimeriez-vous pratiquer en pleine conscience ? (Plusieurs réponses possibles)',
          options: [
            { id: 'alimentation', label: 'Manger/boire' },
            { id: 'marche', label: 'Marcher/se déplacer' },
            { id: 'communication', label: 'Communiquer avec les autres' },
            { id: 'hygiene', label: 'Activités d\'hygiène (douche, brossage de dents)' },
            { id: 'travail', label: 'Tâches professionnelles' },
            { id: 'autres', label: 'Autres activités quotidiennes' }
          ],
          required: true
        },
        {
          id: 'pleine_conscience_module3_q2',
          type: 'multiple_choice',
          question: 'Quelle activité routine allez-vous choisir pour pratiquer en pleine conscience pendant 7 jours ?',
          options: [
            { id: 'dents', label: 'Se brosser les dents' },
            { id: 'douche', label: 'Prendre une douche' },
            { id: 'cafe', label: 'Boire un café/thé' },
            { id: 'repas', label: 'Prendre un repas' },
            { id: 'marche', label: 'Marcher/se déplacer' },
            { id: 'autre', label: 'Autre activité' }
          ],
          required: true
        },
        {
          id: 'pleine_conscience_module3_q3',
          type: 'scale',
          question: 'À quel point vous sentez-vous confiant(e) dans votre capacité à intégrer la pleine conscience dans votre quotidien ?',
          min: 1,
          max: 5,
          labels: ['Pas du tout confiant(e)', 'Peu confiant(e)', 'Moyennement confiant(e)', 'Assez confiant(e)', 'Très confiant(e)'],
          required: true
        }
      ]
    },
    
    // Modules Résilience & Stress
    {
      id: 'resilience_module1',
      islandId: 'resilience',
      title: "Comprendre le stress",
      description: "Reconnaître les mécanismes du stress et ses effets sur le corps et l'esprit",
      icon: "😌",
      duration: "15 min",
      level: 1,
      points: 100,
      badgeId: "zen",
      content: `
        <div>
          <h3>Comprendre le stress</h3>
          <p>Le stress est une réaction naturelle de l'organisme face à une pression ou une menace perçue.</p>
          
          <h4>Mécanismes du stress</h4>
          <ul>
            <li>Réaction de "combat ou fuite" : libération d'adrénaline et de cortisol</li>
            <li>Activation du système nerveux sympathique</li>
            <li>Augmentation du rythme cardiaque et de la respiration</li>
            <li>Tension musculaire</li>
          </ul>
          
          <h4>Effets du stress chronique</h4>
          <ul>
            <li>Fatigue et troubles du sommeil</li>
            <li>Problèmes digestifs</li>
            <li>Diminution des défenses immunitaires</li>
            <li>Difficultés de concentration</li>
            <li>Irritabilité et sautes d'humeur</li>
            <li>Risque accru de burnout</li>
          </ul>
          
          <h4>Exercice : Identifier vos déclencheurs de stress</h4>
          <p>Prenez un moment pour réfléchir aux situations, personnes ou pensées qui déclenchent votre stress.</p>
        </div>
      `,
      questions: [
        {
          id: 'resilience_module1_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre niveau de stress actuel ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Modéré', 'Élevé', 'Très élevé'],
          required: true
        },
        {
          id: 'resilience_module1_q2',
          type: 'checkbox',
          question: 'Quels symptômes de stress ressentez-vous régulièrement ? (Plusieurs réponses possibles)',
          options: [
            { id: 'fatigue', label: 'Fatigue chronique' },
            { id: 'sommeil', label: 'Troubles du sommeil' },
            { id: 'tension', label: 'Tensions musculaires' },
            { id: 'digestion', label: 'Problèmes digestifs' },
            { id: 'concentration', label: 'Difficultés de concentration' },
            { id: 'irritabilite', label: 'Irritabilité' },
            { id: 'anxiete', label: 'Anxiété' },
            { id: 'aucun', label: 'Aucun symptôme particulier' }
          ],
          required: true
        },
        {
          id: 'resilience_module1_q3',
          type: 'text',
          question: 'Quels sont vos principaux déclencheurs de stress professionnel ?',
          placeholder: 'Par exemple : délais serrés, conflits, charge de travail...',
          required: true
        }
      ]
    },
    {
      id: 'resilience_module2',
      islandId: 'resilience',
      title: "Développer sa résilience",
      description: "Renforcer votre capacité à rebondir face aux défis et aux difficultés",
      icon: "🛡️",
      duration: "20 min",
      level: 2,
      points: 100,
      badgeId: "resilient",
      content: `
        <div>
          <h3>Développer sa résilience</h3>
          <p>La résilience est la capacité à s'adapter positivement face à l'adversité, aux traumatismes ou au stress important.</p>
          
          <h4>Facteurs de résilience</h4>
          <ul>
            <li><strong>Optimisme réaliste</strong> : voir les difficultés comme temporaires et surmontables</li>
            <li><strong>Acceptation du changement</strong> : flexibilité face aux nouvelles situations</li>
            <li><strong>Auto-efficacité</strong> : confiance en ses capacités à résoudre les problèmes</li>
            <li><strong>Réseau de soutien</strong> : connexions sociales solides</li>
            <li><strong>Sens et objectifs</strong> : avoir un but qui donne du sens à sa vie</li>
          </ul>
          
          <h4>Stratégies pour renforcer sa résilience</h4>
          <ul>
            <li>Cultiver les émotions positives et la gratitude</li>
            <li>Remettre en perspective les situations difficiles</li>
            <li>Développer ses stratégies d'adaptation (coping)</li>
            <li>Prendre soin de sa santé physique et mentale</li>
            <li>Nourrir ses relations sociales</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'resilience_module2_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre niveau de résilience actuel ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyen', 'Élevé', 'Très élevé'],
          required: true
        },
        {
          id: 'resilience_module2_q2',
          type: 'checkbox',
          question: 'Quels facteurs de résilience sont déjà présents dans votre vie ? (Plusieurs réponses possibles)',
          options: [
            { id: 'optimisme', label: 'Optimisme réaliste' },
            { id: 'acceptation', label: 'Acceptation du changement' },
            { id: 'confiance', label: 'Confiance en soi' },
            { id: 'soutien', label: 'Réseau de soutien solide' },
            { id: 'sens', label: 'Sens et objectifs clairs' },
            { id: 'adaptabilite', label: 'Adaptabilité' }
          ],
          required: true
        },
        {
          id: 'resilience_module2_q3',
          type: 'text',
          question: 'Décrivez une situation difficile que vous avez surmontée et ce qui vous a aidé',
          placeholder: 'Situation, ressources utilisées, apprentissages',
          required: true
        }
      ]
    },
    {
      id: 'resilience_module3',
      islandId: 'resilience',
      title: "Équilibre émotionnel",
      description: "Apprenez à réguler vos émotions et à maintenir un équilibre face au stress",
      icon: "⚖️",
      duration: "25 min",
      level: 3,
      points: 100,
      badgeId: "equilibre",
      content: `
        <div>
          <h3>L'équilibre émotionnel</h3>
          <p>L'équilibre émotionnel est la capacité à gérer efficacement ses émotions, même en période de stress.</p>
          
          <h4>Les dimensions de l'équilibre émotionnel</h4>
          <ul>
            <li><strong>Conscience émotionnelle</strong> : identifier et nommer ses émotions</li>
            <li><strong>Acceptation</strong> : accueillir ses émotions sans les juger</li>
            <li><strong>Régulation</strong> : moduler l'intensité et l'expression des émotions</li>
            <li><strong>Résilience</strong> : rebondir après des périodes émotionnellement difficiles</li>
          </ul>
          
          <h4>Techniques de régulation émotionnelle</h4>
          <ul>
            <li><strong>Respiration profonde</strong> : 4 secondes inspiration, 6 secondes expiration</li>
            <li><strong>Recadrage cognitif</strong> : modifier sa perception d'une situation</li>
            <li><strong>Expression adaptée</strong> : communiquer ses émotions de façon constructive</li>
            <li><strong>Ancrage dans le présent</strong> : technique des 5 sens (5 choses que vous voyez, 4 que vous touchez...)</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'resilience_module3_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre capacité à identifier vos émotions ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Excellente'],
          required: true
        },
        {
          id: 'resilience_module3_q2',
          type: 'scale',
          question: 'Comment évaluez-vous votre capacité à réguler vos émotions en situation de stress ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Excellente'],
          required: true
        },
        {
          id: 'resilience_module3_q3',
          type: 'checkbox',
          question: 'Quelles techniques de régulation émotionnelle utilisez-vous déjà ? (Plusieurs réponses possibles)',
          options: [
            { id: 'respiration', label: 'Respiration profonde' },
            { id: 'recadrage', label: 'Recadrage cognitif' },
            { id: 'expression', label: 'Expression adaptée' },
            { id: 'ancrage', label: 'Techniques d\'ancrage dans le présent' },
            { id: 'meditation', label: 'Méditation' },
            { id: 'activite', label: 'Activité physique' },
            { id: 'aucune', label: 'Aucune technique particulière' }
          ],
          required: true
        }
      ]
    },
    
    // Modules Relations Saines
    {
      id: 'relations_module1',
      islandId: 'relations',
      title: "Communication authentique",
      description: "Développez une communication claire, honnête et empathique",
      icon: "🗣️",
      duration: "15 min",
      level: 1,
      points: 100,
      badgeId: "communicateur",
      content: `
        <div>
          <h3>La communication authentique</h3>
          <p>Une communication authentique est à la fois honnête, claire, respectueuse et empathique.</p>
          
          <h4>Principes de la communication authentique</h4>
          <ul>
            <li><strong>Clarté</strong> : exprimer ses idées et sentiments avec précision</li>
            <li><strong>Honnêteté</strong> : partager sa vérité tout en restant bienveillant</li>
            <li><strong>Écoute active</strong> : être pleinement présent à ce que l'autre exprime</li>
            <li><strong>Non-jugement</strong> : accueillir sans critiquer ou évaluer</li>
            <li><strong>Responsabilité</strong> : parler en "je" plutôt qu'en "tu"</li>
          </ul>
          
          <h4>La communication non violente (CNV)</h4>
          <ol>
            <li><strong>Observation</strong> : décrire les faits sans jugement</li>
            <li><strong>Sentiment</strong> : exprimer son ressenti</li>
            <li><strong>Besoin</strong> : identifier le besoin derrière le sentiment</li>
            <li><strong>Demande</strong> : formuler une demande claire et négociable</li>
          </ol>
        </div>
      `,
      questions: [
        {
          id: 'relations_module1_q1',
          type: 'scale',
          question: 'Comment évaluez-vous la qualité de votre communication au travail ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyenne', 'Bonne', 'Excellente'],
          required: true
        },
        {
          id: 'relations_module1_q2',
          type: 'checkbox',
          question: 'Quels aspects de la communication authentique trouvez-vous difficiles ? (Plusieurs réponses possibles)',
          options: [
            { id: 'clarte', label: 'Exprimer clairement mes idées' },
            { id: 'honnetete', label: 'Être honnête sur mes sentiments' },
            { id: 'ecoute', label: 'Pratiquer l\'écoute active' },
            { id: 'jugement', label: 'Ne pas juger les autres' },
            { id: 'responsabilite', label: 'Parler en "je" plutôt qu\'en "tu"' },
            { id: 'feedback', label: 'Donner un feedback constructif' },
            { id: 'conflit', label: 'Gérer les situations de conflit' }
          ],
          required: true
        },
        {
          id: 'relations_module1_q3',
          type: 'text',
          question: 'Transformez cette critique en message CNV : "Tu ne m\'écoutes jamais quand je parle !"',
          placeholder: 'Observation, sentiment, besoin, demande',
          required: true
        }
      ]
    },
    {
      id: 'relations_module2',
      islandId: 'relations',
      title: "Développer l'empathie",
      description: "Cultivez votre capacité à comprendre et partager les sentiments des autres",
      icon: "❤️",
      duration: "20 min",
      level: 2,
      points: 100,
      badgeId: "empathique",
      content: `
        <div>
          <h3>Développer l'empathie</h3>
          <p>L'empathie est la capacité à comprendre et à ressentir ce que vit une autre personne, selon son cadre de référence.</p>
          
          <h4>Les trois dimensions de l'empathie</h4>
          <ul>
            <li><strong>Empathie cognitive</strong> : comprendre intellectuellement la perspective de l'autre</li>
            <li><strong>Empathie émotionnelle</strong> : ressentir ce que l'autre ressent</li>
            <li><strong>Sollicitude empathique</strong> : être motivé à aider ou soutenir l'autre</li>
          </ul>
          
          <h4>Bénéfices de l'empathie au travail</h4>
          <ul>
            <li>Améliore la cohésion d'équipe et la collaboration</li>
            <li>Facilite la résolution de conflits</li>
            <li>Augmente la satisfaction et l'engagement</li>
            <li>Favorise un climat de confiance et de sécurité psychologique</li>
          </ul>
          
          <h4>Exercice : Écoute empathique</h4>
          <p>Lors de votre prochaine conversation, concentrez-vous entièrement sur l'autre personne. Écoutez pour comprendre, pas pour répondre. Essayez de percevoir ses émotions au-delà des mots.</p>
        </div>
      `,
      questions: [
        {
          id: 'relations_module2_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre niveau d\'empathie actuel ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyen', 'Élevé', 'Très élevé'],
          required: true
        },
        {
          id: 'relations_module2_q2',
          type: 'multiple_choice',
          question: 'Quelle dimension de l\'empathie vous semble la plus naturelle pour vous ?',
          options: [
            { id: 'cognitive', label: 'Empathie cognitive (comprendre intellectuellement)' },
            { id: 'emotionnelle', label: 'Empathie émotionnelle (ressentir avec l\'autre)' },
            { id: 'sollicitude', label: 'Sollicitude empathique (désir d\'aider)' },
            { id: 'aucune', label: 'Aucune en particulier' }
          ],
          required: true
        },
        {
          id: 'relations_module2_q3',
          type: 'checkbox',
          question: 'Quels obstacles à l\'empathie rencontrez-vous ? (Plusieurs réponses possibles)',
          options: [
            { id: 'prejuges', label: 'Préjugés et stéréotypes' },
            { id: 'egocentrisme', label: 'Tendance à rester centré sur soi' },
            { id: 'jugement', label: 'Tendance à juger rapidement' },
            { id: 'stress', label: 'Stress et pression temporelle' },
            { id: 'fatigue', label: 'Fatigue émotionnelle' },
            { id: 'differences', label: 'Grandes différences de perspective' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'relations_module3',
      islandId: 'relations',
      title: "Collaboration positive",
      description: "Maîtrisez l'art de collaborer efficacement et harmonieusement avec les autres",
      icon: "🤝",
      duration: "25 min",
      level: 3,
      points: 100,
      badgeId: "collaborateur",
      content: `
        <div>
          <h3>La collaboration positive</h3>
          <p>Une collaboration positive permet de créer des synergies, d'optimiser les résultats et de rendre le travail plus épanouissant.</p>
          
          <h4>Fondements de la collaboration positive</h4>
          <ul>
            <li><strong>Confiance mutuelle</strong> : croire en l'intégrité et les compétences de chacun</li>
            <li><strong>Objectifs communs</strong> : partager une vision et des objectifs clairs</li>
            <li><strong>Communication ouverte</strong> : échanger de façon transparente et constructive</li>
            <li><strong>Responsabilité partagée</strong> : s'engager collectivement dans le succès</li>
            <li><strong>Valorisation des différences</strong> : considérer la diversité comme une richesse</li>
          </ul>
          
          <h4>Stratégies pour une collaboration efficace</h4>
          <ul>
            <li>Clarifier les rôles et responsabilités de chacun</li>
            <li>Établir des processus de travail et de décision clairs</li>
            <li>Organiser des réunions efficaces et participatives</li>
            <li>Pratiquer le feedback constructif et régulier</li>
            <li>Célébrer les succès collectifs</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'relations_module3_q1',
          type: 'scale',
          question: 'Comment évaluez-vous la qualité de la collaboration dans votre environnement professionnel ?',
          min: 1,
          max: 5,
          labels: ['Très mauvaise', 'Mauvaise', 'Moyenne', 'Bonne', 'Excellente'],
          required: true
        },
        {
          id: 'relations_module3_q2',
          type: 'checkbox',
          question: 'Quels éléments de la collaboration positive sont présents dans votre équipe ? (Plusieurs réponses possibles)',
          options: [
            { id: 'confiance', label: 'Confiance mutuelle' },
            { id: 'objectifs', label: 'Objectifs communs clairs' },
            { id: 'communication', label: 'Communication ouverte' },
            { id: 'responsabilite', label: 'Responsabilité partagée' },
            { id: 'differences', label: 'Valorisation des différences' },
            { id: 'feedback', label: 'Feedback constructif' },
            { id: 'aucun', label: 'Aucun de ces éléments' }
          ],
          required: true
        },
        {
          id: 'relations_module3_q3',
          type: 'text',
          question: 'Décrivez un défi collaboratif actuel dans votre contexte professionnel',
          placeholder: 'Projet, personnes impliquées, difficultés rencontrées',
          required: true
        }
      ]
    },
    
    // Modules Vitalité & Énergie
    {
      id: 'vitalite_module1',
      islandId: 'vitalite',
      title: "Gérer son énergie",
      description: "Apprenez à optimiser et préserver vos ressources énergétiques",
      icon: "⚡",
      duration: "15 min",
      level: 1,
      points: 100,
      badgeId: "energique",
      content: `
        <div>
          <h3>La gestion de l'énergie</h3>
          <p>Contrairement au temps qui est limité à 24h par jour, l'énergie peut être renouvelée et optimisée.</p>
          
          <h4>Les quatre dimensions de l'énergie</h4>
          <ul>
            <li><strong>Énergie physique</strong> : alimentation, sommeil, mouvement, respiration</li>
            <li><strong>Énergie émotionnelle</strong> : émotions positives, résilience, connexions sociales</li>
            <li><strong>Énergie mentale</strong> : concentration, focus, clarté de pensée</li>
            <li><strong>Énergie spirituelle</strong> : sens, valeurs, objectifs, alignement</li>
          </ul>
          
          <h4>Principes de gestion de l'énergie</h4>
          <ul>
            <li>Alterner entre dépense et récupération d'énergie</li>
            <li>Établir des rituels énergisants</li>
            <li>Éviter les "voleurs d'énergie"</li>
            <li>Respecter ses rythmes naturels</li>
          </ul>
          
          <h4>Exercice : Audit énergétique</h4>
          <p>Notez pendant une journée vos niveaux d'énergie (1-10) à différents moments, en identifiant ce qui vous énergise et ce qui vous épuise.</p>
        </div>
      `,
      questions: [
        {
          id: 'vitalite_module1_q1',
          type: 'scale',
          question: 'Comment évaluez-vous votre niveau d\'énergie global actuellement ?',
          min: 1,
          max: 5,
          labels: ['Très faible', 'Faible', 'Moyen', 'Élevé', 'Très élevé'],
          required: true
        },
        {
          id: 'vitalite_module1_q2',
          type: 'checkbox',
          question: 'Quelles dimensions de votre énergie vous semblent les plus affectées ? (Plusieurs réponses possibles)',
          options: [
            { id: 'physique', label: 'Énergie physique' },
            { id: 'emotionnelle', label: 'Énergie émotionnelle' },
            { id: 'mentale', label: 'Énergie mentale' },
            { id: 'spirituelle', label: 'Énergie spirituelle (sens, valeurs)' },
            { id: 'aucune', label: 'Aucune en particulier' }
          ],
          required: true
        },
        {
          id: 'vitalite_module1_q3',
          type: 'text',
          question: 'Identifiez 3 "voleurs d\'énergie" dans votre quotidien professionnel',
          placeholder: 'Par exemple : réunions improductives, multitâche constant...',
          required: true
        }
      ]
    },
    {
      id: 'vitalite_module2',
      islandId: 'vitalite',
      title: "Habitudes de vitalité",
      description: "Intégrez des pratiques qui soutiennent votre énergie au quotidien",
      icon: "💪",
      duration: "20 min",
      level: 2,
      points: 100,
      badgeId: "vitalite",
      content: `
        <div>
          <h3>Les habitudes de vitalité</h3>
          <p>Des habitudes conscientes et régulières peuvent significativement améliorer votre niveau d'énergie et votre bien-être global.</p>
          
          <h4>Piliers fondamentaux de la vitalité</h4>
          <ul>
            <li><strong>Sommeil</strong> : qualité, régularité, environnement propice</li>
            <li><strong>Nutrition</strong> : alimentation équilibrée, hydratation, timing des repas</li>
            <li><strong>Mouvement</strong> : activité physique régulière, éviter la sédentarité prolongée</li>
            <li><strong>Récupération</strong> : pauses, respiration, détente, déconnexion</li>
          </ul>
          
          <h4>Stratégies pour créer des habitudes durables</h4>
          <ul>
            <li>Commencer petit (micro-habitudes)</li>
            <li>Associer la nouvelle habitude à une habitude existante</li>
            <li>Rendre l'habitude évidente, attrayante, facile et satisfaisante</li>
            <li>Utiliser l'environnement pour faciliter l'habitude</li>
            <li>Pratiquer la régularité plutôt que la perfection</li>
          </ul>
        </div>
      `,
      questions: [
        {
          id: 'vitalite_module2_q1',
          type: 'scale',
          question: 'Comment évaluez-vous la qualité de votre sommeil ?',
          min: 1,
          max: 5,
          labels: ['Très mauvaise', 'Mauvaise', 'Moyenne', 'Bonne', 'Excellente'],
          required: true
        },
        {
          id: 'vitalite_module2_q2',
          type: 'scale',
          question: 'À quelle fréquence pratiquez-vous une activité physique ?',
          min: 1,
          max: 5,
          labels: ['Jamais', 'Rarement', 'Occasionnellement', 'Régulièrement', 'Quotidiennement'],
          required: true
        },
        {
          id: 'vitalite_module2_q3',
          type: 'multiple_choice',
          question: 'Quelle habitude de vitalité souhaiteriez-vous développer en priorité ?',
          options: [
            { id: 'sommeil', label: 'Améliorer mon sommeil' },
            { id: 'nutrition', label: 'Optimiser mon alimentation' },
            { id: 'mouvement', label: 'Intégrer plus d\'activité physique' },
            { id: 'pauses', label: 'Prendre des pauses régulières' },
            { id: 'hydratation', label: 'Mieux m\'hydrater' },
            { id: 'autre', label: 'Autre habitude' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'vitalite_module3',
      islandId: 'vitalite',
      title: "Équilibre corps-esprit",
      description: "Atteignez un état d'harmonie entre votre corps et votre esprit pour une vitalité optimale",
      icon: "🌟",
      duration: "25 min",
      level: 3,
      points: 100,
      badgeId: "equilibre_global",
      content: `
        <div>
          <h3>L'équilibre corps-esprit</h3>
          <p>L'équilibre corps-esprit reconnaît l'interconnexion profonde entre notre état physique et notre état mental.</p>
          
          <h4>Principes de l'équilibre corps-esprit</h4>
          <ul>
            <li>Le corps influence l'esprit (posture, mouvement, respiration)</li>
            <li>L'esprit influence le corps (pensées, émotions, stress)</li>
            <li>Les deux systèmes fonctionnent en boucle de rétroaction constante</li>
            <li>Prendre soin de l'un améliore l'autre</li>
          </ul>
          
          <h4>Pratiques pour l'équilibre corps-esprit</h4>
          <ul>
            <li><strong>Yoga</strong> : alliance du mouvement, de la respiration et de la présence</li>
            <li><strong>Tai Chi / Qi Gong</strong> : mouvements lents, respiration et concentration</li>
            <li><strong>Méditation en mouvement</strong> : marche méditative, danse consciente</li>
            <li><strong>Cohérence cardiaque</strong> : respiration rythmique pour harmoniser cœur et cerveau</li>
            <li><strong>Pratiques somatiques</strong> : Feldenkrais, technique Alexander, etc.</li>
          </ul>
          
          <h4>Exercice : Pratique de cohérence cardiaque</h4>
          <p>Respirez à raison de 6 respirations par minute (inspiration 5 secondes, expiration 5 secondes) pendant 5 minutes.</p>
        </div>
      `,
      questions: [
        {
          id: 'vitalite_module3_q1',
          type: 'scale',
          question: 'Comment ressentez-vous la connexion entre votre corps et votre esprit ?',
          min: 1,
          max: 5,
          labels: ['Très déconnectés', 'Plutôt déconnectés', 'Neutre', 'Plutôt connectés', 'Très connectés'],
          required: true
        },
        {
          id: 'vitalite_module3_q2',
          type: 'checkbox',
          question: 'Quelles pratiques corps-esprit avez-vous déjà expérimentées ? (Plusieurs réponses possibles)',
          options: [
            { id: 'yoga', label: 'Yoga' },
            { id: 'taichi', label: 'Tai Chi / Qi Gong' },
            { id: 'meditation', label: 'Méditation' },
            { id: 'coherence', label: 'Cohérence cardiaque' },
            { id: 'somatiques', label: 'Pratiques somatiques' },
            { id: 'marche', label: 'Marche méditative' },
            { id: 'aucune', label: 'Aucune de ces pratiques' }
          ],
          required: true
        },
        {
          id: 'vitalite_module3_q3',
          type: 'scale',
          question: 'Comment vous êtes-vous senti(e) pendant l\'exercice de cohérence cardiaque ?',
          min: 1,
          max: 5,
          labels: ['Très inconfortable', 'Inconfortable', 'Neutre', 'Confortable', 'Très confortable'],
          required: true
        }
      ]
    }
  ];

// Daily challenges
const CHALLENGES = [
  {
    id: 'mindful_breathing',
    title: 'Respirez en pleine conscience',
    description: 'Prendre 5 minutes aujourd\'hui pour respirer profondément et vous reconnecter à l\'instant présent',
    points: 50,
    icon: '🫁',
    color: '#4EAAF0',
    category: 'mindfulness',
    duration: '5 min'
  },
  {
    id: 'digital_detox',
    title: 'Détox numérique',
    description: 'Prenez une pause de 30 minutes sans téléphone ni écran pour vous reconnecter à votre environnement',
    points: 50,
    icon: '📵',
    color: '#41D185',
    category: 'balance',
    duration: '30 min'
  },
  {
    id: 'gratitude_practice',
    title: 'Pratique de gratitude',
    description: 'Notez 3 choses pour lesquelles vous êtes reconnaissant aujourd\'hui',
    points: 50,
    icon: '🙏',
    color: '#B069F8',
    category: 'positivity',
    duration: '5 min'
  },
  {
    id: 'mindful_break',
    title: 'Pause consciente',
    description: 'Faites une pause de 10 minutes en pleine conscience entre deux réunions',
    points: 50,
    icon: '⏸️',
    color: '#FF8747',
    category: 'stress',
    duration: '10 min'
  }
];

// Quick exercises
const EXERCISES = [
  {
    id: 'breathing_exercise',
    title: 'Respiration',
    description: 'Exercice de respiration profonde pour se recentrer',
    icon: '🧘',
    color: '#4EAAF0',
    duration: '3 min',
    category: 'mindfulness'
  },
  {
    id: 'mindfulness_exercise',
    title: 'Pleine conscience',
    description: 'Pratique rapide de pleine conscience',
    icon: '🧠',
    color: '#FF8747',
    duration: '5 min',
    category: 'mindfulness'
  },
  {
    id: 'gratitude_exercise',
    title: 'Gratitude',
    description: 'Exercice express de gratitude',
    icon: '🌱',
    color: '#41D185',
    duration: '2 min',
    category: 'positivity'
  },
  {
    id: 'focus_exercise',
    title: 'Focus',
    description: 'Technique rapide pour améliorer la concentration',
    icon: '🎯',
    color: '#B069F8',
    duration: '10 min',
    category: 'productivity'
  }
];

// ================ UI Components ================

// Character Animation
const Character = ({ character = "🧘", emotion = "neutral", className = "", size = "text-4xl" }) => {
  const animations = {
    neutral: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2 }
    },
    happy: {
      y: [0, -10, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    excited: {
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 0.8 }
    }
  };
  
  return (
    <motion.div
      className={`${size} ${className}`}
      animate={animations[emotion]}
    >
      {character}
    </motion.div>
  );
};

// Logo Component
const Logo = () => (
  <div className="flex items-center">
    <div className="flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 rounded-full w-9 h-9 text-white">
      <span className="text-xl">🧠</span>
    </div>
    <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">IKIGAI</span>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ value, color = "#41D185", height = "h-2.5" }) => (
  <div className={`w-full bg-gray-200 rounded-full ${height}`}>
    <div 
      className={`${height} rounded-full transition-all duration-500`}
      style={{ width: `${value}%`, backgroundColor: color }}
    />
  </div>
);

// Button Component
const Button = ({ children, onClick, disabled = false, size = "md", className = "", color = "#41D185", variant = "primary", icon = null }) => {
  const baseClasses = "font-bold rounded-xl transition-all transform active:scale-95 shadow-md flex items-center justify-center";
  
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };
  
  const variantClasses = {
    primary: `hover:bg-opacity-90 text-white border-b-4 active:border-b-0 active:mt-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    secondary: `bg-gray-100 text-gray-700 hover:bg-gray-200 border-b-4 border-gray-300 active:border-b-0 active:mt-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  };

  const style = variant === 'primary' 
    ? { backgroundColor: color, borderBottomColor: color } 
    : {};
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// Badge Component
const Badge = ({ icon, name, description, color = "#FFF3E0", iconBgColor = "#41D185" }) => (
  <motion.div 
    className="flex items-center p-3 rounded-xl bg-white border-2 border-gray-100 shadow-sm"
    whileHover={{ scale: 1.05 }}
  >
    <div className="rounded-full w-12 h-12 flex items-center justify-center text-xl mr-3 text-white" style={{ backgroundColor: iconBgColor }}>
      <span>{icon}</span>
    </div>
    <div>
      <div className="font-bold text-sm">{name}</div>
      {description && (
        <div className="text-xs text-gray-500" style={{ maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={description}>
          {description}
        </div>
      )}
    </div>
  </motion.div>
);

// Streak Counter
const StreakCounter = ({ streak }) => (
  <div className="bg-white rounded-xl shadow-sm p-3 flex items-center">
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white mr-3">
      <span className="text-2xl">🔥</span>
    </div>
    <div>
      <div className="text-xs text-gray-500">Série de bien-être</div>
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
        {streak} jour{streak > 1 ? 's' : ''}
      </div>
    </div>
  </div>
);

// Wellness Score Component
const WellnessScore = ({ score }) => {
  // Determine color based on score
  let color, emoji;
  if (score >= 80) {
    color = "#41D185"; // Green for excellent
    emoji = "😊";
  } else if (score >= 60) {
    color = "#4EAAF0"; // Blue for good
    emoji = "🙂";
  } else if (score >= 40) {
    color = "#FF8747"; // Orange for moderate
    emoji = "😐";
  } else {
    color = "#FF5252"; // Red for needs improvement
    emoji = "😟";
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Score de bien-être</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-full mr-3">
          <ProgressBar value={score} color={color} height="h-4" />
        </div>
        <div className="font-bold text-lg" style={{ color }}>
          {score}%
        </div>
      </div>
    </div>
  );
};

// XP Bar
const XPBar = ({ points, level }) => {
  const pointsInCurrentLevel = points % 500;
  const percentage = (pointsInCurrentLevel / 500) * 100;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-2">
            {level}
          </div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
        <div className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2 py-1">
          {pointsInCurrentLevel}/500 XP
        </div>
      </div>
      <ProgressBar value={percentage} color="#4EAAF0" height="h-4" />
    </div>
  );
};

// Challenge Card Component
const ChallengeCard = ({ challenge, onComplete, isCompleted }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-sm overflow-hidden"
  >
    <div className="p-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3" style={{ backgroundColor: challenge.color }}>
          <span className="text-xl">{challenge.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{challenge.title}</h3>
          <div className="flex text-xs text-gray-500">
            <span className="flex items-center mr-3">
              <span className="mr-1">⏱️</span>
              {challenge.duration}
            </span>
            <span className="flex items-center">
              <span className="mr-1">✨</span>
              {challenge.points} points
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
      
      <div className="flex justify-end">
        <Button 
          color={challenge.color}
          onClick={() => onComplete(challenge.id)}
          disabled={isCompleted}
          size="sm"
          variant={isCompleted ? "secondary" : "primary"}
          icon={isCompleted ? "✓" : ""}
        >
          {isCompleted ? 'Complété' : 'Commencer'}
        </Button>
      </div>
    </div>
  </motion.div>
);

// Island Card Component
const IslandCard = ({ island, progress = 0, completedModules = 0, isUnlocked, onClick }) => (
  <motion.div 
    whileHover={isUnlocked ? { scale: 1.02 } : {}}
    className={`bg-white rounded-xl shadow-md overflow-hidden relative ${
      isUnlocked ? 'cursor-pointer' : 'opacity-80'
    }`}
    onClick={() => isUnlocked && onClick()}
  >
    <div className="p-5">
      <div className="flex items-start">
        <div className="relative mr-4">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white shadow-sm"
            style={{ backgroundColor: island.color }}
          >
            <span>{island.icon}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-xl">{island.mascot}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg text-gray-800">{island.name}</h3>
            
            {!isUnlocked && (
              <div className="text-xl">🔒</div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{island.description}</p>
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{completedModules}/{island.modules} modules</span>
            <span className="font-bold" style={{ color: island.color }}>{progress}%</span>
          </div>
          
          <ProgressBar value={progress} color={island.color} height="h-2" />
        </div>
      </div>
    </div>
  </motion.div>
);

// Module Card Component
const ModuleCard = ({ module, onStart, isUnlocked, isCompleted, color }) => (
  <motion.div
    whileHover={isUnlocked ? { scale: 1.02 } : {}}
    className={`bg-white rounded-xl shadow-sm overflow-hidden ${
      isUnlocked ? 'cursor-pointer' : 'opacity-70'
    }`}
  >
    <div className="p-5" style={{ borderLeft: isCompleted ? `4px solid ${color}` : '4px solid #e2e8f0' }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
            style={{ backgroundColor: isCompleted ? color : '#e2e8f0' }}
          >
            <span className="text-xl">{module.icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{module.title}</h3>
            <div className="flex text-xs text-gray-500">
              <span className="flex items-center mr-3">
                <span className="mr-1">⏱️</span>
                {module.duration}
              </span>
              <span className="flex items-center">
                <span className="mr-1">✨</span>
                {module.points} points
              </span>
            </div>
          </div>
        </div>
        
        {isCompleted && (
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="mr-1">✓</span> Complété
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 my-3">{module.description}</p>
      
      <div className="flex justify-end">
        <Button 
          color={color}
          onClick={onStart}
          disabled={!isUnlocked}
          size="sm"
          variant={isCompleted ? "secondary" : "primary"}
        >
          {isCompleted ? 'Revisiter' : 'Commencer'}
        </Button>
      </div>
    </div>
  </motion.div>
);

// Quick Exercise Card Component
const QuickExerciseCard = ({ exercise, onStart }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer"
    onClick={onStart}
  >
    <div 
      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2" 
      style={{ backgroundColor: `${exercise.color}20`, color: exercise.color }}
    >
      {exercise.icon}
    </div>
    <div className="font-medium">{exercise.title}</div>
    <div className="text-xs text-gray-500">{exercise.duration}</div>
  </motion.div>
);

// Question Components
const ScaleQuestion = ({ question, value, onChange, disabled }) => {
  return (
    <div className="my-6">
      <div className="flex justify-between mb-3 px-2">
        {question.labels?.map((label, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(question.max || 5)].map((_, idx) => {
          const scaleValue = idx + 1;
          return (
            <motion.button
              key={scaleValue}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`w-16 h-16 rounded-full shadow-md focus:outline-none ${
                value === scaleValue
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              onClick={() => !disabled && onChange(scaleValue)}
              disabled={disabled}
            >
              <span className="text-xl font-bold">{scaleValue}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const MultipleChoiceQuestion = ({ question, value, onChange, disabled }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {question.options?.map((option) => (
        <motion.div 
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !disabled && onChange(option.id)}
          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
            value === option.id 
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 mr-3 ${
              value === option.id
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300'
            }`}>
              {value === option.id && <span>✓</span>}
            </div>
            <span className="font-medium">{option.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const CheckboxQuestion = ({ question, value = [], onChange, disabled, maxSelect }) => {
  const handleToggle = (optionId) => {
    if (disabled) return;
    
    const currentValues = [...value];
    const index = currentValues.indexOf(optionId);
    
    if (index === -1) {
      // Add if not present and check maxSelect limit
      if (maxSelect && currentValues.length >= maxSelect) {
        currentValues.shift(); // Remove first element to maintain max limit
      }
      currentValues.push(optionId);
    } else {
      // Remove if present
      currentValues.splice(index, 1);
    }
    
    onChange(currentValues);
  };
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {question.options?.map((option) => (
        <motion.div 
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleToggle(option.id)}
          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
            value.includes(option.id) 
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-6 h-6 flex items-center justify-center rounded-md border-2 mr-3 ${
              value.includes(option.id)
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300'
            }`}>
              {value.includes(option.id) && <span>✓</span>}
            </div>
            <span className="font-medium">{option.label}</span>
          </div>
        </motion.div>
      ))}
      
      {maxSelect && (
        <p className="text-xs text-gray-500 mt-1">Veuillez sélectionner {maxSelect} option{maxSelect > 1 ? 's' : ''} maximum</p>
      )}
    </div>
  );
};

const TextQuestion = ({ question, value = "", onChange, disabled }) => {
  return (
    <div className="mb-4">
      <textarea
        className="w-full border-2 border-gray-300 rounded-2xl p-4 focus:outline-none focus:border-green-500"
        rows={4}
        placeholder={question.placeholder || "Votre réponse..."}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

// Quiz Component
const Quiz = ({ questions, responses, onChangeResponse, onSubmit, onBack, currentStep, totalSteps, color, isCompleted }) => {
  const currentQuestion = questions[currentStep];
  
  const isLastQuestion = currentStep === questions.length - 1;
  const canContinue = currentQuestion ? getIsQuestionAnswered(currentQuestion, responses[currentQuestion.id]) : true;
  
  function getIsQuestionAnswered(question, response) {
    if (!question.required) return true;
    
    switch (question.type) {
      case 'scale':
      case 'multiple_choice':
        return response !== undefined;
      case 'checkbox':
        return response && response.length > 0;
      case 'text':
        return response && response.trim() !== '';
      default:
        return false;
    }
  }
  
  const renderQuestion = () => {
    const response = responses[currentQuestion.id];
    
    switch (currentQuestion.type) {
      case 'scale':
        return (
          <ScaleQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      case 'checkbox':
        return (
          <CheckboxQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
            maxSelect={currentQuestion.maxSelect}
          />
        );
      case 'text':
        return (
          <TextQuestion 
            question={currentQuestion} 
            value={response}
            onChange={(val) => onChangeResponse(currentQuestion.id, val)}
            disabled={isCompleted}
          />
        );
      default:
        return <p>Type de question non pris en charge</p>;
    }
  };
  
  const renderProgress = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {questions.map((_, idx) => (
        <div 
          key={idx}
          className={`h-2 rounded-full transition-all ${idx === currentStep ? 'w-8' : 'w-2'}`}
          style={{ backgroundColor: idx <= currentStep ? color : "#e5e5e5" }}
        />
      ))}
    </div>
  );
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {renderProgress()}
      
      <h3 className="text-xl font-bold mb-6 text-center">
        {currentQuestion.question}
        {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
      </h3>
      
      {renderQuestion()}
      
      <div className="flex justify-between mt-8">
        {currentStep > 0 ? (
          <Button 
            variant="secondary"
            onClick={onBack}
            size="md"
          >
            Précédent
          </Button>
        ) : (
          <div></div> // Empty div for spacing
        )}
        
        {isLastQuestion ? (
          <Button
            color={color}
            onClick={onSubmit}
            disabled={!canContinue || isCompleted}
            size="md"
          >
            {isCompleted ? "Déjà complété" : "Terminer"}
          </Button>
        ) : (
          <Button
            color={color}
            onClick={() => onSubmit(false)}
            disabled={!canContinue}
            size="md"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
};

// Module Viewer Component (with questions)
const ModuleViewer = ({ module, onClose, onComplete, isCompleted, islandId }) => {
  const [currentStep, setCurrentStep] = useState(0); 
  const [showQuestions, setShowQuestions] = useState(false);
  const [responses, setResponses] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [characterEmotion, setCharacterEmotion] = useState("neutral");
  
  // Island data for character
  const island = ISLANDS.find(i => i.id === islandId);
  const color = island?.color || "#41D185";
  const character = island?.mascot || "🧘";
  
  // Load saved responses if any
  useEffect(() => {
    const progress = StorageService.getProgress();
    if (progress.moduleResponses && progress.moduleResponses[module.id]) {
      setResponses(progress.moduleResponses[module.id].responses || {});
    }
  }, [module.id]);
  
  const handleChangeResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Make character react
    setCharacterEmotion("happy");
    setTimeout(() => setCharacterEmotion("neutral"), 1000);
  };
  
  const handleSubmit = (isComplete = true) => {
    if (isComplete) {
      // Save responses and complete module
      StorageService.saveModuleResponses(module.id, responses);
      onComplete(module.id, islandId);
      
      // Show completion animation
      setShowConfetti(true);
      setCharacterEmotion("excited");
      
      // Close after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      // Move to next question
      setCurrentStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setCurrentStep(prevStep => Math.max(0, prevStep - 1));
  };
  
  // Success view
  const renderSuccess = () => {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-4">
          <Character character={character} emotion="excited" size="text-6xl" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Module complété avec succès !</h3>
        <p className="text-gray-600 mb-6">
          Vous avez gagné {module.points} points et un nouveau badge.
        </p>
        <Button
          color={color}
          onClick={onClose}
          size="lg"
        >
          Retour aux modules
        </Button>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{module.title}</h2>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Module content */}
        <div className="p-6">
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => {
                const size = Math.random() * 8 + 2;
                const colors = [color, '#FFD700', '#FF6B6B', '#4EAAF0', '#41D185'];
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 20}%`,
                      width: size,
                      height: size,
                      backgroundColor: colors[Math.floor(Math.random() * colors.length)]
                    }}
                    animate={{
                      y: ['0%', '120%'],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      ease: "easeOut",
                      delay: Math.random() * 0.5
                    }}
                  />
                );
              })}
            </div>
          )}
          
          {/* Character */}
          <div className="flex justify-center my-4">
            <Character character={character} emotion={characterEmotion} size="text-5xl" />
          </div>
          
          {showQuestions ? (
            isCompleted ? (
              renderSuccess()
            ) : (
              <Quiz 
                questions={module.questions || []}
                responses={responses}
                onChangeResponse={handleChangeResponse}
                onSubmit={handleSubmit}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={module.questions?.length || 0}
                color={color}
                isCompleted={isCompleted}
              />
            )
          ) : (
            <>
              {/* Module content */}
              <div 
                className="bg-white p-4 rounded-xl mb-6" 
                dangerouslySetInnerHTML={{ __html: module.content }}
              />
              
              {/* Action buttons */}
              <div className="flex justify-center">
                {isCompleted ? (
                  <Button variant="secondary" onClick={onClose}>
                    Fermer
                  </Button>
                ) : (
                  <Button 
                    color={color} 
                    onClick={() => setShowQuestions(true)}
                    size="lg"
                  >
                    Commencer le questionnaire
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Island View Component
const IslandView = ({ island, onReturn, globalProgress, onCompleteModule }) => {
  const [activeModule, setActiveModule] = useState(null);
  
  // Get modules for this island
  const islandModules = MODULES.filter(m => m.islandId === island.id);
  
  // Check which modules are completed
  const completedModules = globalProgress?.completedModules || {};
  
  // Determine if a module is unlocked
  const isModuleUnlocked = (module, index) => {
    // First module is always unlocked
    if (index === 0) return true;
    
    // Check if previous module is completed
    const prevModule = islandModules[index - 1];
    return prevModule && completedModules[prevModule.id];
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Logo />
          <button 
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center"
            onClick={onReturn}
          >
            <span className="mr-2">←</span> Retour
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Island header */}
        <div className="text-center mb-8">
          <Character 
            character={island.mascot} 
            emotion="happy" 
            size="text-6xl" 
            className="mb-4"
          />
          <h1 className="text-3xl font-bold mb-2" style={{ color: island.color }}>
            {island.name}
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">{island.description}</p>
          
          {/* Island progress */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Progression</span>
              <span className="font-medium" style={{ color: island.color }}>
                {globalProgress?.islandProgress?.[island.id]?.progress || 0}%
              </span>
            </div>
            <ProgressBar 
              value={globalProgress?.islandProgress?.[island.id]?.progress || 0} 
              color={island.color} 
            />
            <div className="mt-2 text-xs text-center text-gray-500">
              {globalProgress?.islandProgress?.[island.id]?.completedModules || 0}/{island.modules} modules complétés
            </div>
          </div>
        </div>
        
        {/* Modules list */}
        <div>
          <h2 className="text-xl font-bold mb-4">Modules disponibles</h2>
          
          <div className="space-y-4 mb-8">
            {islandModules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                isUnlocked={isModuleUnlocked(module, index)}
                isCompleted={!!completedModules[module.id]}
                color={island.color}
                onStart={() => setActiveModule(module)}
              />
            ))}
          </div>
        </div>
        
        {/* Badges section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Badges à débloquer</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(island.badges).map(badge => {
              const isBadgeEarned = globalProgress?.badges?.some(b => b.id === badge.id);
              
              return (
                <Badge
                  key={badge.id}
                  icon={badge.icon}
                  name={badge.name}
                  description={badge.description}
                  iconBgColor={isBadgeEarned ? "#FFC107" : "#e2e8f0"}
                />
              );
            })}
          </div>
        </div>
      </main>
      
      {/* Active module */}
      {activeModule && (
        <ModuleViewer
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onComplete={onCompleteModule}
          isCompleted={!!completedModules[activeModule.id]}
          islandId={island.id}
        />
      )}
    </div>
  );
};

// Main App Component
const IkigaiApp = () => {
  const [progress, setProgress] = useState(null);
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initial loading
  useEffect(() => {
    // Load progress from storage
    const userProgress = StorageService.getProgress();
    setProgress(userProgress);
    
    // Show welcome modal for new users
    if (userProgress.totalPoints === 0) {
      setShowWelcome(true);
    }
    
    setIsLoading(false);
  }, []);
  
  // Handle module completion
  const handleCompleteModule = (moduleId, islandId) => {
    const updatedProgress = StorageService.completeModule(moduleId, islandId);
    setProgress(updatedProgress);
  };
  
  // Handle challenge completion
  const handleCompleteChallenge = (challengeId) => {
    const updatedProgress = StorageService.completeChallenge(challengeId);
    setProgress(updatedProgress);
  };
  
  // Calculate level based on points
  const level = Math.floor((progress?.totalPoints || 0) / 500) + 1;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen flex-col bg-gray-50">
        <Logo />
        <div className="mt-8 relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-transparent border-l-transparent animate-spin border-blue-500"></div>
        </div>
        <span className="mt-4 text-gray-600">Chargement...</span>
      </div>
    );
  }
  
  // If an island is selected, show island view
  if (selectedIsland) {
    return (
      <IslandView 
        island={selectedIsland} 
        onReturn={() => setSelectedIsland(null)} 
        globalProgress={progress} 
        onCompleteModule={handleCompleteModule}
      />
    );
  }
  
  // Main App View
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6">
            <div className="flex justify-center mb-4">
              <Character character="🧘" emotion="happy" size="text-6xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-3">Bienvenue sur IKIGAI</h2>
            
            <p className="text-gray-600 text-center mb-6">
              Votre assistant personnel pour améliorer votre bien-être au travail et trouver votre équilibre.
            </p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                <span className="text-xl mr-2">✨</span>
                Comment ça fonctionne
              </h3>
              
              <ul className="text-blue-700 space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                    1
                  </div>
                  <span>Explorez les îles thématiques selon vos besoins</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                    2
                  </div>
                  <span>Complétez des modules pour progresser</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                    3
                  </div>
                  <span>Relevez des défis quotidiens</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shrink-0">
                    4
                  </div>
                  <span>Collectez des badges et progressez en niveau</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button color="#4EAAF0" onClick={() => setShowWelcome(false)} size="lg">
                Commencer votre parcours
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center">
            <div className="bg-blue-50 px-3 py-1 rounded-full flex items-center mr-2">
              <span className="text-blue-600 font-bold mr-1">{progress?.totalPoints || 0}</span>
              <span className="text-blue-500 text-xs">pts</span>
            </div>
            
            <div className="flex items-center bg-orange-50 px-3 py-1 rounded-full">
              <span className="text-orange-500 mr-1">🔥</span>
              <span className="text-orange-600 font-bold">{progress?.streak || 0}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Welcome greeting with wellness score */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Bonjour !</h1>
                <p className="text-gray-600">Comment vous sentez-vous aujourd'hui ?</p>
              </div>
              <Character character="🧘" emotion="happy" />
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <WellnessScore score={progress?.wellnessScore || 65} />
              <StreakCounter streak={progress?.streak || 0} />
              <XPBar points={progress?.totalPoints || 0} level={level} />
            </div>
          </div>
        </div>
        
        {/* Tab navigation */}
        <div className="flex mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'discover' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('discover')}
          >
            Découvrir
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'challenges' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('challenges')}
          >
            Défis
          </button>
          <button 
            className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profil
          </button>
        </div>
        
        {/* Tab content */}
        {activeTab === 'discover' && (
          <div>
            {/* Featured content */}
            <div className="mb-8">
              <div 
                className="relative overflow-hidden rounded-2xl shadow-lg mb-6 flex items-end h-48 p-6"
                style={{ 
                  backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div className="z-10 text-white">
                  <h2 className="text-xl font-bold mb-1">Parcourez les îles du bien-être</h2>
                  <p className="text-white text-opacity-80 mb-3">Découvrez les parcours thématiques pour améliorer votre équilibre</p>
                </div>
              </div>
            </div>
            
            {/* Islands */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🏝️</span> 
                Parcours bien-être
              </h2>
              
              <div className="space-y-4">
                {ISLANDS.map((island, index) => {
                  const islandProgressData = progress?.islandProgress?.[island.id] || { progress: 0, completedModules: 0 };
                  
                  return (
                    <IslandCard 
                      key={island.id}
                      island={island}
                      progress={islandProgressData.progress || 0}
                      completedModules={islandProgressData.completedModules || 0}
                      isUnlocked={true} // All islands unlocked for demo
                      onClick={() => setSelectedIsland(island)}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Quick exercises */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">⚡</span> 
                Exercices rapides
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {EXERCISES.map(exercise => (
                  <QuickExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onStart={() => {
                      // Exercise would open a modal in the complete version
                      alert(`Exercice de ${exercise.duration} : ${exercise.title}\n\nCette fonctionnalité serait complétée dans la version finale.`);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Challenges tab */}
        {activeTab === 'challenges' && (
          <div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-5 text-white mb-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl mr-3">
                  🔥
                </div>
                <div>
                  <h2 className="font-bold text-lg mb-1">Défis quotidiens</h2>
                  <p className="text-blue-100">
                    Complétez ces défis pour améliorer votre bien-être et maintenir votre série
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {CHALLENGES.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleCompleteChallenge}
                  isCompleted={progress?.completedChallenges?.includes(challenge.id)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div>
            <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
              <div className="flex items-start">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl mr-4">
                  🧘
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Votre Profil</h2>
                  <p className="text-gray-600 mb-2">Suivez votre progrès et parcours bien-être</p>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center mr-2">
                      <span className="mr-1">⭐</span> Niveau {level}
                    </div>
                    <div className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                      <span className="mr-1">🔥</span> Série de {progress?.streak || 0} jours
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User stats */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📊</span> Vos statistiques
              </h2>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Total points</div>
                    <div className="text-xl font-bold text-blue-600">{progress?.totalPoints || 0}</div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Modules complétés</div>
                    <div className="text-xl font-bold text-green-600">
                      {Object.keys(progress?.completedModules || {}).length}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Badges obtenus</div>
                    <div className="text-xl font-bold text-purple-600">
                      {progress?.badges?.length || 0}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Défis complétés</div>
                    <div className="text-xl font-bold text-orange-600">
                      {progress?.completedChallenges?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Badges collection */}
            {progress?.badges && progress.badges.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">🏆</span> Vos badges
                </h2>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {progress.badges.map(badge => (
                      <Badge
                        key={badge.id}
                        icon={badge.icon}
                        name={badge.name}
                        description={badge.description}
                        iconBgColor="#FFC107"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-blue-50 p-4 rounded-xl">
                <p className="text-blue-800 flex items-center">
                  <span className="text-xl mr-2">🏆</span>
                  Complétez des modules pour gagner vos premiers badges !
                </p>
              </div>
            )}
            
            {/* Settings */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">⚙️</span> Paramètres
              </h2>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <button
                  className="w-full py-3 text-left px-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center"
                  onClick={() => {
                    if(window.confirm("Êtes-vous sûr de vouloir réinitialiser votre progression ?")) {
                      StorageService.resetAllData();
                      window.location.reload();
                    }
                  }}
                >
                  <span>Réinitialiser ma progression</span>
                  <span>🔄</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-2 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex justify-between">
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'discover' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('discover')}
            >
              <span className="text-2xl">🧭</span>
              <span className="text-xs mt-1">Découvrir</span>
            </button>
            
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'challenges' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('challenges')}
            >
              <span className="text-2xl">🔥</span>
              <span className="text-xs mt-1">Défis</span>
            </button>
            
            <button 
              className={`flex flex-col items-center px-4 py-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs mt-1">Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IkigaiApp;