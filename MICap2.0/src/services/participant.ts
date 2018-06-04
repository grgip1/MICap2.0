import {URLSearchParams} from "@angular/http";


export interface Participant {
  midatastudy_id: string;
  testId: string;
}


export interface Feedback {
  midatastudy_id: string;
  feedback: string;
}
