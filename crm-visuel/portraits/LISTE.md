# Portraits des démos (personnes fictives)

Photos de visage générées par IA pour les personnes **inventées** des deux démos. Aucune photo d'une vraie personne.

## Comment les ajouter
1. Générer le portrait (description ci-dessous), puis le recadrer en **carré 512 × 512 px**, visage centré (front en haut à environ 15 %, épaules visibles), fond uni clair.
2. L'enregistrer en **JPEG** (qualité 80, moins de 60 ko) sous `crm-visuel/portraits/<slug>.jpg`.
3. Ajouter le slug dans `crm-visuel/portraits/portraits.json`, par exemple : `{ "disponibles": ["claire-dumont", "lea-bonnet"] }`.

Tant qu'un slug n'est pas dans `portraits.json`, la démo garde l'avatar dessiné (aucune image absente n'est demandée). Une photo listée apparaît partout : cartes RH, fiches, planning Équipe, candidats, anciens salariés, Moniteurs, Élèves, et dans le CV en PDF.

Le slug = le nom en minuscules, sans accents, espaces remplacés par des tirets (« Léa Bonnet » donne `lea-bonnet`).

Les âges sont approximatifs, déduits du parcours fictif (ancienneté, contrat, études).

## Supermarché « Hyper Modèle » : les 22 salariés
Tenue : polo bleu marine à l'enseigne pour le magasin (caisses, rayons, accueil, réserve) ; tenue de bureau pour la direction, les RH et la comptabilité.

| Slug | Personne | Genre | Âge | Poste et tenue |
|---|---|---|---|---|
| `claire-dumont` | Claire Dumont | femme | 45-50 ans | Directrice du magasin, veste de tailleur, chemisier |
| `mehdi-larbi` | Mehdi Larbi | homme | 35-40 ans | Chef de rayon frais, polo marine et gilet polaire |
| `laura-pineau` | Laura Pineau | femme | 35 ans | Cheffe de rayon épicerie, polo marine |
| `kevin-moulin` | Kevin Moulin | homme | 28-30 ans | Employé libre-service, polo marine |
| `sarah-benoit` | Sarah Benoit | femme | 26-28 ans | Employée libre-service (boissons), polo marine |
| `hugo-lefort` | Hugo Lefort | homme | 22-24 ans | Employé libre-service en CDD, polo marine |
| `ines-haddad` | Inès Haddad | femme | 20 ans | Apprentie BTS, polo marine |
| `paul-garnier` | Paul Garnier | homme | 45-50 ans | Réceptionnaire, cariste, polo marine et gilet de sécurité |
| `yasmine-diallo` | Yasmine Diallo | femme | 28-30 ans | Réceptionnaire, polo marine et gilet de sécurité |
| `nathalie-roy` | Nathalie Roy | femme | 45 ans | Hôtesse d'accueil, polo marine, foulard |
| `julien-faivre` | Julien Faivre | homme | 30-35 ans | Hôte d'accueil, polo marine |
| `amandine-petit` | Amandine Petit | femme | 35-40 ans | Hôtesse de caisse référente, polo marine |
| `thomas-morel` | Thomas Morel | homme | 22-25 ans | Hôte de caisse, polo marine |
| `lea-bonnet` | Léa Bonnet | femme | 30-35 ans | Hôtesse de caisse, polo marine |
| `sofiane-kaci` | Sofiane Kaci | homme | 28-30 ans | Hôte de caisse, polo marine |
| `emma-lucas` | Emma Lucas | femme | 25 ans | Hôtesse de caisse en remplacement, polo marine |
| `romain-gilles` | Romain Gilles | homme | 25-28 ans | Hôte de caisse, polo marine |
| `chloe-vasseur` | Chloé Vasseur | femme | 20-22 ans | Renfort saisonnier en caisse, polo marine |
| `antoine-brun` | Antoine Brun | homme | 20 ans | Étudiant, hôte de caisse à temps partiel, polo marine |
| `manon-riviere` | Manon Riviere | femme | 17-18 ans | Apprentie CAP, hôtesse de caisse, polo marine |
| `sophie-marchand` | Sophie Marchand | femme | 40-45 ans | Responsable RH, tenue de bureau (blazer) |
| `marc-lemoine` | Marc Lemoine | homme | 50 ans | Comptable, chemise, lunettes possibles |

## Supermarché : les 11 candidats
Tenue civile soignée, comme une photo de CV.

