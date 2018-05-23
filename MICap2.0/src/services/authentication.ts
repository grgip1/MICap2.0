import {URLSearchParams} from "@angular/http";

/**
 * Authentication request payload.
 */
export interface AuthRequest {
  appname: string;  // internal name of the application
  secret: string;   // the secret key that has been chosen on the development portal
  username: string; // the email of the user
  password: string; // the user's password
  role: string; // the role of the user (when using micap 2.0 the role must be research)
  device: string;   // device code to which study the app is linked
}

/**
 * Recored request payload
 */
export interface GetRecordRequest {
  authToken: string;          // the token from the authentication request
  resourceType: ResourceType; // what ressourceType to get
}

/**
 * Resource type which can be selected
 */
export type ResourceType =
'Patient' |     //resource type patient
'Observation';  //resource type observation
