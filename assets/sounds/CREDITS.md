---
created: '2026-07-30'
updated: '2026-07-30'
status: active
---

# Credits — sons de fin de séance

Curation sons (branche `sons-curation`, retour Eric : "rigolote, ne fait pas
rêver" → refonte partielle, 3 survivants + 9 nouveaux). Tous les fichiers
viennent de Freesound.org, récupérés via leur preview haute qualité (CDN
public, format mp3 128kbps pour les 9 nouveaux ; fichiers originaux déjà
présents dans le repo pour les 3 legacy), puis (re)convertis en `.wav` mono
44.1kHz et normalisés en crête à -1 dBFS (ffmpeg `volumedetect` + gain
calculé) pour un niveau perçu homogène à volume device constant. La
conversion de format ne change rien à la licence : elle porte sur le son
(œuvre), pas sur l'encodage du fichier.

Convention de nom : `{id-freesound}__{auteur}__{slug}.wav`

## Gratuits (isPremium: false)

| Fichier | Son | Auteur | Licence | Source |
|---|---|---|---|---|
| `634089__aj_heels__timercomplete01.wav` | Accompli / Done (défaut) | aj_heels | **CC-BY 4.0** | [freesound.org/s/634089](https://freesound.org/people/aj_heels/sounds/634089/) |
| `609725__theplax__microwave-ping.wav` | Ping | theplax | **CC-BY 4.0** | [freesound.org/s/609725](https://freesound.org/people/theplax/sounds/609725/) |
| `271370__inoshirodesign__singing-bowl-strike.wav` | Bol chantant / Singing bowl | inoshirodesign | CC0 | [freesound.org/s/271370](https://freesound.org/people/inoshirodesign/sounds/271370/) |
| `373053__sgossner__contrabass-pizzicato-c2.wav` | Corde grave (contrebasse pizzicato C2, pack VSCO2 CE) | sgossner (interprète : Brittany Karlson) | CC0 | [freesound.org/s/373053](https://freesound.org/people/sgossner/sounds/373053/) |

## Ambiances (isPremium: true — données seulement, gating au chantier 3b)

| Fichier | Son | Auteur | Licence | Source |
|---|---|---|---|---|
| `564623__azumarill__toaster-oven-or-liftelevator-bell.wav` | Pop | azumarill | **CC-BY 3.0** | [freesound.org/s/564623](https://freesound.org/people/azumarill/sounds/564623/) |
| `270404__littlerobotsoundfactory__jingle-achievement.wav` | Fanfare (Jingle Achievement) | LittleRobotSoundFactory | CC-BY 4.0 | [freesound.org/s/270404](https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/) |
| `331047__foochie_foochie__kalimba-c-note.wav` | Kalimba (C-note) | foochie_foochie | CC0 | [freesound.org/s/331047](https://freesound.org/people/foochie_foochie/sounds/331047/) |
| `495674__jack_urbanski__vibraphone-chord.wav` | Vibraphone Chord | jack_urbanski | CC0 | [freesound.org/s/495674](https://freesound.org/people/jack_urbanski/sounds/495674/) |
| `577692__joesh2__marimba-c3.wav` | Marimba C3 (sec) | joesh2 | CC0 | [freesound.org/s/577692](https://freesound.org/people/joesh2/sounds/577692/) |
| `401722__pogmothoin__marimba-ascending.wav` | Marimba do-ré-mi-fa-sol | pogmothoin | CC-BY 4.0 | [freesound.org/s/401722](https://freesound.org/people/pogmothoin/sounds/401722/) |
| `352666__foolboymedia__up-chime-2.wav` | Up Chime 2 | FoolBoyMedia | CC-BY 4.0 | [freesound.org/s/352666](https://freesound.org/people/FoolBoyMedia/sounds/352666/) |
| `109662__grunz__success.wav` | Success (glissando) | grunz | CC-BY 3.0 | [freesound.org/s/109662](https://freesound.org/people/grunz/sounds/109662/) |

## Attribution requise (CC-BY)

7 des 12 fichiers sont en CC-BY (timer_complete, microwave_ping,
toaster_bell, jingle_achievement, marimba_ascending, up_chime,
success_glissando) : l'attribution nommée ci-dessus (auteur + lien source)
suffit à la licence. Les 5 fichiers CC0 n'imposent aucune attribution légale
mais sont crédités ici par transparence.

Note : les 3 legacy (timer_complete, microwave_ping, toaster_bell) étaient
déjà dans le repo avant ce chantier, en CC-BY, sans qu'aucune attribution
n'existe nulle part — ce fichier corrige cette dette.

## Historique

L'ancienne sélection comptait 10 sons "kitchen/bell" type minuteur de
cuisine. Retour Eric : trop "rigolote", ne correspond pas au public
neuroatypique visé. 7 ont été retirés définitivement (bell_classic,
bell_melodic, microwave_vintage, kitchen_timer/"Ding", kitchen_timer_2,
egg_timer, ding_effect) ; 3 ont été gardés à sa demande explicite
(timer_complete, microwave_ping, toaster_bell) et rejoignent la structure
4 gratuits + 8 Ambiances aux côtés des 9 sons nouvellement curés.
