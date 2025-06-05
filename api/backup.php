<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class BackupAPI {
    private $csvFile;
    
    public function __construct() {
        $this->csvFile = __DIR__ . '/../data/records.csv';
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';
        
        try {
            switch ($method) {
                case 'GET':
                    if ($action === 'export') {
                        $this->exportCSV();
                    } else {
                        $this->sendError('Acción no válida', 400);
                    }
                    break;
                    
                case 'POST':
                    if ($action === 'import') {
                        $this->importCSV();
                    } else {
                        $this->sendError('Acción no válida', 400);
                    }
                    break;
                    
                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error interno del servidor: ' . $e->getMessage(), 500);
        }
    }
    
    private function exportCSV() {
        if (!file_exists($this->csvFile)) {
            $this->sendError('No hay datos para exportar', 404);
            return;
        }
        
        $filename = 'violin_records_' . date('Y-m-d_H-i-s') . '.csv';
        
        header('Content-Type: application/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Expires: 0');
        
        readfile($this->csvFile);
        exit();
    }
    
    private function importCSV() {
        if (!isset($_FILES['file'])) {
            $this->sendError('No se recibió ningún archivo', 400);
            return;
        }
        
        $file = $_FILES['file'];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $this->sendError('Error al subir el archivo', 400);
            return;
        }
        
        if ($file['type'] !== 'text/csv' && !str_ends_with($file['name'], '.csv')) {
            $this->sendError('El archivo debe ser de tipo CSV', 400);
            return;
        }
        
        $tempFile = $file['tmp_name'];
        $records = [];
        $errors = [];
        $lineNumber = 1;
        
        if (($handle = fopen($tempFile, 'r')) !== FALSE) {
            $header = fgetcsv($handle); // Skip header
            $lineNumber++;
            
            // Validate header
            $expectedHeader = ['id', 'date', 'duration', 'notes'];
            if ($header !== $expectedHeader) {
                $this->sendError('El archivo CSV debe tener las columnas: id, date, duration, notes', 400);
                return;
            }
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) >= 4) {
                    $record = [
                        'id' => (int)$data[0],
                        'date' => $data[1],
                        'duration' => $data[2],
                        'notes' => $data[3] ?? ''
                    ];
                    
                    // Validate record
                    $recordErrors = $this->validateRecord($record);
                    if (!empty($recordErrors)) {
                        $errors[] = "Línea $lineNumber: " . implode(', ', $recordErrors);
                    } else {
                        $records[] = $record;
                    }
                }
                $lineNumber++;
            }
            fclose($handle);
        }
        
        if (!empty($errors)) {
            $this->sendError('Errores en el archivo CSV: ' . implode('; ', $errors), 400);
            return;
        }
        
        if (empty($records)) {
            $this->sendError('No se encontraron registros válidos en el archivo', 400);
            return;
        }
        
        // Save imported records
        if ($this->saveRecords($records)) {
            $this->sendSuccess([
                'imported_count' => count($records),
                'records' => $records
            ], "Se importaron {count($records)} registros exitosamente");
        } else {
            $this->sendError('Error al guardar los registros importados', 500);
        }
    }
    
    private function validateRecord($record) {
        $errors = [];
        
        // Validate ID
        if (!is_numeric($record['id']) || $record['id'] <= 0) {
            $errors[] = 'ID inválido';
        }
        
        // Validate date
        if (empty($record['date'])) {
            $errors[] = 'La fecha es requerida';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $record['date'])) {
            $errors[] = 'Formato de fecha inválido (debe ser YYYY-MM-DD)';
        }
        
        // Validate duration
        if (empty($record['duration'])) {
            $errors[] = 'La duración es requerida';
        } elseif (!preg_match('/^\d{1,2}:\d{2}$/', $record['duration'])) {
            $errors[] = 'Formato de duración inválido (debe ser H:MM)';
        }
        
        return $errors;
    }
    
    private function saveRecords($records) {
        $dataDir = dirname($this->csvFile);
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
        
        if (($handle = fopen($this->csvFile, 'w')) !== FALSE) {
            // Write header
            fputcsv($handle, ['id', 'date', 'duration', 'notes']);
            
            // Write records
            foreach ($records as $record) {
                fputcsv($handle, [
                    $record['id'],
                    $record['date'],
                    $record['duration'],
                    $record['notes'] ?? ''
                ]);
            }
            fclose($handle);
            return true;
        }
        
        return false;
    }
    
    private function sendSuccess($data = null, $message = 'Operación exitosa') {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'data' => null
        ]);
    }
}

// Initialize and handle the request
$api = new BackupAPI();
$api->handleRequest();
?>
