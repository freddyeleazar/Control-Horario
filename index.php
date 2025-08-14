<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de clases de violín</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/modals.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1 class="app-title">
                    <i class="fas fa-violin"></i>
                    Registro de clases de violín
                </h1>
                <div class="balance-info" id="balanceInfo">
                    <span id="balanceText">Balance: En hora</span>
                    <div id="weekRangeText" class="week-range-text"></div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">            <!-- Add New Record Button -->
            <div class="action-bar">
                <button class="btn btn-primary" id="addRecordBtn">
                    <i class="fas fa-plus"></i>
                    Nueva clase
                </button>
                <div class="action-buttons-group">
                    <button class="btn btn-success" id="exportBtn">
                        <i class="fas fa-download"></i>
                        Exportar CSV
                    </button>
                    <label for="importFile" class="btn btn-info">
                        <i class="fas fa-upload"></i>
                        Importar CSV
                    </label>
                    <input type="file" id="importFile" accept=".csv" style="display: none;">
                </div>
            </div>

            <!-- Filters -->
            <div class="filters-section">
                <div class="filters-grid">
                    <div class="filter-group">
                        <label for="dateFilter">Filtro por fecha:</label>
                        <input type="date" id="dateFilter" class="filter-input">
                    </div>
                    <div class="filter-group">
                        <label for="monthFilter">Filtro por mes:</label>
                        <select id="monthFilter" class="filter-input">
                            <option value="">Todos los meses</option>
                            <option value="01">Enero</option>
                            <option value="02">Febrero</option>
                            <option value="03">Marzo</option>
                            <option value="04">Abril</option>
                            <option value="05">Mayo</option>
                            <option value="06">Junio</option>
                            <option value="07">Julio</option>
                            <option value="08">Agosto</option>
                            <option value="09">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="yearFilter">Filtro por año:</label>
                        <select id="yearFilter" class="filter-input">
                            <option value="">Todos los años</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="textFilter">Buscar en notas:</label>
                        <input type="text" id="textFilter" placeholder="Palabra clave..." class="filter-input">
                    </div>
                    <div class="filter-group">
                        <button class="btn btn-secondary" id="clearFilters">
                            <i class="fas fa-times"></i>
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            <!-- Records Table -->
            <div class="table-container">
                <table class="records-table" id="recordsTable">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Duración</th>
                            <th>Saldo</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="recordsTableBody">
                        <!-- Records will be loaded here -->
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination-container">
                <div class="pagination-info">
                    <span id="paginationInfo">Mostrando 0 de 0 registros</span>
                </div>
                <div class="pagination-controls">
                    <button class="btn btn-secondary" id="prevPageBtn" disabled>
                        <i class="fas fa-chevron-left"></i>
                        Anterior
                    </button>
                    <span id="pageInfo">Página 1 de 1</span>
                    <button class="btn btn-secondary" id="nextPageBtn" disabled>
                        Siguiente
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->
    <div id="recordModal"></div>
    <div id="notesModal"></div>
    <div id="confirmModal"></div>

    <!-- Scripts -->
    <script src="js/utils.js"></script>
    <script src="js/modal-manager.js"></script>
    <script src="js/record-manager.js"></script>
    <script src="js/table-manager.js"></script>
    <script src="js/filter-manager.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
