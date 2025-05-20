# Wari 🚕 

## 📌 Descripción del proyecto

¿Y si pudieras saber en todo momento a dónde va el taxi en el que viaja tu hijo, hija o un ser querido?

Con **Wari**, eso ya es posible.  
Gracias al sistema integrado de **#GPSHawk**, los taxis Wari comparten contigo su ubicación en tiempo real.

🚕 Pero no solo eso: tú también puedes compartir ese recorrido con tus familiares o personas de confianza.

Más seguridad, más tranquilidad… ¡y sin pagar un sol más!

**Wari no reemplaza al taxi tradicional… lo mejora.**  
Porque la seguridad ya no debe ser un lujo, sino un derecho.

📍 *Muy pronto en Huánuco*  
Taxis seguros, tecnología confiable, y todo **GRATIS** para el pasajero.

## 🌐 Demo del proyecto

- 🔗 [Despliegue](https://wari.hawkperu.com/)  
- 📂 [Repositorio en GitHub](https://github.com/VictorYsla/Wari)

## 🎥 Demo en video


### 📍 Seguimiento del vehículo
https://github.com/user-attachments/assets/c49a4d4e-24f6-4feb-9b46-9f439dbd4c7b

### 🚖 Inicio de sesión y acceso a la app
https://github.com/user-attachments/assets/5cb8ae0e-a272-46fa-adea-f4ee133435d3


## 🔐 Uso de Clerk

**Wari** utiliza [Clerk](https://clerk.dev) para gestionar la autenticación de los conductores.

### ✨ Registro e inicio de sesión personalizados

Usamos los hooks de Clerk para implementar un flujo de autenticación personalizado:

```ts
const { signUp, setActive: setActiveRegister } = useSignUp();
const { signIn, setActive: setActiveLogin } = useSignIn();
const { signOut } = useAuth();
```

![Image](https://github.com/user-attachments/assets/a087f97d-095a-448c-a5f9-c4469c20b782)



## ⚙️ Instalación local

1. Clonar el repositorio: 
```
git clone git@github.com:VictorYsla/Wari.git
```

2. Instalar dependencias
```
yarn install
```
3.Crear el archivo .env.local
```
NEXT_PUBLIC_BASE_URL="tu_url_base_de_la_aplicacion"

# Hawk
NEXT_PUBLIC_HAWK_BASE_URL="tu_url_base_de_api_hawk"
NEXT_PUBLIC_HAWK_INITIAL_PARAMS="tus_parametros_iniciales_de_hawk_si_los_hay"
NEXT_PUBLIC_HAWK_END_PARAMS="tus_parametros_finales_de_hawk_si_los_hay"
NEXT_PUBLIC_HAWK_GET_ALL_INITIAL_PARAMS="tus_parametros_iniciales_para_obtener_todo_de_hawk"
NEXT_PUBLIC_HAWK_GET_ALL_END_PARAMS="tus_parametros_finales_para_obtener_todo_de_hawk"

# Google
NEXT_PUBLIC_Maps_API_KEY="tu_clave_api_de_Maps"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="tu_clave_publicable_de_clerk"
CLERK_SECRET_KEY="tu_clave_secreta_de_clerk"
```
## 🧾 Licencia

Este proyecto está bajo la licencia MIT.


