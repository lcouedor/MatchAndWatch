import axios from "axios";

// export const apiURL = "https://matchandwatch.fun:3333";
// export const apiURL = process.env.VUE_APP_API_URL;
const apiURL = process.env.VUE_APP_API_URL;

// export async function getAll(path: string): Promise<any> {
//     try {
//         const response = await axios.get(`${apiURL}/${path}`);
//         return response.data;
//     } catch (error: any) {
//         if (error.response) {
//             console.error(
//                 `Erreur du serveur (${error.response.status}): ${error.response.data.error}`
//             );
//         } else if (error.request) {
//             console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
//         } else {
//             console.error("Erreur lors de la requête:", error.message);
//         }
//         return null;
//     }
// }

export async function post(path: string, data: any): Promise<any> {
    try {
        const response = await axios.post(`${apiURL}/${path}`, data);
        return { success: true, data: response.data }; // Retourne les données si tout va bien
    } catch (error: any) {
        if (error.response) {
            // Le backend a renvoyé une réponse avec un code d'erreur
            return { success: false, data: error.response.data.error };
        } else if (error.request) {
            console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
        } else {
            console.error("Erreur lors de la requête:", error.message);
        }
        return null;
    }
}

// export async function get(path: string, data: any): Promise<any> {
//     try {
//         const response = await axios.get(`${apiURL}/${path}`, data);
//         return { success: true, data: response.data }; // Retourne les données si tout va bien
//     } catch (error: any) {
//         if (error.response) {
//             // Le backend a renvoyé une réponse avec un code d'erreur
//             return { success: false, data: error.response.data.error };
//         } else if (error.request) {
//             console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
//         } else {
//             console.error("Erreur lors de la requête:", error.message);
//         }
//         return null;
//     }
// }

// export async function del(path: string, data: any): Promise<any> {
//     try {
//         console.log("data:", data);
//         const response = await axios.delete(`${apiURL}/${path}`, { data: data });
//         return { success: true, data: response.data }; // Retourne les données si tout va bien
//     } catch (error: any) {
//         if (error.response) {
//             // Le backend a renvoyé une réponse avec un code d'erreur
//             return { success: false, data: error.response.data.error };
//         } else if (error.request) {
//             console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
//         } else {
//             console.error("Erreur lors de la requête:", error.message);
//         }
//         return null;
//     }
// }

//TODO utiliser le get normal
// export async function getMovie(movieId: number) {
//     try {
//         let data = { params: { movieId: movieId } };
//         const response = await axios.get(`${apiURL}/movie`, data);
//         return { success: true, data: response.data }; // Retourne les données si tout va bien
//     } catch (error: any) {
//         if (error.response) {
//             // Le backend a renvoyé une réponse avec un code d'erreur
//             return { success: false, data: error.response.data.error };
//         } else if (error.request) {
//             console.error("Aucune réponse du serveur. Veuillez réessayer plus tard.");
//         } else {
//             console.error("Erreur lors de la requête:", error.message);
//         }
//         return null;
//     }
// }
