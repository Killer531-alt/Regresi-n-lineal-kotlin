# Proyecto: Regresión Lineal en Kotlin

Este proyecto implementa un modelo de **Regresión Lineal Simple** desarrollado en **Kotlin**, cuyo objetivo es calcular la relación entre dos variables numéricas (por ejemplo, X e Y) a través del método de mínimos cuadrados.  

Permite predecir valores futuros y analizar tendencias de forma sencilla, combinando teoría estadística con programación funcional en Kotlin.

---

## 📘 Descripción del proyecto

La **Regresión Lineal Simple** busca encontrar una recta de la forma:

\[ y = a + b x \]

donde:
- **a** es la intersección o término independiente (intercepto),
- **b** es la pendiente de la recta,
- **x** es la variable independiente,
- **y** es la variable dependiente o valor predicho.

Este programa:
1. Lee pares de datos (x, y).
2. Calcula la pendiente (**b**) y la intersección (**a**).
3. Permite predecir nuevos valores de **y** a partir de un valor de **x**.
4. Muestra los resultados por consola o archivo.

---

## ⚙️ Estructura del proyecto

```
regresion-lineal-kotlin/
│
├── src/
│   └── main/
│       ├── kotlin/
│       │   └── Main.kt
│       └── resources/
│
├── build.gradle.kts
├── README.md
└── .gitignore
```

---

## 🧮 Fórmulas utilizadas

- Pendiente (b):
  \[ b = \frac{n(Σxy) - (Σx)(Σy)}{n(Σx^2) - (Σx)^2} \]

- Intersección (a):
  \[ a = \frac{Σy - b(Σx)}{n} \]

- Ecuación final:
  \[ y = a + bx \]

---

## 🚀 Cómo ejecutar el proyecto

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Killer531-alt/Regresi-n-lineal-kotlin.git
cd Regresi-n-lineal-kotlin
```

### 2️⃣ Compilar y ejecutar
Si estás usando **Gradle**, puedes ejecutar:

```bash
./gradlew run
```

O directamente desde IntelliJ IDEA / VSCode con Kotlin configurado.

---

## 🧠 Ejemplo de uso

### Entrada
```text
x: 1, 2, 3, 4, 5
y: 2, 4, 5, 4, 5
```

### Salida esperada
```text
Pendiente (b): 0.6
Intersección (a): 2.2
Ecuación: y = 2.2 + 0.6x
Predicción para x=6: 5.8
```

---

## 🧩 Tecnologías utilizadas

- **Kotlin 1.9+**
- **Gradle (KTS)** como sistema de construcción
- **Git / GitHub** para control de versiones
- **IntelliJ IDEA** o **VSCode** como IDE recomendados

---

## 👨‍💻 Autor

**Johan Baracaldo**  
📧 [johan.baracaldo01@usa.edu.co](mailto:johan.baracaldo01@usa.edu.co)  
💻 [GitHub: Killer531-alt](https://github.com/Killer531-alt)

---

## 🪪 Licencia

Este proyecto está bajo la licencia **MIT**, lo que permite su libre uso, modificación y distribución siempre que se mantenga el reconocimiento del autor original.

---

