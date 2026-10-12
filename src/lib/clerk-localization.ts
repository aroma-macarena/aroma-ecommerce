import { esMX } from "@clerk/localizations";

/**
 * Clerk's es-MX translation mixes "tú" and "usted" and has a few typos.
 * These overrides keep the sign-in flow consistent with the rest of AROMA,
 * which addresses visitors with "tú".
 */
export const clerkLocalization = {
  ...esMX,
  formFieldAction__forgotPassword: "¿Olvidaste tu contraseña?",
  formFieldError__notMatchingPasswords: "Las contraseñas no coinciden.",
  formFieldError__verificationLinkExpired:
    "El enlace de verificación expiró. Vuelve a solicitarlo.",
  formFieldInputPlaceholder__emailAddresses:
    "Ingresa o pega una o más direcciones de correo electrónico, separadas por espacios o comas",
  formFieldLabel__confirmPassword: "Confirma la contraseña",
  signIn: {
    ...esMX.signIn,
    accountSwitcher: {
      ...esMX.signIn?.accountSwitcher,
      subtitle: "Selecciona la cuenta con la que deseas continuar.",
    },
    alternativeMethods: {
      ...esMX.signIn?.alternativeMethods,
      blockButton__emailCode: "Enviar código a {{identifier}}",
      blockButton__emailLink: "Enviar enlace a {{identifier}}",
      blockButton__phoneCode: "Enviar código a {{identifier}}",
      getHelp: {
        ...esMX.signIn?.alternativeMethods?.getHelp,
        content:
          "Si tienes problemas para ingresar a tu cuenta, envíanos un correo electrónico y trabajaremos contigo para restablecer el acceso lo antes posible.",
      },
    },
    emailCode: {
      ...esMX.signIn?.emailCode,
      resendButton: "Reenviar código",
      title: "Revisa tu correo electrónico",
    },
    emailCodeMfa: {
      ...esMX.signIn?.emailCodeMfa,
      formTitle: "Revisa tu correo electrónico",
      title: "Revisa tu correo electrónico",
    },
    password: {
      ...esMX.signIn?.password,
      title: "Ingresa tu contraseña",
    },
    resetPassword: {
      ...esMX.signIn?.resetPassword,
      requiredMessage:
        "Por razones de seguridad, es necesario restablecer tu contraseña.",
    },
    start: {
      ...esMX.signIn?.start,
      actionText: "¿No tienes cuenta?",
    },
  },
  unstable__errors: {
    ...esMX.unstable__errors,
    form_email_address_blocked:
      "Los servicios de correo electrónico temporal no están permitidos. Usa tu dirección de correo electrónico habitual para crear una cuenta.",
    form_param_nil: "Este campo es obligatorio.",
    form_password_size_in_bytes_exceeded:
      "La contraseña supera el número máximo de bytes permitidos. Elimina algunos caracteres especiales o reduce su longitud.",
  },
} satisfies typeof esMX;
