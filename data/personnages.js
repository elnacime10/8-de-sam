/* Le 8 de SAM — data/personnages.js
   Tes potes : images, noms et répliques. Pur contenu, aucune règle ici. */

/* ============================================================
   1 · RÉGLAGES
   ============================================================ */
const IMG = {
  quartier:"images/quartier.webp",
  studio:"images/studio.webp",
  sushi:"images/sushi.webp",
  sam:"images/sam.webp",
  yuns:"images/yuns.webp",
  mehmet:"images/mehmet.webp",
  hamza:"images/hamza.webp",
  nacime:"images/nacime.webp"
};

const CHARS = {
  sam:   { nom:'Sam' },    yuns:  { nom:'Yuns' },  mehmet:{ nom:'Mehmet' },
  hamza: { nom:'Hamza' },  nacime:{ nom:'Nacime' }
};
const CHAR_IDS = ['sam','yuns','mehmet','hamza','nacime'];

/* Répliques : t = chambrage, c = version polie (réglage "Langage").
   atk = il attaque · hit = il encaisse · low = tu n'as plus qu'une carte
   out = il sort · lose = il finit dernier */
const LINES = {
  sam: {
    atk : [{t:"Assis.",c:"Assis."},
           {t:"Ramassez, enfoirés.",c:"Ramassez, messieurs."},
           {t:"Ramasse sale merde.",c:"Ramasse, et vite."},
           {t:"J'suis l'dernier boss final.",c:"J'suis l'dernier boss final."},
           {t:"Échec et mat pour ta dame.",c:"Échec et mat pour ta dame."},
           {t:"Reste là, j'ai pas fini enfoiré.",c:"Reste là, j'ai pas fini."}],
    hit : [{t:"Profite. Ça durera pas sale fiote.",c:"Profite. Ça durera pas."},
           {t:"T'as mélanger comme une merde",c:"C'est le mélange qui était mauvais."}],
    low : [{t:"Rappel toi que c'est moi qui t'as appris à jouer",c:"Ah non. Ça se joue pas comme ça."},
           {t:"Tu penses ?.",c:"Vas-y, essaie."}],
    out : [{t:"Jte l'avais dis sale batard.",c:"Je t'avais dit."},
           {t:"Y a pas de hasard.",c:"Y a pas de hasard."},
           {t:"Le jeu porte mon nom sale merde",c:"C'est mon blaze sur le jeu"}
          ],
    lose: [{t:"Revanche si t'as des couilles",c:"Revanche. Maintenant."}]
  },
  mehmet: {
    atk : [{t:"Mange ça enfoiré !",c:"Mange ça, tiens !"},
           {t:"Sale bâtard.",c:"Bien fait pour toi."},
           {t:"Ta gueule et pioche.",c:"Tais-toi et pioche."},
           {t:"Sale merde.",c:"Et voilà."}],
    hit : [{t:"Wesh c'est quoi ça ?!",c:"Non mais c'est quoi ça ?"},
           {t:"Le jeu est truqué j'te jure.",c:"Le jeu est truqué, j'te jure."},
           {t:"C'est de la merde ce jeu",c:"Nan mais c'est pas possible."}],
    low : [{t:"Tu fais moins l'malin là.",c:"Tu fais moins le malin, là."},
           {t:"Ferme-la j'réfléchis.",c:"Chut, je réfléchis."}],
    out : [{t:"Voilà. Tranquille. Dégage.",c:"Voilà. Tranquille."}],
    lose: [{t:"J'joue plus. J'JOUE PLUS.",c:"Je joue plus. JE JOUE PLUS."},
           {t:"Vazy j'me casse",c:"Vous êtes des voleurs."}]
  },
  hamza: {
    atk : [{t:"Pioche !",c:"Pioche !"},
           {t:"Ahahah t'as vu ça !",c:"Ahahah t'as vu ça !"},
           {t:"Carte, fin de carte !",c:"Carte, fin de carte !"},
           {t:"Il est mort, il est mort !",c:"Il est mort, il est mort !"}],
    hit : [{t:"Même pas mal ahahah !",c:"Même pas mal ahahah !"},
           {t:"ENFIIIN !",c:"J'suis dans le game, j'suis dans le game."}],
    low : [{t:"Attends attends attends !",c:"Attends attends attends !"},
           {t:"Non non non non non.",c:"Non non non non non."}],
    out : [{t:"ET C'EST FINI !",c:"ET C'EST FINI !"},
           {t:"Générique de fin.",c:"Générique de fin."}],
    lose: [{t:"J'vous laisse gagner, c'est cadeau.",c:"Je vous laisse gagner, c'est cadeau."}]
  },
  yuns: {
    atk : [{t:"Tiens sale merde.",c:"Tiens."},{t:"Voilà.",c:"Voilà."},{t:"Ramasse.",c:"Ramasse."}],
    hit : [{t:"Ferme ta gueul sal batard.",c:"Mouais."},{t:"Ouais bon.",c:"Ouais, bon."}],
    low : [{t:"Je vois ta défaite de là haut.",c:"Ah. Tiens."},
           {t:"T'es ma pute",c:"Ça sent pas bon pour toi."}],
    out : [{t:"Allez salam bande de merde.",c:"C'est bon, j'ai fini."}],
    lose: [{t:"J'm'en bats les couilles.",c:"J'm'en fiche complètement."}]
  },
  nacime: {
    atk : [{t:"Sale mouille.",c:"Allez, doucement."},
           {t:"J't'ai eu.",c:"Je t'ai eu."},
           {t:"Tranquille.",c:"Tranquille."},
           {t:"T'as cru quoi ?",c:"T'as cru quoi ?"}],
    hit : [{t:"C'était prévu ça.",c:"C'était prévu, ça."},
           {t:"J'te laisse croire.",c:"Je te laisse croire."}],
    low : [{t:"Vas-y finis, j't'attends.",c:"Vas-y, finis, je t'attends."},
           {t:"T'es sûr de toi là ?",c:"T'es sûr de toi, là ?"}],
    out : [{t:"Trop facile.",c:"Trop facile."},
           {t:"Prochaine fois j'joue à une main.",c:"Prochaine fois, je joue à une main."}],
    lose: [{t:"J'avais pas les cartes.",c:"J'avais pas les cartes."}]
  }
};
