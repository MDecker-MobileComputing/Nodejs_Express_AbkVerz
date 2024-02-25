/**
 * Diese Datei enthält die Middleware-Funktionen für Express.js
 * <br><br>
 * 
 * Befehl, um die Middleware-Funktionen in einer anderen Datei zu importieren:
 * ```
 * import { middleware } from './middleware.js';
 * ```
 */


// Liste der gültigen API-Keys
const API_KEY_ARRAY = [ "abc-123", "xyz-123", "abc-789", "xyz-789" ];


/**
 * Middleware-Funktion (sollte als erstes in der Middleware-Kette stehen),
 * die prüft, ob ein gültiger API-Key übergeben wurde. Wenn nicht, dann
 * wird der Request mit HTTP-Status-Code "401: Unauthorized" abgelehnt.
 */
function middlewareApiKeyCheck(req, res, next) {

    const apiKey = req.query.API_KEY;

    if (!apiKey) {

        res.status(401)
           .json({ erfolg: false, 
                   ergebnis: "Kein API-Key übergeben" });

    } else {

        if ( API_KEY_ARRAY.includes(apiKey) ) {

            next();
        	
        } else {

            res.status(401)
            .json({ erfolg: false, 
                    ergebnis: "Ungültiger API-Key" });
        }
    }
}


/**
 * Middleware-Funktion, die alle eingehenden Requests auf `console.log()`
 * schreibt.
 */
function middlewareLogger(req, res, next) {

    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
}


// Globaler Zähler für Middleware-Funktion
let requestZaehler = 0;

/**
 * Middleware-Funktion, die die Anzahl der eingehenden Requests zählt und
 * auf `console.log()` schreibt.
 * Die Anzahl wird zusätzlich als HTTP-Header "X-REQUEST-ZAEHLER" an den  
 * Client zurückgeliefert (selbst definierte HTTP-Header sollte immer 
 * mit "X-" beginnen).
 */
function middlewareRequestZaehler(req, res, next) {
    
    requestZaehler++;
    console.log(`Anzahl Requests: ${requestZaehler}\n`);

    res.setHeader("X-REQUEST-ZAEHLER", requestZaehler);

    next();
}


/**
 * Export der Middleware-Funktionen über ein Objekt.
 */
export const middleware = {
    middlewareApiKeyCheck,
    middlewareLogger,
    middlewareRequestZaehler
};