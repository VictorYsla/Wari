// helpers/clerkErrorHandler.ts

export function translateLoginClerkError(error: any): string {
  if (error?.errors?.length > 0) {
    const clerkError = error.errors[0];
    switch (clerkError.code) {
      case "form_identifier_not_found":
        return "Usuario no encontrado.";
      case "form_password_incorrect":
        return "La contraseña es incorrecta.";
      case "form_param_format_invalid":
        return "Formato de credenciales inválido.";
      case "form_param_missing":
        return "Faltan credenciales obligatorias.";
      default:
        return clerkError.message || "Ocurrió un error al iniciar sesión.";
    }
  }

  return "Ocurrió un error al iniciar sesión.";
}
