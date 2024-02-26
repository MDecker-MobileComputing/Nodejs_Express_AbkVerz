import express from 'express';
import { JSONFilePreset } from 'lowdb/node';
import { middleware } from './middleware.js';

const PORT_NUMMER = 8080;

const app = express();


// Datenbank initialisieren
//
// Datenmodell: die Abkürzungen sind Schlüssel auf oberster Ebene im JSON-Objekt,
// die String-Arrays mit mindestens einem Eintrag=Bedeutung referenzieren.
const defaultDataObj =  {

    KSC: ["Kennedy Space Center", "Karlsruher Sport Club"],

    OOO: ["Out of Office", "Out of Order", "Out of Orbit"]
};
const db = await JSONFilePreset("db.json", defaultDataObj);



// Middleware-Funktion registrieren, vor den REST-Endpunkten;
// Reihenfolge ist wichtig!

//app.use( middleware.middlewareApiKeyCheck    );
app.use( middleware.middlewareLogger         );
app.use( middleware.middlewareRequestZaehler );



/**
 * REST-Endpunkt zum Abrufen der Bedeutungen einer Abkürzung.
 */
app.get("/abkverz/v1/abfrage/:abk", (req, res) => {

    const abk           = req.params.abk;
    const abkNormalized = abk.trim().toUpperCase();

    const bedeutungArray = db.data[ abkNormalized ];
    if (bedeutungArray) {

        res.status(200)
           .json({ "erfolg": true,
                   "ergebnis": bedeutungArray
                 });
    } else {

        res.status(404)
           .json({ "erfolg": false,
                   "ergebnis": []
                 });
    }
});


/**
 * REST-Endpunkt zum Abrufen von Metriken über den Datenbestand.
 */
app.get("/abkverz/v1/metriken", (req, res) => {

    let abkZaehler       = 0;
    let bedeutungZaehler = 0;

    Object.keys( db.data ).forEach( (abkuerzung) => {

        abkZaehler++;

        let anzahlBedeutungen = db.data[ abkuerzung ].length;
        bedeutungZaehler += anzahlBedeutungen;
    });

    res.status(200)
       .json({ "anzahlAbkuerzungen": abkZaehler,
               "anzahlBedeutungen" : bedeutungZaehler
             });
});


/**
 * REST-Endpunkt zum Eintragen der ersten Bedeutung für eine
 * neue Abkürzung oder einer weiteren Bedeutung für eine
 * bereits vorhandene Abkürzung.
 */
app.post("/abkverz/v1/dazu/:abk/:bedeutung", async (req, res) => {

    const abk       = decodeURIComponent( req.params.abk       );
    const bedeutung = decodeURIComponent( req.params.bedeutung );

    const abkNormalized = abk.trim().toUpperCase();

    let schonDa = db.data[ abkNormalized ];
    if (schonDa) {

        if (schonDa.includes(bedeutung)) {

            res.status(409)
            .json({ "erfolg": false,
                    "bedeutungen": db.data[ abkNormalized ],
                    "fehler": `Bedeutung "${bedeutung}" für Abkürzung "${abkNormalized}" bereits vorhanden.`
                  });
            return;
        }

        schonDa.push(bedeutung); // weiteres Element für String-Array

    } else {

        db.data[ abkNormalized ] = [ bedeutung ];
    }

    await db.write();

    res.status(201)
       .json({ "erfolg": true,
               "bedeutungen": db.data[ abkNormalized ]
             });
});


/**
 * REST-Endpunkt zum Löschen einer Abkürzung mit all ihren Bedeutungen.
 */
app.delete("/abkverz/v1/loesche/abkuerzung/:abk", async (req, res) => {

    const abk           = req.params.abk;
    const abkNormalized = abk.trim().toUpperCase();

    if (db.data[ abkNormalized ]) {

        const anzahlBedeutungen = db.data[ abkNormalized ].length;

        delete db.data[ abkNormalized ];
        await db.write();

        res.status(200)
           .json({ "erfolg": true,
                   "nachricht": `Abkürzung "${abkNormalized}" mit ${anzahlBedeutungen} Bedeutungen gelöscht.`
                 });

    } else {

        res.status(404)
           .json({ "erfolg": false,
                   "nachricht": `Zu löschende Abkürzung "${abkNormalized}" nicht gefunden.`
                 });
    }

});


/**
 * REST-Endpunkt zum Löschen einer Bedeutung für eine Abkürzung.
 */
app.delete("/abkverz/v1/loesche/bedeutung/:abk/:bedeutung", async (req, res) => {

    const abk           = req.params.abk;
    const abkNormalized = abk.trim().toUpperCase();

    if (!db.data[ abkNormalized ]) {

        res.status(404)
           .json({ "erfolg": false,
                   "nachricht": `Abkürzung "${abkNormalized}" nicht gefunden.`
                 });

        return;
    }

    const bedeutung = decodeURIComponent( req.params.bedeutung );

    if (db.data[ abkNormalized ].includes(bedeutung) == false) {

        res.status(404)
        .json({ "erfolg": false,
                "nachricht": `Bedeutung "${bedeutung}" für Abkürzung "${abkNormalized}" nicht gefunden.`
              });
        return;
    }

    // wenn wir in dieser Zeile ankommen, dann enthält die Abkürzung tatsächlich die zu löschende Bedeutung

    if (db.data[ abkNormalized ].length === 1) {

        res.status(400)
            .json({ "erfolg": false,
                    "nachricht": `Einzige Bedeutung für Abkürzung "${abkNormalized}" kann nicht gelöscht werden.`
                  });
            return;
    }

    // tatsächlich löschen
    db.data[ abkNormalized ] = db.data[ abkNormalized ].filter( (b) => b !== bedeutung );
    await db.write();

    res.status(200)
       .json({ "erfolg": true,
                   "nachricht": `Bedeutung "${bedeutung}" für Abkürzung "${abkNormalized}" gelöscht.`
             });

});



// statische Dateien (z.B. "index.html") aus Unterordner "public/" bereitstellen
app.use( express.static("public") );



// Web-Server starten
app.listen( PORT_NUMMER,
    () => { console.log(`Web-Server lauscht auf Port ${PORT_NUMMER}\n`); }
  );
