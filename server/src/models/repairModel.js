// Database access for repair requests.
import { query, withTransaction } from '../db/pool.js';
import { statusLabel } from '../config/statuses.js';
import { withUniqueReference } from '../utils/reference.js';
import { addStatusHistory, buildListFilter } from './statusHistoryModel.js';

const INITIAL_STATUS = 'request_received';

function mapRepair(row) {
  return {
    id: row.id,
    reference: row.reference,
    deviceBrand: row.device_brand,
    deviceType: row.device_type,
    deviceModel: row.device_model,
    operatingSystem: row.operating_system,
    hardwareIssues: row.hardware_issues, // mysql2 already turns JSON columns into arrays
    softwareIssues: row.software_issues,
    description: row.description,
    imagePath: row.image_path,
    serviceMethod: row.service_method,
    pickupAddress: row.pickup_address,
    pickupArea: row.pickup_area,
    pickupStreet: row.pickup_street,
    pickupInstructions: row.pickup_instructions,
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    contactMethod: row.contact_method,
    status: row.status,
    statusLabel: statusLabel('repair', row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRepair(repair) {
  return withUniqueReference('repair', (reference) =>
    withTransaction(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO repair_requests
           (reference, device_brand, device_type, device_model, operating_system,
            hardware_issues, software_issues, description, image_path, service_method,
            pickup_address, pickup_area, pickup_street, pickup_instructions, pickup_date, pickup_time,
            customer_name, customer_phone, customer_email, contact_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reference,
          repair.deviceBrand,
          repair.deviceType,
          repair.deviceModel,
          repair.operatingSystem,
          JSON.stringify(repair.hardwareIssues),
          JSON.stringify(repair.softwareIssues),
          repair.description || null,
          repair.imagePath,
          repair.serviceMethod,
          repair.pickupAddress,
          repair.pickupArea,
          repair.pickupStreet,
          repair.pickupInstructions,
          repair.pickupDate,
          repair.pickupTime,
          repair.fullName,
          repair.phone,
          repair.email,
          repair.contactMethod,
          INITIAL_STATUS,
        ]
      );
      await addStatusHistory(connection, { type: 'repair', recordId: result.insertId, status: INITIAL_STATUS });
      return { id: result.insertId, reference, status: INITIAL_STATUS };
    })
  );
}

export async function listRepairs(filters) {
  const { where, params } = buildListFilter(filters, [
    'reference',
    'customer_name',
    'customer_phone',
    'customer_email',
    'device_model',
  ]);
  const rows = await query(`SELECT * FROM repair_requests ${where} ORDER BY created_at DESC, id DESC LIMIT 200`, params);
  return rows.map(mapRepair);
}

export async function getRepairById(id) {
  const rows = await query('SELECT * FROM repair_requests WHERE id = ?', [id]);
  return rows.length > 0 ? mapRepair(rows[0]) : null;
}

export async function getRepairByReference(reference) {
  const rows = await query('SELECT * FROM repair_requests WHERE reference = ?', [reference]);
  return rows.length > 0 ? mapRepair(rows[0]) : null;
}
