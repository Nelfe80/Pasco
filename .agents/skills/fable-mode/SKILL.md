---
name: mode-fable
description: Impose une discipline d'exécution par étapes sur les tâches complexes. À déclencher lorsque l'utilisateur demande "fais cela minutieusement", "sois systématique", "mode travail profond" ou lorsque la tâche s'étend objectivement sur plusieurs fichiers/sessions.
---

# Mode Fable

Cette compétence définit une discipline d'exécution pour les travaux complexes : décomposer avant d'agir, déléguer lorsque l'environnement le permet, vérifier à l'aide de tests pouvant échouer, et s'auto-critiquer avant la livraison.

Note sur la nature de cette compétence : Elle structure la *procédure* suivie par le modèle. Elle ne modifie pas les capacités fondamentales du modèle. La cohérence sur les tâches longues et l'auto-correction authentique dépendent des paramètres du modèle, pas d'une consigne. Sur un modèle déjà performant dans ces domaines, elle renforce les bonnes habitudes. Sur un modèle plus limité, elle impose une structure qu'il aurait sinon ignorée, mais elle ne peut pas élever sa capacité de raisonnement maximale. Considérez ceci comme une check-list, pas comme une greffe de compétences.

## Quand ne PAS utiliser ceci

Si une tâche présente une approche correcte évidente et tient en une seule étape, réalisez-la directement et ignorez cette boucle. Structurer une tâche triviale est une perte de temps et complique inutilement la réponse. Cette boucle n'en vaut la peine que lorsqu'une tentative directe risque de manquer un aspect important.

## Boucle principale

La boucle est identique pour tous les domaines. Seul l'artéfact de vérification à l'étape 3 change selon le domaine (voir les Modèles spécifiques par domaine).

**1. Carte des étapes (avant de modifier quoi que ce soit)**
Rédigez le plan complet des étapes avant de commencer. Numérotez les étapes. Incluez un court résultat attendu pour chacune. C'est ainsi que vous éviterez de découvrir à l'étape 7 que vous avez fait une mauvaise hypothèse à l'étape 2. Mettez à jour la carte lorsque ce que vous apprenez invalide ce que vous aviez planifié. La carte est un document vivant, pas un contrat figé.

Chaque étape doit produire un artéfact vérifiable. Si une étape ne produit rien de vérifiable, fusionnez-la avec la suivante.

Exemple de format :
```
Étape 1 : [Nom] → [Résultat attendu]
Étape 2 : [Nom] → [Résultat attendu]
...
```

