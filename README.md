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


## 🔐 ¿Cómo se utiliza Clerk?

Wari integra [Clerk](https://clerk.dev) para gestionar la autenticación de conductores.  

### ✨ Registro e inicio de sesión

Utilizamos los hooks de Clerk para poder utilizar el custom flow:

```ts
const { signUp, setActive: setActiveRegister } = useSignUp();
const { signIn, setActive: setActiveLogin } = useSignIn();
const { signOut } = useAuth();
```
Así como también almacenamos el ```id ``` y el ```createdUserId``` para futuros manejos del usuario desde un panel administrativo
