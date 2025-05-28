# Wari 🚕

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


```

4. Correr el proyecto

```
yarn dev
```

## 🧾 Licencia

Este proyecto está bajo la licencia MIT.
