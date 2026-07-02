# ADR Format

Les ADR vivent dans `docs/adr/` et utilisent une numérotation séquentielle : `0001-slug.md`, `0002-slug.md`, etc.

Crée le dossier `docs/adr/` paresseusement : uniquement quand le premier ADR est nécessaire.

## Template

```md
# {Short title of the decision}

{1 à 3 phrases : quel est le contexte, qu'avons-nous décidé, et pourquoi.}
```

C'est suffisant. Un ADR peut être un simple paragraphe. La valeur est dans le fait d'enregistrer qu'une décision a été prise et pourquoi, pas dans le remplissage de sections.

## Optional sections

N'inclus ces sections que lorsqu'elles apportent une vraie valeur. La plupart des ADR n'en auront pas besoin.

- Status frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — utile quand les décisions sont revisitées.
- Considered Options — seulement quand les alternatives rejetées méritent d'être mémorisées.
- Consequences — seulement quand des effets aval non évidents doivent être signalés.

## Numbering

Scanne `docs/adr/` pour trouver le numéro existant le plus élevé, puis incrémente-le de 1.

## When to offer an ADR

Ces trois critères doivent être vrais :

1. Hard to reverse — changer d'avis plus tard aurait un coût significatif.
2. Surprising without context — un futur lecteur regarderait le code et se demanderait pourquoi ce choix a été fait.
3. Real trade-off — il existait de vraies alternatives, et le choix retenu répond à des raisons spécifiques.

Si la décision est facile à inverser, ignore-la. Si elle n'est pas surprenante, personne ne se demandera pourquoi. S'il n'y avait aucune vraie alternative, il n'y a rien à documenter au-delà de “on a fait le choix évident”.

### What qualifies

- Architectural shape : “We're using a monorepo.”, “The write model is event-sourced, the read model is projected into Postgres.”
- Integration patterns between contexts : “Ordering and Billing communicate via domain events, not synchronous HTTP.”
- Technology choices that carry lock-in : database, message bus, auth provider, deployment target. Pas chaque librairie, seulement celles qu'il serait coûteux de remplacer.
- Boundary and scope decisions : “Customer data is owned by the Customer context; other contexts reference it by ID only.” Les non explicites sont aussi précieux que les oui.
- Deliberate deviations from the obvious path : “We're using manual SQL instead of an ORM because X.” Tout ce qu'un lecteur raisonnable supposerait autrement.
- Constraints not visible in the code : “We can't use AWS because of compliance requirements.”, “Response times must be under 200ms because of the partner API contract.”
- Rejected alternatives when the rejection is non-obvious : si GraphQL a été envisagé puis REST choisi pour des raisons subtiles, documente-le. Sinon quelqu'un reproposera GraphQL dans six mois.
