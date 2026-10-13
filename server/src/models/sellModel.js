// Database access for "Sell Your Device" enquiries.
import { query, withTransaction } from '../db/pool.js';
import { statusLabel } from '../config/statuses.js';
import { withUniqueReference } from '../utils/reference.js';
import { AppError } from '../utils/errors.js';
import { addStatusHistory, buildListFilter } from './statusHistoryModel.js';

const INITIAL_STATUS = 'enquiry_received';

function mapEnquiry(row) {
  return {
    id: row.id,
    reference: row.reference,
    deviceType: row.device_type,
    brand: row.brand,
    model: row.model,
    storageCapacity: row.storage_capacity,
    deviceAge: row.device_age,
    deviceCondition: row.device_condition,
    powersOn: row.powers_on,
    batteryCondition: row.battery_condition,
    hardwareProblems: row.hardware_problems,
    softwareProblems: row.software_problems,
    screenDamaged: row.screen_damaged === 1,
    repairedBefore: row.repaired_before,
    accessoriesIncluded: row.accessories_included,
    description: row.description,
    askingPrice: row.asking_price,
    proposedOffer: row.proposed_offer,
    adminNotes: row.admin_notes,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    contactMethod: row.contact_method,
    status: row.status,
    statusLabel: statusLabel('sell', row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// `photoFileNames` are the files multer already saved in server/uploads.
export async function createSellEnquiry(enquiry, photoFileNames) {
  return withUniqueReference('sell', (reference) =>
    withTransaction(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO sell_enquiries
           (reference, device_type, brand, model, storage_capacity, device_age, device_condition, powers_on,
            battery_condition, hardware_problems, software_problems, screen_damaged, repaired_before,
            accessories_included, description, asking_price,
            customer_name, customer_phone, customer_email, contact_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reference,
          enquiry.deviceType,
          enquiry.brand,
          enquiry.model,
          enquiry.storageCapacity,
          enquiry.deviceAge,
          enquiry.deviceCondition,
          enquiry.powersOn,
          enquiry.batteryCondition,
          enquiry.hardwareProblems,
          enquiry.softwareProblems,
          enquiry.screenDamaged ? 1 : 0,
          enquiry.repairedBefore,
          JSON.stringify(enquiry.accessoriesIncluded),
          enquiry.description,
          enquiry.askingPrice,
          enquiry.fullName,
          enquiry.phone,
          enquiry.email,
          enquiry.contactMethod,
          INITIAL_STATUS,
        ]
      );

      for (const fileName of photoFileNames) {
        await connection.execute('INSERT INTO sell_enquiry_photos (enquiry_id, file_path) VALUES (?, ?)', [
          result.insertId,
          fileName,
        ]);
      }
      await addStatusHistory(connection, { type: 'sell', recordId: result.insertId, status: INITIAL_STATUS });
      return { id: result.insertId, reference, status: INITIAL_STATUS };
    })
  );
}

export async function listSellEnquiries(filters) {
  const { where, params } = buildListFilter(filters, [
    'reference',
    'customer_name',
    'customer_phone',
    'customer_email',
    'brand',
    'model',
  ]);
  const rows = await query(`SELECT * FROM sell_enquiries ${where} ORDER BY created_at DESC, id DESC LIMIT 200`, params);
  return rows.map(mapEnquiry);
}

export async function getSellEnquiryById(id) {
  const rows = await query('SELECT * FROM sell_enquiries WHERE id = ?', [id]);
  if (rows.length === 0) return null;

  const photos = await query('SELECT file_path FROM sell_enquiry_photos WHERE enquiry_id = ? ORDER BY id', [id]);
  return { ...mapEnquiry(rows[0]), photos: photos.map((photo) => photo.file_path) };
}

export async function getSellEnquiryByReference(reference) {
  const rows = await query('SELECT * FROM sell_enquiries WHERE reference = ?', [reference]);
  return rows.length > 0 ? mapEnquiry(rows[0]) : null;
}

// Saves the business's own offer and private notes (set from the admin dashboard).
export async function saveSellReview(id, { proposedOffer, adminNotes }) {
  const result = await query('UPDATE sell_enquiries SET proposed_offer = ?, admin_notes = ? WHERE id = ?', [
    proposedOffer,
    adminNotes,
    id,
  ]);
  if (result.affectedRows === 0) throw new AppError(404, 'That enquiry no longer exists.');
}
