// Configuration
const API_BASE_URL = 'https://boilermanager.onrender.com/api';

// Global variables
let allData = {
    dailyLog: [],
    maintenance: [],
    inventory: [],
    efficiency: []
};

// Initialize the application
window.onload = function() {
    checkConnection();
    loadAllData();
};

// Check server connection
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/data`);
        const status = document.getElementById('connectionStatus');
        if (response.ok) {
            status.textContent = '🟢 Connected';
            status.className = 'connection-status connected';
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        const status = document.getElementById('connectionStatus');
        status.textContent = '🔴 Disconnected';
        status.className = 'connection-status disconnected';
        console.error('Connection error:', error);
    }
}

// Tab switching functionality
function openTab(evt, tabName) {
    var i, tabcontent, tabs;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tabs = document.getElementsByClassName("tab");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Load all data from server
async function loadAllData() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/data`);
        if (response.ok) {
            allData = await response.json();
            populateAllTables();
            updateMetrics();
        } else {
            throw new Error('Failed to load data');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data from server', 'error');
    } finally {
        showLoading(false);
    }
}

// Populate all tables with data
function populateAllTables() {
    populateDailyLogTable();
    populateMaintenanceTable();
    populateInventoryTable();
    populateEfficiencyTable();
}

// Populate daily log table
function populateDailyLogTable() {
    const tbody = document.getElementById('dailyLogBody');
    tbody.innerHTML = '';
    
    allData.dailyLog.forEach(record => {
        const row = createDailyLogRow(record);
        tbody.appendChild(row);
    });
}

// Create daily log row
function createDailyLogRow(data = {}) {
    const row = document.createElement('tr');
    if (!data.id) {
        data.id = Date.now().toString();
    }
    row.innerHTML = `
        <td><input type="date" class="input-field" value="${data.date || ''}" data-field="date"></td>
        <td>
            <select class="input-field" data-field="shift">
                <option value="Shift 1 (6AM-2PM)" ${data.shift === 'Shift 1 (6AM-2PM)' ? 'selected' : ''}>Shift 1 (6AM-2PM)</option>
                <option value="Shift 2 (2PM-10PM)" ${data.shift === 'Shift 2 (2PM-10PM)' ? 'selected' : ''}>Shift 2 (2PM-10PM)</option>
                <option value="Shift 3 (10PM-6AM)" ${data.shift === 'Shift 3 (10PM-6AM)' ? 'selected' : ''}>Shift 3 (10PM-6AM)</option>
            </select>
        </td>
        <td><input type="text" class="input-field" value="${data.operatorName || ''}" data-field="operatorName" placeholder="Operator Name"></td>
        <td><input type="time" class="input-field" value="${data.startTime || ''}" data-field="startTime"></td>
        <td><input type="time" class="input-field" value="${data.endTime || ''}" data-field="endTime"></td>
        <td><input type="number" class="input-field" value="${data.steamPressure || ''}" data-field="steamPressure" placeholder="Bar" step="0.1"></td>
        <td><input type="number" class="input-field" value="${data.steamTemperature || ''}" data-field="steamTemperature" placeholder="°C"></td>
        <td>
            <select class="input-field" data-field="feedWaterLevel">
                <option value="Normal" ${data.feedWaterLevel === 'Normal' ? 'selected' : ''}>Normal</option>
                <option value="Low" ${data.feedWaterLevel === 'Low' ? 'selected' : ''}>Low</option>
                <option value="High" ${data.feedWaterLevel === 'High' ? 'selected' : ''}>High</option>
            </select>
        </td>
        <td>
            <select class="input-field" data-field="fuelType">
                <option value="Wood Chips" ${data.fuelType === 'Wood Chips' ? 'selected' : ''}>Wood Chips</option>
                <option value="Rice Husk" ${data.fuelType === 'Rice Husk' ? 'selected' : ''}>Rice Husk</option>
                <option value="Coal" ${data.fuelType === 'Coal' ? 'selected' : ''}>Coal</option>
                <option value="Biomass" ${data.fuelType === 'Biomass' ? 'selected' : ''}>Biomass</option>
                <option value="Mixed" ${data.fuelType === 'Mixed' ? 'selected' : ''}>Mixed</option>
            </select>
        </td>
        <td><input type="number" class="input-field" value="${data.fuelConsumed || ''}" data-field="fuelConsumed" placeholder="Kg"></td>
        <td><input type="number" class="input-field" value="${data.ashRemoved || ''}" data-field="ashRemoved" placeholder="Kg"></td>
        <td>
            <select class="input-field" data-field="boilerStatus">
                <option value="Running" ${data.boilerStatus === 'Running' ? 'selected' : ''}>Running</option>
                <option value="Stopped" ${data.boilerStatus === 'Stopped' ? 'selected' : ''}>Stopped</option>
                <option value="Maintenance" ${data.boilerStatus === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
            </select>
        </td>
        <td>
            <select class="input-field" data-field="safetyCheck">
                <option value="✓ OK" ${data.safetyCheck === '✓ OK' ? 'selected' : ''}>✓ OK</option>
                <option value="⚠ Warning" ${data.safetyCheck === '⚠ Warning' ? 'selected' : ''}>⚠ Warning</option>
                <option value="❌ Issue" ${data.safetyCheck === '❌ Issue' ? 'selected' : ''}>❌ Issue</option>
            </select>
        </td>
        <td><input type="text" class="input-field" value="${data.remarks || ''}" data-field="remarks" placeholder="Any observations"></td>
        <td>
            <button class="delete-btn" onclick="deleteRecord('dailyLog', '${data.id}', this)">Delete</button>
        </td>
    `;
    
    if (data.id) {
        row.dataset.id = data.id;
    }
    
    return row;
}

