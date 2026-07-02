# CONTEXT.md Format

## Structure

```md
# {Context Name}

{Une ou deux phrases qui décrivent ce contexte et pourquoi il existe.}

## Language

**Order**:
{Une définition courte du terme, en une ou deux phrases.}
_Avoid_: Purchase, transaction

**Invoice**:
Une demande de paiement envoyée à un client après livraison.
_Avoid_: Bill, payment request

**Customer**:
Une personne ou organisation qui passe des commandes.
_Avoid_: Client, buyer, account
```

## Rules

- Sois opinionated : quand plusieurs mots existent pour le même concept, choisis le meilleur terme canonique et mets les autres dans `_Avoid_`.
- Garde les définitions serrées : une ou deux phrases maximum. Définis ce que le concept EST, pas tout ce qu'il fait.
- N'inclus que les termes spécifiques au contexte du projet. Les concepts généraux de programmation n'ont pas leur place ici, même si le projet les utilise beaucoup.
- Avant d'ajouter un terme, demande-toi : est-ce un concept propre à ce contexte, ou un concept général de programmation ? Seul le premier cas appartient à `CONTEXT.md`.
- Regroupe les termes sous des sous-titres seulement quand des familles naturelles émergent. Si tout appartient à un même ensemble cohérent, une liste plate suffit.

## Single vs multi-context repos

Single context, le cas le plus courant : un seul `CONTEXT.md` à la racine du repository.

Multiple contexts : un `CONTEXT-MAP.md` à la racine liste les contextes, leurs emplacements, et leurs relations :

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

Le skill infère la structure à utiliser :

- Si `CONTEXT-MAP.md` existe, lis-le pour trouver les contextes.
- Si seul un `CONTEXT.md` racine existe, considère que le repository a un seul contexte.
- Si aucun des deux n'existe, crée un `CONTEXT.md` racine paresseusement quand le premier terme est résolu.

Quand plusieurs contextes existent, infère celui qui correspond au sujet courant. Si ce n'est pas clair, demande.