| Slug | Personne | Genre | Âge | Poste visé (profil) |
|---|---|---|---|---|
| `camille-royer` | Camille Royer | femme | 20-22 ans | Hôtesse de caisse |
| `bastien-leroux` | Bastien Leroux | homme | 25 ans | Employé libre-service, rayon frais |
| `nadia-ferreira` | Nadia Ferreira | femme | 30 ans | Réceptionnaire (magasinière cariste) |
| `olivier-masson` | Olivier Masson | homme | 35 ans | Adjoint au chef de rayon épicerie |
| `justine-carre` | Justine Carré | femme | 22-24 ans | Hôtesse de caisse (vendeuse) |
| `maxime-perrin` | Maxime Perrin | homme | 24-26 ans | Employé libre-service, rayon frais |
| `elodie-gaillard` | Élodie Gaillard | femme | 30-35 ans | Adjointe au chef de rayon épicerie |
| `theo-marchetti` | Théo Marchetti | homme | 24-26 ans | Réceptionnaire (préparateur de commandes) |
| `aurelie-blanchard` | Aurélie Blanchard | femme | 35-40 ans | Hôtesse de caisse (employée polyvalente) |
| `karim-benali` | Karim Benali | homme | 25-30 ans | Employé libre-service, rayon frais (voir la remarque plus bas) |
| `lucie-fabre` | Lucie Fabre | femme | 19-20 ans | Hôtesse de caisse (étudiante) |

## Supermarché : les 8 anciens salariés
Tenue civile.

| Slug | Personne | Genre | Âge | Ancien poste |
|---|---|---|---|---|
| `gerard-fontaine` | Gérard Fontaine | homme | 62-64 ans | Chef de rayon fruits et légumes, retraité |
| `pauline-arnaud` | Pauline Arnaud | femme | 30 ans | Hôtesse de caisse, en reconversion aide-soignante |
| `lucas-germain` | Lucas Germain | homme | 19-20 ans | Employé libre-service saisonnier |
| `fatou-camara` | Fatou Camara | femme | 40 ans | Réceptionnaire, mutée dans un autre magasin |
| `damien-hubert` | Damien Hubert | homme | 35-40 ans | Adjoint au chef de rayon épicerie, créateur d'entreprise |
| `margaux-lemaire` | Margaux Lemaire | femme | 25 ans | Hôtesse d'accueil en CDD |
| `steven-morin` | Steven Morin | homme | 28 ans | Employé libre-service |
| `clara-joubert` | Clara Joubert | femme | 21-22 ans | Ancienne apprentie BTS, étudiante |

## Auto-école Modèle : l'équipe
| Slug | Personne | Genre | Âge | Poste et tenue |
|---|---|---|---|---|
| `karim-benali` | Karim Benali | homme | 35-40 ans | Moniteur (permis B et moto), polo bleu foncé de l'auto-école |
| `sophie-lambert` | Sophie Lambert | femme | 35 ans | Monitrice permis B, polo bleu foncé |
| `thomas-renaud` | Thomas Renaud | homme | 45 ans | Moniteur permis B et remorque, polo bleu foncé |
| `nadia-kaci` | Nadia Kaci | femme | 30 ans | Monitrice (boîte automatique), polo bleu foncé |
| `julie-moreau` | Julie Moreau | femme | 30-35 ans | Secrétaire de l'agence, tenue de bureau (sert au sélecteur « Voir en tant que ») |
| `helene-carpentier` | Hélène Carpentier | femme | 45-50 ans | Gérante, tenue de bureau (sert au sélecteur « Voir en tant que ») |

## Auto-école : les 16 élèves (permis B)
Tenue civile décontractée (sweat, veste, tee-shirt).

| Slug | Personne | Genre | Âge |
|---|---|---|---|
| `lea-martin` | Léa Martin | femme | 18 ans |
| `hugo-durand` | Hugo Durand | homme | 19 ans |
| `ines-toumi` | Inès Toumi | femme | 17 ans (conduite accompagnée) |
| `yanis-petit` | Yanis Petit | homme | 20 ans |
| `chloe-roux` | Chloé Roux | femme | 18 ans |
| `lucas-girard` | Lucas Girard | homme | 23 ans |
| `manon-faure` | Manon Faure | femme | 17 ans |
| `rayan-saidi` | Rayan Saidi | homme | 19 ans (fait aussi le plateau moto) |
| `emma-vidal` | Emma Vidal | femme | 21 ans |
| `noah-colin` | Noah Colin | homme | 18 ans (passe l'examen aujourd'hui) |
| `jade-lefevre` | Jade Lefèvre | femme | 25 ans (forfait boîte automatique) |
| `adam-bernard` | Adam Bernard | homme | 19 ans |
| `sarah-nicolas` | Sarah Nicolas | femme | 30 ans |
| `tom-henry` | Tom Henry | homme | 18 ans |
| `lina-amrani` | Lina Amrani | femme | 17 ans |
| `enzo-marchal` | Enzo Marchal | homme | 20 ans |

## Remarque
« Karim Benali » est à la fois un candidat du supermarché et un moniteur de l'auto-école : avec un seul fichier `karim-benali.jpg`, il aurait le même visage dans les deux démos. Soit on garde un seul portrait (homme de 30-35 ans, tenue neutre), soit on renomme le candidat du supermarché dans `grande-surface/rh.js` avant de générer les photos.