**2. Déléguer le travail indépendant (si l'environnement le permet)**
Vérifiez d'abord si des outils de sous-agent/Agent existent dans l'environnement actuel. Si ce n'est pas le cas (par exemple, une simple interface de chat sans outil Agent), exécutez les étapes séquentiellement et passez à l'étape 3.

Si des outils de sous-agent sont disponibles et que l'étape N et l'étape M ne dépendent pas l'une de l'autre, lancez-les en parallèle. Chaque sous-agent doit recevoir : sa tâche spécifique, ce qu'il doit produire, l'emplacement de sauvegarde des résultats, et tout contexte pertinent issu des étapes précédentes.

Bonne délégation : "recherche X pendant que je fais Y", "traite ces 3 fichiers", "vérifie ceci de manière indépendante". Mauvaise délégation : diviser une pensée cohérente uniquement pour utiliser des sous-agents.

Gardez la délégation sur un seul niveau par défaut : un sous-agent lancé exécute ses étapes séquentiellement plutôt que de lancer ses propres sous-agents. L'imbrication multiplie le coût et disperse le contexte — n'autorisez un second niveau que lorsqu'une sous-partie nécessite clairement sa propre répartition.

**3. Vérifier avec un test qui peut échouer**
Chaque étape doit définir une condition de réussite validée par un artéfact externe. Vérifications acceptables :
- un test qui s'exécute et réussit
- un fichier ou un résultat dont l'existence sous la forme attendue est prouvée
- une source réellement récupérée et lue, non supposée
- un résultat comparé à la spécification initiale via un diff

"J'ai vérifié et cela semble correct" n'est pas une vérification. Si une étape n'a véritablement aucun test pouvant échouer, dites-le explicitement et marquez son résultat comme non vérifié afin que le manque de validation soit visible pour la suite.

Le coût de la correction d'une erreur à l'étape 3 est minime ; à l'étape 8, il est catastrophique.

Si une correction à l'étape N invalide le résultat d'une étape antérieure, réexécutez la vérification de cette étape précédente avant de continuer. La boucle avance et recule.

**4. S'auto-critiquer avant la livraison**
Avant de présenter le résultat final, lisez-le comme le ferait un relecteur sceptique. Cherchez une faiblesse ou une limitation réelle ; s'il en existe une, corrigez-la ou signalez-la à l'utilisateur. Si la vérification ne révèle rien, dites-le simplement — ne fabriquez pas de faiblesse pour satisfaire au rituel. L'étape 3 est la vérification qui peut échouer. L'étape 4 est le jugement sur ce qui reste perfectible après la réussite de la vérification.

Avant de signaler un problème, vérifiez qu'il existe réellement. Utilisez grep, diff, exécutez le code ou vérifiez directement la source. Ne signalez jamais un problème qui n'a pas été confirmé. Un signalement non vérifié (une alerte levée parce que la preuve n'a pas été trouvée, plutôt que parce qu'un défaut a été identifié) est en soi une erreur : elle crée un doute injustifié et pousse l'utilisateur à chercher des problèmes inexistants. L'absence de preuve n'est pas une conclusion. Confirmez, puis signalez.

---

## Modèles spécifiques par domaine

Chaque domaine ci-dessous est une application de l'étape 3 : il définit le test pouvant échouer adapté au travail.

### Ingénierie logicielle
- Lisez l'intégralité de la section de code concernée avant d'écrire la moindre ligne
- Rédigez des tests avant (ou en même temps que) l'implémentation, pas après
- Pour les modifications importantes : planifiez le diff, puis exécutez-le
- Test pouvant échouer : les tests s'exécutent ; les cas d'erreur sont testés, pas seulement le cas nominal

### Recherche / Travail de connaissance
- Rassemblez les sources avant de synthétiser. N'écrivez pas pendant vos recherches
- Pour chaque affirmation importante : quelle est la preuve ? qu'est-ce qui l'infirmerait ?
- Distinguez les faits confirmés des déductions ; signalez explicitement ces dernières
- Test pouvant échouer : chaque affirmation essentielle renvoie à une source réellement lue

### Analyse de données
- Comprenez la structure des données avant de rédiger toute analyse
- Énoncez votre hypothèse avant de calculer, pas après avoir vu les chiffres
- Recherchez d'abord les problèmes évidents de qualité des données (valeurs nulles, doublons, anomalies)
- Test pouvant échouer : des assertions de qualité des données sont exécutées sur les données réelles et réussissent

### Tâches longues / multi-sessions
- Tenez un journal de travail : décisions prises, pourquoi, ce qui a été tenté et a échoué
- Au début de chaque reprise, relisez le journal de travail avant de faire quoi que ce soit
- Définissez des critères de finalisation dès le départ afin de savoir quand vous arrêter
- Test pouvant échouer : les critères de finalisation sont écrits et testables, pas basés sur un sentiment

---

## Règles opérationnelles

**Seuil d'avertissement.** Au cours d'une exécution multi-étapes, des préoccupations mineures s'accumulent sans valoir la peine de s'arrêter individuellement. Tenez-en le compte. À trois avertissements accumulés, arrêtez-vous et présentez-les tous à l'utilisateur avant de continuer. Trois petits détails allant dans le même sens signalent généralement un vrai problème méritant une décision.

**Sécurité de recherche et remplacement.** Lors de l'édition de fichiers avec sed (ou tout remplacement de sous-chaîne), ciblez toujours les limites de mots pour éviter d'altérer les mots composés — par exemple, remplacer `fin` seul risque d'altérer `définir` en un mot corrompu. Utilisez `\bmot\b` au lieu de `mot`. Après tout passage de sed sur un fichier, recherchez par grep les mots collés ou malformés avant de présenter le résultat. Un remplacement qui corrompt silencieusement les jetons voisins est l'erreur la plus fréquente lors de l'édition de fichiers.

---

## Ce que cette compétence ne fait pas

Elle ne rend pas le modèle sous-jacent plus intelligent. Le raisonnement complexe, la synthèse novatrice et l'expertise du domaine dépendent toujours du modèle. Cette compétence structure *la manière* dont un modèle résout un problème : l'approche, la discipline, les habitudes de vérification. Elle ne modifie pas les capacités brutes.

Lorsqu'une tâche dépasse réellement les capacités du modèle, signalez-le plutôt que de produire un résultat faux mais plausible.
