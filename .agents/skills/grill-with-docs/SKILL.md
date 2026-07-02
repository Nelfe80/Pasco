---
name: questionne-avec-docs
description: Session de questions exigeantes qui confronte un plan au modèle de domaine existant, affine la terminologie et met à jour la documentation (CONTEXT.md, ADR) en cours de route. À utiliser quand l'utilisateur veut tester la robustesse d'un plan par rapport au vocabulaire du projet et aux décisions documentées avant l'implémentation.
---

Réponds dans la langue de l'utilisateur.

Interviewe l'utilisateur de manière exigeante sur chaque aspect du plan jusqu'à atteindre une compréhension partagée. Parcours chaque branche de l'arbre de décision, en résolvant les dépendances entre décisions une par une. Pour chaque question, donne aussi ta réponse recommandée.

Pose les questions une par une, et attends le retour de l'utilisateur avant de continuer.

Si une question peut être résolue en explorant le codebase, explore le codebase au lieu de demander à l'utilisateur.

Ne commence pas l'implémentation pendant cette session, sauf si l'utilisateur demande explicitement de passer du grill à l'implémentation.

## Connaissance du domaine

Pendant l'exploration du codebase, cherche aussi la documentation existante.

### Structure des fichiers

La plupart des repositories ont un seul contexte :

```txt
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

Si un `CONTEXT-MAP.md` existe à la racine, le repository contient plusieurs contextes. Cette map indique où chaque contexte se trouve :

```txt
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← décisions système
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← décisions propres au contexte
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Crée les fichiers de manière paresseuse : uniquement quand tu as quelque chose à écrire. Si aucun `CONTEXT.md` n'existe, crée-le quand le premier terme est réellement résolu. Si aucun `docs/adr/` n'existe, crée-le seulement quand le premier ADR est nécessaire.

## Pendant la session

### Comparer au glossaire

Quand l'utilisateur emploie un terme qui contredit le langage déjà présent dans `CONTEXT.md`, signale-le immédiatement.

Exemple :

> Le glossaire définit "cancellation" comme X, mais tu sembles vouloir dire Y. Lequel doit être la vérité métier ?

### Clarifier le langage flou

Quand l'utilisateur emploie des termes vagues, surchargés ou ambigus, propose un terme canonique plus précis.

Exemple :

> Tu dis "account". Est-ce que tu veux dire `Customer` ou `User` ? Ce sont deux concepts différents.

### Discuter de scénarios concrets

Quand des relations métier sont discutées, challenge-les avec des scénarios concrets. Invente des scénarios qui testent les cas limites et forcent l'utilisateur à préciser les frontières entre concepts.

### Recouper avec le code

Quand l'utilisateur affirme qu'une chose fonctionne d'une certaine manière, vérifie si le code est d'accord. Si tu trouves une contradiction, fais-la remonter explicitement.

Exemple :

> Le code annule des `Order` entiers, mais tu viens de dire que l'annulation partielle est possible. Lequel est correct ?

### Mettre à jour CONTEXT.md au fil de l'eau

Quand un terme est résolu, mets à jour `CONTEXT.md` immédiatement. Ne garde pas ces mises à jour pour la fin : capture-les au fil de la discussion.

Utilise le format décrit dans `references/CONTEXT-FORMAT.md`.

`CONTEXT.md` doit être totalement dépourvu de détails d'implémentation. Ne traite pas `CONTEXT.md` comme une spécification, un brouillon, un scratchpad ou un endroit où stocker des décisions techniques. C'est un glossaire, rien d'autre.

### Proposer des ADR avec parcimonie

Ne propose de créer un ADR que lorsque les trois critères sont vrais :

1. Hard to reverse — changer d'avis plus tard aurait un coût significatif.
2. Surprising without context — un futur lecteur se demanderait pourquoi ce choix a été fait.
3. Real trade-off — il existait de vraies alternatives, et le choix retenu répond à des contraintes précises.

Si l'un des trois critères manque, ne propose pas d'ADR.

Utilise le format décrit dans `references/ADR-FORMAT.md`.
