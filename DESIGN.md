# DESIGN.md — Salon Mimi

## Color Strategy

**Committed** — le fond sombre `nuit` porte 80% des surfaces, l'ocre est l'accent actif.

| Rôle        | Token Tailwind | Valeur hex | Usage |
|-------------|---------------|------------|-------|
| Fond principal | `nuit`   | `#1A0D05`  | bg body, sections principales |
| Fond carte   | `brun`    | `#2C1508`  | cards, panneaux secondaires |
| Fond panneau | `panneau` | `#3D1A06`  | éléments surélevés |
| Accent primaire | `ocre` | `#C17B3F`  | CTA, liens actifs, emphases |
| Accent secondaire | `or` | `#D4A843`  | hover ocre, badges |
| Vert action  | `vert`    | `#1F7A4E`  | bouton WhatsApp uniquement |
| Fond clair   | `fond`    | `#F6EFE3`  | sections inversées (rare) |

**Règle** : le blanc pur n'existe pas. Le texte blanc est `text-white` (OK dans Tailwind) mais les surfaces claires utilisent `fond`. L'ocre ne dépasse pas 15% de la surface visible sauf sur les CTA.

## Theme

**Dark.** Scène physique : une femme regarde le site sur son téléphone le soir après le travail, elle cherche un salon pour le week-end. Le fond sombre évoque le soir marocain, la chaleur des intérieurs, pas l'obscurité froide d'un outil tech.

## Typography

| Rôle | Police | Classe Tailwind | Usage |
|------|--------|-----------------|-------|
| Titres éditoriaux | Playfair Display | `font-playfair` | H1, H2 hero |
| Corps / UI | Inter | `font-inter` | texte courant, nav, formulaires |
| Emphase culturelle | Georgia | `font-georgia` | accroches courtes, citations |

**Hiérarchie** :
- H1 hero : `clamp(2.5rem, 5vw, 4rem)`, Playfair, weight 700
- H2 sections : ~2rem, Playfair
- Body : 14–16px, Inter, leading-relaxed
- Labels/CTA : 10px, tracking-[3px], uppercase, Inter

**Longueur ligne** : max 65ch sur les blocs de texte longs.

## Layout

- Hero : split 50/50 — texte gauche, grille photo 3 colonnes droite (scroll infini)
- Sections : padding variable, pas de container uniforme
- Mobile : colonne unique, grille photo masquée, hero full-width
- Border-radius : `rounded-xl` (12px) sur les photos, `rounded-full` sur les boutons

## Motion

- Colonnes photo hero : scroll continu CSS (`translateY`), 3 vitesses différentes (22s/28s/19s)
- Boutons : `hover:-translate-y-0.5` + transition couleur, pas d'animation layout
- Pas de bounce, pas d'elastic

## Components

### Boutons
- **Primaire** : `bg-ocre hover:bg-or text-white rounded-full px-7 py-4 text-[10px] tracking-[3px] uppercase`
- **Secondaire** : `border border-white/20 hover:border-ocre hover:text-ocre rounded-full`
- **WhatsApp** : `bg-vert text-white rounded-full` — usage unique, pas détourné

### Navigation
- Fixe, fond `nuit`, hauteur 57px
- Logo texte + hamburger mobile
- CTA "RDV" en ocre dans la nav

### Formulaires (admin + réservation)
- Fond `brun` ou `panneau`
- Inputs avec `text-gray-900` sur fond clair — règle critique
- Labels `text-white/70`, focus ring ocre

## Absolute Bans (projet)

- Pas de `border-left` coloré comme accent décoratif
- Pas de gradient text
- Pas de glassmorphism décoratif
- Pas d'em dash dans le copy
- Pas de `@import` Google Fonts dans CSS — utiliser `next/font/google`
