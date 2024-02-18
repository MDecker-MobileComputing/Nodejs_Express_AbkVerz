import express from 'express';
import { JSONFilePreset } from 'lowdb/node';

const PORT_NUMMER = 8080;

const app = express();


// Datenbank initialisieren
//
// Datenmodell: die Abkürzungen sind Schlüssel auf oberster Ebene im JSON-Objekt, die
// String-Arrays mit mindestens einem Eintrag=Bedeutung referenzieren.
const defaultDataObj =  {

    KSC: ["Kennedy Space Center", "Karlsruher Sport Club"],

    OOO: ["Out of Office", "Out of Order", "Out of Orbit"]
};
const db = await JSONFilePreset("db.json", defaultDataObj);


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
 * REST-Endpunkt zum Eintragen der ersten Bedeutung für eine
 * neue Abkürzung oder einer weiteren Bedeutung für eine
 * bereits vorhandene Abkürzung.
 */
app.post("/abkverz/v1/dazu/:abk/:bedeutung", async (req, res) => {

    const abk       = decodeURIComponent( req.params.abk       );
    const bedeutung = decodeURIComponent( req.params.bedeutung );

    console.log(`POST-Request für Abkürzung: ${abk}, Bedeutung: ${bedeutung}`);

    const abkNormalized = abk.trim().toUpperCase();

    let schonDa = db.data[ abkNormalized ];
    if (schonDa) {

        if (schonDa.includes(bedeutung)) {

            res.status(409)
            .json({ "erfolg": false,
                    "bedeutungen": db.data[abkNormalized],
                    "fehler": `Bedeutung "${bedeutung}" für Abkürzung "${abkNormalized}" bereits vorhanden.`
                  });
            return;
        }

        console.log(`Weitere Bedeutung für Abkürzung ${abkNormalized} gespeichert: ${bedeutung}`);
        schonDa.push(bedeutung);

    } else {

        console.log(`Erste Bedeutung für Abkürzung ${abkNormalized} gespeichert: ${bedeutung}`);
        db.data[abkNormalized] = [bedeutung];
    }

    await db.write();

    res.status(201)
       .json({ "erfolg": true,
               "bedeutungen": db.data[abkNormalized]
             });
});



// statische Dateien (z.B. "index.html") aus Unterordner "public/" bereitstellen
app.use( express.static("public") );


// Web-Server starten
app.listen( PORT_NUMMER,
    () => { console.log(`Web-Server lauscht auf Port ${PORT_NUMMER}`); }
  );
