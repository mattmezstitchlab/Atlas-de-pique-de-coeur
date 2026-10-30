"""Le parcours ATLAS, rejouable : les adresses (PR #6), le + (PR #7), la publication volontaire (PR #8).

Usage :
  node tests/serveur.mjs 8090 &           # ou une adresse de déploiement Vercel
  BASE=http://localhost:8090 python3 tests/e2e_parcours.py
Options : NAVIGATEURS=chromium,webkit  ETAPES=adresses,plus,publication  CAPTURES=dossier
"""
import os, re, json, sys
from playwright.sync_api import sync_playwright

B = os.environ.get('BASE', 'http://localhost:8090').rstrip('/')
Q = os.environ.get('SUFFIXE', '')  # ex. « ?_vercel_share=… » pour un aperçu protégé
NAVS = os.environ.get('NAVIGATEURS', 'chromium').split(',')
ETAPES = os.environ.get('ETAPES', 'adresses,plus,publication').split(',')
CAP = os.environ.get('CAPTURES')
OK = [0, 0]
def ok(c, msg):
    OK[0 if c else 1] += 1
    print(('✓ ' if c else '✗ ') + msg)

def url(p):
    if not Q: return B + p
    return B + p + ('&' if '?' in p else '?') + Q.lstrip('?&')

MARIAGE = None

with sync_playwright() as pw:
    for nav in NAVS:
        N = f'[{nav}]'
        b = getattr(pw, nav).launch()
        ctx = b.new_context(viewport={'width': 1280, 'height': 900})
        pg = ctx.new_page(); erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)) if 'access control checks' not in str(e) else None)  # le bandeau d’authentification des aperçus Vercel

        if 'adresses' in ETAPES:
            for p, titre in [('/', 'ATLAS'), ('/chronologie', 'Chronologie'), ('/composition', 'Métamorphose'), ('/cube', 'Cube'), ('/ecosysteme', ''), ('/moteur', ''), ('/administration', '')]:
                r = pg.goto(url(p)); ok(r.status == 200, f'{N} {p} répond ({r.status})')
            pg.goto(url('/metamorphose')); ok(pg.url.split('?')[0].endswith('/composition'), f'{N} /metamorphose → /composition')
            pg.goto(url('/admin')); ok(pg.url.split('?')[0].endswith('/administration'), f'{N} /admin → /administration')

        if 'plus' in ETAPES or 'publication' in ETAPES:
            pg.goto(url('/composition')); pg.evaluate('localStorage.clear()'); pg.reload()
            pg.wait_for_selector('#plus-exemples button')
            pg.locator('#plus-exemples button').first.click()
            st = pg.locator('#plus-statut').inner_text()
            ok('3 demandes lues' in st and '5 fragments' in st, f'{N} le + : « {st[:60]}… »')
            ok(pg.locator('.manque').count() >= 1, f'{N} ce qui manque est signalé')
            avant = pg.locator('#grille .bloc').count()
            pg.locator('#plus-propositions input[type=checkbox]').last.uncheck()
            pg.click('#plus-poser')
            apres = pg.locator('#grille .bloc').count()
            ok(apres - avant == 4, f'{N} 4 blocs posés après confirmation ({avant} → {apres})')
            liens = pg.evaluate("JSON.parse(localStorage.getItem('atlas-metamorphose-v1')).liens.length")
            ok(liens >= 3, f'{N} les blocs sont reliés ({liens} liens)')
            pg.reload(); pg.wait_for_selector('#grille .bloc')
            ok(pg.locator('#grille .bloc').count() == apres, f'{N} la composition survit au rechargement')

        if 'publication' in ETAPES:
            # 1-3. une version publique, choisie explicitement
            pg.locator('#publier').scroll_into_view_if_needed()
            ok(pg.locator('#publier-preparer').is_disabled(), f'{N} rien ne se prépare sans choix explicite')
            pg.fill('#publier-titre', 'Démonstration : un mariage en trois demandes')
            pg.check('#publier-accord')
            pg.click('#publier-preparer')
            apercu = json.loads(pg.locator('#publier-apercu').text_content())
            cles = sorted(apercu.keys())
            ok(cles == sorted(['format', 'version', 'id', 'titre', 'description', 'publieLe', 'visibility', 'publicationStatus', 'blocs', 'liens', 'mise']), f'{N} 4. seuls les champs autorisés ({", ".join(cles)})')
            texte = json.dumps(apercu, ensure_ascii=False)
            interdits = [m for m in ['148', 'Lyon', '900', 'septembre', '"reconnu"', '"manque"', '"phrase"', '"demandes"', '"donnees"', '"image"', '"complet"'] if m in texte]
            ok(not interdits, f'{N} 4. ni demandes écrites, ni lieux, ni montants, ni données des modules, ni réglages locaux {interdits}')
            ok(re.fullmatch(r'[a-z0-9-]{1,80}', apercu['id']) is not None, f'{N} 5. identifiant {apercu["id"]}')
            pg.click('#publier-preparer')
            ok(json.loads(pg.locator('#publier-apercu').text_content())['id'] == apercu['id'], f'{N} 5. identifiant stable (même composition → même identifiant)')
            ok(pg.evaluate("localStorage.getItem('atlas-metamorphose-v1').indexOf('publication') === -1"), f'{N} rien n’est publié automatiquement (aucune trace côté serveur, aucun envoi)')
            MARIAGE = apercu

        if 'lecture' in ETAPES or 'publication' in ETAPES:
            demo = os.environ.get('DEMO', 'demonstration-un-concert-en-deux-demandes')
            r = pg.goto(url('/composition/' + demo))
            ok(r.status == 200, f'{N} 7. /composition/{demo} répond')
            pg.wait_for_selector('.creation-etat[data-code]', timeout=15000)
            ok(pg.locator('.creation-grille .bloc').count() >= 2, f'{N} 7. la création publiée s’affiche ({pg.locator(".creation-grille .bloc").count()} blocs)')
            ok(pg.locator('.creation-grille [draggable=true], .creation-grille .poignee, #barre-bloc').count() == 0, f'{N} 7. en lecture seule (ni poignée ni barre d’outils)')
            ls = pg.evaluate("localStorage.getItem('atlas-metamorphose-v1')")
            pg.goto(url('/composition/' + demo)); pg.wait_for_selector('.creation-etat[data-code]')
            ok(pg.evaluate("localStorage.getItem('atlas-metamorphose-v1')") == ls, f'{N} 7. ouvrir une création ne touche pas à votre composition')
            if CAP: pg.screenshot(path=f'{CAP}/creation-{nav}.png', full_page=True)
            for ident, attendu in [('inconnue-0000', 'absente'), ('Pas..valide', 'invalide'), ('essai-privee', 'privée'), ('essai-brouillon', 'pas publiée')]:
                pg.goto(url('/composition/' + ident)); pg.wait_for_selector('.creation-etat[data-code]')
                t = pg.locator('.creation-etat').inner_text()
                ok(attendu in t and pg.locator('.creation-grille .bloc').count() == 0, f'{N} refus propre « {ident} » : {t[:70]}')
            pg.goto(url('/creation?id=' + demo)); pg.wait_for_selector('.creation-etat[data-code]')
            ok(pg.locator('.creation-grille .bloc').count() >= 2, f'{N} adresse de secours /creation?id=')

        if CAP: pg.screenshot(path=f'{CAP}/fin-{nav}.png')
        ok(not erreurs, f'{N} aucune erreur ({erreurs[:2]})')
        b.close()

print(f'— {OK[0]}/{OK[0] + OK[1]}')
sys.exit(1 if OK[1] else 0)
