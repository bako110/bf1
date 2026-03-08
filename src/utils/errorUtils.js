/**
 * Utilitaires pour la gestion des erreurs
 */

/**
 * Extrait un message d'erreur lisible à partir d'une erreur API
 * @param {Error} error - L'erreur capturée
 * @param {string} defaultMessage - Message par défaut si aucun message spécifique n'est trouvé
 * @returns {string} Message d'erreur formaté
 */
export function extractErrorMessage(error, defaultMessage = 'Une erreur est survenue.') {
  console.error('Erreur détectée:', error);
  
  // Si pas d'erreur de réponse, retourner le message par défaut
  if (!error?.response?.data) {
    return error?.message || defaultMessage;
  }
  
  const errorData = error.response.data;
  
  // Message d'erreur simple
  if (typeof errorData.detail === 'string') {
    return errorData.detail;
  }
  
  // Erreurs de validation Pydantic (tableau d'objets)
  if (Array.isArray(errorData.detail)) {
    const messages = errorData.detail.map(err => {
      if (typeof err === 'string') return err;
      if (err.msg) {
        const location = err.loc ? err.loc.join('.') : '';
        return location ? `${location}: ${err.msg}` : err.msg;
      }
      return 'Erreur de validation';
    });
    
    return messages.length > 0 ? messages.join(', ') : defaultMessage;
  }
  
  // Autres formats de message
  if (errorData.message) {
    return errorData.message;
  }
  
  if (errorData.error) {
    return errorData.error;
  }
  
  return defaultMessage;
}

/**
 * Formate les erreurs de validation pour l'affichage
 * @param {Array} errors - Tableau d'erreurs de validation
 * @returns {string} Messages d'erreur formatés
 */
export function formatValidationErrors(errors) {
  if (!Array.isArray(errors)) return '';
  
  return errors.map(error => {
    if (typeof error === 'string') return error;
    
    const field = error.loc ? error.loc.join('.') : '';
    const message = error.msg || 'Erreur de validation';
    
    return field ? `${field}: ${message}` : message;
  }).join(', ');
}

/**
 * Vérifie si une erreur est due à un problème d'authentification
 * @param {Error} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur d'authentification
 */
export function isAuthError(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Vérifie si une erreur est due à un problème de validation
 * @param {Error} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur de validation
 */
export function isValidationError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  
  return status === 422 || (status === 400 && Array.isArray(data?.detail));
}

/**
 * Hook personnalisé pour la gestion centralisée des erreurs
 * @param {function} setError - Fonction pour définir l'erreur dans le state
 * @returns {function} Fonction pour traiter les erreurs
 */
export function useErrorHandler(setError) {
  return (error, defaultMessage = 'Une erreur est survenue.') => {
    const message = extractErrorMessage(error, defaultMessage);
    setError(message);
    
    // Log pour le debugging
    console.error('Erreur traitée:', {
      originalError: error,
      extractedMessage: message
    });
  };
}