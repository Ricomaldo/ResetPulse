---
created: '2026-07-30'
updated: '2026-07-30'
status: active
---

# Credits — sons de fin de séance

Curation sons (branche `sons-curation`, retour Eric : "rigolote, ne fait pas
rêver" → refonte complète). Tous les fichiers viennent de Freesound.org,
récupérés via leur preview haute qualité (CDN public, format mp3 128kbps),
puis convertis en `.wav` mono 44.1kHz et normalisés en crête à -1 dBFS
(ffmpeg `volumedetect` + gain calculé) pour un niveau perçu homogène à
volume device constant. La conversion de format ne change rien à la
licence : elle porte sur le son (œuvre), pas sur l'encodage du fichier.

Convention de nom : `{id-freesound}__{auteur}__{slug}.wav`

## Gratuits (isPremium: false — un par famille)

| Fichier | Son | Famille | Auteur | Licence | Source |
|---|---|---|---|---|---|
| `270404__littlerobotsoundfactory__jingle-achievement.wav` | Jingle Achievement (défaut) | energy | LittleRobotSoundFactory | CC-BY 4.0 | [freesound.org/s/270404](https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/) |
| `271370__inoshirodesign__singing-bowl-strike.wav` | Singing bowl strike | calm | inoshirodesign | CC0 | [freesound.org/s/271370](https://freesound.org/people/inoshirodesign/sounds/271370/) |
| `373053__sgossner__contrabass-pizzicato-c2.wav` | Contrabass pizzicato C2 (pack VSCO2 CE) | deep | sgossner (interprète : Brittany Karlson) | CC0 | [freesound.org/s/373053](https://freesound.org/people/sgossner/sounds/373053/) |
| `331047__foochie_foochie__kalimba-c-note.wav` | Kalimba (C-note) | focus | foochie_foochie | CC0 | [freesound.org/s/331047](https://freesound.org/people/foochie_foochie/sounds/331047/) |

## Ambiances (isPremium: true — données seulement, gating au chantier 3b)

| Fichier | Son | Famille | Auteur | Licence | Source |
|---|---|---|---|---|---|
| `495674__jack_urbanski__vibraphone-chord.wav` | Vibraphone Chord | calm | jack_urbanski | CC0 | [freesound.org/s/495674](https://freesound.org/people/jack_urbanski/sounds/495674/) |
| `577692__joesh2__marimba-c3.wav` | Marimba C3 (sec) | deep | joesh2 | CC0 | [freesound.org/s/577692](https://freesound.org/people/joesh2/sounds/577692/) |
| `401722__pogmothoin__marimba-ascending.wav` | Marimba do-ré-mi-fa-sol | focus | pogmothoin | CC-BY 4.0 | [freesound.org/s/401722](https://freesound.org/people/pogmothoin/sounds/401722/) |
| `352666__foolboymedia__up-chime-2.wav` | Up Chime 2 | energy | FoolBoyMedia | CC-BY 4.0 | [freesound.org/s/352666](https://freesound.org/people/FoolBoyMedia/sounds/352666/) |
| `109662__grunz__success.wav` | Success (glissando) | energy | grunz | CC-BY 3.0 | [freesound.org/s/109662](https://freesound.org/people/grunz/sounds/109662/) |

## Attribution requise (CC-BY)

Pour les 4 fichiers en CC-BY (jingle_achievement, marimba_ascending, up_chime,
success_glissando), l'attribution nommée ci-dessus (auteur + lien source)
suffit à la licence. Les fichiers CC0 n'imposent aucune attribution légale
mais sont créditée ici par transparence.

## Historique

L'ancienne sélection (10 sons "kitchen/bell" type minuteur de cuisine —
microwave-ping, kitchen-timer, toaster-bell, etc.) a été entièrement retirée
(retour Eric : trop "rigolote", ne correspond pas au public neuroatypique
visé). Aucun utilisateur du reborn 3.0 n'était concerné (app pas encore
buildable en release store à ce stade) — retrait sans coût de migration.
