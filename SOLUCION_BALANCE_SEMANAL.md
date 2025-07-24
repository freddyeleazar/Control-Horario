# Corrección del Cálculo de Balance Semanal

## Problema Identificado
La aplicación de registro de clases de violín tenía un problema en el cálculo del balance de horas: **cuando había clases que ocurrían durante la misma semana, la suma o resta de horas correspondiente no se realizaba correctamente entre clases realizadas durante la misma semana**.

## Problema Original
El cálculo anterior consideraba **TODAS** las clases registradas en la aplicación, sumando todas las horas y comparándolas con el objetivo total (1 hora × número total de clases). Esto causaba que:
- El balance no reflejara el estado real de la semana actual
- Las clases de semanas anteriores afectaran el balance mostrado
- No se podía tener un control preciso del avance semanal

## Solución Implementada

### 1. **Nuevas Funciones de Utilidad (utils.js)**
Se agregaron funciones especializadas para el manejo de semanas:

```javascript
// Obtener el inicio de la semana (lunes)
getWeekStart(date)

// Obtener el final de la semana (domingo)  
getWeekEnd(date)

// Verificar si dos fechas están en la misma semana
areDatesInSameWeek(date1, date2)

// Obtener identificador único de semana (YYYY-WW)
getWeekIdentifier(date)

// Agrupar registros por semana
groupRecordsByWeek(records)

// Obtener solo los registros de la semana actual
getCurrentWeekRecords(records)
```

### 2. **Modificación del Cálculo de Balance (app.js)**
Se modificó la función `updateBalanceInfo()` para:

**ANTES:**
- Calculaba el balance con TODOS los registros
- Mostraba mensajes genéricos como "FALTAN X:XX" o "SOBRAN X:XX"

**AHORA:**
- ✅ Solo considera las clases de la **semana actual**
- ✅ Calcula el objetivo basándose en las clases de esta semana únicamente
- ✅ Muestra mensajes específicos: "FALTAN X:XX esta semana" o "SOBRAN X:XX esta semana"
- ✅ Si no hay clases esta semana: "Sin clases esta semana"

### 3. **Lógica del Nuevo Cálculo**
```javascript
// 1. Obtener solo registros de la semana actual
const currentWeekRecords = Utils.getCurrentWeekRecords(allRecords);

// 2. Sumar minutos de las clases de esta semana
let totalMinutes = 0;
currentWeekRecords.forEach(record => {
    const { hours, minutes } = Utils.parseDuration(record.duration);
    totalMinutes += Utils.durationToMinutes(hours, minutes);
});

// 3. Calcular objetivo para esta semana (1 hora × clases de esta semana)
const targetMinutes = currentWeekRecords.length * 60;

// 4. Mostrar diferencia específica de la semana
const difference = totalMinutes - targetMinutes;
```

## Ejemplos de Funcionamiento

### Escenario 1: Semana Balanceada
**Clases esta semana:**
- Lunes: 1:00
- Miércoles: 1:00  
- Viernes: 1:00

**Resultado:** "✅ Todo OK esta semana" (3 horas = 3 clases × 1 hora)

### Escenario 2: Faltan Horas
**Clases esta semana:**
- Lunes: 0:45
- Miércoles: 0:30

**Resultado:** "⚠️ FALTAN 0:45 esta semana" (1:15 vs objetivo de 2:00)

### Escenario 3: Sobran Horas  
**Clases esta semana:**
- Lunes: 1:30
- Miércoles: 1:00

**Resultado:** "⚠️ SOBRAN 0:30 esta semana" (2:30 vs objetivo de 2:00)

## Características Importantes

1. **Independiente de Filtros**: El balance semanal se calcula con TODOS los registros, no solo los filtrados en la tabla
2. **Actualización Automática**: Se recalcula cada vez que se agregan, editan o eliminan registros
3. **Semana ISO**: Considera lunes como inicio de semana (estándar internacional)
4. **Mensajes Claros**: Específica que el balance es "esta semana" para evitar confusiones

## Archivos Modificados

1. **`js/utils.js`** - Nuevas funciones para manejo de semanas
2. **`js/app.js`** - Modificación de `updateBalanceInfo()` y `renderAll()`

## Verificación
Para verificar el funcionamiento, se crearon archivos de prueba:
- `test_week_functions.html` - Prueba funciones de semana
- `test_balance.html` - Prueba cálculo de balance semanal

El problema ha sido **completamente solucionado**. Ahora el profesor y la alumna pueden ver correctamente si están al día con las horas de la semana actual, independientemente de las clases de semanas anteriores.
