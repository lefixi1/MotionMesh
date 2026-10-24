# MotionMesh

MotionMesh je webová platforma na prezentáciu multimediálneho obsahu a podporu spolupráce medzi používateľmi. Platforma umožňuje vytváranie príspevkov a projektov, upload multimediálnych súborov, zobrazovanie 3D modelov a interakcie používateľov prostredníctvom komentárov.

---

## Aktuálna funkcionalita

### Používateľské účty

- registrácia a prihlásenie pomocou Google OAuth,
- správa používateľských sessions,
- zobrazenie používateľského profilu,
- autorizácia prístupu pomocou middleware

### Posts

- vytváranie príspevkov,
- upload multimediálnych súborov,
- zobrazovanie obrázkov, videí a 3D modelov,
- detail príspevku,
- komentáre pod príspevkami,
- vyhľadanie príspevkov.

### Projects

- vytváranie a správa projektov,
- nastavovanie stavu projektu a progresu,
- pridávanie participantov a rolí,
- správa projektových taskov,
- upload multimediálneho obsahu,
- komentáre pod projektmi,
- systém join requestov.

### 3D Modely

- zobrazovanie .glb modelov pomocou Three.js
- interaktívne ovládanie modelu,
- približovanie a otáčanie modelu,
- automatická rotácia modelu.

### Používateľské rozhranie

- responzívne používateľské rozhranie,
- dynamické načítavanie dát pomocou Axios,
- routing pomocou React Router,
- hamburger menu pre menšie obrazovky

### Ostatné funkcionality

- systém notifikácií,
- upload súborov pomocou multer,
- REST API komunikácia medzi frontendom a backendom,
- správa dát pomocou databázy MySQL.

---

## Použíte technológie

### Frontend

- React
- TypeScript
- Vite (na inicializáciu React projektu)
- React Router SOM
- Axios
- Three.js
- three-stdlib
- Google OAuth
- hamburger-react

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- mysql12
- express-session
- multer
- cors
- cookie-parser
- body-parser
- google-auth-library

---

## Požiadavky na spustenie

Pred spustením aplikácie je potrebne mať nainštalované:

- Node.js
- npm
- MySQL Server

Odporúčané vývojové prostredie:

- Visual Studio Code

---

## Databáza

Aplikácia používa relačný databazový systém MySQL spolu s nástrojom MySQL Workbench, ktorý je potrebné mať nainštalovaný pre správu databázy a import databázového exportu.

Pred spustením backendu je potrebné:

1. vytvoriť databázu,
2. importovať databázový export pomocou MySQL Workbench,
3. nastaviť prístupové údaje k databáze v súbore:

```ts
server / config / DB.ts;
```

Príklad konfigurácie:

```ts
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "motionmesh",
});
```

---

## Inštalácia závislostí

Otvorte terminál v koreňovom priečinku projektu.

### Frontend

Prejdite do frontend priečinka:

```bash
cd frontend
```

Nainštalujte všetky potrebné knižnice a závislosti:

```bash
npm install
```

### Backend

Prejdite do backend priečinka:

```bash
cd server
```

Nainštalujte všetky potrebné knižnice a závislosti:

```bash
npm install
```

---

## Spustenie aplikácie

### Backend

V priečinku server spustite:

```bash
npm run dev
```

Backend aplikácie bude dostupný na:

```bash
http://localhost:3001
```

### Frontend

V priečinku frontend spustite:

```bash
npm run dev
```

Frontend aplikácie bude dostupný na:

```bash
http://localhost:5173
```

---

## Google OAuth

Projekt už obsahuje nakonfigurované Google OAuth Client ID určené pre lokálne spustenie aplikácie. V prípade potreby je možné vytvoriť vlastný Google Cloud projekt a nahradiť existujúce OAuth údaje vlastnými.

---

## Upload súborov

Nahrané súbory sa ukladajú do priečinka:

```bash
server/uploads
```

Backend následne tento priečinok sprístupňuje pomocou statického routingu.

---

## Testovanie funkcionalít

Po spustení aplikácie je možné otestovať základné funkcionality priamo cez používateľské rozhranie.

### Používateľský účet

1. Otvorte frontend aplikáciu na adrese `http://localhost:5173`.
2. Najprv vykonajte registráciu pomocou Google OAuth
3. Po úspešnej registrácii používateľ bude presmerovany na hlavnú stranku aplikácie a bude mať možnosť prejst na svoj používateľsky účet a upraviť svoje údaje.

### Autorizácia registrácie

Platforma používa autorizačné kódy uložené v tabuľke `codes`. Registrácia používateľa je povolená iba po zadaní platného autorizačného kódu.

### Posts

- Pomocou buttonu `ADD` v header aplikácii je možné vytvoriť nový príspevok
- Prí vytváraní príspevku je možné nahrať multimediálny súbor, nastaviť viditeľnosť príspevku a vybrať zo zoznamu projekt, ktorého participantom je používateľ a ku krorému bude príspevok patriť. Výber projektu nie je povinný.
- Po vytvorení je možné zobraziť detail príspevku a pridať komentár
- Na stranke `/posts` sa dá sortirovať príspevky podľa abecedy.
- Na stranke `/main` používateľ má možnosť vyhľadať príspevky podľa nazvu alebo používateľskeho mena používateľa, ktorý príspevok vytvoril.

### Projects

- V používateľskom profile v časti Projects je možné vytvoriť nový projekt.
- Pri projekte je možné nastaviť stav, progres, tagy, tasky a participantov.
- Používateľ môže odoslať join request na projekt a vlastník projektu ho môže spracovať.

### Autorizácia a admin funkcionalita

Niektoré endpointy alebo časti aplikácie sú chránené pomocou middleware funkcií `checkAuth` a `checkAdmin`.

Pre otestovanie admin funkcionality je potrebné mať v databáze používateľa s rolou:

````sql
role = `admin`

Ak je potrebné nastaviť používateľa ako administrátora, je možné upraviť jeho rolu priamo v databáze. Napríklad pomocou SQL príkazu:

```sql
UPDATE users
SET role = `admin`
WHERE user_id = 1;

Po opätovnom prihlásení bude mať používateľ dostupné funkcionality vyžadujúce administrátorské oprávnenia.

---

## Poznámka

Aplikácia je určená na lokálne spustenie vo vývojovom prostredí. Pre produkčné nasadenie by bolo potrebné upraviť konfiguráciu databázy, OAuth údajov, CORS nastavenia a zabezpečenie citlivých údajov.
````
