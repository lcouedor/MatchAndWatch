import axios from "axios";
import { io } from "socket.io-client";

const apiURL = "http://localhost:3333";
const socket = io(apiURL);

socket.on("newMessage", (message: any) => {
  console.log("Nouveau message reçu:", message);
});

export async function getAll(path: string): Promise<any> {
  try {
    const response = await axios.get(`${apiURL}/${path}`);
    return response.data; // Retourne les données si tout va bien
  } catch (error: any) {
    // Gérez les erreurs et affichez des messages appropriés
    if (error.response) {
      // Le backend a renvoyé une réponse avec un code d'erreur
      console.error(`Erreur du serveur (${error.response.status}): ${error.response.data.error}`);
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue
      console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
    } else {
      // Autre type d'erreur (par exemple, une erreur de configuration)
      console.error("Erreur lors de la requête:", error.message);
    }
    // Retournez une valeur par défaut ou null pour éviter un crash du frontend
    return null;
  }
}

export async function post(path: string, data: any): Promise<any> {
  try {
    const response = await axios.post(`${apiURL}/${path}`, data);
    return response.data; // Retourne les données si tout va bien
  } catch (error: any) {
    if (error.response) {
      console.error(`Erreur du serveur (${error.response.status}): ${error.response.data.error}`);
    } else if (error.request) {
      console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
    } else {
      console.error("Erreur lors de la requête:", error.message);
    }
    return null;
  }
}