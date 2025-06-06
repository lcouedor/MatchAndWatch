export interface apiResponse<T> {
    success: boolean;
    data?: T; // Les données retournées par l'API, si la requête a réussi
    error?: string; // Message d'erreur, si la requête a échoué
    message?: string; // Message d'information, optionnel
}