// Populate maintenance table
function populateMaintenanceTable() {
    const tbody = document.getElementById('maintenanceBody');
    tbody.innerHTML = '';
    
    allData.maintenance.forEach(record => {
        const row = createMaintenanceRow(record);
        tbody.appendChild(row);
    });
}

// Create maintenance row
function createMaintenanceRow(data = {}) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="input-field" value="${data.taskId || ''}" data-field="taskId" placeholder="Task ID"></td>
        <td>
            <select class="input-field" data-field="component">
                <option value="Boiler Tube" ${data.component === 'Boiler Tube' ? 'selected' : ''}>Boiler Tube</option>
                <option value="Burner" ${data.component === 'Burner' ? 'selected' : ''}>Burner</option>
                <option value="Water Pump" ${data.component === 'Water Pump' ? 'selected' : ''}>Water Pump</option>
                <option value="Safety Valve" ${data.component === 'Safety Valve' ? 'selected' : ''}>Safety Valve</option>
                <option value="Pressure Gauge" ${data.component === 'Pressure Gauge' ? 'selected' : ''}>Pressure Gauge</option>
                <option value="Feed System" ${data.component === 'Feed System' ? 'selected' : ''}>Feed System</option>
                <option value="Ash Handling" ${data.component === 'Ash Handling' ? 'selected' : ''}>Ash Handling</option>
                <option value="Steam Drum" ${data.component === 'Steam Drum' ? 'selected' : ''}>Steam Drum</option>
            </select>
        </td>
        <td><input type="text" class="input-field" value="${data.maintenanceTask || ''}" data-field="maintenanceTask" placeholder="Maintenance Task"></td>
        <td>
            <select class="input-field" data-field="frequency">
                <option value="Daily" ${data.frequency === 'Daily' ? 'selected' : ''}>Daily</option>
                <option value="Weekly" ${data.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                <option value="Monthly" ${data.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
                <option value="Quarterly" ${data.frequency === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                <option value="Semi-Annual" ${data.frequency === 'Semi-Annual' ? 'selected' : ''}>Semi-Annual</option>
                <option value="Annual" ${data.frequency === 'Annual' ? 'selected' : ''}>Annual</option>
            </select>
        </td>
        <td><input type="date" class="input-field" value="${data.lastDone || ''}" data-field="lastDone"></td>
        <td><input type="date" class="input-field" value="${data.nextDue || ''}" data-field="nextDue"></td>
        <td>
            <select class="input-field" data-field="status">
                <option value="Scheduled" ${data.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                <option value="In Progress" ${data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${data.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Overdue" ${data.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
            </select>
        </td>
        <td><input type="text" class="input-field" value="${data.assignedTo || ''}" data-field="assignedTo" placeholder="Assigned To"></td>
        <td><input type="number" class="input-field" value="${data.estimatedHours || ''}" data-field="estimatedHours" placeholder="Hours"></td>
        <td><input type="text" class="input-field" value="${data.partsRequired || ''}" data-field="partsRequired" placeholder="Parts Required"></td>
        <td><input type="number" class="input-field" value="${data.cost || ''}" data-field="cost" placeholder="₹"></td>
        <td>
            <select class="input-field" data-field="priority">
                <option value="Low" ${data.priority === 'Low' ? 'selected' : ''}>Low</option>
                <option value="Medium" ${data.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="High" ${data.priority === 'High' ? 'selected' : ''}>High</option>
                <option value="Critical" ${data.priority === 'Critical' ? 'selected' : ''}>Critical</option>
            </select>
        </td>
        <td><input type="text" class="input-field" value="${data.notes || ''}" data-field="notes" placeholder="Notes"></td>
        <td>
            <button class="delete-btn" onclick="deleteRecord('maintenance', '${data.id}', this)">Delete</button>
        </td>
    `;
    
    if (data.id) {
        row.dataset.id = data.id;
    }
    
    return row;
}

// Populate inventory table
function populateInventoryTable() {
    const tbody = document.getElementById('inventoryBody');
    tbody.innerHTML = '';
    
    allData.inventory.forEach(record => {
        const row = createInventoryRow(record);
        tbody.appendChild(row);
    });
}

// Create inventory row
function createInventoryRow(data = {}) {
    const row = document.createElement('tr');
    const status = getInventoryStatus(data.currentStock, data.minimumStock);
    
    row.innerHTML = `
        <td><input type="text" class="input-field" value="${data.itemCode || ''}" data-field="itemCode" placeholder="Item Code"></td>
        <td><input type="text" class="input-field" value="${data.itemName || ''}" data-field="itemName" placeholder="Item Name"></td>
        <td>
            <select class="input-field" data-field="category">
                <option value="Fuel" ${data.category === 'Fuel' ? 'selected' : ''}>Fuel</option>
                <option value="Spare Parts" ${data.category === 'Spare Parts' ? 'selected' : ''}>Spare Parts</option>
                <option value="Chemicals" ${data.category === 'Chemicals' ? 'selected' : ''}>Chemicals</option>
                <option value="Tools" ${data.category === 'Tools' ? 'selected' : ''}>Tools</option>
                <option value="Safety Equipment" ${data.category === 'Safety Equipment' ? 'selected' : ''}>Safety Equipment</option>
                <option value="Consumables" ${data.category === 'Consumables' ? 'selected' : ''}>Consumables</option>
            </select>
        </td>
        <td><input type="number" class="input-field" value="${data.currentStock || ''}" data-field="currentStock" placeholder="Current Stock"></td>
        <td><input type="text" class="input-field" value="${data.unit || ''}" data-field="unit" placeholder="Unit"></td>
        <td><input type="number" class="input-field" value="${data.minimumStock || ''}" data-field="minimumStock" placeholder="Min Stock"></td>
        <td><input type="number" class="input-field" value="${data.maximumStock || ''}" data-field="maximumStock" placeholder="Max Stock"></td>
        <td><span class="status-indicator ${status.class}">${status.text}</span></td>
        <td><input type="number" class="input-field" value="${data.unitPrice || ''}" data-field="unitPrice" placeholder="₹"></td>
        <td><input type="text" class="input-field" value="${data.supplier || ''}" data-field="supplier" placeholder="Supplier"></td>
        <td><input type="date" class="input-field" value="${data.lastPurchase || ''}" data-field="lastPurchase"></td>
        <td><input type="date" class="input-field" value="${data.lastUsed || ''}" data-field="lastUsed"></td>
        <td><input type="text" class="input-field" value="${data.usageRate || ''}" data-field="usageRate" placeholder="Usage Rate"></td>
        <td><input type="text" class="input-field" value="${data.notes || ''}" data-field="notes" placeholder="Notes"></td>
        <td>
            <button class="delete-btn" onclick="deleteRecord('inventory', '${data.id}', this)">Delete</button>
        </td>
    `;
    
    if (data.id) {
        row.dataset.id = data.id;
    }
    
    return row;
}

// Populate efficiency table
function populateEfficiencyTable() {
    const tbody = document.getElementById('efficiencyBody');
    tbody.innerHTML = '';
    
    allData.efficiency.forEach(record => {
        const row = createEfficiencyRow(record);
        tbody.appendChild(row);
    });
}

// Create efficiency row
function createEfficiencyRow(data = {}) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="date" class="input-field" value="${data.date || ''}" data-field="date"></td>
        <td>
            <select class="input-field" data-field="shift">
                <option value="Shift 1 (6AM-2PM)" ${data.shift === 'Shift 1 (6AM-2PM)' ? 'selected' : ''}>Shift 1 (6AM-2PM)</option>
                <option value="Shift 2 (2PM-10PM)" ${data.shift === 'Shift 2 (2PM-10PM)' ? 'selected' : ''}>Shift 2 (2PM-10PM)</option>
                <option value="Shift 3 (10PM-6AM)" ${data.shift === 'Shift 3 (10PM-6AM)' ? 'selected' : ''}>Shift 3 (10PM-6AM)</option>
            </select>
        </td>
        <td>
            <select class="input-field" data-field="fuelType">
                <option value="Wood Chips" ${data.fuelType === 'Wood Chips' ? 'selected' : ''}>Wood Chips</option>
                <option value="Rice Husk" ${data.fuelType === 'Rice Husk' ? 'selected' : ''}>Rice Husk</option>
                <option value="Coal" ${data.fuelType === 'Coal' ? 'selected' : ''}>Coal</option>
                <option value="Biomass" ${data.fuelType === 'Biomass' ? 'selected' : ''}>Biomass</option>
                <option value="Mixed" ${data.fuelType === 'Mixed' ? 'selected' : ''}>Mixed</option>
            </select>
        </td>
        <td><input type="number" class="input-field" value="${data.fuelConsumed || ''}" data-field="fuelConsumed" placeholder="Kg"></td>
        <td><input type="number" class="input-field" value="${data.steamGenerated || ''}" data-field="steamGenerated" placeholder="Kg"></td>
        <td><input type="number" class="input-field" value="${data.steamPressure || ''}" data-field="steamPressure" placeholder="Bar" step="0.1"></td>
        <td><input type="number" class="input-field" value="${data.steamTemperature || ''}" data-field="steamTemperature" placeholder="°C"></td>
        <td><input type="number" class="input-field" value="${data.feedWaterTemp || ''}" data-field="feedWaterTemp" placeholder="°C"></td>
        <td><input type="number" class="input-field" value="${data.flueGasTemp || ''}" data-field="flueGasTemp" placeholder="°C"></td>
        <td><input type="number" class="input-field" value="${data.efficiency || ''}" data-field="efficiency" placeholder="%" step="0.1"></td>
        <td><input type="number" class="input-field" value="${data.steamFuelRatio || ''}" data-field="steamFuelRatio" placeholder="Ratio" step="0.1"></td>
        <td><input type="number" class="input-field" value="${data.heatRate || ''}" data-field="heatRate" placeholder="kCal/kg"></td>
        <td><input type="text" class="input-field" value="${data.issuesIdentified || ''}" data-field="issuesIdentified" placeholder="Issues"></td>
        <td><input type="text" class="input-field" value="${data.correctiveActions || ''}" data-field="correctiveActions" placeholder="Actions"></td>
        <td>
            <button class="delete-btn" onclick="deleteRecord('efficiency', '${data.id}', this)">Delete</button>
        </td>
    `;
    
    if (data.id) {
        row.dataset.id = data.id;
    }
    
    return row;
}

// Add new row functions
function addDailyLogRow() {
    const tbody = document.getElementById('dailyLogBody');
    const row = createDailyLogRow();
    tbody.appendChild(row);
}

function addMaintenanceRow() {
    const tbody = document.getElementById('maintenanceBody');
    const row = createMaintenanceRow();
    tbody.appendChild(row);
}

function addInventoryRow() {
    const tbody = document.getElementById('inventoryBody');
    const row = createInventoryRow();
    tbody.appendChild(row);
}

function addEfficiencyRow() {
    const tbody = document.getElementById('efficiencyBody');
    const row = createEfficiencyRow();
    tbody.appendChild(row);
}

// Save data to server
async function saveData(section) {
    showLoading(true);
    try {
        const tableData = extractTableData(section);
        const response = await fetch(`${API_BASE_URL}/data/${section}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tableData)
        });
        
        if (response.ok) {
            allData[section] = tableData;
            showNotification('Data saved successfully!', 'success');
            updateMetrics();
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Error saving data', 'error');
    } finally {
        showLoading(false);
    }
}

// Extract table data from DOM
function extractTableData(section) {
    const tableId = section + 'Table';
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    const data = [];
    
    rows.forEach(row => {
        const rowData = {};
        const inputs = row.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            const field = input.getAttribute('data-field');
            if (field) {
                rowData[field] = input.value;
            }
        });
        
        // Add existing ID if available
        if (row.dataset.id) {
            rowData.id = row.dataset.id;
        }
        
        // Only add rows that have some data
        if (Object.values(rowData).some(value => value && value.trim() !== '')) {
            data.push(rowData);
        }
    });
    
    return data;
}

// Delete record
async function deleteRecord(section, id, button) {
    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/data/${section}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            button.closest('tr').remove();
            allData[section] = allData[section].filter(record => record.id !== id);
            showNotification('Record deleted successfully!', 'success');
            updateMetrics();
        } else {
            throw new Error('Failed to delete record');
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        showNotification('Error deleting record', 'error');
    } finally {
        showLoading(false);
    }
}

// Export to CSV
function exportToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    const csv = [];
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('th, td');
        const rowData = [];
        
        cols.forEach((col, index) => {
            if (index < cols.length - 1) { // Skip actions column
                const input = col.querySelector('input, select');
                if (input) {
                    rowData.push('"' + input.value.replace(/"/g, '""') + '"');
                } else {
                    rowData.push('"' + col.textContent.replace(/"/g, '""') + '"');
                }
            }
        });
        
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Create backup
async function createBackup() {
    try {
        const response = await fetch(`${API_BASE_URL}/backup`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `boiler_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('Backup created successfully!', 'success');
        } else {
            throw new Error('Failed to create backup');
        }
    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('Error creating backup', 'error');
    }
}

// Update metrics
function updateMetrics() {
    updateDailyLogMetrics();
    updateEfficiencyMetrics();
}

// Update daily log metrics
function updateDailyLogMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = allData.dailyLog.filter(entry => entry.date === today);
    
    document.getElementById('todayEntries').textContent = todayEntries.length;
    
    const avgPressure = todayEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry.steamPressure) || 0);
    }, 0) / (todayEntries.length || 1);
    
    document.getElementById('avgSteamPressure').textContent = avgPressure.toFixed(1);
    
    const totalFuel = todayEntries.reduce((sum, entry) => {
        return sum + (parseFloat(entry.fuelConsumed) || 0);
    }, 0);
    
    document.getElementById('totalFuelUsed').textContent = totalFuel.toFixed(1);
}

// Update efficiency metrics
function updateEfficiencyMetrics() {
    const efficiencyData = allData.efficiency;
    
    if (efficiencyData.length > 0) {
        const avgEff = efficiencyData.reduce((sum, entry) => {
            return sum + (parseFloat(entry.efficiency) || 0);
        }, 0) / efficiencyData.length;
        
        document.getElementById('avgEfficiency').textContent = avgEff.toFixed(1) + '%';
        
        const avgSteamGen = efficiencyData.reduce((sum, entry) => {
            return sum + (parseFloat(entry.steamGenerated) || 0);
        }, 0) / efficiencyData.length;
        
        document.getElementById('steamGenRate').textContent = avgSteamGen.toFixed(1);
        
        const avgFuelCons = efficiencyData.reduce((sum, entry) => {
            return sum + (parseFloat(entry.fuelConsumed) || 0);
        }, 0) / efficiencyData.length;
        
        document.getElementById('fuelConsumption').textContent = avgFuelCons.toFixed(1);
        
        const avgRatio = efficiencyData.reduce((sum, entry) => {
            return sum + (parseFloat(entry.steamFuelRatio) || 0);
        }, 0) / efficiencyData.length;
        
        document.getElementById('steamRatio').textContent = avgRatio.toFixed(2);
    }
}

// Helper function to get inventory status
function getInventoryStatus(currentStock, minimumStock) {
    const current = parseFloat(currentStock) || 0;
    const minimum = parseFloat(minimumStock) || 0;
    
    if (current === 0) {
        return { text: 'Out of Stock', class: 'status-critical' };
    } else if (current <= minimum) {
        return { text: 'Low Stock', class: 'status-warning' };
    } else {
        return { text: 'In Stock', class: 'status-ok' };
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show/hide loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

// Initialize connection check interval
setInterval(checkConnection, 30000); // Check every 30 seconds