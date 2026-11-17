import type { GroovepackLocale } from "@/types/i18n/groovepack-locale.type";
import type { GroovepackLocaleMessages } from "@/types/i18n/locale-messages.type";

export const GROOVEPACK_MESSAGES = {
  en: {
    loading: "Processing...",
    success: "Operation completed successfully.",
    unexpectedError:
      "An unexpected error occurred while processing your request. Please try again.",
    serverRequestFailed:
      "Could not process the request on the server. Please try again.",
    operationFailed: "The operation could not be completed.",
  },
  es: {
    loading: "Procesando...",
    success: "Operación completada con éxito.",
    unexpectedError:
      "Ocurrió un error inesperado al procesar la solicitud. Por favor, intenta de nuevo.",
    serverRequestFailed:
      "No se pudo procesar la solicitud en el servidor. Por favor, intenta de nuevo.",
    operationFailed: "La operación no se pudo completar.",
  },
  pt: {
    loading: "Processando...",
    success: "Operação concluída com sucesso.",
    unexpectedError:
      "Ocorreu um erro inesperado ao processar a solicitação. Por favor, tente novamente.",
    serverRequestFailed:
      "Não foi possível processar a solicitação no servidor. Por favor, tente novamente.",
    operationFailed: "Não foi possível concluir a operação.",
  },
  it: {
    loading: "Elaborazione in corso...",
    success: "Operazione completata con successo.",
    unexpectedError:
      "Si è verificato un errore imprevisto durante l'elaborazione della richiesta. Riprova.",
    serverRequestFailed:
      "Impossibile elaborare la richiesta sul server. Riprova.",
    operationFailed: "Impossibile completare l'operazione.",
  },
  fr: {
    loading: "Traitement en cours...",
    success: "Opération terminée avec succès.",
    unexpectedError:
      "Une erreur inattendue s'est produite lors du traitement de la demande. Veuillez réessayer.",
    serverRequestFailed:
      "Impossible de traiter la demande sur le serveur. Veuillez réessayer.",
    operationFailed: "L'opération n'a pas pu être terminée.",
  },
} as const satisfies Record<GroovepackLocale, GroovepackLocaleMessages>;
