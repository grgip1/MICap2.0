import {URLSearchParams} from "@angular/http";

/**
 * Authentifikationsparameter.
 */
export interface AuthRequest {
  appname: string;  // Interner Name der Applikation.
  secret: string;   // Das Secret weclhes beim Plugin erstellen gesetzt wurde.
  username: string; // E-Mail vom Nutzer
  password: string; // Passwort vom Nutzer
  role: string;     // Die Rolle des Nutzers (um MICap 2.0 zu nutzen muss es ein Forscherkonto sein)
  device: string;   // Device-Code zu welcher Studie die Applikation verknüpft ist.
}
