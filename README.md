# Abkürzungsverzeichnis als REST-API mit Nodejs, Express.js und lowdb #

<br>

Diese Repo enthält den Quellcode für ein Nodejs-Programm, das eine REST-API
mit zwei REST-Endpunkten zur Speicherung von Abkürzungen und zugehörigen
Bedeutungen bereitstellt.
Eine Abkürzung kann mehrere Bedeutungen haben.

<br>

----

## REST-Endpunkte ##

<br>

Abfrage der Abkürzung "KSC" mit HTTP-GET-Request:
```
http://localhost:8080/abkverz/v1/abfrage/KSC
```

<br>

HTTP-Post-Request, um für die Abkürzung "NPM" die erste oder eine weitere
Bedeutung hinzuzufügen:
```
http://localhost:8080/abkverz/v1/dazu/NPM/Never Post Messages
```

<br>

----

## lowdb ##

<br>

Für die Persistenz wird [lowdb](https://www.npmjs.com/package/lowdb) verwendet.
Diese "Datenbank" speichert die Datensätze in Form eines großen JSON-Dokuments,
siehe die Datei `db.json`, die beim Hinzufügen der ersten Abkürzung/Bedeutung
erzeugt wird.

Beispiel für Inhalt der Datei `db.json`:

```
{
  "KSC": [
    "Kennedy Space Center",
    "Karlsruher Sport Club"
  ],
  "OOO": [
    "Out of Office",
    "Out of Order",
    "Out of Orbit"
  ],
  "NPM": [
    "Node Package Manager"
  ]
}
```

<br>

----

## License ##

<br>

See the [LICENSE file](LICENSE.md) for license rights and limitations (BSD 3-Clause License)
for the files in this repository.

<br>