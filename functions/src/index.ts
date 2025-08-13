import * as functions from "firebase-functions";
import { logger } from "firebase-functions";

export const helloWorld = functions.https.onCall((data, context) => {
  logger.info("Hello logs!", {structuredData: true});
  return {message: "Hello from Firebase!"};
});


