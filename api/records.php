<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class RecordsAPI {
    private $csvFile;
    
    public function __construct() {
        $this->csvFile = __DIR__ . '/../data/records.csv';
        $this->ensureDataDirectory();
    }
    
    private function ensureDataDirectory() {
        $dataDir = dirname($this->csvFile);
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0755, true);
        }
    }
    
    private function ensureCSVFile() {
        if (!file_exists($this->csvFile)) {
            $header = "id,date,duration,notes\n";
            file_put_contents($this->csvFile, $header);
        }
    }
    
    private function loadRecords() {
        $this->ensureCSVFile();
        $records = [];
        
        if (($handle = fopen($this->csvFile, 'r')) !== FALSE) {
            $header = fgetcsv($handle); // Skip header
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) >= 4) {
                    $records[] = [
                        'id' => (int)$data[0],
                        'date' => $data[1],
                        'duration' => $data[2],
                        'notes' => $data[3] ?? ''
                    ];
                }
            }
            fclose($handle);
        }
        
        return $records;
    }
    
    private function saveRecords($records) {
        $this->ensureCSVFile();
        
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
    
    private function getNextId($records) {
        if (empty($records)) {
            return 1;
        }
        
        $maxId = max(array_column($records, 'id'));
        return $maxId + 1;
    }
    
    private function validateRecord($data) {
        $errors = [];
        
        // Validate date
        if (empty($data['date'])) {
            $errors[] = 'La fecha es requerida';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['date'])) {
            $errors[] = 'Formato de fecha inválido (debe ser YYYY-MM-DD)';
        }
        
        // Validate duration
        if (empty($data['duration'])) {
            $errors[] = 'La duración es requerida';
        } elseif (!preg_match('/^\d{1,2}:\d{2}$/', $data['duration'])) {
            $errors[] = 'Formato de duración inválido (debe ser H:MM)';
        } else {
            $parts = explode(':', $data['duration']);
            $hours = (int)$parts[0];
            $minutes = (int)$parts[1];
            
            if ($hours < 0 || $hours > 23) {
                $errors[] = 'Las horas deben estar entre 0 y 23';
            }
            
            if ($minutes < 0 || $minutes > 59) {
                $errors[] = 'Los minutos deben estar entre 0 y 59';
            }
            
            if ($hours === 0 && $minutes === 0) {
                $errors[] = 'La duración debe ser mayor a 0';
            }
        }
        
        return $errors;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            switch ($method) {
                case 'GET':
                    $this->getRecords();
                    break;
                    
                case 'POST':
                    $this->createRecord($input);
                    break;
                    
                case 'PUT':
                    $this->updateRecord($input);
                    break;
                    
                case 'DELETE':
                    $this->deleteRecord($input);
                    break;
                    
                default:
                    $this->sendError('Método no permitido', 405);
                    break;
            }
        } catch (Exception $e) {
            $this->sendError('Error interno del servidor: ' . $e->getMessage(), 500);
        }
    }
    
    private function getRecords() {
        $records = $this->loadRecords();
        
        // Sort by date descending
        usort($records, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        $this->sendSuccess($records);
    }
    
    private function createRecord($data) {
        $errors = $this->validateRecord($data);
        
        if (!empty($errors)) {
            $this->sendError(implode(', ', $errors), 400);
            return;
        }
        
        $records = $this->loadRecords();
        $newRecord = [
            'id' => $this->getNextId($records),
            'date' => $data['date'],
            'duration' => $data['duration'],
            'notes' => $data['notes'] ?? ''
        ];
        
        $records[] = $newRecord;
        
        if ($this->saveRecords($records)) {
            $this->sendSuccess($newRecord, 'Registro creado exitosamente');
        } else {
            $this->sendError('Error al guardar el registro', 500);
        }
    }
    
    private function updateRecord($data) {
        if (empty($data['id'])) {
            $this->sendError('ID es requerido para actualizar', 400);
            return;
        }
        
        $errors = $this->validateRecord($data);
        
        if (!empty($errors)) {
            $this->sendError(implode(', ', $errors), 400);
            return;
        }
        
        $records = $this->loadRecords();
        $recordIndex = -1;
        
        foreach ($records as $index => $record) {
            if ($record['id'] == $data['id']) {
                $recordIndex = $index;
                break;
            }
        }
        
        if ($recordIndex === -1) {
            $this->sendError('Registro no encontrado', 404);
            return;
        }
        
        $records[$recordIndex] = [
            'id' => (int)$data['id'],
            'date' => $data['date'],
            'duration' => $data['duration'],
            'notes' => $data['notes'] ?? ''
        ];
        
        if ($this->saveRecords($records)) {
            $this->sendSuccess($records[$recordIndex], 'Registro actualizado exitosamente');
        } else {
            $this->sendError('Error al actualizar el registro', 500);
        }
    }
    
    private function deleteRecord($data) {
        if (empty($data['id'])) {
            $this->sendError('ID es requerido para eliminar', 400);
            return;
        }
        
        $records = $this->loadRecords();
        $recordIndex = -1;
        
        foreach ($records as $index => $record) {
            if ($record['id'] == $data['id']) {
                $recordIndex = $index;
                break;
            }
        }
        
        if ($recordIndex === -1) {
            $this->sendError('Registro no encontrado', 404);
            return;
        }
        
        array_splice($records, $recordIndex, 1);
        
        if ($this->saveRecords($records)) {
            $this->sendSuccess(null, 'Registro eliminado exitosamente');
        } else {
            $this->sendError('Error al eliminar el registro', 500);
        }
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
$api = new RecordsAPI();
$api->handleRequest();
?>
